import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserAccount, XtreamUserAccount, M3UUserAccount } from '../types';

export interface Series {
  id: string;
  name: string;
  streamUrl: string;
  posterUrl?: string;
  description?: string;
  rating?: number;
  releaseDate?: string;
  seasons?: number;
  episodes?: number;
  genre?: string;
  category?: string;
  isNew?: boolean;
  language?: string;
  year?: string;
  genres?: string[];
  length?: number;
  seriesItems?: SeriesItem[];
}

export interface SeriesItem {
  id: string;
  seriesId: string;
  seasonNumber: number;
  episodeNumber: number;
  name: string;
  streamUrl: string;
  thumbnailUrl?: string;
  description?: string;
  duration?: number;
  added?: string;
}

interface FilterOptions {
  searchTerm?: string;
  category?: string;
  language?: string;
  favoritesOnly?: boolean;
  favorites?: string[];
  sortBy?: 'az' | 'new' | 'rating';
}

// Helper function to normalize URLs
function normalizeUrl(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

// Fetch series based on account type
export async function fetchSeries(account: UserAccount): Promise<Series[]> {
  try {
    if ('type' in account) {
      if (account.type === 'xtream') {
        return await fetchXtreamSeries(account as XtreamUserAccount);
      } else if (account.type === 'm3u') {
        return await fetchM3USeries(account as M3UUserAccount);
      }
    }
    
    console.error('Unknown or invalid account:', account);
    return [];
  } catch (error) {
    console.error('Error fetching series:', error);
    return [];
  }
}

// Fetch series from Xtream Codes API
async function fetchXtreamSeries(account: XtreamUserAccount): Promise<Series[]> {
  try {
    const { username, password, serverUrl } = account;
    const normalizedUrl = normalizeUrl(serverUrl);
    
    // Get series categories
    const categoriesUrl = `${normalizedUrl}/player_api.php?username=${username}&password=${password}&action=get_series_categories`;
    const categoriesResponse = await axios.get(categoriesUrl);
    const categories = categoriesResponse.data || [];
    
    // Get all series
    const seriesUrl = `${normalizedUrl}/player_api.php?username=${username}&password=${password}&action=get_series`;
    const seriesResponse = await axios.get(seriesUrl);
    const seriesData = seriesResponse.data || [];
    
    // Format series data
    const seriesList: Series[] = [];
    
    for (const series of seriesData) {
      // Find category name
      const category = categories.find((cat: any) => cat.category_id === series.category_id);
      
      // Check if series is new (added in the last 14 days)
      const addedDate = new Date(series.added);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - addedDate.getTime()) / (1000 * 60 * 60 * 24));
      const isNew = daysDiff <= 14;
      
      // Get series info
      const seriesInfoUrl = `${normalizedUrl}/player_api.php?username=${username}&password=${password}&action=get_series_info&series_id=${series.series_id}`;
      const seriesInfoResponse = await axios.get(seriesInfoUrl);
      const seriesInfo = seriesInfoResponse.data || {};
      
      // Format episodes
      const seriesItems: SeriesItem[] = [];
      if (seriesInfo.episodes) {
        Object.keys(seriesInfo.episodes).forEach(seasonKey => {
          const seasonNumber = parseInt(seasonKey);
          const episodes = seriesInfo.episodes[seasonKey];
          
          episodes.forEach((episode: any) => {
            seriesItems.push({
              id: `${series.series_id}_${seasonNumber}_${episode.episode_num}`,
              seriesId: series.series_id.toString(),
              seasonNumber,
              episodeNumber: episode.episode_num,
              name: episode.title || `Episode ${episode.episode_num}`,
              streamUrl: `${normalizedUrl}/series/${username}/${password}/${episode.id}.${episode.container_extension}`,
              thumbnailUrl: episode.info?.movie_image || series.cover,
              description: episode.info?.plot || '',
              duration: episode.info?.duration_secs ? Math.floor(episode.info.duration_secs / 60) : undefined,
              added: episode.added
            });
          });
        });
      }
      
      seriesList.push({
        id: series.series_id.toString(),
        name: series.name,
        streamUrl: "", // Series don't have a direct stream URL
        posterUrl: series.cover || undefined,
        description: series.plot || undefined,
        rating: series.rating ? parseFloat(series.rating) : undefined,
        releaseDate: series.releaseDate || undefined,
        genre: series.genre || undefined,
        category: category ? category.category_name : undefined,
        isNew,
        language: series.language || undefined,
        seriesItems,
        seasons: seriesItems.reduce((acc, curr) => Math.max(acc, curr.seasonNumber), 0),
        episodes: seriesItems.length
      });
    }
    
    return seriesList;
  } catch (error) {
    console.error('Error fetching Xtream series:', error);
    return [];
  }
}

// Fetch series from M3U playlist
async function fetchM3USeries(account: M3UUserAccount): Promise<Series[]> {
  try {
    const { m3uUrl } = account;
    
    // Fetch the M3U playlist
    const response = await axios.get(m3uUrl);
    const m3uContent = response.data;
    
    // Parse M3U content
    const lines = m3uContent.split('\n');
    const seriesMap = new Map<string, Series>();
    
    let currentItem: Partial<SeriesItem> | null = null;
    let seriesId = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('#EXTINF:')) {
        // Start of a new entry
        currentItem = {};
        
        // Parse attributes
        const infoMatch = line.match(/#EXTINF:(-?\d+)\s+(.*)/);
        if (infoMatch) {
          const info = infoMatch[2];
          
          // Extract title - Check for series pattern (e.g., "Series Name S01E02" or "Series Name - S01E02")
          const titleMatch = info.match(/tvg-name="([^"]*)"/) || info.match(/,(.*)$/);
          if (titleMatch) {
            const fullTitle = titleMatch[1].trim();
            
            // Try to detect if this is a series entry (looks for S01E01 patterns)
            const seriesPattern = /^(.*?)(?:[\s-]+)?S(\d+)(?:E|\s+E)(\d+)/i;
            const seriesMatch = fullTitle.match(seriesPattern);
            
            if (seriesMatch) {
              const seriesName = seriesMatch[1].trim();
              const seasonNum = parseInt(seriesMatch[2]);
              const episodeNum = parseInt(seriesMatch[3]);
              
              // Create a unique ID for the series
              seriesId = `series_${seriesName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;
              
              // Set up current item
              currentItem.seriesId = seriesId;
              currentItem.seasonNumber = seasonNum;
              currentItem.episodeNumber = episodeNum;
              currentItem.name = fullTitle;
              
              // Extract logo
              const logoMatch = info.match(/tvg-logo="([^"]*)"/);
              if (logoMatch) {
                currentItem.thumbnailUrl = logoMatch[1];
              }
              
              // Extract group/category
              const groupMatch = info.match(/group-title="([^"]*)"/);
              if (groupMatch) {
                const category = groupMatch[1];
                
                // Update or create series entry
                if (!seriesMap.has(seriesId)) {
                  seriesMap.set(seriesId, {
                    id: seriesId,
                    name: seriesName,
                    streamUrl: "", // Series don't have a direct stream URL
                    category,
                    seriesItems: [],
                    seasons: seasonNum,
                    episodes: 0,
                    posterUrl: currentItem.thumbnailUrl
                  });
                } else {
                  const existingSeries = seriesMap.get(seriesId)!;
                  existingSeries.seasons = Math.max(existingSeries.seasons || 0, seasonNum);
                  if (!existingSeries.posterUrl && currentItem.thumbnailUrl) {
                    existingSeries.posterUrl = currentItem.thumbnailUrl;
                  }
                }
              }
            } else {
              // Not a series entry
              currentItem = null;
              continue;
            }
          }
        }
      } else if (line.startsWith('http') && currentItem && currentItem.seriesId) {
        // This is the URL line
        currentItem.streamUrl = line;
        currentItem.id = `${currentItem.seriesId}_S${currentItem.seasonNumber}_E${currentItem.episodeNumber}`;
        
        // Add to series items
        if (seriesMap.has(currentItem.seriesId)) {
          const series = seriesMap.get(currentItem.seriesId)!;
          if (!series.seriesItems) {
            series.seriesItems = [];
          }
          series.seriesItems.push(currentItem as SeriesItem);
          series.episodes = (series.episodes || 0) + 1;
        }
        
        currentItem = null;
      }
    }
    
    return Array.from(seriesMap.values());
  } catch (error) {
    console.error('Error fetching M3U series:', error);
    return [];
  }
}

// Get unique series categories
export async function fetchSeriesCategories(account: UserAccount): Promise<string[]> {
  const seriesList = await fetchSeries(account);
  const categories = new Set<string>();
  
  seriesList.forEach(series => {
    if (series.category) {
      categories.add(series.category);
    }
  });
  
  return Array.from(categories).sort();
}

// Filter series based on different criteria
export function filterSeries(seriesList: Series[], options: FilterOptions): Series[] {
  let filtered = [...seriesList];
  
  // Filter by search term
  if (options.searchTerm) {
    const term = options.searchTerm.toLowerCase();
    filtered = filtered.filter(series => 
      series.name.toLowerCase().includes(term) || 
      series.description?.toLowerCase().includes(term) ||
      series.genre?.toLowerCase().includes(term)
    );
  }
  
  // Filter by category
  if (options.category) {
    filtered = filtered.filter(series => series.category === options.category);
  }
  
  // Filter by language
  if (options.language) {
    filtered = filtered.filter(series => 
      series.language?.toLowerCase() === options.language?.toLowerCase()
    );
  }
  
  // Filter favorites only
  if (options.favoritesOnly && options.favorites) {
    filtered = filtered.filter(series => options.favorites?.includes(series.id));
  }
  
  // Sort results
  if (options.sortBy) {
    switch (options.sortBy) {
      case 'az':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'new':
        filtered.sort((a, b) => {
          if (a.isNew === b.isNew) return 0;
          return a.isNew ? -1 : 1;
        });
        break;
      case 'rating':
        filtered.sort((a, b) => {
          const ratingA = a.rating || 0;
          const ratingB = b.rating || 0;
          return ratingB - ratingA; // Higher ratings first
        });
        break;
    }
  }
  
  return filtered;
} 
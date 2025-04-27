import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserAccount, XtreamUserAccount, M3UUserAccount } from '../types';

export interface Movie {
  id: string;
  name: string;
  streamUrl: string;
  posterUrl?: string;
  description?: string;
  rating?: number;
  releaseDate?: string;
  duration?: number; // in minutes
  genre?: string;
  category?: string;
  isNew?: boolean;
  language?: string;
  year?: string;
  genres?: string[];
  subtitles?: Array<{ language: string; url: string }>;
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

// Fetch VOD movies based on account type
export async function fetchMovies(account: UserAccount): Promise<Movie[]> {
  try {
    if ('type' in account) {
      if (account.type === 'xtream') {
        return await fetchXtreamMovies(account as XtreamUserAccount);
      } else if (account.type === 'm3u') {
        return await fetchM3UMovies(account as M3UUserAccount);
      }
    }
    
    console.error('Unknown or invalid account:', account);
    return [];
  } catch (error) {
    console.error('Error fetching movies:', error);
    return [];
  }
}

// Fetch movies from Xtream Codes API
async function fetchXtreamMovies(account: XtreamUserAccount): Promise<Movie[]> {
  try {
    const { username, password, serverUrl } = account;
    const normalizedUrl = normalizeUrl(serverUrl);
    
    // First get VOD categories
    const categoriesUrl = `${normalizedUrl}/player_api.php?username=${username}&password=${password}&action=get_vod_categories`;
    const categoriesResponse = await axios.get(categoriesUrl);
    const categories = categoriesResponse.data || [];
    
    // Then get all VOD streams
    const vodUrl = `${normalizedUrl}/player_api.php?username=${username}&password=${password}&action=get_vod_streams`;
    const vodResponse = await axios.get(vodUrl);
    const vodData = vodResponse.data || [];
    
    // Format movies data
    const movies: Movie[] = vodData.map((movie: any) => {
      // Construct stream URL
      const streamUrl = `${normalizedUrl}/movie/${username}/${password}/${movie.stream_id}.${movie.container_extension}`;
      
      // Check if movie is new (added in the last 14 days)
      const addedDate = new Date(movie.added);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - addedDate.getTime()) / (1000 * 60 * 60 * 24));
      const isNew = daysDiff <= 14;
      
      // Find category name
      const category = categories.find((cat: any) => cat.category_id === movie.category_id);
      
      return {
        id: movie.stream_id.toString(),
        name: movie.name,
        streamUrl,
        posterUrl: movie.stream_icon || undefined,
        description: movie.plot || undefined,
        rating: movie.rating ? parseFloat(movie.rating) : undefined,
        releaseDate: movie.releaseDate || undefined,
        duration: movie.duration ? parseInt(movie.duration) : undefined,
        genre: movie.genre || undefined,
        category: category ? category.category_name : undefined,
        isNew,
        language: movie.language || undefined,
      };
    });
    
    return movies;
  } catch (error) {
    console.error('Error fetching Xtream movies:', error);
    return [];
  }
}

// Fetch movies from M3U playlist
async function fetchM3UMovies(account: M3UUserAccount): Promise<Movie[]> {
  try {
    const { m3uUrl } = account;
    
    // Fetch the M3U playlist
    const response = await axios.get(m3uUrl);
    const m3uContent = response.data;
    
    // Parse M3U content
    const lines = m3uContent.split('\n');
    const movies: Movie[] = [];
    
    let currentMovie: Partial<Movie> | null = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('#EXTINF:')) {
        // Start of a new entry
        currentMovie = {};
        
        // Parse attributes
        const infoMatch = line.match(/#EXTINF:(-?\d+)\s+(.*)/);
        if (infoMatch) {
          const duration = parseInt(infoMatch[1]);
          const info = infoMatch[2];
          
          // Extract title
          const titleMatch = info.match(/tvg-name="([^"]*)"/) || info.match(/,(.*)$/);
          if (titleMatch) {
            currentMovie.name = titleMatch[1].trim();
          }
          
          // Extract logo
          const logoMatch = info.match(/tvg-logo="([^"]*)"/);
          if (logoMatch) {
            currentMovie.posterUrl = logoMatch[1];
          }
          
          // Extract group/category
          const groupMatch = info.match(/group-title="([^"]*)"/);
          if (groupMatch) {
            currentMovie.category = groupMatch[1];
          }
          
          // Check if it's a movie (not live TV)
          const isMovie = currentMovie.category?.toLowerCase().includes('movie') || 
                         currentMovie.category?.toLowerCase().includes('vod');
          
          if (!isMovie) {
            currentMovie = null;
            continue;
          }
          
          if (duration > 0) {
            currentMovie.duration = duration / 60; // Convert to minutes
          }
        }
      } else if (line.startsWith('http') && currentMovie && currentMovie.name) {
        // This is the URL line
        currentMovie.streamUrl = line;
        currentMovie.id = `m3u-${movies.length + 1}`;
        movies.push(currentMovie as Movie);
        currentMovie = null;
      }
    }
    
    return movies;
  } catch (error) {
    console.error('Error fetching M3U movies:', error);
    return [];
  }
}

// Get unique movie categories
export async function fetchMovieCategories(account: UserAccount): Promise<string[]> {
  const movies = await fetchMovies(account);
  const categories = new Set<string>();
  
  movies.forEach(movie => {
    if (movie.category) {
      categories.add(movie.category);
    }
  });
  
  return Array.from(categories).sort();
}

// Filter movies based on different criteria
export function filterMovies(movies: Movie[], options: FilterOptions): Movie[] {
  let filtered = [...movies];
  
  // Filter by search term
  if (options.searchTerm) {
    const term = options.searchTerm.toLowerCase();
    filtered = filtered.filter(movie => 
      movie.name.toLowerCase().includes(term) || 
      movie.description?.toLowerCase().includes(term) ||
      movie.genre?.toLowerCase().includes(term)
    );
  }
  
  // Filter by category
  if (options.category) {
    filtered = filtered.filter(movie => movie.category === options.category);
  }
  
  // Filter by language
  if (options.language) {
    filtered = filtered.filter(movie => 
      movie.language?.toLowerCase() === options.language?.toLowerCase()
    );
  }
  
  // Filter favorites only
  if (options.favoritesOnly && options.favorites) {
    filtered = filtered.filter(movie => options.favorites?.includes(movie.id));
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
import axios from 'axios';
import { UserAccount } from '../types';
import { mockLiveChannels, mockCategories } from './mockData';

export interface LiveChannel {
  id: string;
  name: string;
  streamUrl: string;
  logoUrl?: string;
  bannerUrl?: string;
  description?: string;
  epgId?: string;
  category?: string;
  groupTitle?: string;
}

// Flag to control whether to use mock data even when real data is available
// Set this to true during development if you want to always see mock data
const FORCE_MOCK_DATA = false;

/**
 * Fetches live TV channels from a user account (Xtream or M3U)
 */
export const fetchLiveChannels = async (account: UserAccount): Promise<LiveChannel[]> => {
  try {
    if (FORCE_MOCK_DATA) {
      console.log('Using mock channel data (forced)');
      return mockLiveChannels;
    }
    
    if (account.type === 'xtream') {
      return await fetchXtreamLiveChannels(account);
    } else if (account.type === 'm3u') {
      return await fetchM3ULiveChannels(account);
    } else {
      throw new Error('Unknown account type');
    }
  } catch (error) {
    console.error('Error fetching live channels:', error);
    console.log('Falling back to mock data');
    return mockLiveChannels;
  }
};

/**
 * Fetches live TV channels from an Xtream Codes API
 */
const fetchXtreamLiveChannels = async (account: UserAccount): Promise<LiveChannel[]> => {
  if (account.type !== 'xtream') {
    throw new Error('Invalid account type for Xtream channels');
  }

  try {
    const { serverUrl, username, password } = account;
    // Normalize URL (remove trailing slash)
    const normalizedUrl = serverUrl.endsWith('/') ? serverUrl.slice(0, -1) : serverUrl;
    
    // Get all live stream categories
    const categoriesResponse = await axios.get(
      `${normalizedUrl}/player_api.php?username=${username}&password=${password}&action=get_live_categories`
    );
    
    // Get all live streams
    const streamsResponse = await axios.get(
      `${normalizedUrl}/player_api.php?username=${username}&password=${password}&action=get_live_streams`
    );
    
    // Format channels with their categories
    const categories = categoriesResponse.data || [];
    const streams = streamsResponse.data || [];
    
    return streams.map((stream: any) => {
      // Find category name
      const category = categories.find((cat: any) => cat.category_id === stream.category_id);
      
      return {
        id: String(stream.stream_id),
        name: stream.name,
        streamUrl: `${normalizedUrl}/live/${username}/${password}/${stream.stream_id}.ts`,
        logoUrl: stream.stream_icon || undefined,
        epgId: stream.epg_channel_id,
        category: category ? category.category_name : undefined
      };
    });
  } catch (error) {
    console.error('Error fetching Xtream live channels:', error);
    throw error;
  }
};

/**
 * Fetches live TV channels from an M3U playlist
 */
const fetchM3ULiveChannels = async (account: UserAccount): Promise<LiveChannel[]> => {
  if (account.type !== 'm3u') {
    throw new Error('Invalid account type for M3U channels');
  }

  try {
    // Fetch M3U playlist
    const response = await axios.get(account.m3uUrl);
    const m3uContent = response.data;
    
    // Parse M3U content
    return parseM3UContent(m3uContent);
  } catch (error) {
    console.error('Error fetching M3U live channels:', error);
    throw error;
  }
};

/**
 * Parses M3U content into a list of channels
 */
const parseM3UContent = (content: string): LiveChannel[] => {
  const channels: LiveChannel[] = [];
  const lines = content.split('\n');
  
  let currentChannel: Partial<LiveChannel> = {};
  let id = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check for EXTINF line which contains channel info
    if (line.startsWith('#EXTINF:')) {
      currentChannel = {};
      
      // Extract name from the line
      const nameMatch = line.match(/,(.+)$/);
      if (nameMatch && nameMatch[1]) {
        currentChannel.name = nameMatch[1].trim();
      }
      
      // Extract tvg-logo (channel logo)
      const logoMatch = line.match(/tvg-logo="([^"]+)"/);
      if (logoMatch && logoMatch[1]) {
        currentChannel.logoUrl = logoMatch[1];
      }
      
      // Extract group-title (category)
      const groupMatch = line.match(/group-title="([^"]+)"/);
      if (groupMatch && groupMatch[1]) {
        currentChannel.groupTitle = groupMatch[1];
        currentChannel.category = groupMatch[1];
      }
      
      // Extract tvg-id (epg id)
      const epgIdMatch = line.match(/tvg-id="([^"]+)"/);
      if (epgIdMatch && epgIdMatch[1]) {
        currentChannel.epgId = epgIdMatch[1];
      }
      
    } 
    // Check for the URL line (follows EXTINF line)
    else if (line && !line.startsWith('#') && currentChannel.name) {
      currentChannel.streamUrl = line;
      currentChannel.id = String(++id); // Generate a unique ID
      
      // Add complete channel to array
      channels.push(currentChannel as LiveChannel);
      
      // Reset for next channel
      currentChannel = {};
    }
  }
  
  return channels;
};

/**
 * Fetches live channel categories from an account
 */
export const fetchChannelCategories = async (account: UserAccount): Promise<string[]> => {
  try {
    if (FORCE_MOCK_DATA) {
      console.log('Using mock category data (forced)');
      return mockCategories;
    }
    
    const channels = await fetchLiveChannels(account);
    
    // Extract unique categories
    const categoriesSet = new Set<string>();
    channels.forEach(channel => {
      if (channel.category) {
        categoriesSet.add(channel.category);
      }
    });
    
    return Array.from(categoriesSet).sort();
  } catch (error) {
    console.error('Error fetching channel categories:', error);
    console.log('Falling back to mock category data');
    return mockCategories;
  }
};

/**
 * Filters channels by search term and category
 */
export const filterChannels = (
  channels: LiveChannel[],
  searchTerm: string = '',
  category?: string
): LiveChannel[] => {
  return channels.filter(channel => {
    // Apply category filter
    if (category && channel.category !== category) {
      return false;
    }
    
    // Apply search filter (if search term exists)
    if (searchTerm && !channel.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });
}; 
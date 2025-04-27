import axios from 'axios';
import { UserAccount } from '../types';

// Content counts interface
interface ContentCounts {
  live?: number;
  movies?: number;
  series?: number;
}

/**
 * Fetches content counts from an Xtream Codes API or M3U URL
 */
export const fetchContentCounts = async (account: UserAccount): Promise<ContentCounts> => {
  // Default values if we can't fetch actual counts
  const defaultCounts: ContentCounts = {
    live: undefined,
    movies: undefined,
    series: undefined,
  };

  try {
    if (account.type === 'xtream') {
      return await fetchXtreamContentCounts(account);
    } else if (account.type === 'm3u') {
      return await fetchM3UContentCounts(account);
    }
    
    return defaultCounts;
  } catch (error) {
    console.error('Error fetching content counts:', error);
    return defaultCounts;
  }
};

/**
 * Fetches content counts from an Xtream Codes API
 */
const fetchXtreamContentCounts = async (account: UserAccount): Promise<ContentCounts> => {
  if (account.type !== 'xtream') {
    throw new Error('Invalid account type for Xtream content count');
  }

  try {
    // Normalize server URL
    let normalizedUrl = account.serverUrl;
    if (!normalizedUrl.startsWith('http')) {
      normalizedUrl = `http://${normalizedUrl}`;
    }
    
    // Remove trailing slash if present
    normalizedUrl = normalizedUrl.replace(/\/$/, '');
    
    // Fetch content counts from various endpoints
    const promises = [
      // Live channels
      axios.get(`${normalizedUrl}/player_api.php`, {
        params: {
          username: account.username,
          password: account.password,
          action: 'get_live_streams',
        },
        timeout: 10000,
      }),
      
      // Movies
      axios.get(`${normalizedUrl}/player_api.php`, {
        params: {
          username: account.username,
          password: account.password,
          action: 'get_vod_streams',
        },
        timeout: 10000,
      }),
      
      // Series
      axios.get(`${normalizedUrl}/player_api.php`, {
        params: {
          username: account.username,
          password: account.password,
          action: 'get_series',
        },
        timeout: 10000,
      }),
    ];

    // Execute all requests in parallel
    const results = await Promise.allSettled(promises);
    
    // Process results and extract counts
    const counts: ContentCounts = {};
    
    if (results[0].status === 'fulfilled') {
      counts.live = results[0].value.data.length;
    }
    
    if (results[1].status === 'fulfilled') {
      counts.movies = results[1].value.data.length;
    }
    
    if (results[2].status === 'fulfilled') {
      counts.series = results[2].value.data.length;
    }
    
    return counts;
  } catch (error) {
    console.error('Error fetching Xtream content counts:', error);
    return {
      live: undefined,
      movies: undefined,
      series: undefined,
    };
  }
};

/**
 * Fetches content counts from an M3U playlist
 * This is a simplified implementation - for a real app, you would
 * need to parse the M3U file and count the different types of content
 */
const fetchM3UContentCounts = async (account: UserAccount): Promise<ContentCounts> => {
  if (account.type !== 'm3u') {
    throw new Error('Invalid account type for M3U content count');
  }

  try {
    // For now, we're just returning placeholder values
    // In a real app, you would fetch and parse the M3U file
    // to count the different types of content
    return {
      live: undefined,
      movies: undefined,
      series: undefined,
    };
  } catch (error) {
    console.error('Error fetching M3U content counts:', error);
    return {
      live: undefined,
      movies: undefined,
      series: undefined,
    };
  }
}; 
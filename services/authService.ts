import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { UserAccount, XtreamLoginResponse } from '../types';

const ACCOUNTS_STORAGE_KEY = 'iptv_accounts';
const CURRENT_ACCOUNT_ID_KEY = 'current_account_id';

// Helper to save accounts to AsyncStorage
const saveAccounts = async (accounts: UserAccount[]): Promise<void> => {
  try {
    const accountsJson = JSON.stringify(accounts);
    await AsyncStorage.setItem(ACCOUNTS_STORAGE_KEY, accountsJson);
  } catch (error) {
    console.error('Error saving accounts:', error);
    throw new Error('Failed to save account data');
  }
};

// Get all saved accounts
export const getAccounts = async (): Promise<UserAccount[]> => {
  try {
    const accountsJson = await AsyncStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (!accountsJson) return [];
    return JSON.parse(accountsJson);
  } catch (error) {
    console.error('Error retrieving accounts:', error);
    return [];
  }
};

// Save a new account
export const saveAccount = async (account: UserAccount): Promise<void> => {
  try {
    const accounts = await getAccounts();
    
    // Check if account with same details already exists
    const existingAccountIndex = accounts.findIndex(acc => {
      if (account.type === 'xtream' && acc.type === 'xtream') {
        return acc.serverUrl === account.serverUrl && 
               acc.username === account.username;
      } else if (account.type === 'm3u' && acc.type === 'm3u') {
        return acc.m3uUrl === account.m3uUrl;
      }
      return false;
    });

    if (existingAccountIndex >= 0) {
      // Update existing account
      accounts[existingAccountIndex] = {
        ...accounts[existingAccountIndex],
        ...account,
        lastUsed: Date.now()
      };
    } else {
      // Add new account
      accounts.push({
        ...account,
        lastUsed: Date.now()
      });
    }

    await saveAccounts(accounts);
    
    // Set as current account
    await setCurrentAccountId(account.id);
  } catch (error) {
    console.error('Error saving account:', error);
    throw new Error('Failed to save account');
  }
};

// Delete an account
export const deleteAccount = async (accountId: string): Promise<void> => {
  try {
    const accounts = await getAccounts();
    const updatedAccounts = accounts.filter(acc => acc.id !== accountId);
    await saveAccounts(updatedAccounts);
    
    // If deleted account was current, reset current account
    const currentId = await getCurrentAccountId();
    if (currentId === accountId) {
      await AsyncStorage.removeItem(CURRENT_ACCOUNT_ID_KEY);
    }
  } catch (error) {
    console.error('Error deleting account:', error);
    throw new Error('Failed to delete account');
  }
};

// Get/set current account ID
export const getCurrentAccountId = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(CURRENT_ACCOUNT_ID_KEY);
  } catch (error) {
    console.error('Error getting current account ID:', error);
    return null;
  }
};

export const setCurrentAccountId = async (accountId: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(CURRENT_ACCOUNT_ID_KEY, accountId);
  } catch (error) {
    console.error('Error setting current account ID:', error);
    throw new Error('Failed to set current account');
  }
};

// Test Xtream API connection
export const testXtreamConnection = async (
  serverUrl: string,
  username: string,
  password: string
): Promise<boolean> => {
  try {
    // Normalize server URL
    let normalizedUrl = serverUrl;
    if (!normalizedUrl.startsWith('http')) {
      normalizedUrl = `http://${normalizedUrl}`;
    }
    
    // Remove trailing slash if present
    normalizedUrl = normalizedUrl.replace(/\/$/, '');
    
    const url = `${normalizedUrl}/player_api.php?username=${username}&password=${password}`;
    const response = await axios.get<XtreamLoginResponse>(url, {
      timeout: 10000, // 10 second timeout
    });
    
    // Check if authentication was successful
    return response.data && 
           response.data.user_info && 
           response.data.user_info.auth === 1;
  } catch (error) {
    console.error('Xtream connection test failed:', error);
    return false;
  }
};

// Test M3U URL connection
export const testM3UConnection = async (m3uUrl: string): Promise<boolean> => {
  try {
    // Simple check - just verify that the URL returns something
    const response = await axios.get(m3uUrl, {
      timeout: 10000, // 10 second timeout
    });
    
    const content = response.data;
    
    // Basic validation - check for #EXTM3U header
    return typeof content === 'string' && content.includes('#EXTM3U');
  } catch (error) {
    console.error('M3U connection test failed:', error);
    return false;
  }
}; 
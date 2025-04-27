import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import Colors from '../../constants/Colors';
import { getAccounts, getCurrentAccountId } from '../../services/authService';
import { fetchLiveChannels } from '../../services/channelService';
import { fetchMovies } from '../../services/movieService';
import { fetchSeries } from '../../services/seriesService';
import { UserAccount } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {
  const [account, setAccount] = useState<UserAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [counts, setCounts] = useState({
    channels: 0,
    movies: 0,
    series: 0
  });

  useEffect(() => {
    loadAccount();
  }, []);

  const loadAccount = async () => {
    try {
      const currentId = await getCurrentAccountId();
      if (currentId) {
        const accounts = await getAccounts();
        const acc = accounts.find(a => a.id === currentId);
        if (acc) {
          setAccount(acc);
          // Load counts in background
          loadCounts(acc);
        }
      }
    } catch (error) {
      console.error('Error loading account:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCounts = async (acc: UserAccount) => {
    try {
      // Load counts in parallel
      const [channels, movies, series] = await Promise.all([
        fetchLiveChannels(acc),
        fetchMovies(acc),
        fetchSeries(acc)
      ]);
      
      setCounts({
        channels: channels.length,
        movies: movies.length,
        series: series.length
      });
    } catch (error) {
      console.error('Error loading counts:', error);
    }
  };

  const navigateToSection = (section: string) => {
    if (section === 'live') {
      router.push('/live');
    } else if (section === 'movies') {
      router.push('/movies');
    } else if (section === 'series') {
      router.push('/series');
    }
  };

  // Helper function to get account display name
  const getAccountName = () => {
    if (!account) return 'No account selected';
    
    if ('name' in account) {
      return account.name as string;
    } else if (account.type === 'xtream') {
      return account.username || 'Xtream Account';
    } else if (account.type === 'm3u') {
      return 'm3uUrl' in account ? 'M3U Account' : 'Unknown Account';
    }
    
    return 'Unknown Account';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* App bar */}
      <View style={styles.appBar}>
        <Text style={styles.appBarTitle}>IPTV Player</Text>
        <View style={styles.appBarActions}>
          <TouchableOpacity style={styles.appBarButton}>
            <Ionicons name="settings-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView style={styles.scrollView}>
        {/* Account info */}
        <View style={styles.accountCard}>
          <View style={styles.accountInfo}>
            <Text style={styles.accountTitle}>Current Account</Text>
            <Text style={styles.accountName}>{getAccountName()}</Text>
            <Text style={styles.accountDetails}>
              {account?.type === 'xtream' ? 'Xtream Codes' : account?.type === 'm3u' ? 'M3U Playlist' : ''}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.accountButton}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.accountButtonText}>
              {account ? 'CHANGE' : 'SELECT'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Content sections */}
        <View style={styles.sectionTitle}>
          <Text style={styles.sectionTitleText}>Browse Content</Text>
        </View>
        
        <View style={styles.cardsContainer}>
          {/* Live TV Card */}
          <TouchableOpacity 
            style={styles.sectionCard}
            onPress={() => navigateToSection('live')}
          >
            <LinearGradient
              colors={['#1e3c72', '#2a5298']}
              style={styles.sectionCardGradient}
            >
              <FontAwesome5 name="tv" size={28} color="white" />
              <Text style={styles.sectionCardTitle}>Live TV</Text>
              <Text style={styles.sectionCardCount}>
                {counts.channels} Channels
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          
          {/* Movies Card */}
          <TouchableOpacity 
            style={styles.sectionCard}
            onPress={() => navigateToSection('movies')}
          >
            <LinearGradient
              colors={['#8E2DE2', '#4A00E0']}
              style={styles.sectionCardGradient}
            >
              <FontAwesome5 name="film" size={28} color="white" />
              <Text style={styles.sectionCardTitle}>Movies</Text>
              <Text style={styles.sectionCardCount}>
                {counts.movies} Movies
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          
          {/* Series Card */}
          <TouchableOpacity 
            style={styles.sectionCard}
            onPress={() => navigateToSection('series')}
          >
            <LinearGradient
              colors={['#FF5F6D', '#FFC371']}
              style={styles.sectionCardGradient}
            >
              <FontAwesome5 name="play-circle" size={28} color="white" />
              <Text style={styles.sectionCardTitle}>TV Series</Text>
              <Text style={styles.sectionCardCount}>
                {counts.series} Series
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        
        {/* Recently Watched - Placeholder for now */}
        <View style={styles.sectionTitle}>
          <Text style={styles.sectionTitleText}>Recently Watched</Text>
        </View>
        
        <View style={styles.emptyRecent}>
          <Text style={styles.emptyText}>
            Items you watch will appear here
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  appBar: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  appBarTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.dark.textPrimary,
  },
  appBarActions: {
    flexDirection: 'row',
  },
  appBarButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  accountCard: {
    margin: 16,
    padding: 16,
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accountInfo: {
    flex: 1,
  },
  accountTitle: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginBottom: 4,
  },
  accountName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.textPrimary,
    marginBottom: 2,
  },
  accountDetails: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  accountButton: {
    backgroundColor: Colors.dark.accent,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  accountButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  sectionTitle: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.textPrimary,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  sectionCard: {
    width: (SCREEN_WIDTH - 48) / 3,
    height: 120,
    marginHorizontal: 8,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  sectionCardGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionCardTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
  },
  sectionCardCount: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  emptyRecent: {
    height: 100,
    margin: 16,
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
  },
});

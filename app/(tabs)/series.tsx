import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';

import Colors from '../../constants/Colors';
import { getAccounts, getCurrentAccountId } from '../../services/authService';
import { Series, fetchSeries, fetchSeriesCategories } from '../../services/seriesService';
import { UserAccount } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Series card layout
const GRID_COLUMNS = 3;
const SERIES_CARD_WIDTH = (SCREEN_WIDTH - 48) / GRID_COLUMNS;
const SERIES_CARD_HEIGHT = SERIES_CARD_WIDTH * 1.5;

export default function SeriesScreen() {
  const [currentAccount, setCurrentAccount] = useState<UserAccount | null>(null);
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load account and series data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Load current account
      const currentId = await getCurrentAccountId();
      if (!currentId) {
        setError('No account selected');
        return;
      }

      const accounts = await getAccounts();
      const account = accounts.find((acc) => acc.id === currentId);
      
      if (!account) {
        setError('Selected account not found');
        return;
      }

      setCurrentAccount(account);

      // Load series and categories
      const seriesData = await fetchSeries(account);
      setSeriesList(seriesData);
      
      // Set a featured series if available
      if (seriesData.length > 0) {
        setSelectedSeries(seriesData[0]);
      }

      const categoriesData = await fetchSeriesCategories(account);
      setCategories(['All Categories', ...categoriesData]);
    } catch (error) {
      console.error('Error loading series data:', error);
      setError('Failed to load series. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSeries = (series: Series) => {
    setSelectedSeries(series);
    // Navigate to series detail (to be implemented)
    router.push({
      pathname: 'series/seriesdetail' as any,
      params: { seriesId: series.id }
    });
  };

  const handleRefresh = () => {
    loadData();
  };

  // Render loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color={Colors.dark.accent} />
        <Text style={styles.loadingText}>Loading your series...</Text>
      </SafeAreaView>
    );
  }

  // Render error state
  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar barStyle="light-content" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Text style={styles.refreshButtonText}>Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Render series card
  const renderSeriesCard = ({ item: series }: { item: Series }) => {
    return (
      <TouchableOpacity 
        style={styles.seriesCard}
        onPress={() => handleSelectSeries(series)}
        activeOpacity={0.7}
      >
        <View style={styles.posterContainer}>
          {series.posterUrl ? (
            <Image
              source={{ uri: series.posterUrl }}
              style={styles.poster}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.posterPlaceholder}>
              <FontAwesome name="film" size={24} color={Colors.dark.textSecondary} />
            </View>
          )}
          
          {/* New label */}
          {series.isNew && (
            <View style={styles.newLabel}>
              <Text style={styles.newLabelText}>NEW</Text>
            </View>
          )}
          
          {/* Seasons/Episodes count */}
          <View style={styles.infoLabel}>
            <Text style={styles.infoLabelText}>
              {series.seasons} {series.seasons === 1 ? 'Season' : 'Seasons'} | {series.episodes} Ep
            </Text>
          </View>
        </View>
        
        <View style={styles.seriesInfo}>
          <Text style={styles.seriesTitle} numberOfLines={2}>
            {series.name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* App bar */}
      <View style={styles.appBar}>
        <View style={styles.appBarLeft}>
          <Text style={styles.appBarTitle}>TV Series</Text>
        </View>
        <View style={styles.appBarRight}>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => console.log("Search not implemented")}
          >
            <Ionicons name="search" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Series Grid Section */}
      <View style={styles.seriesSection}>
        <Text style={styles.sectionTitle}>
          TV Series
          <Text style={styles.seriesCount}> ({seriesList.length})</Text>
        </Text>
        
        {seriesList.length > 0 ? (
          <FlatList
            data={seriesList}
            renderItem={renderSeriesCard}
            keyExtractor={(item) => item.id}
            numColumns={GRID_COLUMNS}
            contentContainerStyle={styles.seriesGrid}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No series found. Try adding a different source.
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
  },
  loadingText: {
    color: Colors.dark.textSecondary,
    fontSize: 16,
    marginTop: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
    padding: 20,
  },
  errorText: {
    color: Colors.dark.textSecondary,
    fontSize: 16,
    marginTop: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  refreshButton: {
    backgroundColor: Colors.dark.accent,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  refreshButtonText: {
    color: Colors.dark.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  appBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  appBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appBarTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.dark.textPrimary,
  },
  appBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchButton: {
    marginLeft: 16,
  },
  seriesSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.textPrimary,
    marginBottom: 12,
  },
  seriesCount: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    fontWeight: 'normal',
  },
  seriesGrid: {
    paddingBottom: 16,
  },
  seriesCard: {
    width: SERIES_CARD_WIDTH,
    marginHorizontal: 4,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: Colors.dark.backgroundSecondary,
  },
  posterContainer: {
    width: '100%',
    height: SERIES_CARD_HEIGHT,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  posterPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.dark.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newLabel: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.dark.accent,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  newLabelText: {
    color: 'white',
    fontSize: 9,
    fontWeight: 'bold',
  },
  infoLabel: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  infoLabelText: {
    color: 'white',
    fontSize: 9,
    textAlign: 'center',
  },
  seriesInfo: {
    padding: 8,
  },
  seriesTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.dark.textPrimary,
    lineHeight: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    padding: 20,
  },
}); 
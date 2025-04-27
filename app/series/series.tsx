import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import Colors from '../../constants/Colors';
import { getAccounts, getCurrentAccountId } from '../../services/authService';
import { Series, fetchSeries } from '../../services/seriesService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const ITEM_WIDTH = SCREEN_WIDTH / COLUMN_COUNT - 16;
const ITEM_HEIGHT = ITEM_WIDTH * 1.5;

export default function SeriesScreen() {
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);

  useEffect(() => {
    loadSeries();
  }, []);

  const loadSeries = async () => {
    setIsLoading(true);

    try {
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

      const fetchedSeries = await fetchSeries(account);
      setSeriesList(fetchedSeries);
    } catch (error) {
      console.error('Error loading series:', error);
      setError('Failed to load series');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeriesPress = (series: Series) => {
    setSelectedSeries(series);
    // Navigate to series detail page
    router.push({
      pathname: 'series/seriesdetail' as any,
      params: { seriesId: series.id }
    });
  };

  const renderSeriesItem = ({ item }: { item: Series }) => (
    <TouchableOpacity
      style={styles.seriesItem}
      onPress={() => handleSeriesPress(item)}
    >
      <Image
        source={{ uri: item.posterUrl || 'https://via.placeholder.com/150' }}
        style={styles.seriesCover}
        resizeMode="cover"
      />
      <Text style={styles.seriesTitle} numberOfLines={1}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color={Colors.dark.accent} />
        <Text style={styles.loadingText}>Loading series...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar barStyle="light-content" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadSeries}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#1F2A3E', '#121726']}
        style={styles.backgroundGradient}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Series</Text>
          <TouchableOpacity style={styles.searchButton}>
            <Ionicons name="search" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Series Grid */}
        <FlatList
          data={seriesList}
          renderItem={renderSeriesItem}
          keyExtractor={(item) => item.id}
          numColumns={COLUMN_COUNT}
          contentContainerStyle={styles.seriesGrid}
          showsVerticalScrollIndicator={false}
          initialNumToRender={12}
          maxToRenderPerBatch={12}
          windowSize={5}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121726',
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  searchButton: {
    padding: 8,
  },
  seriesGrid: {
    padding: 8,
  },
  seriesItem: {
    width: ITEM_WIDTH,
    marginHorizontal: 6,
    marginVertical: 12,
  },
  seriesCover: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  seriesTitle: {
    color: 'white',
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121726',
  },
  loadingText: {
    color: 'white',
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121726',
    padding: 20,
  },
  errorText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: Colors.dark.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Share,
  StatusBar,
  Alert,
  FlatList,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons, MaterialIcons, FontAwesome, MaterialCommunityIcons, Entypo } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import Colors from '../../constants/Colors';
import { getAccounts, getCurrentAccountId } from '../../services/authService';
import { Series, fetchSeries } from '../../services/seriesService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock cast data - this would typically come from an API
const CAST_DATA = [
  { id: '1', name: 'Bryan Cranston', image: 'https://image.tmdb.org/t/p/w500/7Jahy5LZX2Vx65OhBHfBGdYjH81.jpg' },
  { id: '2', name: 'Aaron Paul', image: 'https://image.tmdb.org/t/p/w500/pIHIzr7BiCMcaN6HULKMCGhYRez.jpg' },
  { id: '3', name: 'Anna Gunn', image: 'https://image.tmdb.org/t/p/w500/jZRoHRQbQsraSjCnTgYOGG1u4KU.jpg' },
  { id: '4', name: 'Dean Norris', image: 'https://image.tmdb.org/t/p/w500/tVkHN3qqQX2WQnTBtw9Jbh2gHGI.jpg' },
  { id: '5', name: 'Betsy Brandt', image: 'https://image.tmdb.org/t/p/w500/haFimehtZgQZ1VKf9OQFCwjLTu8.jpg' },
  { id: '6', name: 'RJ Mitte', image: 'https://image.tmdb.org/t/p/w500/z5qxRNrLbA4wL0GI9xZnvvVsI9k.jpg' },
];

// Mock seasons data
const MOCK_SEASONS = [
  { id: '1', name: 'Season 1', episodeCount: 10, year: '2008' },
  { id: '2', name: 'Season 2', episodeCount: 13, year: '2009' },
  { id: '3', name: 'Season 3', episodeCount: 13, year: '2010' },
  { id: '4', name: 'Season 4', episodeCount: 13, year: '2011' },
  { id: '5', name: 'Season 5', episodeCount: 16, year: '2012-2013' },
];

export default function SeriesDetailScreen() {
  const { seriesId } = useLocalSearchParams<{ seriesId: string }>();
  
  const [series, setSeries] = useState<Series | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Load series data
  useEffect(() => {
    loadSeriesData();
  }, [seriesId]);
  
  const loadSeriesData = async () => {
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
      
      // Fetch all series and find the one with matching ID
      const allSeries = await fetchSeries(account);
      const foundSeries = allSeries.find(s => s.id === seriesId);
      
      if (!foundSeries) {
        setError('Series not found');
        return;
      }
      
      setSeries(foundSeries);
      
      // Check if series is in favorites (this would typically use AsyncStorage)
      // For demo purposes, just set a random favorite status
      setIsFavorite(Math.random() > 0.5);
    } catch (error) {
      console.error('Error loading series:', error);
      setError('Failed to load series data');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleWatchEpisode = (seasonId: string, episodeId: string) => {
    if (!series) return;
    
    router.push({
      pathname: 'series/seriesplayer' as any,
      params: {
        seriesId: series.id,
        seasonId,
        episodeId,
        title: series.name
      }
    });
  };
  
  const handleTrailer = () => {
    Alert.alert('Trailer', 'Trailer functionality will be available soon');
    // In a real app, this would navigate to a trailer player
  };
  
  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // In a real app, this would update the favorite status in storage
  };
  
  const handleCast = () => {
    Alert.alert('Cast', 'Casting functionality will be available soon');
    // In a real app, this would open a cast dialog
  };
  
  const handleShare = async () => {
    if (!series) return;
    
    try {
      await Share.share({
        message: `Check out ${series.name} on IPTV Player!`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const renderSeasonItem = ({ item }: { item: typeof MOCK_SEASONS[0] }) => (
    <TouchableOpacity 
      style={styles.seasonItem}
      onPress={() => Alert.alert('Season', `${item.name} selected. This would show episodes.`)}
    >
      <View style={styles.seasonInfo}>
        <Text style={styles.seasonName}>{item.name}</Text>
        <Text style={styles.seasonDetails}>{item.episodeCount} episodes • {item.year}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.5)" />
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
  
  if (error || !series) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar barStyle="light-content" />
        <Text style={styles.errorText}>{error || 'Series not found'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
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
      
      {/* Header with poster */}
      <SafeAreaView style={styles.safeArea}>
        {/* Top Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={28} color="white" />
          </TouchableOpacity>
          
          <View style={styles.navBarRight}>
            <TouchableOpacity
              style={styles.navBarButton}
              onPress={handleCast}
            >
              <MaterialCommunityIcons name="cast" size={28} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.navBarButton}
              onPress={handleToggleFavorite}
            >
              <Ionicons 
                name={isFavorite ? "star" : "star-outline"} 
                size={28} 
                color={isFavorite ? "#FFD700" : "white"} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.navBarButton}
              onPress={handleShare}
            >
              <Ionicons name="share-outline" size={28} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Series Poster and Info */}
          <View style={styles.headerSection}>
            <Image
              source={{ uri: series.posterUrl || 'https://via.placeholder.com/300x450' }}
              style={styles.poster}
              resizeMode="cover"
            />
            
            <View style={styles.infoContainer}>
              <Text style={styles.title}>{series.name}</Text>
              
              {series.rating && (
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={styles.rating}>{series.rating}/10</Text>
                </View>
              )}
              
              {series.year && (
                <Text style={styles.year}>{series.year}</Text>
              )}
              
              {series.seasons && (
                <Text style={styles.seasons}>{series.seasons} Seasons</Text>
              )}
              
              {series.genres && series.genres.length > 0 && (
                <View style={styles.genreContainer}>
                  {series.genres.map((genre, index) => (
                    <View key={index} style={styles.genrePill}>
                      <Text style={styles.genreText}>{genre}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
          
          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.watchButton]}
              onPress={() => handleWatchEpisode('1', '1')}
            >
              <Ionicons name="play" size={20} color="white" />
              <Text style={styles.actionButtonText}>Watch</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleTrailer}
            >
              <MaterialIcons name="movie" size={20} color="white" />
              <Text style={styles.actionButtonText}>Trailer</Text>
            </TouchableOpacity>
          </View>
          
          {/* Series Description */}
          {series.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Storyline</Text>
              <Text style={styles.description}>{series.description}</Text>
            </View>
          )}
          
          {/* Seasons List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Seasons</Text>
            <FlatList
              data={MOCK_SEASONS}
              renderItem={renderSeasonItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
          
          {/* Cast Horizontal Scroll */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cast</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.castContainer}
            >
              {CAST_DATA.map((cast) => (
                <View key={cast.id} style={styles.castItem}>
                  <Image 
                    source={{ uri: cast.image }}
                    style={styles.castImage}
                    resizeMode="cover"
                  />
                  <Text style={styles.castName}>{cast.name}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
          
          {/* Related Series (Just a placeholder) */}
          <View style={[styles.section, styles.lastSection]}>
            <Text style={styles.sectionTitle}>You May Also Like</Text>
            <Text style={styles.comingSoonText}>Recommendations coming soon...</Text>
          </View>
        </ScrollView>
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
  backButton: {
    backgroundColor: Colors.dark.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  navBarRight: {
    flexDirection: 'row',
  },
  navBarButton: {
    padding: 8,
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  headerSection: {
    flexDirection: 'row',
    padding: 16,
  },
  poster: {
    width: SCREEN_WIDTH / 3,
    height: (SCREEN_WIDTH / 3) * 1.5,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  title: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  rating: {
    color: 'white',
    marginLeft: 4,
    fontSize: 14,
  },
  year: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginBottom: 4,
  },
  seasons: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginBottom: 8,
  },
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  genrePill: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  genreText: {
    color: 'white',
    fontSize: 12,
  },
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    flex: 1,
    marginHorizontal: 4,
  },
  watchButton: {
    backgroundColor: Colors.dark.accent,
  },
  actionButtonText: {
    color: 'white',
    marginLeft: 4,
    fontWeight: '500',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  lastSection: {
    borderBottomWidth: 0,
    paddingBottom: 32,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    lineHeight: 20,
  },
  seasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  seasonInfo: {
    flex: 1,
  },
  seasonName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  seasonDetails: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  castContainer: {
    paddingVertical: 8,
  },
  castItem: {
    marginRight: 16,
    alignItems: 'center',
    width: 80,
  },
  castImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  castName: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  comingSoonText: {
    color: 'rgba(255,255,255,0.5)',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 16,
  },
}); 
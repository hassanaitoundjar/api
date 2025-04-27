import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Modal,
  ActivityIndicator,
  Platform,
  FlatList,
  Image,
  ImageBackground,
} from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome, AntDesign, Entypo, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import Colors from '../../constants/Colors';
import { getAccounts, getCurrentAccountId } from '../../services/authService';
import { 
  Movie,
  fetchMovies,
  fetchMovieCategories,
  filterMovies,
} from '../../services/movieService';
import { UserAccount } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Filter options
enum SortOption {
  AZ = 'A-Z',
  FAVORITES = 'Favorites',
  NEW = 'New',
}

// Language filters
const LANGUAGE_FILTERS = [
  { code: 'ALL', label: 'All' },
  { code: 'EN', label: 'English' },
  { code: 'AR', label: 'Arabic' },
  { code: 'FR', label: 'French' },
  { code: 'AF', label: 'Africa' },
];

// Movie grid layout
const GRID_COLUMNS = 3;
const MOVIE_CARD_WIDTH = (SCREEN_WIDTH - 48) / GRID_COLUMNS; // 48 = total horizontal padding and spacing
const MOVIE_CARD_HEIGHT = MOVIE_CARD_WIDTH * 1.5; // Poster aspect ratio

export default function MoviesScreen() {
  const [currentAccount, setCurrentAccount] = useState<UserAccount | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [isPremium, setIsPremium] = useState(false);
  
  // Filter states
  const [favorites, setFavorites] = useState<string[]>([]); 
  const [recentlyWatched, setRecentlyWatched] = useState<Movie[]>([]);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>(SortOption.AZ);
  const [selectedLanguage, setSelectedLanguage] = useState('ALL');
  
  const scrollViewRef = useRef<ScrollView>(null);
  const navigation = useNavigation();

  // Load account and movies data
  useEffect(() => {
    loadData();
    // Load favorites from AsyncStorage (simplified for demo)
    const loadFavorites = async () => {
      // Mock data for now
      setFavorites(['movie1', 'movie2']);
      
      // Check if premium (mock for now)
      setIsPremium(false);
    };
    
    loadFavorites();
  }, []);

  // Update recently watched when movies are loaded
  useEffect(() => {
    if (movies.length > 0 && recentlyWatched.length === 0) {
      // For demo purposes, choose the first few movies with good posters
      const moviesWithPosters = movies.filter(movie => movie.posterUrl);
      setRecentlyWatched(moviesWithPosters.slice(0, 5));
    }
  }, [movies]);

  // Update search results when search term changes
  useEffect(() => {
    if (searchTerm && movies.length > 0) {
      const filtered = filterMovies(movies, { searchTerm });
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, movies]);

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

      // Load movies and categories
      const moviesData = await fetchMovies(account);
      setMovies(moviesData);
      
      // Set a featured movie if available
      if (moviesData.length > 0) {
        setSelectedMovie(moviesData[0]);
      }

      const categoriesData = await fetchMovieCategories(account);
      // Add "All Categories" as the first option
      setCategories(['All Categories', ...categoriesData]);
    } catch (error) {
      console.error('Error loading movies data:', error);
      setError('Failed to load movies. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectMovie = (movie: Movie) => {
    setSelectedMovie(movie);
    
    // Add to recently watched
    const isAlreadyWatched = recentlyWatched.some(m => m.id === movie.id);
    if (!isAlreadyWatched) {
      // Add to the beginning and limit to 5 items
      setRecentlyWatched([movie, ...recentlyWatched.slice(0, 4)]);
    } else {
      // Move to the top
      setRecentlyWatched([
        movie,
        ...recentlyWatched.filter(m => m.id !== movie.id)
      ]);
    }
    
    // Navigate to movie details screen
    router.push({
      pathname: 'movies/moviesdetail' as any,
      params: { movieId: movie.id }
    });
    
    // Close search modal if open
    if (searchModalVisible) {
      setSearchModalVisible(false);
      setSearchTerm('');
    }
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setCategoryDropdownOpen(false);
    // Scroll to top when category changes
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  const handleSearch = (text: string) => {
    setSearchTerm(text);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleRefresh = () => {
    loadData();
  };

  const toggleFavorite = (movieId: string) => {
    if (favorites.includes(movieId)) {
      setFavorites(favorites.filter(id => id !== movieId));
    } else {
      setFavorites([...favorites, movieId]);
    }
  };

  const handleSortChange = (option: SortOption) => {
    setSortOption(option);
  };

  const handleLanguageFilterChange = (language: string) => {
    setSelectedLanguage(language);
  };

  const getFilteredMovies = () => {
    return filterMovies(movies, {
      category: selectedCategory !== 'All Categories' ? selectedCategory : undefined,
      language: selectedLanguage !== 'ALL' ? selectedLanguage : undefined,
      favoritesOnly: sortOption === SortOption.FAVORITES,
      favorites,
      sortBy: sortOption === SortOption.AZ ? 'az' : 
              sortOption === SortOption.NEW ? 'new' : 
              sortOption === SortOption.FAVORITES ? 'rating' : undefined
    });
  };

  // Render loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color={Colors.dark.accent} />
        <Text style={styles.loadingText}>Loading your movies...</Text>
      </SafeAreaView>
    );
  }

  // Render error state
  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar barStyle="light-content" />
        <MaterialIcons name="error" size={60} color={Colors.dark.accent} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Text style={styles.refreshButtonText}>Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Get filtered movies
  const filteredMovies = getFilteredMovies();

  // Render movie card
  const renderMovieCard = ({ item: movie }: { item: Movie }) => {
    const isFavorite = favorites.includes(movie.id);
    
    return (
      <TouchableOpacity 
        style={styles.movieCard}
        onPress={() => handleSelectMovie(movie)}
        activeOpacity={0.7}
      >
        <View style={styles.moviePosterContainer}>
          {movie.posterUrl ? (
            <Image
              source={{ uri: movie.posterUrl }}
              style={styles.moviePoster}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.moviePosterPlaceholder}>
              <FontAwesome name="film" size={24} color={Colors.dark.textSecondary} />
            </View>
          )}
          
          {/* Favorite button */}
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={() => toggleFavorite(movie.id)}
          >
            <FontAwesome 
              name={isFavorite ? "star" : "star-o"} 
              size={18} 
              color={isFavorite ? Colors.dark.accent : "white"} 
            />
          </TouchableOpacity>
          
          {/* Rating */}
          {movie.rating && (
            <View style={styles.ratingContainer}>
              <FontAwesome name="star" size={10} color="#FFD700" />
              <Text style={styles.ratingText}>{movie.rating.toFixed(1)}</Text>
            </View>
          )}
          
          {/* New label */}
          {movie.isNew && (
            <View style={styles.newLabel}>
              <Text style={styles.newLabelText}>NEW</Text>
            </View>
          )}
        </View>
        
        <View style={styles.movieInfo}>
          <Text style={styles.movieTitle} numberOfLines={2}>
            {movie.name}
            {movie.language && ` [${movie.language}]`}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Render recently watched movie
  const renderRecentMovie = ({ item: movie }: { item: Movie }) => {
    return (
      <TouchableOpacity 
        style={styles.recentCard}
        onPress={() => handleSelectMovie(movie)}
        activeOpacity={0.7}
      >
        <View style={styles.recentCardInner}>
          {movie.posterUrl ? (
            <Image
              source={{ uri: movie.posterUrl }}
              style={styles.recentCardImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.recentCardPlaceholder}>
              <FontAwesome name="film" size={24} color={Colors.dark.textSecondary} />
            </View>
          )}
          <Text style={styles.recentCardTitle} numberOfLines={1}>{movie.name}</Text>
          {movie.rating && (
            <View style={styles.recentCardRating}>
              <FontAwesome name="star" size={10} color="#FFD700" />
              <Text style={styles.recentCardRatingText}>{movie.rating.toFixed(1)}</Text>
            </View>
          )}
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
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.appBarTitle}>Movies</Text>
        </View>
        <View style={styles.appBarRight}>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => setSearchModalVisible(true)}
          >
            <Ionicons name="search" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Premium Banner */}
      {!isPremium && (
        <View style={styles.premiumBanner}>
          <View style={styles.premiumIconContainer}>
            <MaterialCommunityIcons name="crown" size={18} color="#FFD700" />
          </View>
          <Text style={styles.premiumText}>
            Go Premium: Remove ads, Dark mode, and more
          </Text>
          <TouchableOpacity style={styles.premiumButton}>
            <Ionicons name="arrow-forward" size={16} color="white" />
          </TouchableOpacity>
        </View>
      )}
      
      {/* Categories and Filters */}
      <View style={styles.filterContainer}>
        <View style={styles.categoryDropdown}>
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
          >
            <Text style={styles.dropdownButtonText}>{selectedCategory}</Text>
            <MaterialIcons 
              name={categoryDropdownOpen ? "arrow-drop-up" : "arrow-drop-down"} 
              size={24} 
              color={Colors.dark.textPrimary} 
            />
          </TouchableOpacity>
          
          {categoryDropdownOpen && (
            <View style={styles.dropdownContent}>
              <ScrollView style={styles.dropdownScroll} nestedScrollEnabled={true}>
                {categories.map(category => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.dropdownItem,
                      selectedCategory === category && styles.selectedDropdownItem
                    ]}
                    onPress={() => handleCategorySelect(category)}
                  >
                    <Text 
                      style={[
                        styles.dropdownItemText,
                        selectedCategory === category && styles.selectedDropdownItemText
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
        
        {/* Movie counts */}
        <View style={styles.countsContainer}>
          <Text style={styles.countsText}>
            Total movies: <Text style={styles.countsHighlight}>{movies.length}</Text>
            {favorites.length > 0 ? ` • Favorites: ` : ''}
            {favorites.length > 0 && (
              <Text style={styles.countsHighlight}>
                {favorites.length}
              </Text>
            )}
            {sortOption === SortOption.FAVORITES && (
              <Text style={styles.countsNote}> (showing only favorites)</Text>
            )}
          </Text>
        </View>
        
        <ScrollView 
          horizontal 
          style={styles.filterScroll}
          showsHorizontalScrollIndicator={false}
        >
          {/* Sort options */}
          <TouchableOpacity 
            style={[
              styles.filterButton,
              sortOption === SortOption.AZ && styles.activeFilterButton
            ]}
            onPress={() => handleSortChange(SortOption.AZ)}
          >
            <Text style={[
              styles.filterButtonText,
              sortOption === SortOption.AZ && styles.activeFilterButtonText
            ]}>A-Z</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.filterButton,
              sortOption === SortOption.FAVORITES && styles.activeFilterButton
            ]}
            onPress={() => handleSortChange(SortOption.FAVORITES)}
          >
            <FontAwesome 
              name="star" 
              size={14} 
              color={sortOption === SortOption.FAVORITES ? Colors.dark.textPrimary : Colors.dark.textSecondary} 
              style={styles.filterButtonIcon}
            />
            <Text style={[
              styles.filterButtonText,
              sortOption === SortOption.FAVORITES && styles.activeFilterButtonText
            ]}>
              Favorites{favorites.length > 0 ? ` (${favorites.length})` : ''}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.filterButton,
              sortOption === SortOption.NEW && styles.activeFilterButton
            ]}
            onPress={() => handleSortChange(SortOption.NEW)}
          >
            <Text style={[
              styles.filterButtonText,
              sortOption === SortOption.NEW && styles.activeFilterButtonText
            ]}>NEW</Text>
          </TouchableOpacity>
          
          {/* Language filters */}
          {LANGUAGE_FILTERS.map(language => (
            <TouchableOpacity 
              key={language.code}
              style={[
                styles.filterButton,
                selectedLanguage === language.code && styles.activeFilterButton
              ]}
              onPress={() => handleLanguageFilterChange(language.code)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedLanguage === language.code && styles.activeFilterButtonText
              ]}>{language.code}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {/* Main content with vertical scrolling */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={true}
      >
        {/* Recently Watched Section */}
        {recentlyWatched.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>Recently Watched</Text>
            <FlatList
              data={recentlyWatched}
              renderItem={renderRecentMovie}
              keyExtractor={(item) => `recent-${item.id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentList}
            />
          </View>
        )}
        
        {/* Movies Grid Section */}
        <View style={styles.moviesSection}>
          <Text style={styles.sectionTitle}>
            Movies
            <Text style={styles.movieCount}> ({filteredMovies.length})</Text>
          </Text>
          
          {filteredMovies.length > 0 ? (
            <FlatList
              data={filteredMovies}
              renderItem={renderMovieCard}
              keyExtractor={(item) => item.id}
              numColumns={GRID_COLUMNS}
              scrollEnabled={false}
              contentContainerStyle={styles.moviesGrid}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {sortOption === SortOption.FAVORITES
                  ? "No favorite movies found. Add movies to favorites by tapping the star icon."
                  : "No movies found for the selected filters."
                }
              </Text>
            </View>
          )}
        </View>
        
        {/* Space at bottom for better scrolling */}
        <View style={styles.bottomSpace} />
      </ScrollView>
      
      {/* Search modal */}
      <Modal
        visible={searchModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSearchModalVisible(false)}
      >
        <View style={styles.searchModalContainer}>
          <View style={styles.searchModalContent}>
            <View style={styles.searchHeader}>
              <View style={styles.searchInputContainer}>
                <Ionicons 
                  name="search" 
                  size={20} 
                  color={Colors.dark.textSecondary}
                  style={styles.searchIcon}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search for movies..."
                  placeholderTextColor={Colors.dark.textSecondary}
                  value={searchTerm}
                  onChangeText={handleSearch}
                  autoFocus={true}
                />
                {searchTerm !== '' && (
                  <TouchableOpacity onPress={handleClearSearch}>
                    <Ionicons 
                      name="close-circle" 
                      size={20}
                      color={Colors.dark.textSecondary}
                    />
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity
                onPress={() => {
                  setSearchModalVisible(false);
                  setSearchTerm('');
                }}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.searchResults}>
              {searchTerm === '' ? (
                <Text style={styles.searchHint}>Start typing to search movies</Text>
              ) : searchResults.length === 0 ? (
                <Text style={styles.noResults}>No movies found for "{searchTerm}"</Text>
              ) : (
                <FlatList
                  data={searchResults}
                  renderItem={({ item: movie }) => (
                    <TouchableOpacity
                      key={movie.id}
                      style={styles.searchResultItem}
                      onPress={() => handleSelectMovie(movie)}
                    >
                      {movie.posterUrl ? (
                        <Image 
                          source={{ uri: movie.posterUrl }} 
                          style={styles.searchResultImage}
                        />
                      ) : (
                        <View style={styles.searchResultImagePlaceholder}>
                          <FontAwesome name="film" size={20} color={Colors.dark.textSecondary} />
                        </View>
                      )}
                      <View style={styles.searchResultInfo}>
                        <Text style={styles.searchResultTitle}>{movie.name}</Text>
                        {movie.rating && (
                          <View style={styles.searchResultRating}>
                            <FontAwesome name="star" size={12} color="#FFD700" />
                            <Text style={styles.searchResultRatingText}>{movie.rating.toFixed(1)}</Text>
                          </View>
                        )}
                      </View>
                      <Ionicons name="play-circle-outline" size={24} color={Colors.dark.accent} />
                    </TouchableOpacity>
                  )}
                  keyExtractor={item => `search-${item.id}`}
                  scrollEnabled={false}
                />
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  backButton: {
    marginRight: 12,
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
  // Premium Banner
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.backgroundSecondary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  premiumIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  premiumText: {
    flex: 1,
    color: Colors.dark.textPrimary,
    fontSize: 14,
  },
  premiumButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.dark.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Categories and Filters
  filterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  categoryDropdown: {
    marginBottom: 12,
    position: 'relative',
    zIndex: 2, // Ensure dropdown shows above other content
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  dropdownButtonText: {
    color: Colors.dark.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  dropdownContent: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: Colors.dark.backgroundTertiary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    marginTop: 4,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  selectedDropdownItem: {
    backgroundColor: Colors.dark.accent + '20',
  },
  dropdownItemText: {
    color: Colors.dark.textPrimary,
    fontSize: 14,
  },
  selectedDropdownItemText: {
    color: Colors.dark.accent,
    fontWeight: 'bold',
  },
  countsContainer: {
    marginBottom: 12,
  },
  countsText: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
  },
  countsHighlight: {
    fontWeight: 'bold',
  },
  countsNote: {
    color: Colors.dark.textSecondary,
    fontWeight: 'normal',
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  activeFilterButton: {
    backgroundColor: Colors.dark.accent,
    borderColor: Colors.dark.accent,
  },
  filterButtonIcon: {
    marginRight: 4,
  },
  filterButtonText: {
    color: Colors.dark.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: Colors.dark.textPrimary,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  // Recently Watched Section
  recentSection: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.textPrimary,
    marginBottom: 12,
  },
  movieCount: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    fontWeight: 'normal',
  },
  recentList: {
    paddingRight: 16,
  },
  recentCard: {
    width: 120,
    height: 180,
    marginRight: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  recentCardInner: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: 8,
    overflow: 'hidden',
  },
  recentCardImage: {
    width: '100%',
    height: 140,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  recentCardPlaceholder: {
    width: '100%',
    height: 140,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: Colors.dark.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentCardTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.dark.textPrimary,
    marginTop: 8,
    marginBottom: 4,
    marginHorizontal: 8,
  },
  recentCardRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginBottom: 8,
  },
  recentCardRatingText: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    marginLeft: 4,
  },
  // Movies Grid Section
  moviesSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  moviesGrid: {
    paddingBottom: 16,
  },
  movieCard: {
    width: MOVIE_CARD_WIDTH,
    marginHorizontal: 4,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: Colors.dark.backgroundSecondary,
  },
  moviePosterContainer: {
    width: '100%',
    height: MOVIE_CARD_WIDTH * 1.5,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  moviePoster: {
    width: '100%',
    height: '100%',
  },
  moviePosterPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.dark.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  ratingContainer: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  ratingText: {
    color: 'white',
    fontSize: 11,
    marginLeft: 4,
    fontWeight: 'bold',
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
  movieInfo: {
    padding: 8,
  },
  movieTitle: {
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
  bottomSpace: {
    height: 60,
  },
  // Search Modal
  searchModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  searchModalContent: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: Colors.dark.textPrimary,
    fontSize: 16,
    height: 40,
  },
  cancelButton: {
    paddingLeft: 16,
  },
  cancelButtonText: {
    color: Colors.dark.accent,
    fontSize: 16,
  },
  searchResults: {
    flex: 1,
    padding: 16,
  },
  searchHint: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
  noResults: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  searchResultImage: {
    width: 50,
    height: 75,
    borderRadius: 4,
  },
  searchResultImagePlaceholder: {
    width: 50,
    height: 75,
    borderRadius: 4,
    backgroundColor: Colors.dark.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchResultInfo: {
    flex: 1,
    marginLeft: 12,
  },
  searchResultTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.dark.textPrimary,
    marginBottom: 4,
  },
  searchResultRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchResultRatingText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginLeft: 4,
  },
}); 
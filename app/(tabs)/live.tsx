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
} from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome, AntDesign, Entypo } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';

import ChannelRow from '../../components/ChannelRow';
import Colors from '../../constants/Colors';
import { getAccounts, getCurrentAccountId } from '../../services/authService';
import { 
  LiveChannel, 
  fetchLiveChannels, 
  fetchChannelCategories,
  filterChannels 
} from '../../services/channelService';
import { UserAccount } from '../../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Filter options
enum SortOption {
  AZ = 'A-Z',
  FAVORITES = 'Favorites',
  NEW = 'New',
}

// Language filters
const LANGUAGE_FILTERS = [
  { code: 'ALL', label: 'All' },
  { code: 'AR', label: 'Arabic' },
  { code: 'EN', label: 'English' },
  { code: 'FR', label: 'French' },
  { code: 'US', label: 'USA' },
  { code: 'AF', label: 'Africa' },
];

export default function LiveTVScreen() {
  const [currentAccount, setCurrentAccount] = useState<UserAccount | null>(null);
  const [channels, setChannels] = useState<LiveChannel[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<LiveChannel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<LiveChannel[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Channels');
  
  // New states for the requested features
  const [favorites, setFavorites] = useState<string[]>([]); // Array of channel IDs
  const [recentlyWatched, setRecentlyWatched] = useState<LiveChannel[]>([]);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>(SortOption.AZ);
  const [selectedLanguage, setSelectedLanguage] = useState('ALL');
  
  const scrollViewRef = useRef<ScrollView>(null);
  const navigation = useNavigation();

  // Load account and channels data
  useEffect(() => {
    loadData();
    // Load favorites from AsyncStorage (simplified for demo)
    // In a real app, you would use AsyncStorage to persist this data
    const loadFavorites = async () => {
      // Mock data for now
      setFavorites(['channel1', 'channel2']);
      
      // Mock recently watched
      // In a real app, this would be persisted and loaded from storage
      if (channels.length > 0) {
        setRecentlyWatched(channels.slice(0, 3));
      }
    };
    
    loadFavorites();
  }, []);

  // Update recently watched when channels are loaded
  useEffect(() => {
    if (channels.length > 0 && recentlyWatched.length === 0) {
      // For demo purposes, just choose the first few channels
      setRecentlyWatched(channels.slice(0, 3));
    }
  }, [channels]);

  // Update search results when search term changes
  useEffect(() => {
    if (searchTerm && channels.length > 0) {
      const filtered = filterChannels(channels, searchTerm);
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, channels]);

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

      // Load channels and categories
      const channelsData = await fetchLiveChannels(account);
      setChannels(channelsData);
      
      // Set a featured channel if available
      if (channelsData.length > 0) {
        // Find a good featured channel (preferring news/sports)
        const featuredCandidates = channelsData.filter(c => 
          c.category === 'News' || c.category === 'Sports'
        );
        
        setSelectedChannel(
          featuredCandidates.length > 0 
            ? featuredCandidates[Math.floor(Math.random() * featuredCandidates.length)]
            : channelsData[0]
        );
      }

      const categoriesData = await fetchChannelCategories(account);
      // Add "All Channels" as the first option
      setCategories(['All Channels', ...categoriesData]);
    } catch (error) {
      console.error('Error loading TV data:', error);
      setError('Failed to load channels. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectChannel = (channel: LiveChannel) => {
    setSelectedChannel(channel);
    
    // Add to recently watched
    const isAlreadyWatched = recentlyWatched.some(c => c.id === channel.id);
    if (!isAlreadyWatched) {
      // Add to the beginning and limit to 5 items
      setRecentlyWatched([channel, ...recentlyWatched.slice(0, 4)]);
    } else {
      // Move to the top
      setRecentlyWatched([
        channel,
        ...recentlyWatched.filter(c => c.id !== channel.id)
      ]);
    }
    
    // Navigate to player screen
    router.push({
      pathname: "/player" as any,
      params: { 
        channelId: channel.id,
        channelName: channel.name,
        streamUrl: channel.streamUrl
      }
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

  const toggleFavorite = (channelId: string) => {
    if (favorites.includes(channelId)) {
      setFavorites(favorites.filter(id => id !== channelId));
    } else {
      setFavorites([...favorites, channelId]);
    }
  };

  const handleSortChange = (option: SortOption) => {
    setSortOption(option);
  };

  const handleLanguageFilterChange = (language: string) => {
    setSelectedLanguage(language);
  };

  const getFilteredChannels = () => {
    // First filter by category
    let filtered = selectedCategory === 'All Channels' 
      ? channels 
      : channels.filter(channel => channel.category === selectedCategory);
    
    // Then filter by language if not ALL
    if (selectedLanguage !== 'ALL') {
      filtered = filtered.filter(channel => {
        // In a real app, you would have a proper language field
        // For demo, we'll consider the first 2 chars of name as the language code
        const channelName = channel.name || '';
        return channelName.startsWith(selectedLanguage);
      });
    }
    
    // Filter by favorites if Favorites option is selected
    if (sortOption === SortOption.FAVORITES) {
      filtered = filtered.filter(channel => favorites.includes(channel.id));
    }
    
    // Then sort based on selected sort option
    switch (sortOption) {
      case SortOption.AZ:
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
      case SortOption.FAVORITES:
        // Already filtered to show only favorites above, just sort alphabetically
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
      case SortOption.NEW:
        // In a real app, you would have a date added field
        // For demo, we'll just return as is (assuming newer channels are first)
        return filtered;
      default:
        return filtered;
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color={Colors.dark.accent} />
        <Text style={styles.loadingText}>Loading your channels...</Text>
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

  // Get filtered channels based on selections
  const filteredChannels = getFilteredChannels();

  const renderChannelItem = ({ item: channel }: { item: LiveChannel }) => {
    const isFavorite = favorites.includes(channel.id);
    
    return (
      <TouchableOpacity 
        style={styles.channelItem}
        onPress={() => handleSelectChannel(channel)}
        activeOpacity={0.7}
      >
        <View style={styles.channelLogo}>
          {channel.logoUrl ? (
            <Image
              source={{ uri: channel.logoUrl }}
              style={styles.logoImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoPlaceholderText}>
                {channel.name.substring(0, 2).toUpperCase()}
              </Text>
            </View>
          )}
          {isFavorite && (
            <View style={styles.favoriteBadge}>
              <FontAwesome name="star" size={10} color="#fff" />
            </View>
          )}
        </View>
        
        <View style={styles.channelInfo}>
          <Text style={styles.channelName}>
            {/* Add language prefix for demo */}
            <Text style={styles.languagePrefix}>{channel.name.substring(0, 2).toUpperCase()} | </Text>
            {channel.name}
          </Text>
          {channel.category && (
            <Text style={styles.channelCategory}>{channel.category}</Text>
          )}
        </View>
        
        <View style={styles.channelActions}>
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={() => toggleFavorite(channel.id)}
          >
            <FontAwesome 
              name={isFavorite ? "star" : "star-o"} 
              size={22} 
              color={isFavorite ? Colors.dark.accent : Colors.dark.textSecondary} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.moreButton}>
            <Entypo name="dots-three-vertical" size={16} color={Colors.dark.textSecondary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderRecentItem = ({ item: channel }: { item: LiveChannel }) => {
    return (
      <TouchableOpacity 
        style={styles.recentCard}
        onPress={() => handleSelectChannel(channel)}
      >
        <View style={styles.recentCardInner}>
          {channel.logoUrl ? (
            <Image
              source={{ uri: channel.logoUrl }}
              style={styles.recentCardImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.recentCardPlaceholder}>
              <Text style={styles.recentCardPlaceholderText}>
                {channel.name.substring(0, 2).toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={styles.recentCardTitle} numberOfLines={1}>{channel.name}</Text>
          {channel.category && (
            <Text style={styles.recentCardCategory} numberOfLines={1}>{channel.category}</Text>
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
          <Text style={styles.appBarTitle}>Live TV</Text>
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
        
        {/* Channel counts */}
        <View style={styles.countsContainer}>
          <Text style={styles.countsText}>
            Total channels: <Text style={styles.countsHighlight}>{channels.length}</Text>
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
              renderItem={renderRecentItem}
              keyExtractor={(item) => `recent-${item.id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentList}
            />
          </View>
        )}
        
        {/* Channels Section */}
        <View style={styles.channelsSection}>
          <Text style={styles.sectionTitle}>
            Channels 
            <Text style={styles.channelCount}> ({filteredChannels.length})</Text>
          </Text>
          
          {filteredChannels.length > 0 ? (
            <FlatList
              data={filteredChannels}
              renderItem={renderChannelItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false} // Parent ScrollView handles scrolling
              contentContainerStyle={styles.channelsList}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {sortOption === SortOption.FAVORITES
                  ? "No favorite channels found. Add channels to favorites by tapping the star icon."
                  : "No channels found for the selected filters."
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
                  placeholder="Search for channels..."
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
                <Text style={styles.searchHint}>Start typing to search channels</Text>
              ) : searchResults.length === 0 ? (
                <Text style={styles.noResults}>No channels found for "{searchTerm}"</Text>
              ) : (
                searchResults.map(channel => (
                  <TouchableOpacity
                    key={channel.id}
                    style={styles.searchResultItem}
                    onPress={() => handleSelectChannel(channel)}
                  >
                    <Ionicons name="tv-outline" size={24} color={Colors.dark.textSecondary} />
                    <View style={styles.searchResultInfo}>
                      <Text style={styles.searchResultTitle}>{channel.name}</Text>
                      {channel.category && (
                        <Text style={styles.searchResultCategory}>{channel.category}</Text>
                      )}
                    </View>
                    <Ionicons name="play-circle-outline" size={24} color={Colors.dark.accent} />
                  </TouchableOpacity>
                ))
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
  channelCount: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    fontWeight: 'normal',
  },
  recentList: {
    paddingRight: 16,
  },
  recentCard: {
    width: 120,
    height: 160,
    marginRight: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  recentCardInner: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: 8,
    padding: 8,
  },
  recentCardImage: {
    width: '100%',
    height: 90,
    borderRadius: 4,
    marginBottom: 8,
  },
  recentCardPlaceholder: {
    width: '100%',
    height: 90,
    borderRadius: 4,
    backgroundColor: Colors.dark.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  recentCardPlaceholderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.textSecondary,
  },
  recentCardTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.dark.textPrimary,
    marginBottom: 2,
  },
  recentCardCategory: {
    fontSize: 10,
    color: Colors.dark.textSecondary,
  },
  // Channels Section
  channelsSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  channelsList: {
    paddingBottom: 16,
  },
  channelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  channelLogo: {
    width: 45,
    height: 45,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: Colors.dark.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  logoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.backgroundTertiary,
  },
  logoPlaceholderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.textSecondary,
  },
  channelInfo: {
    flex: 1,
    paddingHorizontal: 12,
  },
  channelName: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.dark.textPrimary,
    marginBottom: 4,
  },
  languagePrefix: {
    color: Colors.dark.textSecondary,
    fontWeight: 'normal',
  },
  channelCategory: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  channelActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  favoriteButton: {
    padding: 8,
    marginRight: 4,
  },
  moreButton: {
    padding: 8,
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
  searchResultInfo: {
    flex: 1,
    marginLeft: 12,
  },
  searchResultTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.dark.textPrimary,
  },
  searchResultCategory: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  favoriteBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.dark.accent,
    borderRadius: 10,
    paddingHorizontal: 2,
    paddingVertical: 1,
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
}); 
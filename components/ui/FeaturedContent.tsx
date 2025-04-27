import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  FlatList, 
  ImageBackground,
  Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface FeaturedItem {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  type?: string;
  year?: string;
  rating?: string;
}

interface FeaturedContentProps {
  featuredItems: FeaturedItem[];
  onItemPress: (item: FeaturedItem) => void;
  isLoading?: boolean;
}

const FeaturedContent: React.FC<FeaturedContentProps> = ({
  featuredItems,
  onItemPress,
  isLoading = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const renderPlaceholder = () => (
    <View style={styles.placeholderContainer}>
      <View style={styles.placeholderContent}>
        <View style={styles.placeholderTitle} />
        <View style={styles.placeholderDescription} />
        <View style={styles.placeholderButtons} />
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: FeaturedItem }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.itemContainer}
      onPress={() => onItemPress(item)}
    >
      <ImageBackground
        source={{ uri: item.imageUrl }}
        style={styles.itemBackground}
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)', 'rgba(0,0,0,0.9)']}
          style={styles.gradient}
        >
          <View style={styles.contentContainer}>
            <Text style={styles.title}>{item.title}</Text>
            
            <View style={styles.metaContainer}>
              {item.year && <Text style={styles.metaText}>{item.year}</Text>}
              {item.type && (
                <>
                  <View style={styles.dot} />
                  <Text style={styles.metaText}>{item.type}</Text>
                </>
              )}
              {item.rating && (
                <>
                  <View style={styles.dot} />
                  <Text style={styles.metaText}>{item.rating}</Text>
                </>
              )}
            </View>
            
            {item.description && (
              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>
            )}

            <View style={styles.buttonsContainer}>
              <TouchableOpacity style={styles.playButton} onPress={() => onItemPress(item)}>
                <Ionicons name="play" size={22} color="#000" />
                <Text style={styles.playText}>Play</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="add" size={24} color="white" />
                <Text style={styles.iconText}>My List</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="information-circle-outline" size={24} color="white" />
                <Text style={styles.iconText}>Info</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );

  // Render pagination indicators
  const renderPagination = () => {
    return (
      <View style={styles.paginationContainer}>
        {featuredItems.map((_, index) => {
          const inputRange = [
            (index - 1) * SCREEN_WIDTH,
            index * SCREEN_WIDTH,
            (index + 1) * SCREEN_WIDTH,
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 16, 8],
            extrapolate: 'clamp',
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={`dot-${index}`}
              style={[
                styles.dot,
                { width: dotWidth, opacity },
              ]}
            />
          );
        })}
      </View>
    );
  };

  if (isLoading) {
    return renderPlaceholder();
  }

  if (featuredItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No featured content available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={flatListRef}
        data={featuredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(
            event.nativeEvent.contentOffset.x / SCREEN_WIDTH
          );
          setCurrentIndex(newIndex);
        }}
      />
      {renderPagination()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 500,
    marginBottom: 20,
  },
  itemContainer: {
    width: SCREEN_WIDTH,
    height: 500,
  },
  itemBackground: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
    justifyContent: 'flex-end',
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaText: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dark.accent,
    marginHorizontal: 4,
  },
  description: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
    marginBottom: 16,
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  playButton: {
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  playText: {
    color: 'black',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  iconButton: {
    alignItems: 'center',
    marginHorizontal: 12,
  },
  iconText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    width: '100%',
  },
  placeholderContainer: {
    height: 500,
    width: SCREEN_WIDTH,
    backgroundColor: Colors.dark.backgroundSecondary,
  },
  placeholderContent: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  placeholderTitle: {
    height: 24,
    width: '70%',
    backgroundColor: Colors.dark.backgroundTertiary,
    borderRadius: 4,
    marginBottom: 12,
  },
  placeholderDescription: {
    height: 14,
    width: '90%',
    backgroundColor: Colors.dark.backgroundTertiary,
    borderRadius: 4,
    marginBottom: 20,
  },
  placeholderButtons: {
    height: 40,
    width: '50%',
    backgroundColor: Colors.dark.backgroundTertiary,
    borderRadius: 4,
  },
  emptyContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
  },
});

export default FeaturedContent; 
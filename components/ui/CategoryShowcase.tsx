import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image,
  Dimensions 
} from 'react-native';
import Colors from '../../constants/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ContentItem {
  id: string;
  title: string;
  imageUrl: string;
  type?: 'movie' | 'series' | 'documentary';
  year?: string;
  rating?: string;
}

interface CategoryShowcaseProps {
  title: string;
  items: ContentItem[];
  onItemPress: (item: ContentItem) => void;
  onSeeAllPress?: () => void;
  isLoading?: boolean;
  aspectRatio?: number; // Default will be 2/3 (portrait)
}

const CategoryShowcase: React.FC<CategoryShowcaseProps> = ({
  title,
  items,
  onItemPress,
  onSeeAllPress,
  isLoading = false,
  aspectRatio = 2/3, // poster style by default
}) => {
  const renderPlaceholders = () => {
    const placeholders = [];
    for (let i = 0; i < 4; i++) {
      placeholders.push(
        <View 
          key={`placeholder-${i}`} 
          style={[
            styles.placeholderItem, 
            { aspectRatio }
          ]} 
        />
      );
    }
    return (
      <FlatList
        data={placeholders}
        renderItem={({ item }) => item}
        keyExtractor={(_, index) => `placeholder-${index}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    );
  };

  const renderItem = ({ item }: { item: ContentItem }) => (
    <TouchableOpacity 
      style={styles.itemContainer}
      activeOpacity={0.7}
      onPress={() => onItemPress(item)}
    >
      <View style={styles.itemImageContainer}>
        <Image 
          source={{ uri: item.imageUrl }} 
          style={[styles.itemImage, { aspectRatio }]} 
        />
        {(item.type || item.year || item.rating) && (
          <View style={styles.itemMetadata}>
            {item.type && (
              <View style={styles.metadataTag}>
                <Text style={styles.metadataText}>{item.type}</Text>
              </View>
            )}
            {item.year && (
              <Text style={styles.metadataText}>{item.year}</Text>
            )}
            {item.rating && (
              <View style={styles.ratingTag}>
                <Text style={styles.metadataText}>{item.rating}</Text>
              </View>
            )}
          </View>
        )}
      </View>
      <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>{title}</Text>
        {items.length > 0 && onSeeAllPress && (
          <TouchableOpacity onPress={onSeeAllPress}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        renderPlaceholders()
      ) : items.length > 0 ? (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No content available</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.dark.accent,
  },
  listContainer: {
    paddingHorizontal: 8,
  },
  itemContainer: {
    width: Math.min(SCREEN_WIDTH * 0.33, 150),
    marginHorizontal: 8,
  },
  itemImageContainer: {
    position: 'relative',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  itemImage: {
    width: '100%',
    borderRadius: 4,
    backgroundColor: Colors.dark.backgroundSecondary,
  },
  itemMetadata: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    alignItems: 'center',
  },
  metadataTag: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
  },
  ratingTag: {
    backgroundColor: 'rgba(255, 180, 0, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
  },
  metadataText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '500',
  },
  itemTitle: {
    fontSize: 14,
    color: Colors.dark.text,
  },
  placeholderItem: {
    width: Math.min(SCREEN_WIDTH * 0.33, 150),
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: 4,
    marginHorizontal: 8,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
});

export default CategoryShowcase; 
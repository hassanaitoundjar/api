import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../../constants/Colors';

interface ContentItem {
  id: string;
  title: string;
  imageUrl?: string;
  type?: 'channel' | 'movie' | 'series';
}

interface ContentRowProps {
  title: string;
  items: ContentItem[];
  onItemPress: (item: ContentItem) => void;
  viewAll?: () => void;
  isLoading?: boolean;
}

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.33; // 3 items per row
const ITEM_HEIGHT = ITEM_WIDTH * 1.5; // Poster aspect ratio

const ContentRow: React.FC<ContentRowProps> = ({
  title,
  items,
  onItemPress,
  viewAll,
  isLoading = false,
}) => {
  const renderPlaceholders = () => {
    return Array(5).fill(0).map((_, index) => (
      <View key={`placeholder-${index}`} style={[styles.itemContainer, styles.placeholder]}>
        <View style={styles.placeholderImage} />
        <View style={styles.placeholderTitle} />
      </View>
    ));
  };

  const renderItem = ({ item }: { item: ContentItem }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => onItemPress(item)}
      activeOpacity={0.7}
    >
      <Image
        source={
          item.imageUrl
            ? { uri: item.imageUrl }
            : require('../../assets/images/adaptive-icon.png')
        }
        style={styles.itemImage}
        resizeMode="cover"
      />
      <Text style={styles.itemTitle} numberOfLines={1}>
        {item.title}
      </Text>
      {item.type && (
        <View style={styles.typeIconContainer}>
          <FontAwesome5
            name={
              item.type === 'channel'
                ? 'tv'
                : item.type === 'movie'
                ? 'film'
                : 'play-circle'
            }
            size={12}
            color="#fff"
          />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>{title}</Text>
        {viewAll && (
          <TouchableOpacity onPress={viewAll}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={styles.rowContainer}>
          {renderPlaceholders()}
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.textPrimary,
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.dark.accent,
  },
  rowContainer: {
    flexDirection: 'row',
    paddingLeft: 16,
  },
  listContent: {
    paddingLeft: 16,
    paddingRight: 16,
  },
  itemContainer: {
    width: ITEM_WIDTH,
    marginRight: 8,
  },
  itemImage: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    borderRadius: 4,
  },
  itemTitle: {
    fontSize: 14,
    color: Colors.dark.textPrimary,
    marginTop: 4,
  },
  typeIconContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 6,
    borderRadius: 12,
  },
  placeholder: {
    opacity: 0.5,
  },
  placeholderImage: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    borderRadius: 4,
    backgroundColor: Colors.dark.backgroundTertiary,
  },
  placeholderTitle: {
    width: '80%',
    height: 14,
    backgroundColor: Colors.dark.backgroundTertiary,
    marginTop: 4,
    borderRadius: 2,
  },
});

export default ContentRow; 
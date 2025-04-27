import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_WIDTH = SCREEN_WIDTH * 0.32;
const ITEM_HEIGHT = ITEM_WIDTH * 1.5;

interface WatchProgress {
  percentComplete: number; // 0-100
  remainingMinutes?: number;
}

interface WatchItem {
  id: string;
  title: string;
  imageUrl: string;
  progress: WatchProgress;
}

interface ContinueWatchingProps {
  items: WatchItem[];
  onItemPress: (item: WatchItem) => void;
  onRemoveItem?: (itemId: string) => void;
  isLoading?: boolean;
}

const ContinueWatching: React.FC<ContinueWatchingProps> = ({
  items,
  onItemPress,
  onRemoveItem,
  isLoading = false,
}) => {
  const renderPlaceholders = () => {
    return Array(4)
      .fill(0)
      .map((_, index) => (
        <View key={`placeholder-${index}`} style={styles.itemContainer}>
          <View style={styles.placeholderItem} />
          <View style={styles.placeholderProgress} />
          <View style={styles.placeholderTitle} />
        </View>
      ));
  };

  const renderItem = ({ item }: { item: WatchItem }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      activeOpacity={0.8}
      onPress={() => onItemPress(item)}
    >
      <View style={styles.itemWrapper}>
        <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
        <View style={styles.optionsButton}>
          <TouchableOpacity
            onPress={() => onRemoveItem && onRemoveItem(item.id)}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Ionicons name="close-circle" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${item.progress.percentComplete}%` },
            ]}
          />
        </View>
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle} numberOfLines={1}>
          {item.title}
        </Text>
        {item.progress.remainingMinutes && (
          <Text style={styles.remainingText}>
            {item.progress.remainingMinutes} min left
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Continue Watching</Text>
        </View>
        <View style={styles.listContainer}>{renderPlaceholders()}</View>
      </View>
    );
  }

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Continue Watching</Text>
      </View>
      <FlatList
        horizontal
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  listContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  itemContainer: {
    width: ITEM_WIDTH,
    marginRight: 12,
  },
  itemWrapper: {
    position: 'relative',
    borderRadius: 4,
    overflow: 'hidden',
  },
  itemImage: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    borderRadius: 4,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.dark.accent,
  },
  optionsButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    zIndex: 1,
  },
  itemInfo: {
    marginTop: 8,
  },
  itemTitle: {
    fontSize: 14,
    color: Colors.dark.text,
    fontWeight: '500',
  },
  remainingText: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  placeholderItem: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: 4,
  },
  placeholderProgress: {
    height: 3,
    width: '100%',
    backgroundColor: Colors.dark.backgroundTertiary,
    marginTop: 4,
  },
  placeholderTitle: {
    height: 14,
    width: '80%',
    backgroundColor: Colors.dark.backgroundTertiary,
    borderRadius: 2,
    marginTop: 8,
  },
});

export default ContinueWatching; 
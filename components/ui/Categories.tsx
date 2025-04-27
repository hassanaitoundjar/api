import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../../constants/Colors';

interface Category {
  id: string;
  name: string;
  imageUrl?: string;
  itemCount?: number;
}

interface CategoriesProps {
  categories: Category[];
  onCategoryPress: (category: Category) => void;
  isLoading?: boolean;
}

const Categories: React.FC<CategoriesProps> = ({
  categories,
  onCategoryPress,
  isLoading = false,
}) => {
  const renderPlaceholders = () => {
    return Array(4).fill(0).map((_, index) => (
      <View key={`placeholder-${index}`} style={[styles.categoryItem, styles.placeholder]} />
    ));
  };

  const renderItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => onCategoryPress(item)}
      activeOpacity={0.7}
    >
      <ImageBackground
        source={
          item.imageUrl
            ? { uri: item.imageUrl }
            : require('../../assets/images/adaptive-icon.png')
        }
        style={styles.categoryBackground}
        imageStyle={styles.categoryImage}
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.categoryGradient}
        >
          <Text style={styles.categoryName}>{item.name}</Text>
          {item.itemCount !== undefined && (
            <Text style={styles.categoryCount}>{item.itemCount} items</Text>
          )}
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Categories</Text>
        <TouchableOpacity>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          {renderPlaceholders()}
        </View>
      ) : categories.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No categories available</Text>
        </View>
      ) : (
        <FlatList
          data={categories}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
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
  viewAll: {
    fontSize: 14,
    color: Colors.dark.accent,
  },
  loadingContainer: {
    flexDirection: 'row',
    paddingLeft: 16,
  },
  categoriesList: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  categoryItem: {
    width: 160,
    height: 90,
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  categoryBackground: {
    width: '100%',
    height: '100%',
  },
  categoryImage: {
    borderRadius: 8,
  },
  categoryGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    justifyContent: 'flex-end',
    padding: 10,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.textPrimary,
  },
  categoryCount: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  placeholder: {
    backgroundColor: Colors.dark.backgroundTertiary,
    opacity: 0.5,
  },
  emptyContainer: {
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
});

export default Categories; 
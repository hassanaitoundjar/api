import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Colors from '../constants/Colors';

interface CategorySelectorProps {
  categories: string[];
  selectedCategory: string | undefined;
  onSelectCategory: (category: string | undefined) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity
          style={[
            styles.categoryButton,
            selectedCategory === undefined && styles.selectedCategoryButton,
          ]}
          onPress={() => onSelectCategory(undefined)}
        >
          <Text
            style={[
              styles.categoryText,
              selectedCategory === undefined && styles.selectedCategoryText,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.selectedCategoryButton,
            ]}
            onPress={() => onSelectCategory(category)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category && styles.selectedCategoryText,
              ]}
              numberOfLines={1}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.backgroundSecondary,
    paddingVertical: 10,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.dark.backgroundTertiary,
    marginRight: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  selectedCategoryButton: {
    backgroundColor: Colors.dark.accent,
  },
  categoryText: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: Colors.dark.textPrimary,
    fontWeight: 'bold',
  },
});

export default CategorySelector; 
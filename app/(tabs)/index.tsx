import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, StatusBar, Alert } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

import Colors from '../../constants/Colors';
import { getAccounts, getCurrentAccountId } from '../../services/authService';
import { UserAccount } from '../../types';

// Import UI components
import Banner from '../../components/ui/Banner';
import ContentRow from '../../components/ui/ContentRow';
import ContinueWatching from '../../components/ui/ContinueWatching';
import FeaturedContent from '../../components/ui/FeaturedContent';
import Categories from '../../components/ui/Categories';

// Define interfaces to match component props
interface ContentItem {
  id: string;
  title: string;
  imageUrl?: string;
  type?: 'channel' | 'movie' | 'series';
}

// Mock data
const FEATURED_ITEMS = [
  {
    id: '1',
    title: 'Stranger Things',
    description: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.',
    imageUrl: 'https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
    type: 'Series',
    year: '2016',
    rating: 'TV-14'
  },
  {
    id: '2',
    title: 'The Witcher',
    description: 'Geralt of Rivia, a mutated monster-hunter for hire, journeys toward his destiny in a turbulent world where people often prove more wicked than beasts.',
    imageUrl: 'https://image.tmdb.org/t/p/original/7vjaCdMw15FEbXyLQTVa04URsPm.jpg',
    type: 'Series',
    year: '2019',
    rating: 'TV-MA'
  },
  {
    id: '3',
    title: 'Inception',
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    imageUrl: 'https://image.tmdb.org/t/p/original/8IB2e4r4oVhHnANbnm7O3Tj6tF8.jpg',
    type: 'Movie',
    year: '2010',
    rating: 'PG-13'
  }
];

const CONTINUE_WATCHING_ITEMS = [
  {
    id: '1',
    title: 'Breaking Bad',
    imageUrl: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
    progress: {
      percentComplete: 73,
      remainingMinutes: 22
    }
  },
  {
    id: '2',
    title: 'The Crown',
    imageUrl: 'https://image.tmdb.org/t/p/w500/mPjRGBhyGzcUpCZSfAVyDQG2tLf.jpg',
    progress: {
      percentComplete: 45,
      remainingMinutes: 35
    }
  },
  {
    id: '3',
    title: 'Interstellar',
    imageUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    progress: {
      percentComplete: 25,
      remainingMinutes: 97
    }
  }
];

const CONTENT_ROWS = [
  {
    title: 'Trending Now',
    items: [
      {
        id: '1',
        title: 'The Queen\'s Gambit',
        imageUrl: 'https://image.tmdb.org/t/p/w500/zU0htwkhNvBQdVSIKB9s6hgVeFK.jpg',
        type: 'series' as 'series'
      },
      {
        id: '2',
        title: 'Money Heist',
        imageUrl: 'https://image.tmdb.org/t/p/w500/reEMJA1uzscCbkpeRJeTT2bjqUp.jpg',
        type: 'series' as 'series'
      },
      {
        id: '3',
        title: 'The Mandalorian',
        imageUrl: 'https://image.tmdb.org/t/p/w500/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg',
        type: 'series' as 'series'
      },
      {
        id: '4',
        title: 'Tenet',
        imageUrl: 'https://image.tmdb.org/t/p/w500/k68nPLbIST6NP96JmTxmZijEvCA.jpg',
        type: 'movie' as 'movie'
      },
      {
        id: '5',
        title: 'Dune',
        imageUrl: 'https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg',
        type: 'movie' as 'movie'
      }
    ] as ContentItem[]
  },
  {
    title: 'Popular Movies',
    items: [
      {
        id: '6',
        title: 'The Dark Knight',
        imageUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
        type: 'movie' as 'movie'
      },
      {
        id: '7',
        title: 'Joker',
        imageUrl: 'https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg',
        type: 'movie' as 'movie'
      },
      {
        id: '8',
        title: 'Parasite',
        imageUrl: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
        type: 'movie' as 'movie'
      },
      {
        id: '9',
        title: 'Avengers: Endgame',
        imageUrl: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
        type: 'movie' as 'movie'
      },
      {
        id: '10',
        title: 'The Shawshank Redemption',
        imageUrl: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
        type: 'movie' as 'movie'
      }
    ] as ContentItem[]
  },
  {
    title: 'Top Rated Series',
    items: [
      {
        id: '11',
        title: 'Game of Thrones',
        imageUrl: 'https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
        type: 'series' as 'series'
      },
      {
        id: '12',
        title: 'Breaking Bad',
        imageUrl: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
        type: 'series' as 'series'
      },
      {
        id: '13',
        title: 'Chernobyl',
        imageUrl: 'https://image.tmdb.org/t/p/w500/hlLXt2tOPT6RRnjiUmoxyG1LTFi.jpg',
        type: 'series' as 'series'
      },
      {
        id: '14',
        title: 'The Wire',
        imageUrl: 'https://image.tmdb.org/t/p/w500/5bTF522eYn6g6j6X7d0OlqISUMl.jpg',
        type: 'series' as 'series'
      },
      {
        id: '15',
        title: 'Sherlock',
        imageUrl: 'https://image.tmdb.org/t/p/w500/7WTsnHkbA0FaG6R9dikbd7ylpPm.jpg',
        type: 'series' as 'series'
      }
    ] as ContentItem[]
  }
];

const CATEGORIES = [
  {
    id: '1',
    name: 'Action',
    imageUrl: 'https://image.tmdb.org/t/p/w500/3Rf1S7bB1T5d9OQGwGgCtLzMSyE.jpg',
    itemCount: 145
  },
  {
    id: '2',
    name: 'Comedy',
    imageUrl: 'https://image.tmdb.org/t/p/w500/8kOWDBK6XlPUzckuHDo3wwVRFwt.jpg',
    itemCount: 162
  },
  {
    id: '3',
    name: 'Drama',
    imageUrl: 'https://image.tmdb.org/t/p/w500/5KCVkau1HEl7ZzfPsKAPM0sMiKc.jpg',
    itemCount: 212
  },
  {
    id: '4',
    name: 'Sci-Fi',
    imageUrl: 'https://image.tmdb.org/t/p/w500/uF4lM1rOvgfSHNIN22awO6ixgiB.jpg',
    itemCount: 98
  }
];

export default function HomeScreen() {
  const [currentAccount, setCurrentAccount] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAccountData();
  }, []);

  const loadAccountData = async () => {
    setLoading(true);
    try {
      // Load current account
      const currentId = await getCurrentAccountId();
      if (!currentId) {
        // No account selected, redirect to profiles page
        router.replace('/');
        return;
      }

      const accounts = await getAccounts();
      const account = accounts.find((acc) => acc.id === currentId);
      
      if (!account) {
        router.replace('/');
        return;
      }

      setCurrentAccount(account);
    } catch (error) {
      console.error('Error loading account data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContentPress = (item: any) => {
    try {
      Haptics?.impactAsync?.(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.log('Haptics not available');
    }
    
    Alert.alert(
      `${item.title}`,
      `You selected ${item.title}. This functionality is coming soon.`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleCategoryPress = (category: any) => {
    Alert.alert(
      `${category.name} Category`,
      `Browse ${category.itemCount} titles in the ${category.name} category.`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleViewAll = (section: string) => {
    Alert.alert(
      `View All ${section}`,
      `You'll be able to browse all ${section.toLowerCase()} here soon.`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleRemoveFromContinueWatching = (itemId: string) => {
    Alert.alert(
      'Remove from Continue Watching',
      'This item will be removed from your Continue Watching list.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive' }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Featured Banner */}
        <Banner
          title="The Last of Us"
          description="Twenty years after a fungal infection devastated mankind, a survivor escorts a teenage girl out of an oppressive quarantine zone."
          imageUrl="https://image.tmdb.org/t/p/original/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg"
          onPress={() => handleContentPress({ title: "The Last of Us" })}
        />

        {/* Continue Watching Section */}
        <ContinueWatching
          items={CONTINUE_WATCHING_ITEMS}
          onItemPress={handleContentPress}
          onRemoveItem={handleRemoveFromContinueWatching}
          isLoading={loading}
        />

        {/* Featured Content Carousel */}
        <FeaturedContent
          featuredItems={FEATURED_ITEMS}
          onItemPress={handleContentPress}
          isLoading={loading}
        />

        {/* Content Rows */}
        {CONTENT_ROWS.map((row) => (
          <ContentRow
            key={row.title}
            title={row.title}
            items={row.items}
            onItemPress={handleContentPress}
            viewAll={() => handleViewAll(row.title)}
            isLoading={loading}
          />
        ))}

        {/* Categories Section */}
        <Categories
          categories={CATEGORIES}
          onCategoryPress={handleCategoryPress}
          isLoading={loading}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 30,
  },
});

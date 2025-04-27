import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getChannels, LiveChannel } from '../../services/channelService';
import FeaturedChannelBanner from '../../components/FeaturedChannelBanner';
import ChannelRow from '../../components/ChannelRow';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const [featuredChannel, setFeaturedChannel] = useState<LiveChannel | null>(null);
  const [channels, setChannels] = useState<LiveChannel[]>([]);
  const [categorizedChannels, setCategorizedChannels] = useState<{[key: string]: LiveChannel[]}>({});
  const router = useRouter();

  useEffect(() => {
    const loadChannels = async () => {
      try {
        const allChannels = await getChannels();
        
        // Set channels
        setChannels(allChannels);
        
        // Select a random channel as featured
        if (allChannels.length > 0) {
          const randomIndex = Math.floor(Math.random() * allChannels.length);
          setFeaturedChannel(allChannels[randomIndex]);
        }
        
        // Group channels by category
        const grouped = allChannels.reduce((acc, channel) => {
          const category = channel.category || 'Uncategorized';
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(channel);
          return acc;
        }, {} as {[key: string]: LiveChannel[]});
        
        setCategorizedChannels(grouped);
      } catch (error) {
        console.error('Error loading channels:', error);
      }
    };
    
    loadChannels();
  }, []);
  
  const handleChannelPress = (channel: LiveChannel) => {
    router.push({
      pathname: '/player',
      params: { channelId: channel.id }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Featured Channel Banner */}
        {featuredChannel && (
          <FeaturedChannelBanner
            channel={featuredChannel}
            onPress={() => handleChannelPress(featuredChannel)}
          />
        )}
        
        {/* Channel Rows by Category */}
        {Object.entries(categorizedChannels).map(([category, categoryChannels]) => (
          <ChannelRow
            key={category}
            title={category}
            channels={categoryChannels}
            onChannelPress={handleChannelPress}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  scrollView: {
    flex: 1,
  },
}); 
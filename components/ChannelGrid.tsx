import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { LiveChannel } from '../services/channelService';
import ChannelItem from './ChannelItem';

interface ChannelGridProps {
  channels: Record<string, LiveChannel[]>;
  onChannelPress: (channel: LiveChannel) => void;
}

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.28;
const ITEM_HEIGHT = ITEM_WIDTH * 0.6;

export default function ChannelGrid({ channels, onChannelPress }: ChannelGridProps) {
  // Get category names and sort them
  const categories = Object.keys(channels).sort();

  if (categories.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No channels available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        keyExtractor={(item) => item}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: category }) => (
          <View style={styles.categoryRow}>
            <Text style={styles.categoryTitle}>{category}</Text>
            <FlatList
              horizontal
              data={channels[category]}
              keyExtractor={(item) => item.id.toString()}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.rowContent}
              renderItem={({ item: channel }) => (
                <TouchableOpacity
                  style={styles.channelContainer}
                  onPress={() => onChannelPress(channel)}
                  activeOpacity={0.7}
                >
                  <ChannelItem channel={channel} style={styles.channelItem} />
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
  categoryRow: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    marginLeft: 4,
  },
  rowContent: {
    paddingRight: 16,
  },
  channelContainer: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    marginLeft: 8,
  },
  channelItem: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
}); 
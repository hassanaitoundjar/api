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
import { LinearGradient } from 'expo-linear-gradient';
import { LiveChannel } from '../services/channelService';
import Colors from '../constants/Colors';

interface ChannelRowProps {
  title: string;
  channels: LiveChannel[];
  onSelectChannel: (channel: LiveChannel) => void;
  selectedChannelId?: string;
  featured?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NUM_COLUMNS = 3;
const CARD_WIDTH = (SCREEN_WIDTH - 48) / NUM_COLUMNS; // 48 = padding + spacing
const CARD_HEIGHT = CARD_WIDTH * 1.1; // Slightly taller than wide

export default function ChannelRow({
  title,
  channels,
  onSelectChannel,
  selectedChannelId,
  featured = false,
}: ChannelRowProps) {
  if (channels.length === 0) {
    return null;
  }

  const renderChannelItem = ({ item: channel }: { item: LiveChannel }) => {
    const isSelected = channel.id === selectedChannelId;
    // Check if channel is live (if the property exists)
    const isLive = (channel as any).isLive;
    
    return (
      <TouchableOpacity
        style={[
          styles.channelCard,
          isSelected && styles.selectedCard,
        ]}
        onPress={() => onSelectChannel(channel)}
        activeOpacity={0.7}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: channel.logoUrl }}
            style={styles.channelImage}
            resizeMode="cover"
          />
          
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.gradient}
          />
          
          {isLive && (
            <View style={styles.liveIndicator}>
              <View style={styles.liveIndicatorDot} />
              <Text style={styles.liveIndicatorText}>LIVE</Text>
            </View>
          )}
          
          <View style={styles.playButtonOverlay}>
            <View style={styles.playButton}>
              <Ionicons 
                name="play" 
                size={20} 
                color="white" 
              />
            </View>
          </View>
        </View>
        
        <View style={styles.channelInfo}>
          <Text 
            style={styles.channelName}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {channel.name}
          </Text>
          
          {channel.category && (
            <Text 
              style={styles.channelCategory}
              numberOfLines={1}
            >
              {channel.category}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.rowTitle}>{title}</Text>
      
      <FlatList
        data={channels}
        renderItem={renderChannelItem}
        keyExtractor={(item) => item.id}
        numColumns={NUM_COLUMNS}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false} // Disable scrolling as parent ScrollView will handle it
        contentContainerStyle={styles.gridContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  rowTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.textPrimary,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  gridContent: {
    paddingHorizontal: 12,
  },
  channelCard: {
    width: CARD_WIDTH,
    marginHorizontal: 4,
    marginBottom: 12,
    borderRadius: 6,
    backgroundColor: Colors.dark.backgroundSecondary,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCard: {
    borderColor: Colors.dark.accent,
    borderWidth: 2,
    elevation: 6,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  channelImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  liveIndicator: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'white',
    marginRight: 4,
  },
  liveIndicatorText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  playButtonOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0, // Hidden by default
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  channelInfo: {
    padding: 8,
  },
  channelName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.textPrimary,
    marginBottom: 2,
  },
  channelCategory: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
}); 
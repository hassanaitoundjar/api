import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { LiveChannel } from '../services/channelService';

interface FeaturedChannelBannerProps {
  channel: LiveChannel;
  onPress: () => void;
}

const { width, height } = Dimensions.get('window');
const BANNER_HEIGHT = height * 0.5;

export default function FeaturedChannelBanner({ channel, onPress }: FeaturedChannelBannerProps) {
  // Use logoUrl as fallback for bannerUrl
  const imageUrl = channel.bannerUrl || channel.logoUrl || '';
  
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.container}>
      <ImageBackground
        source={{ uri: imageUrl }}
        style={styles.bannerImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
          style={styles.gradient}
        >
          <View style={styles.contentContainer}>
            <Text style={styles.title}>{channel.name}</Text>
            <Text style={styles.description} numberOfLines={2}>
              {channel.description || `Watch ${channel.name} live now!`}
            </Text>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.playButton} onPress={onPress}>
                <Ionicons name="play" size={22} color="#000" />
                <Text style={styles.buttonText}>Play</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.infoButton}>
                <Ionicons name="information-circle-outline" size={22} color="#fff" />
                <Text style={styles.infoButtonText}>More Info</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: BANNER_HEIGHT,
    marginBottom: 20,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  description: {
    fontSize: 16,
    color: '#e6e6e6',
    marginBottom: 20,
    width: '70%',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  playButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 4,
    marginRight: 16,
  },
  buttonText: {
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 5,
    fontSize: 16,
  },
  infoButton: {
    backgroundColor: 'rgba(100, 100, 100, 0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  infoButtonText: {
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 5,
    fontSize: 16,
  },
}); 
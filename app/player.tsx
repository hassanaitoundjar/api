import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  StatusBar, 
  TouchableOpacity,
  Text,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';

import VideoPlayer from '../components/VideoPlayer';
import Colors from '../constants/Colors';

export default function PlayerScreen() {
  const params = useLocalSearchParams();
  const { channelId, channelName, streamUrl } = params;
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Handle hardware back button
  useEffect(() => {
    return () => {
      // Clean up when unmounting
      StatusBar.setHidden(false);
    };
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleFullscreenToggle = (fullscreen: boolean) => {
    setIsFullscreen(fullscreen);
    StatusBar.setHidden(fullscreen);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" hidden={isFullscreen} />
      
      {!isFullscreen && (
        <SafeAreaView style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>{channelName}</Text>
          <View style={styles.placeholder} />
        </SafeAreaView>
      )}
      
      <View style={styles.playerContainer}>
        <VideoPlayer
          uri={streamUrl as string}
          channelName={channelName as string}
          isFullscreen={isFullscreen}
          onFullscreenToggle={handleFullscreenToggle}
          shouldPlay={true}
          onError={(error) => console.error('Player error:', error)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomColor: Colors.dark.border,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.textPrimary,
    marginLeft: 8,
  },
  placeholder: {
    width: 40,
  },
  playerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 
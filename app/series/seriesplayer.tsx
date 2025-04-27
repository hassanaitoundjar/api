import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ScreenOrientation from 'expo-screen-orientation';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '../../constants/Colors';
import { getAccounts, getCurrentAccountId } from '../../services/authService';
import { Series, fetchSeries } from '../../services/seriesService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function SeriesPlayerScreen() {
  const { seriesId, seasonId, episodeId, title } = useLocalSearchParams<{ 
    seriesId: string; 
    seasonId: string;
    episodeId: string;
    title: string;
  }>();
  
  const [series, setSeries] = useState<Series | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<any>({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [selectedQuality, setSelectedQuality] = useState<string>('auto');
  const [selectedSubtitle, setSelectedSubtitle] = useState<string | null>(null);
  
  const videoRef = useRef<Video>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Load series data and switch to landscape mode
  useEffect(() => {
    async function setup() {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      loadSeriesData();
    }
    
    setup();
    
    // Clean up on component unmount
    return () => {
      // Schedule orientation unlock for next tick
      setTimeout(() => {
        ScreenOrientation.unlockAsync().catch(console.error);
      }, 0);
      
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [seriesId, seasonId, episodeId]);
  
  const loadSeriesData = async () => {
    setIsLoading(true);
    
    try {
      const currentId = await getCurrentAccountId();
      if (!currentId) {
        setError('No account selected');
        return;
      }

      const accounts = await getAccounts();
      const account = accounts.find((acc) => acc.id === currentId);
      
      if (!account) {
        setError('Selected account not found');
        return;
      }
      
      // Fetch all series and find the one with matching ID
      const allSeries = await fetchSeries(account);
      const foundSeries = allSeries.find(s => s.id === seriesId);
      
      if (!foundSeries) {
        setError('Series not found');
        return;
      }
      
      setSeries(foundSeries);
      
      // Set default subtitle if available
      if (foundSeries.subtitles && foundSeries.subtitles.length > 0) {
        setSelectedSubtitle(foundSeries.subtitles[0].language);
      }
    } catch (error) {
      console.error('Error loading series:', error);
      setError('Failed to load series data');
    } finally {
      setIsLoading(false);
    }
  };
  
  const togglePlayPause = async () => {
    if (status.isPlaying) {
      await videoRef.current?.pauseAsync();
    } else {
      await videoRef.current?.playAsync();
    }
  };
  
  const handleBack = async () => {
    await ScreenOrientation.unlockAsync();
    router.back();
  };
  
  const toggleControls = () => {
    setControlsVisible(!controlsVisible);
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = null;
    }
    
    if (!controlsVisible) {
      // Start a timer to auto-hide controls after 5 seconds
      controlsTimeoutRef.current = setTimeout(() => {
        setControlsVisible(false);
      }, 5000);
    }
  };
  
  const handleFullscreen = async () => {
    setIsFullscreen(!isFullscreen);
  };
  
  const seek = async (forward: boolean) => {
    if (!videoRef.current) return;
    
    const seekInterval = 10000; // 10 seconds
    const currentPosition = status.positionMillis;
    const newPosition = forward
      ? currentPosition + seekInterval
      : Math.max(0, currentPosition - seekInterval);
    
    await videoRef.current.setPositionAsync(newPosition);
  };
  
  const handleSelectQuality = (quality: string) => {
    setSelectedQuality(quality);
    Alert.alert('Quality Selected', `Changed to ${quality} quality`);
    // In a real app, this would change the video source to the selected quality
  };
  
  const handleSelectSubtitle = (language: string | null) => {
    setSelectedSubtitle(language);
    Alert.alert('Subtitle Selected', language ? `Subtitles set to ${language}` : 'Subtitles disabled');
    // In a real app, this would load the appropriate subtitle track
  };
  
  const handleNextEpisode = () => {
    Alert.alert('Next Episode', 'This would play the next episode');
    // In a real app, this would navigate to the next episode
  };
  
  const formatTime = (millis: number) => {
    if (!millis) return '00:00';
    
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar hidden />
        <ActivityIndicator size="large" color={Colors.dark.accent} />
        <Text style={styles.loadingText}>Loading video...</Text>
      </View>
    );
  }
  
  if (error || !series) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar hidden={false} barStyle="light-content" />
        <Text style={styles.errorText}>{error || 'Video not found'}</Text>
        <TouchableOpacity style={styles.button} onPress={handleBack}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  
  // In a real app, get the actual episode stream URL based on the selected season and episode
  const streamUrl = series.streamUrl || 'https://example.com/video.mp4';
  const episodeTitle = `${title} - S${seasonId}E${episodeId}`;
  
  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      <TouchableOpacity 
        style={styles.videoContainer} 
        activeOpacity={1}
        onPress={toggleControls}
      >
        <Video
          ref={videoRef}
          style={styles.video}
          source={{ uri: streamUrl }}
          resizeMode={isFullscreen ? ResizeMode.COVER : ResizeMode.CONTAIN}
          useNativeControls={false}
          shouldPlay
          isLooping={false}
          onPlaybackStatusUpdate={setStatus}
        />
        
        {/* Custom Controls */}
        {controlsVisible && (
          <View style={styles.controlsContainer}>
            {/* Top Bar */}
            <View style={styles.topBar}>
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Ionicons name="arrow-back" size={28} color="white" />
              </TouchableOpacity>
              
              <Text style={styles.title}>{episodeTitle}</Text>
              
              <View style={styles.rightButtons}>
                <TouchableOpacity 
                  style={styles.iconButton}
                  onPress={() => handleSelectQuality(selectedQuality === 'auto' ? 'HD' : 'auto')}
                >
                  <MaterialIcons name="high-quality" size={24} color="white" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.iconButton}
                  onPress={() => handleSelectSubtitle(selectedSubtitle ? null : 'English')}
                >
                  <MaterialIcons 
                    name="subtitles" 
                    size={24} 
                    color={selectedSubtitle ? Colors.dark.accent : "white"} 
                  />
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Center Play/Pause Control */}
            <View style={styles.centerControls}>
              <TouchableOpacity 
                style={styles.seekButton}
                onPress={() => seek(false)}
              >
                <Ionicons name="play-back" size={28} color="white" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.playPauseButton}
                onPress={togglePlayPause}
              >
                <Ionicons
                  name={status.isPlaying ? "pause" : "play"}
                  size={42}
                  color="white"
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.seekButton}
                onPress={() => seek(true)}
              >
                <Ionicons name="play-forward" size={28} color="white" />
              </TouchableOpacity>
            </View>
            
            {/* Bottom Controls - Progress Bar and Fullscreen */}
            <View style={styles.bottomBar}>
              <Text style={styles.timeText}>
                {formatTime(status.positionMillis || 0)}
              </Text>
              
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { 
                      width: `${status.positionMillis && status.durationMillis 
                        ? (status.positionMillis / status.durationMillis) * 100 
                        : 0}%`
                    }
                  ]} 
                />
              </View>
              
              <Text style={styles.timeText}>
                {formatTime(status.durationMillis || 0)}
              </Text>
              
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={handleNextEpisode}
              >
                <Ionicons name="play-skip-forward" size={24} color="white" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.fullscreenButton}
                onPress={handleFullscreen}
              >
                <Ionicons
                  name={isFullscreen ? "contract" : "expand"}
                  size={24}
                  color="white"
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  loadingText: {
    color: 'white',
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
    padding: 20,
  },
  errorText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    backgroundColor: Colors.dark.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  video: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  controlsContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    padding: 8,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  rightButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  centerControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  seekButton: {
    padding: 16,
  },
  playPauseButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
    borderRadius: 40,
    marginHorizontal: 32,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  timeText: {
    color: 'white',
    fontSize: 14,
    marginHorizontal: 8,
  },
  progressBarContainer: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginHorizontal: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.dark.accent,
    borderRadius: 2,
  },
  fullscreenButton: {
    padding: 8,
    marginLeft: 8,
  },
}); 
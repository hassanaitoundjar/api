import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  Dimensions,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus, AVPlaybackStatusSuccess } from 'expo-av';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/Colors';

interface VideoPlayerProps {
  uri: string;
  channelName?: string;
  shouldPlay?: boolean;
  isFullscreen?: boolean;
  onFullscreenToggle?: (fullscreen: boolean) => void;
  onError?: (error: string) => void;
  onClose?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  uri,
  channelName,
  shouldPlay = true,
  isFullscreen = false,
  onFullscreenToggle,
  onError,
  onClose,
}) => {
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [isPlaying, setIsPlaying] = useState(shouldPlay);
  const [isBuffering, setIsBuffering] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);
  const controlsFadeAnimation = useRef(new Animated.Value(1)).current;

  const isPlaybackStatus = (status: AVPlaybackStatus): status is AVPlaybackStatusSuccess => {
    return status.isLoaded === true;
  };

  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  // Fade controls in and out
  useEffect(() => {
    Animated.timing(controlsFadeAnimation, {
      toValue: controlsVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.inOut(Easing.cubic),
    }).start();
    
    if (controlsVisible) {
      resetControlsTimeout();
    }

    return () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
    };
  }, [controlsVisible]);

  const resetControlsTimeout = () => {
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    
    // Auto-hide controls after 3 seconds if playing
    controlsTimeout.current = setTimeout(() => {
      if (isPlaying) {
        setControlsVisible(false);
      }
    }, 3000);
  };

  useEffect(() => {
    // Load and play video when uri changes
    if (videoRef.current) {
      setIsBuffering(true);
      setError(null);
      
      videoRef.current.loadAsync(
        { uri },
        { shouldPlay, isLooping: true },
        false
      );
    }
    
    // Cleanup when unmounting
    return () => {
      if (videoRef.current) {
        videoRef.current.unloadAsync();
      }
    };
  }, [uri, shouldPlay]);

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    setStatus(status);
    
    if (isPlaybackStatus(status)) {
      setIsBuffering(!status.isPlaying && status.isBuffering);
      setIsPlaying(status.isPlaying);
    }
  };

  const togglePlay = async () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
    
    setIsPlaying(!isPlaying);
    setControlsVisible(true);
  };

  const toggleMute = async () => {
    if (!videoRef.current) return;
    
    await videoRef.current.setIsMutedAsync(!isMuted);
    setIsMuted(!isMuted);
    setControlsVisible(true);
  };

  const toggleFullscreen = () => {
    if (onFullscreenToggle) {
      onFullscreenToggle(!isFullscreen);
    }
  };

  const handleVideoTap = () => {
    setControlsVisible(!controlsVisible);
  };

  const handleVideoError = (error: string) => {
    setError(`Error loading video: ${error}`);
    setIsBuffering(false);
  };

  return (
    <View style={[
      styles.container,
      isFullscreen && styles.fullscreenContainer,
    ]}>
      <TouchableOpacity 
        activeOpacity={1}
        style={styles.videoContainer}
        onPress={handleVideoTap}
      >
        <Video
          ref={videoRef}
          style={styles.video}
          resizeMode={isFullscreen ? ResizeMode.CONTAIN : ResizeMode.COVER}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          onError={() => handleVideoError("Could not load video")}
          useNativeControls={false}
        />
        
        {/* Buffering indicator */}
        {isBuffering && (
          <View style={styles.bufferingContainer}>
            <ActivityIndicator size="large" color="#E50914" />
            <Text style={styles.bufferingText}>Loading stream...</Text>
          </View>
        )}
        
        {/* Error message */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={40} color="#E50914" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Controls overlay with fade animation */}
        <Animated.View 
          style={[
            styles.controlsWrapper,
            { opacity: controlsFadeAnimation }
          ]}
          pointerEvents={controlsVisible ? 'auto' : 'none'}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.7)', 'transparent', 'transparent', 'rgba(0,0,0,0.7)']}
            style={styles.controlsGradient}
          >
            {/* Top controls */}
            <View style={styles.topControls}>
              {onClose && isFullscreen && (
                <TouchableOpacity 
                  style={styles.backButton} 
                  onPress={onClose}
                >
                  <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
              )}
              
              {channelName && (
                <Text style={styles.channelName}>{channelName}</Text>
              )}
              
              <View style={styles.spacer} />
              
              {/* Live indicator */}
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            </View>

            {/* Center play/pause button */}
            <View style={styles.centerControls}>
              <TouchableOpacity 
                style={styles.playPauseButton}
                onPress={togglePlay}
              >
                <Ionicons
                  name={isPlaying ? "pause" : "play"}
                  size={40}
                  color="white"
                />
              </TouchableOpacity>
            </View>

            {/* Bottom controls */}
            <View style={styles.bottomControls}>
              <TouchableOpacity 
                onPress={toggleMute} 
                style={styles.controlButton}
              >
                <Ionicons
                  name={isMuted ? "volume-mute" : "volume-high"}
                  size={24}
                  color="white"
                />
              </TouchableOpacity>
              
              <View style={styles.spacer} />
              
              <TouchableOpacity 
                onPress={toggleFullscreen} 
                style={styles.controlButton}
              >
                <MaterialIcons
                  name={isFullscreen ? "fullscreen-exit" : "fullscreen"}
                  size={28}
                  color="white"
                />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fullscreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    aspectRatio: undefined,
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  bufferingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bufferingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  errorText: {
    color: 'white',
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  controlsWrapper: {
    ...StyleSheet.absoluteFillObject,
  },
  controlsGradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    marginRight: 16,
  },
  channelName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E50914',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
    marginRight: 4,
  },
  liveText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  centerControls: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomControls: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  controlButton: {
    padding: 8,
  },
  spacer: {
    flex: 1,
  },
});

export default VideoPlayer; 
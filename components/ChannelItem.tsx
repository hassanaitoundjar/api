import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Animated,
  ViewStyle,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { LiveChannel } from '../services/channelService';
import { LinearGradient } from 'expo-linear-gradient';

interface ChannelItemProps {
  channel: LiveChannel;
  style?: ViewStyle;
  isActive?: boolean;
  onPress: (channel: LiveChannel) => void;
  isPlayingNow?: boolean;
}

const ChannelItem: React.FC<ChannelItemProps> = ({
  channel,
  style,
  isActive = false,
  onPress,
  isPlayingNow = false,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const scale = useState(new Animated.Value(1))[0];

  // Handle press in effect
  const handlePressIn = () => {
    setIsPressed(true);
    Animated.spring(scale, {
      toValue: 1.05,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  // Handle press out effect
  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        { transform: [{ scale }] },
      ]}
      onTouchStart={handlePressIn}
      onTouchEnd={handlePressOut}
      onTouchCancel={handlePressOut}
    >
      <View style={styles.channelLogoContainer}>
        {channel.logoUrl ? (
          <Image
            source={{ uri: channel.logoUrl }}
            style={styles.channelLogo}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderLogo}>
            <FontAwesome5 name="tv" size={18} color={Colors.dark.textSecondary} />
          </View>
        )}
        
        {isPlayingNow && (
          <View style={styles.playingIndicator}>
            <ActivityIndicator size="small" color={Colors.dark.accent} />
          </View>
        )}
      </View>
      
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.gradient}
      />
      
      <View style={styles.channelInfoContainer}>
        <Text 
          style={[
            styles.channelName,
            isActive && styles.activeText,
          ]}
          numberOfLines={1}
        >
          {channel.name}
        </Text>
        
        {channel.category && (
          <Text style={styles.channelCategory} numberOfLines={1}>
            {channel.category}
          </Text>
        )}
      </View>
      
      <View style={styles.playButtonContainer}>
        <View style={[
          styles.playButton,
          isActive && styles.activePlayButton
        ]}>
          <FontAwesome5
            name={isPlayingNow ? "pause" : "play"}
            size={12}
            color={isActive ? Colors.dark.background : Colors.dark.textPrimary}
          />
        </View>
      </View>

      {isPressed && (
        <View style={styles.hoverInfo}>
          <Text style={styles.hoverText}>{channel.name}</Text>
          {channel.category && (
            <Text style={styles.categoryText}>{channel.category}</Text>
          )}
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  activeContainer: {
    backgroundColor: Colors.dark.accent + '20', // Add some transparency
  },
  channelLogoContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.backgroundSecondary,
    position: 'relative',
  },
  channelLogo: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  placeholderLogo: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.backgroundTertiary,
  },
  channelInfoContainer: {
    flex: 1,
    marginLeft: 12,
  },
  channelName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.dark.textPrimary,
    marginBottom: 4,
  },
  activeText: {
    color: Colors.dark.accent,
    fontWeight: 'bold',
  },
  channelCategory: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  playButtonContainer: {
    paddingLeft: 8,
  },
  playButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.backgroundTertiary,
  },
  activePlayButton: {
    backgroundColor: Colors.dark.accent,
  },
  playingIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.dark.background + 'CC',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '40%',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  hoverInfo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 4,
  },
  hoverText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  categoryText: {
    color: '#ddd',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default ChannelItem; 
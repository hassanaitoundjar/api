import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../../constants/Colors';

interface BannerProps {
  title: string;
  description?: string;
  imageUrl?: string;
  onPress: () => void;
}

const { width } = Dimensions.get('window');

const Banner: React.FC<BannerProps> = ({ 
  title, 
  description, 
  imageUrl, 
  onPress 
}) => {
  return (
    <TouchableOpacity 
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.container}
    >
      <ImageBackground
        source={
          imageUrl 
            ? { uri: imageUrl } 
            : require('../../assets/images/adaptive-icon.png')
        }
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        />
        
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{title}</Text>
          {description && (
            <Text style={styles.description} numberOfLines={2}>
              {description}
            </Text>
          )}
          
          <View style={styles.buttonsContainer}>
            <TouchableOpacity 
              style={styles.playButton}
              onPress={onPress}
            >
              <FontAwesome5 name="play" size={16} color="#000" />
              <Text style={styles.playButtonText}>Play</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.infoButton}
              onPress={onPress}
            >
              <FontAwesome5 name="info-circle" size={16} color="#fff" />
              <Text style={styles.infoButtonText}>Info</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width,
    height: width * 0.56, // 16:9 aspect ratio
    marginBottom: 20,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
  },
  contentContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    padding: 20,
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.textPrimary,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  description: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginBottom: 16,
    width: '90%',
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 4,
    marginRight: 12,
  },
  playButtonText: {
    color: '#000',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(100, 100, 100, 0.5)',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  infoButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default Banner; 
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../../constants/Colors';

interface ContentCardProps {
  title: string;
  count?: number | string;
  icon: React.ComponentProps<typeof FontAwesome5>['name'];
  backgroundImage?: string;
  onPress: () => void;
  loading?: boolean;
}

const ContentCard: React.FC<ContentCardProps> = ({
  title,
  count,
  icon,
  backgroundImage,
  onPress,
  loading = false,
}) => {
  const displayCount = loading ? 'Loading...' : count;

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <ImageBackground
        source={
          backgroundImage 
            ? { uri: backgroundImage } 
            : require('../../assets/images/adaptive-icon.png')
        }
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        />
        
        <View style={styles.content}>
          <FontAwesome5 name={icon} size={30} color={Colors.dark.textPrimary} style={styles.icon} />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.count}>
            {displayCount !== undefined ? `(${displayCount})` : ''}
          </Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.dark.textPrimary,
    textAlign: 'center',
  },
  count: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    marginTop: 4,
  },
});

export default ContentCard; 
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FeaturedContent {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  year?: string;
  rating?: string;
  duration?: string;
  genres?: string[];
}

interface FeaturedBannerProps {
  content: FeaturedContent | null;
  onPlay: (content: FeaturedContent) => void;
  onMoreInfo: (content: FeaturedContent) => void;
  isLoading?: boolean;
}

const FeaturedBanner: React.FC<FeaturedBannerProps> = ({
  content,
  onPlay,
  onMoreInfo,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <View style={styles.placeholderContainer}>
        <View style={styles.placeholderImage} />
        <View style={styles.placeholderContent}>
          <View style={styles.placeholderTitle} />
          <View style={styles.placeholderDescription} />
          <View style={styles.placeholderButtons} />
        </View>
      </View>
    );
  }

  if (!content) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="film-outline" size={48} color={Colors.dark.textSecondary} />
        <Text style={styles.emptyText}>No featured content available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: content.imageUrl }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
          style={styles.gradient}
        >
          <View style={styles.contentContainer}>
            <Text style={styles.title}>{content.title}</Text>
            
            <View style={styles.metadataContainer}>
              {content.year && (
                <Text style={styles.metadataText}>{content.year}</Text>
              )}
              {content.rating && (
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingText}>{content.rating}</Text>
                </View>
              )}
              {content.duration && (
                <Text style={styles.metadataText}>{content.duration}</Text>
              )}
            </View>

            {content.genres && content.genres.length > 0 && (
              <View style={styles.genresContainer}>
                {content.genres.map((genre, index) => (
                  <React.Fragment key={genre}>
                    <Text style={styles.genreText}>{genre}</Text>
                    {index < content.genres!.length - 1 && (
                      <View style={styles.genreDot} />
                    )}
                  </React.Fragment>
                ))}
              </View>
            )}
            
            <Text style={styles.description} numberOfLines={2}>
              {content.description}
            </Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.playButton}
                activeOpacity={0.8}
                onPress={() => onPlay(content)}
              >
                <Ionicons name="play" size={18} color="#000" />
                <Text style={styles.playButtonText}>Play</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.infoButton}
                activeOpacity={0.8}
                onPress={() => onMoreInfo(content)}
              >
                <Ionicons name="information-circle-outline" size={18} color="#fff" />
                <Text style={styles.infoButtonText}>More Info</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.6,
    maxHeight: 500,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  metadataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metadataText: {
    color: '#fff',
    fontSize: 14,
    marginRight: 12,
  },
  ratingBadge: {
    backgroundColor: 'rgba(255, 180, 0, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
    marginRight: 12,
  },
  ratingText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '500',
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 12,
  },
  genreText: {
    color: '#fff',
    fontSize: 14,
  },
  genreDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#fff',
    marginHorizontal: 8,
  },
  description: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  playButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginRight: 12,
  },
  playButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  infoButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  infoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  placeholderContainer: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.6,
    maxHeight: 500,
    backgroundColor: Colors.dark.backgroundSecondary,
    justifyContent: 'flex-end',
  },
  placeholderImage: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.dark.backgroundSecondary,
  },
  placeholderContent: {
    padding: 16,
  },
  placeholderTitle: {
    height: 28,
    width: '70%',
    backgroundColor: Colors.dark.backgroundTertiary,
    borderRadius: 4,
    marginBottom: 12,
  },
  placeholderDescription: {
    height: 14,
    width: '90%',
    backgroundColor: Colors.dark.backgroundTertiary,
    borderRadius: 4,
    marginBottom: 20,
  },
  placeholderButtons: {
    height: 40,
    width: '60%',
    backgroundColor: Colors.dark.backgroundTertiary,
    borderRadius: 4,
    marginBottom: 8,
  },
  emptyContainer: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.backgroundSecondary,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.dark.textSecondary,
  },
});

export default FeaturedBanner; 
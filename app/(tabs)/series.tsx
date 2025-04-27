import React from 'react';
import { View, Text, StyleSheet, Image, StatusBar, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import Colors from '../../constants/Colors';

export default function SeriesScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Image
        source={require('../../assets/images/adaptive-icon.png')}
        style={styles.backgroundImage}
        blurRadius={5}
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
        style={styles.gradient}
      />

      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <MaterialIcons name="arrow-back" size={24} color={Colors.dark.textPrimary} />
      </TouchableOpacity>

      <View style={styles.contentContainer}>
        <FontAwesome5 name="play-circle" size={80} color={Colors.dark.accent} />
        <Text style={styles.title}>Series</Text>
        <Text style={styles.subtitle}>Coming Soon</Text>
        <Text style={styles.description}>
          This section will display all available TV series from your IPTV provider.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.dark.textPrimary,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.dark.accent,
    marginTop: 10,
  },
  description: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    marginTop: 20,
    maxWidth: '80%',
  },
}); 
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, StatusBar, ActivityIndicator, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import UserAccountCard from '../components/UserAccountCard';
import Button from '../components/ui/Button';
import Colors from '../constants/Colors';
import { getAccounts, deleteAccount, setCurrentAccountId } from '../services/authService';
import { UserAccount } from '../types';

export default function HomeScreen() {
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const savedAccounts = await getAccounts();
      // Sort by last used (most recent first)
      savedAccounts.sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0));
      setAccounts(savedAccounts);
    } catch (error) {
      console.error('Failed to load accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccount = () => {
    try {
      Haptics?.impactAsync?.(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.log('Haptics not available');
    }
    
    router.push({
      pathname: '/login'
    });
  };

  const handleSelectAccount = async (account: UserAccount) => {
    try {
      Haptics?.impactAsync?.(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.log('Haptics not available');
    }
    
    try {
      await setCurrentAccountId(account.id);
      // Navigate to the main app screen (tabs)
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error selecting account:', error);
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    try {
      Haptics?.impactAsync?.(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.log('Haptics not available');
    }
    
    try {
      await deleteAccount(accountId);
      await loadAccounts();
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.dark.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Image
        source={require('../assets/images/adaptive-icon.png')}
        style={styles.backgroundImage}
        blurRadius={3}
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
        style={styles.gradient}
      />
      
      <View style={styles.headerContainer}>
        <Text style={styles.title}>IPTV Xtream Player</Text>
        <Text style={styles.subtitle}>Choose a Profile</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {accounts.length > 0 ? (
          accounts.map((account) => (
            <UserAccountCard
              key={account.id}
              account={account}
              onSelect={handleSelectAccount}
              onDelete={handleDeleteAccount}
            />
          ))
        ) : (
          <View style={styles.emptyStateContainer}>
            <MaterialIcons name="person-add" size={48} color={Colors.dark.textSecondary} />
            <Text style={styles.emptyStateText}>No profiles added yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Add a profile to start watching IPTV content
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title="Add Profile"
          onPress={handleAddAccount}
          variant="outline"
          fullWidth
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
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.dark.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.dark.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.textPrimary,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: '80%',
  },
  buttonContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
}); 
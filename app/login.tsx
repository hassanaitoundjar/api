import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { StatusBar } from 'expo-status-bar';
import uuid from 'react-native-uuid';

import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import ToggleSwitch from '../components/ui/ToggleSwitch';
import Colors from '../constants/Colors';
import { testXtreamConnection, testM3UConnection, saveAccount } from '../services/authService';
import { M3ULoginFormValues, UserAccount, UserAccountType, XtreamLoginFormValues } from '../types';

// Form validation schemas
const xtreamSchema = yup.object({
  serverUrl: yup.string().required('Server URL is required'),
  username: yup.string().required('Username is required'),
  password: yup.string().required('Password is required'),
  playlistName: yup.string().required('Playlist name is required'),
});

const m3uSchema = yup.object({
  m3uUrl: yup
    .string()
    .required('M3U URL is required')
    .url('Please enter a valid URL'),
  playlistName: yup.string().required('Playlist name is required'),
});

export default function LoginScreen() {
  const [loginMethod, setLoginMethod] = useState<UserAccountType>('xtream');
  const [isLoading, setIsLoading] = useState(false);

  // Xtream form
  const xtreamForm = useForm<XtreamLoginFormValues>({
    resolver: yupResolver(xtreamSchema),
    defaultValues: {
      serverUrl: '',
      username: '',
      password: '',
      playlistName: '',
    },
  });

  // M3U form
  const m3uForm = useForm<M3ULoginFormValues>({
    resolver: yupResolver(m3uSchema),
    defaultValues: {
      m3uUrl: '',
      playlistName: '',
    },
  });

  const toggleLoginMethod = (index: number) => {
    setLoginMethod(index === 0 ? 'xtream' : 'm3u');
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleXtreamLogin = async (data: XtreamLoginFormValues) => {
    setIsLoading(true);
    try {
      const isValid = await testXtreamConnection(
        data.serverUrl,
        data.username,
        data.password
      );

      if (isValid) {
        const account: UserAccount = {
          id: uuid.v4() as string,
          type: 'xtream',
          playlistName: data.playlistName,
          serverUrl: data.serverUrl,
          username: data.username,
          password: data.password,
        };

        await saveAccount(account);
        router.replace('/(tabs)');
      } else {
        Alert.alert(
          'Connection Failed',
          'Could not connect to the Xtream server with the provided credentials. Please check your details and try again.'
        );
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(
        'Error',
        'An error occurred while trying to log in. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleM3ULogin = async (data: M3ULoginFormValues) => {
    setIsLoading(true);
    try {
      const isValid = await testM3UConnection(data.m3uUrl);

      if (isValid) {
        const account: UserAccount = {
          id: uuid.v4() as string,
          type: 'm3u',
          playlistName: data.playlistName,
          m3uUrl: data.m3uUrl,
        };

        await saveAccount(account);
        router.replace('/(tabs)');
      } else {
        Alert.alert(
          'Connection Failed',
          'Could not load the M3U playlist. Please check the URL and try again.'
        );
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(
        'Error',
        'An error occurred while trying to load the playlist. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <StatusBar style="light" />
      <Image
        source={require('../assets/images/adaptive-icon.png')}
        style={styles.backgroundImage}
        blurRadius={3}
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
        style={styles.gradient}
      />

      <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
        <MaterialIcons name="arrow-back" size={24} color={Colors.dark.textPrimary} />
      </TouchableOpacity>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Sign In</Text>
        <Text style={styles.subtitle}>Add your IPTV provider details</Text>

        <ToggleSwitch
          options={['Xtream Codes', 'M3U URL']}
          selectedIndex={loginMethod === 'xtream' ? 0 : 1}
          onToggle={toggleLoginMethod}
        />

        {loginMethod === 'xtream' ? (
          // Xtream login form
          <View style={styles.formContainer}>
            <Controller
              control={xtreamForm.control}
              name="serverUrl"
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <Input
                  label="Server URL"
                  value={value}
                  onChangeText={onChange}
                  placeholder="http://example.com:8080"
                  error={error?.message}
                  keyboardType="url"
                />
              )}
            />

            <Controller
              control={xtreamForm.control}
              name="username"
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <Input
                  label="Username"
                  value={value}
                  onChangeText={onChange}
                  placeholder="Enter username"
                  error={error?.message}
                />
              )}
            />

            <Controller
              control={xtreamForm.control}
              name="password"
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <Input
                  label="Password"
                  value={value}
                  onChangeText={onChange}
                  placeholder="Enter password"
                  secureTextEntry
                  error={error?.message}
                />
              )}
            />

            <Controller
              control={xtreamForm.control}
              name="playlistName"
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <Input
                  label="Playlist Name"
                  value={value}
                  onChangeText={onChange}
                  placeholder="My IPTV Service"
                  error={error?.message}
                />
              )}
            />

            <Button
              title="Sign In"
              onPress={xtreamForm.handleSubmit(handleXtreamLogin)}
              isLoading={isLoading}
              fullWidth
            />
          </View>
        ) : (
          // M3U login form
          <View style={styles.formContainer}>
            <Controller
              control={m3uForm.control}
              name="m3uUrl"
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <Input
                  label="M3U URL"
                  value={value}
                  onChangeText={onChange}
                  placeholder="http://example.com/playlist.m3u"
                  error={error?.message}
                  keyboardType="url"
                />
              )}
            />

            <Controller
              control={m3uForm.control}
              name="playlistName"
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <Input
                  label="Playlist Name"
                  value={value}
                  onChangeText={onChange}
                  placeholder="My M3U Playlist"
                  error={error?.message}
                />
              )}
            />

            <Button
              title="Sign In"
              onPress={m3uForm.handleSubmit(handleM3ULogin)}
              isLoading={isLoading}
              fullWidth
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 24,
    paddingTop: 100,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.dark.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    marginBottom: 32,
  },
  formContainer: {
    width: '100%',
  },
}); 
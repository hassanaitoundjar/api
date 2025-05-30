import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import Colors from '../constants/Colors';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.dark.background },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="login" options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="player" 
        options={{ 
          presentation: 'card',
          animation: 'slide_from_right',
          gestureEnabled: true,
        }} 
      />
      <Stack.Screen 
        name="movies/moviesdetail" 
        options={{ 
          presentation: 'card',
          animation: 'slide_from_right',
          gestureEnabled: true,
        }} 
      />
      <Stack.Screen 
        name="movies/movieplayer" 
        options={{ 
          presentation: 'card',
          animation: 'slide_from_right',
          gestureEnabled: true,
        }} 
      />
      <Stack.Screen 
        name="series/seriesdetail" 
        options={{ 
          presentation: 'card',
          animation: 'slide_from_right',
          gestureEnabled: true,
        }} 
      />
      <Stack.Screen 
        name="series/seriesplayer" 
        options={{ 
          presentation: 'card',
          animation: 'slide_from_right',
          gestureEnabled: true,
        }} 
      />
    </Stack>
  );
}

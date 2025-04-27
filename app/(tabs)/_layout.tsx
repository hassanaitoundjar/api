import React from 'react';
import { Tabs } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../../constants/Colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.dark.accent,
        tabBarInactiveTintColor: Colors.dark.tabIconDefault,
        tabBarStyle: {
          backgroundColor: Colors.dark.backgroundSecondary,
          borderTopColor: Colors.dark.border,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: Colors.dark.backgroundSecondary,
        },
        headerTintColor: Colors.dark.textPrimary,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome5 name="home" size={22} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="live"
        options={{
          title: 'Live TV',
          tabBarIcon: ({ color }) => <FontAwesome5 name="tv" size={22} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="movies"
        options={{
          title: 'Movies',
          tabBarIcon: ({ color }) => <FontAwesome5 name="film" size={22} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="series"
        options={{
          title: 'Series',
          tabBarIcon: ({ color }) => <FontAwesome5 name="play-circle" size={22} color={color} />,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}

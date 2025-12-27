import { Tabs } from 'expo-router';
import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView, Platform, StatusBar } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';

// Warm, soft aesthetic color palette inspired by the ClickLearn design
const WarmRetroColors = {
  primary: '#F4A261',        // Warm peach/orange
  secondary: '#E76F51',      // Terracotta
  accent: '#2A9D8F',         // Teal
  background: '#FFF8F0',     // Warm off-white
  surface: '#FEFAE0',        // Cream
  sidebar: '#FFE8CC',        // Light peach
  border: '#E9C896',         // Soft tan
  text: '#264653',           // Dark teal-gray
  textSecondary: '#6B7280',  // Medium gray
  success: '#A8DADC',        // Soft blue-green
  cardBg: '#FFFFFF',         // White for cards
};

export default function TabLayout() {
  // Calculate safe area padding for Android
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: WarmRetroColors.primary,
        tabBarInactiveTintColor: WarmRetroColors.textSecondary,
        tabBarStyle: { 
          backgroundColor: WarmRetroColors.sidebar,
          borderTopWidth: 0,
          paddingTop: Platform.OS === 'android' ? statusBarHeight + 18 : 18,
          height: Platform.OS === 'android' ? 95 + statusBarHeight : 95,
          paddingBottom: 18,
          paddingHorizontal: 10,
          // Enhanced shadow for depth and animation visibility
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.12,
          shadowRadius: 16,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          marginTop: 6,
        },
        tabBarItemStyle: {
          paddingVertical: 12,
          borderRadius: 20,
          marginHorizontal: 8,
          marginVertical: 6,
          minHeight: 70,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'transparent',
          // Add space for animation lift effect
          transform: [{ translateY: 0 }],
        },
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarPosition: 'top',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color }) => <MaterialIcons size={26} name="qr-code-scanner" color={color} />,
        }}
      />
      <Tabs.Screen
        name="show"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ color }) => <MaterialIcons size={26} name="account-balance-wallet" color={color} />,
        }}
      />
      <Tabs.Screen
        name="mesh"
        options={{
          title: 'Mesh',
          tabBarIcon: ({ color }) => <MaterialIcons size={26} name="device-hub" color={color} />,
        }}
      />
    </Tabs>
  );
}
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ClerkProvider } from '@clerk/clerk-expo';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { AppNavigator } from './src/navigation/AppNavigator';
import { colors } from './src/styles/colors';
import { tokenCache } from './src/utils/tokenCache';

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!);
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

console.log('Clerk Publishable Key loaded:', publishableKey ? `${publishableKey.substring(0, 20)}...` : 'NOT LOADED');

if (!publishableKey) {
  throw new Error(
    'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env.local'
  );
}

export default function App() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ConvexProvider client={convex}>
        <SafeAreaProvider>
          <NavigationContainer>
            <AppNavigator />
            <StatusBar style="dark" backgroundColor={colors.background} />
          </NavigationContainer>
        </SafeAreaProvider>
      </ConvexProvider>
    </ClerkProvider>
  );
}

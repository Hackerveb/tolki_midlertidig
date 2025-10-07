import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack';
import { useAuth } from '@clerk/clerk-expo';
import { NavigationParamList } from '../types';
import { MainScreen } from '../screens/MainScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { BuyCreditsScreen } from '../screens/BuyCreditsScreen';
import { BillingHistoryScreen } from '../screens/BillingHistoryScreen';
import { SignUpScreen } from '../screens/SignUpScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { colors } from '../styles/colors';

const Stack = createStackNavigator<NavigationParamList>();

const screenOptions: StackNavigationOptions = {
  headerShown: false,
  cardStyle: {
    backgroundColor: colors.background,
  },
  animationEnabled: true,
  cardStyleInterpolator: ({ current, layouts }) => {
    return {
      cardStyle: {
        transform: [
          {
            translateX: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.width, 0],
            }),
          },
        ],
      },
    };
  },
};

const LoadingView = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
    <ActivityIndicator size="large" color={colors.primary} />
  </View>
);

export const AppNavigator: React.FC = () => {
  const { isLoaded, isSignedIn } = useAuth();

  // Show loading while checking auth
  if (!isLoaded) {
    return <LoadingView />;
  }

  // Determine initial route
  const getInitialRoute = (): keyof NavigationParamList => {
    return isSignedIn ? 'Main' : 'Onboarding';
  };

  return (
    <Stack.Navigator
      initialRouteName={getInitialRoute()}
      screenOptions={screenOptions}
    >
      {isSignedIn ? (
        <>
          <Stack.Screen
            name="Main"
            component={MainScreen}
            options={{
              animationEnabled: false,
            }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
          />
          <Stack.Screen
            name="EditProfile"
            component={EditProfileScreen}
          />
          <Stack.Screen
            name="BuyCredits"
            component={BuyCreditsScreen}
          />
          <Stack.Screen
            name="BillingHistory"
            component={BillingHistoryScreen}
          />
        </>
      ) : (
        <>
          {/* Onboarding (includes sign-in on page 4) */}
          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{
              animationEnabled: false,
            }}
          />
          <Stack.Screen
            name="SignUp"
            component={SignUpScreen}
          />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
          />
        </>
      )}
    </Stack.Navigator>
  );
};
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack';
import { useAuth } from '@clerk/clerk-expo';
import { NavigationParamList } from '../types';
import { MainScreen } from '../screens/MainScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { BuyCreditsScreen } from '../screens/BuyCreditsScreen';
import { PaymentMethodsScreen } from '../screens/PaymentMethodsScreen';
import { BillingHistoryScreen } from '../screens/BillingHistoryScreen';
import { SignInScreen } from '../screens/SignInScreen';
import { SignUpScreen } from '../screens/SignUpScreen';
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

  if (!isLoaded) {
    return <LoadingView />;
  }

  return (
    <Stack.Navigator
      initialRouteName={isSignedIn ? "Main" : "SignIn"}
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
            name="PaymentMethods"
            component={PaymentMethodsScreen}
          />
          <Stack.Screen
            name="BillingHistory"
            component={BillingHistoryScreen}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="SignIn"
            component={SignInScreen}
          />
          <Stack.Screen
            name="SignUp"
            component={SignUpScreen}
          />
        </>
      )}
    </Stack.Navigator>
  );
};
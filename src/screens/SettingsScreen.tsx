import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  Animated,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useClerk } from '@clerk/clerk-expo';
import * as WebBrowser from 'expo-web-browser';
import { Header } from '../components/Header';
import { NeumorphicCard } from '../components/NeumorphicCard';
import { NavigationParamList } from '../types';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useCredits } from '../hooks/useCredits';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing, radius } from '../styles/global';
import { shadows } from '../styles/shadows';
import { Svg, Path, Rect, Circle, Polyline } from 'react-native-svg';
import { hapticFeedback } from '../utils/haptics';
import { PRIVACY_POLICY_URL, TERMS_OF_SERVICE_URL } from '../constants/legal';

type SettingsScreenNavigationProp = StackNavigationProp<NavigationParamList, 'Settings'>;

interface ActionButtonProps {
  title: string;
  onPress: () => void;
  icon?: React.ReactNode;
  isAccent?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  title,
  onPress,
  icon,
  isAccent = false,
}) => (
  <Pressable
    onPress={() => {
      hapticFeedback.light();
      onPress();
    }}
    style={({ pressed }) => [
      styles.actionBtn,
      isAccent && styles.actionBtnAccent,
      pressed && styles.actionBtnPressed,
    ]}
  >
    <Text style={[styles.actionBtnText, isAccent && styles.actionBtnTextAccent]}>
      {title}
    </Text>
    {icon && !isAccent && <View style={styles.actionBtnIcon}>{icon}</View>}
  </Pressable>
);

const ArrowIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Polyline 
      points="9 18 15 12 9 6" 
      stroke={colors.silverAlpha(0.6)} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </Svg>
);

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { signOut } = useClerk();
  const { displayName, email, initials } = useCurrentUser();
  const { balance, isLowOnCredits } = useCredits();
  const creditAnimation = useRef(new Animated.Value(0)).current;
  const shimmerAnimation = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    // Animate credit display on mount
    setTimeout(() => {
      Animated.timing(creditAnimation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }, 500);

    // Shimmer animation
    Animated.loop(
      Animated.timing(shimmerAnimation, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const handleSignOut = () => {
    hapticFeedback.light();
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => hapticFeedback.light()
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await hapticFeedback.warning();
              await signOut();
            } catch (error) {
              console.error('Sign out error:', error);
              await hapticFeedback.error();
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          }
        },
      ]
    );
  };

  const openURL = async (url: string) => {
    try {
      await hapticFeedback.light();
      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      console.error('Error opening URL:', error);
      await hapticFeedback.error();
      Alert.alert('Error', 'Unable to open link. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Settings"
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Profile Section with Credits */}
        <View style={styles.userSection}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>{initials}</Text>
          </View>
          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.userEmail}>{email}</Text>

          {/* Credits Display */}
          <Animated.View style={[
            styles.creditsDisplayCompact,
            {
              opacity: creditAnimation,
              transform: [{
                scale: creditAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.95, 1],
                }),
              }],
            },
          ]}>
            <View style={styles.creditsBadge}>
              <Text style={styles.creditsNumberCompact}>{balance}</Text>
              <Text style={styles.creditsLabelCompact}>credits</Text>
            </View>
            <Text style={styles.creditsDescriptionCompact}>≈ {balance} min</Text>
            {isLowOnCredits && (
              <View style={styles.lowCreditsWarningCompact}>
                <Text style={styles.lowCreditsTextCompact}>⚠️ Low</Text>
              </View>
            )}
          </Animated.View>

          <Pressable
            style={({ pressed }) => [
              styles.logoutBtn,
              pressed && styles.btnPressed
            ]}
            onPress={handleSignOut}
          >
            <Text style={styles.logoutBtnText}>Sign Out</Text>
          </Pressable>
        </View>

        {/* Management Actions */}
        <NeumorphicCard style={styles.profileSection}>
          <View style={styles.sectionHeader}>
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <Path 
                d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" 
                stroke={colors.foreground} 
                strokeWidth="2" 
                strokeLinecap="round"
              />
            </Svg>
            <Text style={styles.sectionTitle}>Manage</Text>
          </View>

          <ActionButton
            title="Buy Credits"
            onPress={() => navigation.navigate('BuyCredits')}
            icon={<ArrowIcon />}
          />
          <ActionButton
            title="Billing History"
            onPress={() => navigation.navigate('BillingHistory')}
            icon={<ArrowIcon />}
          />
        </NeumorphicCard>

        {/* Legal Section */}
        <NeumorphicCard style={styles.profileSection}>
          <View style={styles.sectionHeader}>
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <Path
                d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                stroke={colors.foreground}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M14 2v6h6"
                stroke={colors.foreground}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M12 18v-6M9 15h6"
                stroke={colors.foreground}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </Svg>
            <Text style={styles.sectionTitle}>Legal</Text>
          </View>

          <ActionButton
            title="Privacy Policy"
            onPress={() => openURL(PRIVACY_POLICY_URL)}
            icon={<ArrowIcon />}
          />
          <ActionButton
            title="Terms of Service"
            onPress={() => openURL(TERMS_OF_SERVICE_URL)}
            icon={<ArrowIcon />}
          />
        </NeumorphicCard>

        {/* Profile Management */}
        <NeumorphicCard style={styles.profileSection}>
          <View style={styles.sectionHeader}>
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={colors.foreground} strokeWidth="2" />
              <Circle cx="12" cy="7" r="4" stroke={colors.foreground} strokeWidth="2" />
            </Svg>
            <Text style={styles.sectionTitle}>Profile</Text>
          </View>

          <ActionButton
            title="Edit Profile"
            onPress={() => navigation.navigate('EditProfile')}
            icon={<ArrowIcon />}
          />
          <ActionButton
            title="Change Password"
            onPress={() => Alert.alert('Change Password', 'Change password functionality would be implemented here')}
            isAccent
          />
        </NeumorphicCard>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  
  // User Profile Section
  userSection: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background,
    borderRadius: 20,
    marginVertical: 20,
    ...shadows.subtle,
  },
  userAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    ...shadows.elevated,
  },
  userAvatarText: {
    fontSize: 32,
    fontWeight: '600',
    color: colors.primary,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: colors.silver,
    marginBottom: 15,
  },
  logoutBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: colors.background,
    borderRadius: 20,
    ...shadows.subtle,
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#e74c3c',
  },
  btnPressed: {
    ...shadows.pressed,
  },

  // Credits Display (Compact - integrated in user section)
  creditsDisplayCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 20,
    gap: 12,
  },
  creditsBadge: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    ...shadows.elevated,
  },
  creditsNumberCompact: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
  },
  creditsLabelCompact: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.white,
    opacity: 0.9,
  },
  creditsDescriptionCompact: {
    fontSize: 13,
    color: colors.silverAlpha(0.6),
    fontWeight: '500',
  },
  lowCreditsWarningCompact: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  lowCreditsTextCompact: {
    fontSize: 11,
    color: colors.white,
    fontWeight: '600',
  },

  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
  },

  // Profile Section
  profileSection: {
    padding: 20,
    marginBottom: 20,
  },

  // Action Buttons
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: colors.background,
    borderRadius: 16,
    marginBottom: 12,
    ...shadows.subtle,
  },
  actionBtnPressed: {
    ...shadows.pressed,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
  },
  actionBtnIcon: {
    opacity: 0.6,
  },
  actionBtnAccent: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
  },
  actionBtnTextAccent: {
    color: colors.white,
    fontWeight: '600',
  },
});
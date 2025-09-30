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
    onPress={onPress} 
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
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error('Sign out error:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Settings"
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Profile Section */}
        <View style={styles.userSection}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>{initials}</Text>
          </View>
          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.userEmail}>{email}</Text>
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

        {/* Credits Section */}
        <NeumorphicCard style={styles.subscriptionSection}>
          <View style={styles.sectionHeader}>
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <Circle cx="12" cy="12" r="10" stroke={colors.foreground} strokeWidth="2" />
              <Polyline
                points="12 6 12 12 16 14"
                stroke={colors.foreground}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <Text style={styles.sectionTitle}>Credits</Text>
          </View>

          <Animated.View style={[
            styles.creditsDisplay,
            {
              opacity: creditAnimation,
              transform: [{
                scale: creditAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              }],
            },
          ]}>
            <Text style={styles.creditsNumber}>{balance}</Text>
            <Text style={styles.creditsLabel}>credits remaining</Text>
            <Text style={styles.creditsDescription}>{balance} minutes of translation</Text>
            {isLowOnCredits && (
              <View style={styles.lowCreditsWarning}>
                <Text style={styles.lowCreditsText}>⚠️ Running low on credits</Text>
              </View>
            )}
          </Animated.View>
        </NeumorphicCard>

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
            title="Payment Methods"
            onPress={() => navigation.navigate('PaymentMethods')}
            icon={<ArrowIcon />}
          />
          <ActionButton
            title="Billing History"
            onPress={() => navigation.navigate('BillingHistory')}
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

  // Subscription Section
  subscriptionSection: {
    padding: 20,
    marginBottom: 20,
  },
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
  usageMeter: {
    marginBottom: 20,
  },
  usageLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  usageLabelText: {
    fontSize: 13,
    color: colors.silver,
  },
  usageLabelValue: {
    fontSize: 13,
    color: colors.silver,
  },
  usageBar: {
    height: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
    overflow: 'hidden',
    ...shadows.pressed,
  },
  usageFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.silverAlpha(0.2),
  },
  lastInfoRow: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.silver,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
  },
  planBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  planBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },

  // Credits Display
  creditsDisplay: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  creditsNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  creditsLabel: {
    fontSize: 14,
    color: colors.silverAlpha(0.6),
    marginBottom: 4,
  },
  creditsDescription: {
    fontSize: 12,
    color: colors.silverAlpha(0.5),
    marginBottom: 12,
  },
  lowCreditsWarning: {
    backgroundColor: '#FF6B6B20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF6B6B40',
  },
  lowCreditsText: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '600',
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
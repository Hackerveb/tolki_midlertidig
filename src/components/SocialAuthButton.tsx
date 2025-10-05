import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import Svg, { Path, G, Defs, ClipPath, Rect } from 'react-native-svg';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing, radius } from '../styles/global';
import { shadows } from '../styles/shadows';

type SocialProvider = 'google' | 'apple';

interface SocialAuthButtonProps {
  provider: SocialProvider;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  mode?: 'signin' | 'signup';
  iconOnly?: boolean;
}

// Google Logo SVG
const GoogleIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 48 48">
    <Path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
    />
    <Path
      fill="#4285F4"
      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
    />
    <Path
      fill="#FBBC05"
      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
    />
    <Path
      fill="#34A853"
      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
    />
  </Svg>
);

// Apple Logo SVG
const AppleIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="white">
    <Path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
  </Svg>
);

export const SocialAuthButton: React.FC<SocialAuthButtonProps> = ({
  provider,
  onPress,
  disabled = false,
  loading = false,
  mode = 'signin',
  iconOnly = false,
}) => {
  const isGoogle = provider === 'google';
  const isApple = provider === 'apple';

  if (iconOnly) {
    // Icon-only version: small circular button
    const iconButtonStyle = isApple
      ? styles.iconAppleButton
      : styles.iconGoogleButton;

    return (
      <Pressable
        style={({ pressed }) => [
          styles.iconButton,
          iconButtonStyle,
          pressed && !disabled && !loading && styles.iconButtonPressed,
          (disabled || loading) && styles.buttonDisabled,
        ]}
        onPress={onPress}
        disabled={disabled || loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color={isApple ? colors.white : colors.foreground} />
        ) : (
          <>
            {isGoogle ? <GoogleIcon /> : <AppleIcon />}
          </>
        )}
      </Pressable>
    );
  }

  // Full version with text
  const buttonStyle = isApple
    ? styles.appleButton
    : styles.googleButton;

  const textStyle = isApple
    ? styles.appleButtonText
    : styles.googleButtonText;

  const buttonText = mode === 'signin'
    ? `Sign in with ${isGoogle ? 'Google' : 'Apple'}`
    : `Sign up with ${isGoogle ? 'Google' : 'Apple'}`;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        buttonStyle,
        pressed && !disabled && !loading && styles.buttonPressed,
        (disabled || loading) && styles.buttonDisabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={isApple ? colors.white : colors.foreground} />
      ) : (
        <View style={styles.buttonContent}>
          <View style={styles.iconContainer}>
            {isGoogle ? <GoogleIcon /> : <AppleIcon />}
          </View>
          <Text style={[styles.buttonText, textStyle]}>{buttonText}</Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    minHeight: 56, // 44pt = 56px approximately
    width: '100%',
    ...shadows.elevated,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  googleButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.silverAlpha(0.2),
  },
  appleButton: {
    backgroundColor: '#000000', // Apple requires black background
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    ...shadows.subtle,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    ...typography.button,
    fontSize: 16,
    fontWeight: '600',
  },
  googleButtonText: {
    color: colors.foreground,
  },
  appleButtonText: {
    color: colors.white,
  },
  // Icon-only button styles
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.subtle,
  },
  iconGoogleButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.silverAlpha(0.2),
  },
  iconAppleButton: {
    backgroundColor: '#000000',
  },
  iconButtonPressed: {
    transform: [{ scale: 0.95 }],
  },
});

import { Platform, ViewStyle } from 'react-native';
import { colors } from './colors';

interface ShadowStyle {
  ios: ViewStyle;
  android: ViewStyle;
}

const createShadow = (config: {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}): ShadowStyle => ({
  ios: {
    shadowColor: config.shadowColor,
    shadowOffset: config.shadowOffset,
    shadowOpacity: config.shadowOpacity,
    shadowRadius: config.shadowRadius,
  },
  android: {
    elevation: config.elevation,
  },
});

export const shadows = {
  // Neumorphic elevated shadow
  elevated: Platform.select({
    ...createShadow({
      shadowColor: colors.silver,
      shadowOffset: { width: 8, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 8,
    }),
  }),
  
  // Neumorphic pressed/inset shadow
  pressed: Platform.select({
    ios: {
      shadowColor: colors.silver,
      shadowOffset: { width: -2, height: -2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    android: {
      elevation: 0,
    },
  }),
  
  // Subtle shadow for cards
  subtle: Platform.select({
    ...createShadow({
      shadowColor: colors.silver,
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    }),
  }),
  
  // Hover/focus shadow
  hover: Platform.select({
    ...createShadow({
      shadowColor: colors.silver,
      shadowOffset: { width: 10, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 10,
    }),
  }),
  
  // Double shadow for neumorphic effect
  neumorphic: Platform.select({
    ios: {
      shadowColor: colors.silver,
      shadowOffset: { width: 8, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      // For the light shadow, we'll apply it as a border or background gradient
    },
    android: {
      elevation: 8,
      // Android doesn't support multiple shadows natively
      // We'll use elevation and potentially a custom drawable
    },
  }),
  
  // Neumorphic button shadow
  button: Platform.select({
    ios: {
      shadowColor: colors.silverAlpha(0.4),
      shadowOffset: { width: 6, height: 6 },
      shadowOpacity: 1,
      shadowRadius: 12,
    },
    android: {
      elevation: 6,
    },
  }),
  
  // Neumorphic button pressed
  buttonPressed: Platform.select({
    ios: {
      shadowColor: colors.silverAlpha(0.4),
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 4,
    },
    android: {
      elevation: 2,
    },
  }),
};
import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors } from '../styles/colors';
import { shadows } from '../styles/shadows';
import { radius, spacing } from '../styles/global';

interface NeumorphicCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'elevated' | 'pressed' | 'subtle';
  padding?: boolean;
}

export const NeumorphicCard: React.FC<NeumorphicCardProps> = ({
  children,
  style,
  variant = 'elevated',
  padding = true,
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'pressed':
        return styles.cardPressed;
      case 'subtle':
        return styles.cardSubtle;
      case 'elevated':
      default:
        return styles.cardElevated;
    }
  };

  return (
    <View
      style={[
        styles.card,
        getVariantStyle(),
        padding && styles.cardPadding,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
  },
  cardPadding: {
    padding: spacing.md,
  },
  cardElevated: {
    ...shadows.elevated,
  },
  cardPressed: {
    ...shadows.pressed,
  },
  cardSubtle: {
    ...shadows.subtle,
  },
});
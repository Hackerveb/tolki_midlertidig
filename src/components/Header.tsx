import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/global';

interface HeaderProps {
  title?: string;
  onBack?: () => void;
  rightElement?: React.ReactNode;
  showBack?: boolean;
  transparent?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onBack,
  rightElement,
  showBack = true,
  transparent = false,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top || StatusBar.currentHeight || 0,
          backgroundColor: transparent ? 'transparent' : colors.background,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.left}>
          {showBack && onBack && (
            <Pressable onPress={onBack} style={styles.backButton}>
              <Text style={styles.backIcon}>←</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.center}>
          {title && <Text style={styles.title}>{title}</Text>}
        </View>

        <View style={styles.right}>{rightElement}</View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: Platform.select({
      ios: 44,
      android: 56,
      default: 56,
    }),
    paddingHorizontal: spacing.md,
  },
  left: {
    flex: 1,
    alignItems: 'flex-start',
  },
  center: {
    flex: 2,
    alignItems: 'center',
  },
  right: {
    flex: 1,
    alignItems: 'flex-end',
  },
  title: {
    ...typography.h6,
    color: colors.foreground,
    textAlign: 'center',
  },
  backButton: {
    padding: spacing.sm,
  },
  backIcon: {
    fontSize: 24,
    color: colors.foreground,
  },
});
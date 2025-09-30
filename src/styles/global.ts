import { StyleSheet, Dimensions, Platform } from 'react-native';
import { colors } from './colors';
import { shadows } from './shadows';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  full: 9999,
};

export const globalStyles = StyleSheet.create({
  // Containers
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  
  // Layout
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Common components
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.elevated,
  },
  
  button: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.button,
  },
  
  buttonPressed: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.buttonPressed,
  },
  
  input: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.foreground,
    ...shadows.pressed,
  },
  
  // Separators
  separator: {
    height: 1,
    backgroundColor: colors.silverAlpha(0.2),
    marginVertical: spacing.md,
  },
  
  // App specific
  appContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignSelf: 'center',
    width: '100%',
    ...Platform.select({
      web: { maxWidth: 430 },
      default: {},
    }),
  },
  
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  // Neumorphic elements
  neumorphicContainer: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    ...shadows.neumorphic,
  },
  
  neumorphicButton: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.elevated,
  },
  
  neumorphicButtonPressed: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.pressed,
  },
  
  // Record button specific
  recordButtonContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.elevated,
  },
  
  // Language dropdown
  languageDropdown: {
    flex: 1,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    ...shadows.subtle,
  },
  
  // Audio visualizer dots
  audioDotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    gap: spacing.sm,
  },
  
  audioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.blueMunsell,
  },
});

export const dimensions = {
  screenWidth,
  screenHeight,
  maxAppWidth: 430,
  headerHeight: Platform.select({
    ios: 44 + (Platform.OS === 'ios' ? 48 : 0), // Account for status bar
    android: 56,
    default: 56,
  }),
  tabBarHeight: Platform.select({
    ios: 49 + (Platform.OS === 'ios' ? 34 : 0), // Account for bottom safe area
    android: 56,
    default: 56,
  }),
  recordButtonSize: 80,
  languageDropdownHeight: 48,
};
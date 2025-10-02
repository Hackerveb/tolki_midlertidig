import * as Haptics from 'expo-haptics';

/**
 * Centralized haptic feedback utility
 * Provides consistent tactile feedback across the app
 */

export const hapticFeedback = {
  /**
   * Light impact - for subtle interactions
   * Use for: dropdown opens, list scrolls, minor selections
   */
  light: () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Silently fail if haptics not available
    }
  },

  /**
   * Medium impact - for standard interactions
   * Use for: button presses, confirmations, toggles
   */
  medium: () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      // Silently fail if haptics not available
    }
  },

  /**
   * Heavy impact - for significant interactions
   * Use for: important confirmations, errors, critical actions
   */
  heavy: () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      // Silently fail if haptics not available
    }
  },

  /**
   * Success notification - positive feedback
   * Use for: successful purchases, completed actions
   */
  success: () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      // Silently fail if haptics not available
    }
  },

  /**
   * Warning notification - cautionary feedback
   * Use for: low credits warnings, approaching limits
   */
  warning: () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (error) {
      // Silently fail if haptics not available
    }
  },

  /**
   * Error notification - negative feedback
   * Use for: failed actions, errors, rejections
   */
  error: () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (error) {
      // Silently fail if haptics not available
    }
  },

  /**
   * Selection change - for picker/slider interactions
   * Use for: slider adjustments, value changes
   */
  selection: () => {
    try {
      Haptics.selectionAsync();
    } catch (error) {
      // Silently fail if haptics not available
    }
  },
};

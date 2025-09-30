import React, { useState, useRef } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Animated,
  PressableProps,
  StyleProp,
} from 'react-native';
import { colors } from '../styles/colors';
import { shadows } from '../styles/shadows';
import { typography } from '../styles/typography';
import { radius, spacing } from '../styles/global';

interface NeumorphicButtonProps extends Omit<PressableProps, 'style'> {
  title?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  children?: React.ReactNode;
  disabled?: boolean;
  variant?: 'default' | 'primary' | 'secondary';
}

export const NeumorphicButton: React.FC<NeumorphicButtonProps> = ({
  title,
  style,
  textStyle,
  children,
  disabled = false,
  variant = 'default',
  onPress,
  onPressIn,
  onPressOut,
  ...props
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = (event: any) => {
    setIsPressed(true);
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
    onPressIn?.(event);
  };

  const handlePressOut = (event: any) => {
    setIsPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
    onPressOut?.(event);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.primary,
          textColor: colors.white,
        };
      case 'secondary':
        return {
          backgroundColor: colors.secondary,
          textColor: colors.white,
        };
      default:
        return {
          backgroundColor: colors.background,
          textColor: colors.foreground,
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Pressable
        disabled={disabled}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.button,
          isPressed ? styles.buttonPressed : styles.buttonDefault,
          { backgroundColor: variantStyles.backgroundColor },
          disabled && styles.buttonDisabled,
          style,
        ]}
        {...props}
      >
        {children || (
          title && (
            <Text
              style={[
                styles.buttonText,
                { color: variantStyles.textColor },
                disabled && styles.buttonTextDisabled,
                textStyle,
              ]}
            >
              {title}
            </Text>
          )
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonDefault: {
    ...shadows.elevated,
  },
  buttonPressed: {
    ...shadows.pressed,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    ...typography.button,
    textAlign: 'center',
  },
  buttonTextDisabled: {
    opacity: 0.7,
  },
});
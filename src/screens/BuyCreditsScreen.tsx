import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
  PanResponder,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../components/Header';
import { useCredits } from '../hooks/useCredits';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing, radius } from '../styles/global';
import { shadows } from '../styles/shadows';
import { hapticFeedback } from '../utils/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDER_WIDTH = SCREEN_WIDTH - (spacing.lg * 2);
const SLIDER_PADDING = 20;
const EFFECTIVE_SLIDER_WIDTH = SLIDER_WIDTH - (SLIDER_PADDING * 2);

interface CreditPackage {
  id: number;
  credits: number;
  price: number;
}

const creditPackages: CreditPackage[] = [
  { id: 0, credits: 30, price: 700 },
  { id: 1, credits: 60, price: 1200 },
  { id: 2, credits: 360, price: 6900 },
  { id: 3, credits: 720, price: 12900 },
  { id: 4, credits: 1440, price: 22900 },
];

export const BuyCreditsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { balance, purchaseCredits } = useCredits();
  const [selectedPackageId, setSelectedPackageId] = useState<number>(1); // Default to 60 credits
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Animation values
  const priceCardScaleAnim = useRef(new Animated.Value(1)).current;
  const sliderThumbAnim = useRef(new Animated.Value(getSliderPosition(1))).current;
  const dragStartPosition = useRef(0);

  // Calculate slider position from package ID
  function getSliderPosition(packageId: number) {
    return (packageId / (creditPackages.length - 1)) * EFFECTIVE_SLIDER_WIDTH;
  }

  // Get package ID from slider position - finds nearest package
  function getPackageFromPosition(position: number) {
    const normalizedPosition = Math.max(0, Math.min(position, EFFECTIVE_SLIDER_WIDTH));

    // Find nearest package by distance
    let nearestPackageId = 0;
    let minDistance = Infinity;

    for (let i = 0; i < creditPackages.length; i++) {
      const packagePosition = getSliderPosition(i);
      const distance = Math.abs(normalizedPosition - packagePosition);
      if (distance < minDistance) {
        minDistance = distance;
        nearestPackageId = i;
      }
    }

    return nearestPackageId;
  }

  // Update selected package and animate
  const updateSelectedPackage = (packageId: number) => {
    if (packageId === selectedPackageId) return;

    setSelectedPackageId(packageId);
    hapticFeedback.selection(); // Selection haptic

    // Pulse price card
    Animated.sequence([
      Animated.timing(priceCardScaleAnim, {
        toValue: 1.02,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(priceCardScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // PanResponder for dragging
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // @ts-ignore - accessing internal value
        dragStartPosition.current = sliderThumbAnim._value;
      },
      onPanResponderMove: (_, gestureState) => {
        const newPosition = dragStartPosition.current + gestureState.dx;
        const clampedPosition = Math.max(0, Math.min(newPosition, EFFECTIVE_SLIDER_WIDTH));
        sliderThumbAnim.setValue(clampedPosition);

        // Update selected package in real-time while dragging
        const newPackageId = getPackageFromPosition(clampedPosition);
        setSelectedPackageId(newPackageId); // Always update, no condition check
      },
      onPanResponderRelease: () => {
        // @ts-ignore - accessing internal value
        const currentPosition = sliderThumbAnim._value;
        const finalPackageId = getPackageFromPosition(currentPosition);
        const snapPosition = getSliderPosition(finalPackageId);

        // Snap to nearest position
        Animated.spring(sliderThumbAnim, {
          toValue: snapPosition,
          useNativeDriver: false,
          friction: 8,
          tension: 40,
        }).start();

        // Update selected package
        updateSelectedPackage(finalPackageId);
      },
    })
  ).current;

  const handleStopPress = (packageId: number) => {
    if (packageId === selectedPackageId) return;

    setSelectedPackageId(packageId);
    hapticFeedback.light(); // Light haptic on package selection

    // Animate slider thumb
    Animated.spring(sliderThumbAnim, {
      toValue: getSliderPosition(packageId),
      useNativeDriver: false,
      friction: 8,
      tension: 40,
    }).start();

    // Pulse price card
    Animated.sequence([
      Animated.timing(priceCardScaleAnim, {
        toValue: 1.02,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(priceCardScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePurchase = async () => {
    if (isPurchasing) return;

    await hapticFeedback.medium(); // Medium haptic on purchase press
    setIsPurchasing(true);
    try {
      const result = await purchaseCredits(selectedPackageId);
      await hapticFeedback.success(); // Success haptic
      Alert.alert(
        'Purchase Successful!',
        `${creditPackages[selectedPackageId].credits} credits have been added to your account. New balance: ${result.newBalance?.toFixed(2) || '0.00'} credits.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      await hapticFeedback.error(); // Error haptic
      Alert.alert(
        'Purchase Failed',
        'There was an error processing your purchase. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsPurchasing(false);
    }
  };

  const selectedPackage = creditPackages[selectedPackageId];
  const priceInDollars = (selectedPackage.price / 100).toFixed(2);
  const pricePerCredit = (selectedPackage.price / selectedPackage.credits / 100).toFixed(2);

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Buy Credits"
        showBack
        onBack={() => navigation.goBack()}
        rightElement={
          <Text style={styles.headerBalance}>
            {balance?.toFixed(0) || '0'}
          </Text>
        }
      />

      <View style={styles.content}>
        {/* Top Section - Slider stays centered */}
        <View style={styles.topSection}>
          {/* Slider */}
          <View style={styles.sliderSection}>
          <View style={styles.sliderContainer}>
            <View style={styles.sliderTrack} />

            {/* Slider Stops */}
            {creditPackages.map((pkg, index) => {
              const position = getSliderPosition(index);
              return (
                <Pressable
                  key={pkg.id}
                  onPress={() => handleStopPress(index)}
                  style={[
                    styles.sliderStop,
                    { left: position + SLIDER_PADDING },
                    selectedPackageId === index && styles.sliderStopActive,
                  ]}
                >
                  <View style={styles.sliderStopInner} />
                </Pressable>
              );
            })}

            {/* Slider Thumb */}
            <Animated.View
              {...panResponder.panHandlers}
              style={[
                styles.sliderThumb,
                {
                  left: sliderThumbAnim.interpolate({
                    inputRange: [0, EFFECTIVE_SLIDER_WIDTH],
                    outputRange: [SLIDER_PADDING, SLIDER_PADDING + EFFECTIVE_SLIDER_WIDTH],
                  }),
                },
              ]}
            />
          </View>

          {/* Slider Labels */}
          <View style={styles.sliderLabels}>
            {creditPackages.map((pkg, index) => {
              const position = getSliderPosition(index);
              return (
                <Text
                  key={pkg.id}
                  style={[
                    styles.sliderLabel,
                    { left: position + SLIDER_PADDING },
                    selectedPackageId === index && styles.sliderLabelActive,
                  ]}
                >
                  {pkg.credits}
                </Text>
              );
            })}
          </View>
        </View>
        </View>

        {/* Bottom Section - Hours, Price, Button */}
        <View style={styles.bottomSection}>
          {/* Hours Display */}
          <View style={styles.hoursContainer}>
          <Text style={styles.hoursText}>= {(selectedPackage.credits / 60).toFixed(1)} hours</Text>
        </View>

        {/* Price Card */}
        <Animated.View
          style={[
            styles.priceCard,
            {
              transform: [{ scale: priceCardScaleAnim }],
            },
          ]}
        >
          {/* Best Value Badge - show for 360 credits package (index 2) */}
          {selectedPackageId === 2 && (
            <View style={styles.bestValueBadge}>
              <Text style={styles.bestValueText}>⭐ BEST VALUE</Text>
            </View>
          )}
          <Text style={styles.priceAmount}>${priceInDollars}</Text>
          <Text style={styles.pricePerCredit}>${pricePerCredit}/credit</Text>
        </Animated.View>

        {/* Purchase Button */}
        <Pressable
          style={({ pressed }) => [
            styles.purchaseButton,
            pressed && styles.purchaseButtonPressed,
            isPurchasing && styles.purchaseButtonDisabled,
          ]}
          onPress={handlePurchase}
          disabled={isPurchasing}
        >
          {isPurchasing ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.purchaseButtonText}>
              Purchase ${priceInDollars}
            </Text>
          )}
        </Pressable>
        </View>
      </View>
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
    padding: spacing.lg,
  },

  // Top Section - Slider stays centered
  topSection: {
    flex: 1,
    justifyContent: 'center',
  },

  // Bottom Section - Hours, Price, Button at bottom
  bottomSection: {
    // No flex, stays at bottom
  },

  // Header Balance
  headerBalance: {
    ...typography.h6,
    color: colors.primary,
    fontSize: 18,
    fontWeight: '600',
  },

  // Slider
  sliderSection: {
    marginBottom: spacing.xl,
  },
  sliderContainer: {
    height: 60,
    width: SLIDER_WIDTH,
    position: 'relative',
    marginBottom: spacing.md,
  },
  sliderTrack: {
    position: 'absolute',
    top: 28,
    left: SLIDER_PADDING,
    right: SLIDER_PADDING,
    height: 4,
    backgroundColor: colors.background,
    borderRadius: 2,
    ...shadows.pressed,
  },
  sliderStop: {
    position: 'absolute',
    top: 20,
    width: 20,
    height: 20,
    marginLeft: -10,
    borderRadius: 10,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.subtle,
  },
  sliderStopActive: {
    ...shadows.elevated,
  },
  sliderStopInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.silverAlpha(0.3),
  },
  sliderThumb: {
    position: 'absolute',
    top: 15,
    width: 30,
    height: 30,
    marginLeft: -15,
    borderRadius: 15,
    backgroundColor: colors.primary,
    ...shadows.elevated,
  },
  sliderLabels: {
    position: 'relative',
    height: 20,
    width: SLIDER_WIDTH,
  },
  sliderLabel: {
    position: 'absolute',
    ...typography.caption,
    color: colors.silverAlpha(0.5),
    fontSize: 12,
    marginLeft: -20,
    width: 40,
    textAlign: 'center',
  },
  sliderLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },

  // Hours
  hoursContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  hoursText: {
    ...typography.body,
    color: colors.foreground,
    fontSize: 18,
  },

  // Price Card
  priceCard: {
    backgroundColor: colors.background,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
    alignItems: 'center',
    marginBottom: spacing.xl,
    alignSelf: 'center',
    minWidth: 200,
    ...shadows.elevated,
  },
  bestValueBadge: {
    position: 'absolute',
    top: -12,
    backgroundColor: colors.primary,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    ...shadows.elevated,
  },
  bestValueText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.5,
  },
  priceAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.foreground,
    marginBottom: spacing.xs,
  },
  pricePerCredit: {
    ...typography.body,
    color: colors.silverAlpha(0.6),
    fontSize: 14,
  },

  // Purchase Button
  purchaseButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md + 4,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
    alignItems: 'center',
    ...shadows.elevated,
  },
  purchaseButtonPressed: {
    transform: [{ scale: 0.98 }],
    ...shadows.subtle,
  },
  purchaseButtonDisabled: {
    opacity: 0.6,
  },
  purchaseButtonText: {
    ...typography.button,
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'none',
  },
});

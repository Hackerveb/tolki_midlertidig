import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../components/Header';
import { useCredits } from '../hooks/useCredits';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing, radius } from '../styles/global';
import { shadows } from '../styles/shadows';
import { hapticFeedback } from '../utils/haptics';

interface CreditPackage {
  id: number;
  credits: number;
  price: number;
}

const creditPackages: CreditPackage[] = [
  { id: 0, credits: 90, price: 599 },
  { id: 1, credits: 180, price: 1099 },
  { id: 2, credits: 1080, price: 5999 },
  { id: 3, credits: 2160, price: 11499 },
  { id: 4, credits: 4320, price: 21999 },
];

// Helper function to format time display
const formatTime = (credits: number): string => {
  const totalMinutes = credits / 3; // 3 credits per minute
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.floor(totalMinutes % 60);

  if (hours >= 1) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  return `${minutes}m`;
};

export const BuyCreditsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { balance, purchaseCredits } = useCredits();
  const [selectedPackageId, setSelectedPackageId] = useState<number>(1); // Default to 180 credits
  const [isPurchasing, setIsPurchasing] = useState(false);

  const handleSelectPackage = (packageId: number) => {
    if (packageId === selectedPackageId) return;
    setSelectedPackageId(packageId);
    hapticFeedback.light();
  };

  const handlePurchase = async () => {
    if (isPurchasing) return;

    await hapticFeedback.medium();
    setIsPurchasing(true);
    try {
      const result = await purchaseCredits(selectedPackageId);
      await hapticFeedback.success();
      Alert.alert(
        'Purchase Successful!',
        `${creditPackages[selectedPackageId].credits} credits have been added to your account. New balance: ${result.newBalance?.toFixed(0) || '0'} credits.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      await hapticFeedback.error();
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
        {/* Package Cards */}
        <View style={styles.packagesContainer}>
          {creditPackages.map((pkg) => {
            const isSelected = selectedPackageId === pkg.id;
            const isBestValue = pkg.id === 2; // 1080 credits package

            return (
              <Pressable
                key={pkg.id}
                style={[
                  styles.packageCard,
                  isSelected && styles.packageCardSelected,
                ]}
                onPress={() => handleSelectPackage(pkg.id)}
              >
                {/* Best Value Badge */}
                {isBestValue && (
                  <View style={styles.bestValueBadge}>
                    <Text style={styles.bestValueText}>⭐</Text>
                  </View>
                )}

                {/* Credits and Time Row */}
                <View style={styles.packageTopRow}>
                  <Text style={[styles.creditsText, isSelected && styles.creditsTextSelected]}>
                    {pkg.credits} credits
                  </Text>
                  <Text style={styles.bulletSeparator}>•</Text>
                  <Text style={[styles.timeText, isSelected && styles.timeTextSelected]}>
                    {formatTime(pkg.credits)}
                  </Text>
                </View>

                {/* Price Row */}
                <Text style={[styles.priceText, isSelected && styles.priceTextSelected]}>
                  ${(pkg.price / 100).toFixed(2)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Buy Now Button */}
        <Pressable
          style={({ pressed }) => [
            styles.buyButton,
            pressed && styles.buyButtonPressed,
            isPurchasing && styles.buyButtonDisabled,
          ]}
          onPress={handlePurchase}
          disabled={isPurchasing}
        >
          {isPurchasing ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buyButtonText}>
              BUY NOW - ${priceInDollars}
            </Text>
          )}
        </Pressable>
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    justifyContent: 'space-between',
  },

  // Header Balance
  headerBalance: {
    ...typography.h6,
    color: colors.primary,
    fontSize: 18,
    fontWeight: '600',
  },

  // Package Cards Container
  packagesContainer: {
    gap: spacing.sm,
  },

  // Package Card
  packageCard: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    ...shadows.subtle,
  },
  packageCardSelected: {
    borderColor: colors.primary,
    ...shadows.elevated,
  },

  // Best Value Badge
  bestValueBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  bestValueText: {
    fontSize: 16,
  },

  // Package Top Row (Credits • Time)
  packageTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  creditsText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: '600',
    color: colors.silverAlpha(0.7),
  },
  creditsTextSelected: {
    color: colors.foreground,
  },
  bulletSeparator: {
    ...typography.body,
    fontSize: 15,
    color: colors.silverAlpha(0.4),
    marginHorizontal: spacing.sm,
  },
  timeText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: '500',
    color: colors.silverAlpha(0.7),
  },
  timeTextSelected: {
    color: colors.foreground,
  },

  // Price Row
  priceText: {
    ...typography.body,
    fontSize: 18,
    fontWeight: '700',
    color: colors.silverAlpha(0.6),
    textAlign: 'center',
  },
  priceTextSelected: {
    color: colors.primary,
  },

  // Buy Button
  buyButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md + 4,
    borderRadius: radius.lg,
    alignItems: 'center',
    ...shadows.elevated,
  },
  buyButtonPressed: {
    transform: [{ scale: 0.98 }],
    ...shadows.subtle,
  },
  buyButtonDisabled: {
    opacity: 0.6,
  },
  buyButtonText: {
    ...typography.button,
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

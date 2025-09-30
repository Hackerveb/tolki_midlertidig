import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../components/Header';
import { useCredits } from '../hooks/useCredits';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing, radius } from '../styles/global';
import { shadows } from '../styles/shadows';
import { Svg, Polyline, Circle } from 'react-native-svg';

interface CreditPackage {
  id: number;
  credits: number;
  price: number;
  label: string;
  description: string;
  isPopular?: boolean;
}

interface PackageCardProps {
  package: CreditPackage;
  isSelected: boolean;
  onSelect: () => void;
  isPurchasing: boolean;
}

const CheckIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Polyline
      points="20 6 9 17 4 12"
      stroke={colors.primary}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CreditIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={colors.primary} strokeWidth="2" />
    <Polyline
      points="12 6 12 12 16 14"
      stroke={colors.primary}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PackageCard: React.FC<PackageCardProps> = ({
  package: pkg,
  isSelected,
  onSelect,
  isPurchasing,
}) => (
  <Pressable
    onPress={onSelect}
    disabled={isPurchasing}
    style={({ pressed }) => [
      styles.packageCard,
      isSelected && styles.packageCardSelected,
      pkg.isPopular && styles.packageCardPopular,
      pressed && styles.packageCardPressed,
      isPurchasing && styles.packageCardDisabled,
    ]}
  >
    {pkg.isPopular && (
      <View style={styles.popularBadge}>
        <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
      </View>
    )}

    <View style={styles.packageHeader}>
      <View style={styles.packageHeaderLeft}>
        <Text style={[styles.packageCredits, isSelected && styles.textSelected]}>
          {pkg.credits}
        </Text>
        <Text style={[styles.packageCreditsLabel, isSelected && styles.textSelectedMuted]}>
          credits
        </Text>
      </View>
      <View style={styles.packageHeaderRight}>
        <Text style={[styles.packagePrice, isSelected && styles.textSelected]}>
          ${(pkg.price / 100).toFixed(2)}
        </Text>
        <Text style={[styles.packagePricePerCredit, isSelected && styles.textSelectedMuted]}>
          ${(pkg.price / pkg.credits / 100).toFixed(2)}/credit
        </Text>
      </View>
    </View>

    <View style={styles.packageFooter}>
      <View style={styles.packageMinutes}>
        <CreditIcon />
        <Text style={[styles.packageMinutesText, isSelected && styles.textSelectedMuted]}>
          = {pkg.credits} minutes of translation
        </Text>
      </View>
      {isSelected && (
        <View style={styles.checkIconContainer}>
          <CheckIcon />
        </View>
      )}
    </View>
  </Pressable>
);

export const BuyCreditsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { balance, purchaseCredits } = useCredits();
  const { displayName } = useCurrentUser();
  const [selectedPackageId, setSelectedPackageId] = useState<number>(1);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const creditPackages: CreditPackage[] = [
    {
      id: 0,
      credits: 10,
      price: 150,
      label: 'Starter',
      description: '$1.50',
    },
    {
      id: 1,
      credits: 30,
      price: 400,
      label: 'Basic',
      description: '$4.00',
      isPopular: true,
    },
    {
      id: 2,
      credits: 60,
      price: 700,
      label: 'Pro',
      description: '$7.00',
    },
    {
      id: 3,
      credits: 120,
      price: 1300,
      label: 'Ultimate',
      description: '$13.00',
    },
  ];

  const handlePurchase = async () => {
    if (isPurchasing) return;

    setIsPurchasing(true);
    try {
      const result = await purchaseCredits(selectedPackageId);
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
      Alert.alert(
        'Purchase Failed',
        'There was an error processing your purchase. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Buy Credits"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Current Balance */}
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <View style={styles.balanceValue}>
            <Text style={styles.balanceNumber}>{balance?.toFixed(2) || '0.00'}</Text>
            <Text style={styles.balanceUnit}>credits</Text>
          </View>
          <Text style={styles.balanceDescription}>
            = {balance?.toFixed(2) || '0.00'} minutes of translation remaining
          </Text>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>How credits work</Text>
          <Text style={styles.infoText}>• 1 credit = 1 minute of translation</Text>
          <Text style={styles.infoText}>• Minimum charge: 0.05 credits per session</Text>
          <Text style={styles.infoText}>• Credits deducted every 3 seconds (0.05 credits)</Text>
          <Text style={styles.infoText}>• Credits never expire</Text>
        </View>

        {/* Credit Packages */}
        <Text style={styles.sectionTitle}>Select a package</Text>
        <View style={styles.packagesContainer}>
          {creditPackages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              package={pkg}
              isSelected={selectedPackageId === pkg.id}
              onSelect={() => setSelectedPackageId(pkg.id)}
              isPurchasing={isPurchasing}
            />
          ))}
        </View>

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
              Purchase {creditPackages[selectedPackageId].credits} Credits for ${(creditPackages[selectedPackageId].price / 100).toFixed(2)}
            </Text>
          )}
        </Pressable>

        {/* Footer Note */}
        <Text style={styles.footerNote}>
          Payments are processed securely. You can view your purchase history in Settings.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },

  // Balance Section
  balanceContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    ...shadows.soft,
  },
  balanceLabel: {
    ...typography.bodySmall,
    color: colors.silverAlpha(0.6),
    marginBottom: spacing.xs,
  },
  balanceValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.xs,
  },
  balanceNumber: {
    ...typography.h1,
    color: colors.primary,
    fontSize: 48,
  },
  balanceUnit: {
    ...typography.body,
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  balanceDescription: {
    ...typography.bodySmall,
    color: colors.silverAlpha(0.7),
  },

  // Info Box
  infoBox: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primaryAlpha(0.05),
    borderWidth: 1,
    borderColor: colors.primaryAlpha(0.1),
    marginBottom: spacing.xl,
  },
  infoTitle: {
    ...typography.bodyBold,
    color: colors.foreground,
    marginBottom: spacing.sm,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.silverAlpha(0.8),
    marginBottom: spacing.xs,
  },

  // Packages Section
  sectionTitle: {
    ...typography.h3,
    color: colors.foreground,
    marginBottom: spacing.md,
  },
  packagesContainer: {
    marginBottom: spacing.xl,
  },

  // Package Card
  packageCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.silverAlpha(0.1),
    ...shadows.soft,
  },
  packageCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryAlpha(0.02),
  },
  packageCardPopular: {
    borderColor: colors.primaryAlpha(0.3),
  },
  packageCardPressed: {
    transform: [{ scale: 0.98 }],
  },
  packageCardDisabled: {
    opacity: 0.6,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: spacing.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: radius.sm,
  },
  popularBadgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
    fontSize: 10,
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  packageHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  packageHeaderRight: {
    alignItems: 'flex-end',
  },
  packageCredits: {
    ...typography.h2,
    color: colors.foreground,
  },
  packageCreditsLabel: {
    ...typography.body,
    color: colors.silverAlpha(0.6),
    marginLeft: spacing.xs,
  },
  packagePrice: {
    ...typography.h3,
    color: colors.foreground,
  },
  packagePricePerCredit: {
    ...typography.caption,
    color: colors.silverAlpha(0.6),
  },
  packageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  packageMinutes: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  packageMinutesText: {
    ...typography.bodySmall,
    color: colors.silverAlpha(0.7),
    marginLeft: spacing.xs,
  },
  checkIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primaryAlpha(0.1),
    alignItems: 'center',
    justifyContent: 'center',
  },
  textSelected: {
    color: colors.primary,
  },
  textSelectedMuted: {
    color: colors.primaryAlpha(0.7),
  },

  // Purchase Button
  purchaseButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.elevated,
  },
  purchaseButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  purchaseButtonDisabled: {
    opacity: 0.6,
  },
  purchaseButtonText: {
    ...typography.button,
    color: colors.white,
  },

  // Footer
  footerNote: {
    ...typography.caption,
    color: colors.silverAlpha(0.5),
    textAlign: 'center',
  },
});
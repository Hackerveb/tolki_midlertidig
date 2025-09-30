import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../components/Header';
import { NeumorphicCard } from '../components/NeumorphicCard';
import { NeumorphicButton } from '../components/NeumorphicButton';
import { PaymentMethod } from '../types';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing, radius } from '../styles/global';
import { shadows } from '../styles/shadows';

const CreditCard: React.FC<{
  method: PaymentMethod;
  onPress: () => void;
}> = ({ method, onPress }) => {
  const getCardColor = () => {
    switch (method.brand?.toLowerCase()) {
      case 'visa':
        return '#1A1F71';
      case 'mastercard':
        return '#EB001B';
      case 'amex':
        return '#006FCF';
      default:
        return colors.primary;
    }
  };

  return (
    <Pressable onPress={onPress}>
      <NeumorphicCard style={styles.cardContainer}>
        <View style={[styles.creditCard, { backgroundColor: getCardColor() }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardBrand}>{method.brand?.toUpperCase()}</Text>
            {method.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>DEFAULT</Text>
              </View>
            )}
          </View>
          <View style={styles.cardChip} />
          <Text style={styles.cardNumber}>•••• •••• •••• {method.last4}</Text>
          <View style={styles.cardFooter}>
            <View>
              <Text style={styles.cardLabel}>EXPIRES</Text>
              <Text style={styles.cardExpiry}>
                {method.expiryMonth?.toString().padStart(2, '0')}/{method.expiryYear}
              </Text>
            </View>
            <View style={styles.cardLogo}>
              <View style={styles.cardLogoCircle1} />
              <View style={styles.cardLogoCircle2} />
            </View>
          </View>
        </View>
      </NeumorphicCard>
    </Pressable>
  );
};

export const PaymentMethodsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [paymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      last4: '4242',
      brand: 'Visa',
      isDefault: true,
      expiryMonth: 12,
      expiryYear: 2025,
    },
    {
      id: '2',
      type: 'card',
      last4: '5555',
      brand: 'Mastercard',
      isDefault: false,
      expiryMonth: 8,
      expiryYear: 2024,
    },
  ]);

  const handleAddCard = () => {
    // Placeholder for add card functionality
    console.log('Add new card');
  };

  const handleCardPress = (method: PaymentMethod) => {
    // Placeholder for card management
    console.log('Manage card:', method.id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Payment Methods"
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <Text style={styles.sectionTitle}>Your Payment Methods</Text>
          <Text style={styles.sectionSubtitle}>
            Manage your cards and payment options
          </Text>
        </View>

        {/* Credit Cards */}
        <View style={styles.cardsContainer}>
          {paymentMethods.map((method) => (
            <CreditCard
              key={method.id}
              method={method}
              onPress={() => handleCardPress(method)}
            />
          ))}
        </View>

        {/* Add New Card Button */}
        <Pressable onPress={handleAddCard} style={styles.addCardButton}>
          <NeumorphicCard style={styles.addCardContent}>
            <Text style={styles.addCardIcon}>+</Text>
            <Text style={styles.addCardText}>Add New Card</Text>
          </NeumorphicCard>
        </Pressable>

        {/* Other Payment Methods */}
        <View style={styles.otherMethodsSection}>
          <Text style={styles.sectionTitle}>Other Payment Methods</Text>
          <NeumorphicCard style={styles.otherMethodsCard}>
            <Pressable style={styles.paymentMethodItem}>
              <View style={styles.paymentMethodLeft}>
                <Text style={styles.paymentMethodIcon}>🍎</Text>
                <Text style={styles.paymentMethodText}>Apple Pay</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </Pressable>
            <View style={styles.separator} />
            <Pressable style={styles.paymentMethodItem}>
              <View style={styles.paymentMethodLeft}>
                <Text style={styles.paymentMethodIcon}>G</Text>
                <Text style={styles.paymentMethodText}>Google Pay</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </Pressable>
            <View style={styles.separator} />
            <Pressable style={styles.paymentMethodItem}>
              <View style={styles.paymentMethodLeft}>
                <Text style={styles.paymentMethodIcon}>P</Text>
                <Text style={styles.paymentMethodText}>PayPal</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </Pressable>
          </NeumorphicCard>
        </View>

        {/* Security Note */}
        <View style={styles.securityNote}>
          <Text style={styles.securityIcon}>🔒</Text>
          <Text style={styles.securityText}>
            Your payment information is encrypted and secure. We never store your full card details.
          </Text>
        </View>
      </ScrollView>
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
  },
  headerSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  sectionTitle: {
    ...typography.h5,
    color: colors.foreground,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    ...typography.body,
    color: colors.silverAlpha(0.8),
  },
  cardsContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  cardContainer: {
    marginBottom: spacing.md,
    padding: 0,
    overflow: 'hidden',
  },
  creditCard: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    aspectRatio: 1.586,
    minHeight: 200,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  cardBrand: {
    ...typography.h6,
    color: colors.white,
    fontWeight: '600',
  },
  defaultBadge: {
    backgroundColor: colors.whiteAlpha(0.3),
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.xs,
  },
  defaultBadgeText: {
    ...typography.labelSmall,
    color: colors.white,
    fontSize: 10,
  },
  cardChip: {
    width: 40,
    height: 30,
    backgroundColor: colors.whiteAlpha(0.3),
    borderRadius: radius.xs,
    marginBottom: spacing.md,
  },
  cardNumber: {
    ...typography.h6,
    color: colors.white,
    letterSpacing: 2,
    marginBottom: spacing.lg,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardLabel: {
    ...typography.labelSmall,
    color: colors.whiteAlpha(0.7),
    fontSize: 10,
  },
  cardExpiry: {
    ...typography.body,
    color: colors.white,
  },
  cardLogo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardLogoCircle1: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.whiteAlpha(0.8),
  },
  cardLogoCircle2: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.whiteAlpha(0.6),
    marginLeft: -10,
  },
  addCardButton: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  addCardContent: {
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  addCardIcon: {
    fontSize: 24,
    color: colors.primary,
  },
  addCardText: {
    ...typography.button,
    color: colors.primary,
  },
  otherMethodsSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  otherMethodsCard: {
    marginTop: spacing.md,
    padding: 0,
  },
  paymentMethodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  paymentMethodIcon: {
    fontSize: 24,
    width: 30,
    textAlign: 'center',
  },
  paymentMethodText: {
    ...typography.body,
    color: colors.foreground,
  },
  arrow: {
    fontSize: 24,
    color: colors.silverAlpha(0.5),
  },
  separator: {
    height: 1,
    backgroundColor: colors.silverAlpha(0.1),
    marginHorizontal: spacing.lg,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  securityIcon: {
    fontSize: 16,
  },
  securityText: {
    ...typography.caption,
    color: colors.silverAlpha(0.6),
    flex: 1,
  },
});
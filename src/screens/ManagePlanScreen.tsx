import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../components/Header';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing, radius } from '../styles/global';
import { shadows } from '../styles/shadows';
import { Svg, Polyline } from 'react-native-svg';

type Plan = 'Free' | 'Plus' | 'Pro' | 'Max' | 'Max+';

interface PlanData {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string;
  isRecommended?: boolean;
}

interface PlanCardProps {
  plan: PlanData;
  isSelected: boolean;
  onSelect: () => void;
  isRecommended?: boolean;
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

const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  isSelected,
  onSelect,
  isRecommended = false,
}) => {
  return (
    <Pressable onPress={onSelect}>
      <View style={[
        styles.planCard,
        isSelected && styles.planCardSelected,
        isRecommended && styles.planCardRecommended,
      ]}>
        {isRecommended && (
          <View style={styles.recommendedBadge}>
            <Text style={styles.recommendedText}>RECOMMENDED</Text>
          </View>
        )}
        <View style={styles.planCardHeader}>
          <Text style={styles.planCardName}>{plan.name}</Text>
          <View style={styles.planCardPriceContainer}>
            <Text style={styles.planCardAmount}>{plan.price}</Text>
            <Text style={styles.planCardPeriod}>{plan.period}</Text>
          </View>
        </View>
        <Text style={styles.planCardDescription}>{plan.description}</Text>
        <Text style={styles.planCardFeatures}>{plan.features}</Text>
      </View>
    </Pressable>
  );
};

export const ManagePlanScreen: React.FC = () => {
  const navigation = useNavigation();
  const [currentPlan] = useState<Plan>('Plus');
  const [selectedPlan, setSelectedPlan] = useState<Plan>('Plus');

  const plans: Record<Plan, PlanData> = {
    Free: {
      name: 'Free',
      price: '$0',
      period: 'per month',
      description: 'Perfect for trying out the service',
      features: '• 5 minutes/month • 52 languages • Real-time translation',
    },
    Plus: {
      name: 'Plus',
      price: '$14.99',
      period: 'per month',
      description: 'Great for regular users',
      features: '• 45 minutes/month • 52 languages • Real-time translation',
    },
    Pro: {
      name: 'Pro',
      price: '$74.99',
      period: 'per month',
      description: 'For frequent travelers',
      features: '• 5 hours/month • 52 languages • Real-time translation',
    },
    Max: {
      name: 'Max',
      price: '$179.99',
      period: 'per month',
      description: 'Professional usage',
      features: '• 15 hours/month • 52 languages • Real-time translation',
    },
    'Max+': {
      name: 'Max+',
      price: '$329.99',
      period: 'per month',
      description: 'For teams and heavy users',
      features: '• 30 hours/month • 52 languages • Priority support',
      isRecommended: true,
    },
  };

  const handleUpdatePlan = () => {
    Alert.alert(
      'Update Plan',
      `Switch to ${selectedPlan} plan?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            Alert.alert('Success', 'Plan updated successfully!');
          }
        },
      ]
    );
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Subscription Cancelled',
              'You will have access until the end of the billing period.'
            );
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Manage Plan"
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Plan */}
        <View style={styles.currentPlanSection}>
          <View style={styles.planHeader}>
            <Text style={styles.currentPlanName}>Plus Plan</Text>
            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>CURRENT</Text>
            </View>
          </View>
          <Text style={styles.currentPlanPrice}>$14.99</Text>
          <Text style={styles.currentPlanPeriod}>per month</Text>
          <View style={styles.currentPlanFeatures}>
            <View style={styles.featureItem}>
              <CheckIcon />
              <Text style={styles.featureText}>45 minutes per month</Text>
            </View>
            <View style={styles.featureItem}>
              <CheckIcon />
              <Text style={styles.featureText}>52 languages supported</Text>
            </View>
            <View style={styles.featureItem}>
              <CheckIcon />
              <Text style={styles.featureText}>Real-time translation</Text>
            </View>
          </View>
        </View>

        {/* Available Plans */}
        <View style={styles.plansSection}>
          <Text style={styles.sectionTitle}>Available Plans</Text>
          {(Object.keys(plans) as Plan[]).map((planKey) => (
            <PlanCard
              key={planKey}
              plan={plans[planKey]}
              isSelected={planKey === selectedPlan}
              onSelect={() => setSelectedPlan(planKey)}
              isRecommended={plans[planKey].isRecommended}
            />
          ))}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Pressable
          style={({ pressed }) => [
            styles.primaryBtn,
            pressed && styles.btnPressed
          ]}
          onPress={handleUpdatePlan}
        >
          <Text style={styles.primaryBtnText}>Update Plan</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.secondaryBtn,
            pressed && styles.btnPressed
          ]}
          onPress={handleCancelSubscription}
        >
          <Text style={styles.secondaryBtnText}>Cancel Subscription</Text>
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
    paddingHorizontal: 20,
  },

  // Current Plan Section
  currentPlanSection: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 20,
    marginVertical: 20,
    ...shadows.subtle,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  currentPlanName: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.foreground,
  },
  currentBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: colors.primary,
    borderRadius: 14,
  },
  currentBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
    textTransform: 'uppercase',
  },
  currentPlanPrice: {
    fontSize: 32,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 5,
  },
  currentPlanPeriod: {
    fontSize: 14,
    color: colors.silver,
    marginBottom: 20,
  },
  currentPlanFeatures: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  featureText: {
    fontSize: 14,
    color: colors.foreground,
  },

  // Plans Section
  plansSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 15,
  },

  // Plan Card
  planCard: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    position: 'relative',
    overflow: 'hidden',
    ...shadows.subtle,
  },
  planCardSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
    ...shadows.pressed,
  },
  planCardRecommended: {
    overflow: 'visible',
  },
  recommendedBadge: {
    position: 'absolute',
    top: 10,
    right: -30,
    backgroundColor: colors.primary,
    paddingHorizontal: 40,
    paddingVertical: 4,
    transform: [{ rotate: '45deg' }],
  },
  recommendedText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.white,
  },
  planCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  planCardName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.foreground,
  },
  planCardPriceContainer: {
    alignItems: 'flex-end',
  },
  planCardAmount: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.foreground,
  },
  planCardPeriod: {
    fontSize: 12,
    color: colors.silver,
  },
  planCardDescription: {
    fontSize: 13,
    color: colors.silver,
    marginBottom: 10,
  },
  planCardFeatures: {
    fontSize: 13,
    color: colors.foreground,
  },

  // Action Buttons
  actionButtons: {
    backgroundColor: colors.background,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.silverAlpha(0.2),
  },
  primaryBtn: {
    width: '100%',
    padding: 14,
    backgroundColor: colors.primary,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  secondaryBtn: {
    width: '100%',
    padding: 14,
    backgroundColor: colors.background,
    borderRadius: 16,
    alignItems: 'center',
    ...shadows.subtle,
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#e74c3c',
  },
  btnPressed: {
    ...shadows.pressed,
  },
});
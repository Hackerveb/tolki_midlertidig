import { useUser as useClerkUser } from '@clerk/clerk-expo';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';

export const useCredits = () => {
  const { user: clerkUser } = useClerkUser();

  // Real-time credit balance
  const balance = useQuery(
    api.users.getCreditsBalance,
    clerkUser?.id ? { clerkId: clerkUser.id } : 'skip'
  ) ?? 0;

  // Credits used today
  const creditsUsedToday = useQuery(
    api.usageSessions.getCreditsUsedToday,
    clerkUser?.id ? { clerkId: clerkUser.id } : 'skip'
  ) ?? 0;

  // Mutations and actions
  const deductCredits = useMutation(api.users.deductCredits);
  const simulatePurchase = useAction(api.payments.simulatePurchase);
  const createPaymentIntent = useAction(api.payments.createPaymentIntent);

  // Purchase credits
  const purchaseCredits = async (packageIndex: number) => {
    if (!clerkUser?.id) {
      throw new Error('User not authenticated');
    }

    try {
      // For now, use simulated purchase. Replace with real Stripe integration later
      const result = await simulatePurchase({
        clerkId: clerkUser.id,
        packageIndex,
      });
      return result;
    } catch (error) {
      console.error('Error purchasing credits:', error);
      throw error;
    }
  };

  // Check if user has enough credits (default to minimum session charge)
  const hasCredits = (amount: number = 0.05) => balance >= amount;

  // Check if user is low on credits
  const isLowOnCredits = balance < 5 && balance > 0;

  return {
    balance,
    creditsUsedToday,
    hasCredits,
    isLowOnCredits,
    purchaseCredits,
    deductCredits,
  };
};
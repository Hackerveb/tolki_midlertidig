import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useUser } from '@clerk/clerk-expo';
import { Header } from '../components/Header';
import { NeumorphicCard } from '../components/NeumorphicCard';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing, radius } from '../styles/global';

interface CreditPurchase {
  id: string;
  date: number;
  amount: number;
  credits: number;
  status: 'completed' | 'pending' | 'failed';
  description: string;
}

const TransactionItem: React.FC<{
  transaction: CreditPurchase;
  onPress: () => void;
}> = ({ transaction, onPress }) => {
  const getStatusColor = () => {
    switch (transaction.status) {
      case 'completed':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'failed':
        return colors.error;
      default:
        return colors.foreground;
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Pressable onPress={onPress}>
      <NeumorphicCard style={styles.transactionCard}>
        <View style={styles.transactionHeader}>
          <View style={styles.transactionLeft}>
            <Text style={styles.transactionDate}>
              {formatDate(transaction.date)}
            </Text>
            <Text style={styles.transactionDescription}>
              {transaction.description}
            </Text>
            <Text style={styles.transactionCredits}>
              {transaction.credits} credits
            </Text>
          </View>
          <View style={styles.transactionRight}>
            <Text style={styles.transactionAmount}>
              ${transaction.amount.toFixed(2)}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
              <Text style={styles.statusText}>
                {transaction.status.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
      </NeumorphicCard>
    </Pressable>
  );
};

export const BillingHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useUser();

  // Fetch purchase history from Convex
  const purchases = useQuery(
    api.payments.getRecentPurchases,
    user?.id ? { clerkId: user.id } : 'skip'
  );

  // Transform to display format
  const transactions: CreditPurchase[] = purchases?.map((p: any) => ({
    id: p.id,
    date: p.date,
    amount: p.amount,
    credits: p.credits,
    status: p.status,
    description: p.description,
  })) || [];

  const handleTransactionPress = (transaction: CreditPurchase) => {
    console.log('View transaction:', transaction.id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Billing History"
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary Card */}
        <NeumorphicCard style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Current Period</Text>
            <Text style={styles.summaryValue}>Jan 1 - Jan 31, 2024</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Next Billing Date</Text>
            <Text style={styles.summaryValue}>Feb 15, 2024</Text>
          </View>
        </NeumorphicCard>

        {/* Transactions List */}
        <View style={styles.transactionsContainer}>
          <Text style={styles.sectionTitle}>Transaction History</Text>
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                onPress={() => handleTransactionPress(transaction)}
              />
            ))
          ) : (
            <NeumorphicCard style={styles.emptyCard}>
              <Text style={styles.emptyText}>No credit purchases yet. Your purchase history will appear here.</Text>
            </NeumorphicCard>
          )}
        </View>

        {/* Export Options */}
        <NeumorphicCard style={styles.exportCard}>
          <Text style={styles.exportTitle}>Export Options</Text>
          <View style={styles.exportButtons}>
            <Pressable style={styles.exportButton}>
              <Text style={styles.exportIcon}>📄</Text>
              <Text style={styles.exportButtonText}>PDF</Text>
            </Pressable>
            <Pressable style={styles.exportButton}>
              <Text style={styles.exportIcon}>📊</Text>
              <Text style={styles.exportButtonText}>CSV</Text>
            </Pressable>
            <Pressable style={styles.exportButton}>
              <Text style={styles.exportIcon}>📧</Text>
              <Text style={styles.exportButtonText}>Email</Text>
            </Pressable>
          </View>
        </NeumorphicCard>
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
  summaryCard: {
    margin: spacing.lg,
    padding: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  summaryLabel: {
    ...typography.body,
    color: colors.silverAlpha(0.8),
  },
  summaryValue: {
    ...typography.body,
    color: colors.foreground,
  },
  summaryAmount: {
    ...typography.h6,
    color: colors.primary,
  },
  separator: {
    height: 1,
    backgroundColor: colors.silverAlpha(0.1),
    marginVertical: spacing.xs,
  },
  transactionsContainer: {
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    ...typography.h6,
    color: colors.foreground,
    marginBottom: spacing.md,
  },
  transactionCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  transactionLeft: {
    flex: 1,
  },
  transactionDate: {
    ...typography.caption,
    color: colors.silverAlpha(0.6),
    marginBottom: spacing.xs,
  },
  transactionDescription: {
    ...typography.body,
    color: colors.foreground,
  },
  transactionCredits: {
    ...typography.bodySmall,
    color: colors.primary,
    marginTop: 2,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    ...typography.h6,
    color: colors.foreground,
    marginBottom: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  statusText: {
    ...typography.labelSmall,
    color: colors.white,
    fontSize: 10,
  },
  downloadButton: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.silverAlpha(0.1),
  },
  downloadText: {
    ...typography.button,
    color: colors.primary,
    fontSize: 12,
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.silverAlpha(0.6),
  },
  exportCard: {
    margin: spacing.lg,
    padding: spacing.lg,
  },
  exportTitle: {
    ...typography.h6,
    color: colors.foreground,
    marginBottom: spacing.md,
  },
  exportButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  exportButton: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  exportIcon: {
    fontSize: 24,
  },
  exportButtonText: {
    ...typography.caption,
    color: colors.foreground,
  },
});
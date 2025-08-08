import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLocalization } from '../contexts/LocalizationContext';
import { fetchWalletTransactions } from '../lib/database';

const { width } = Dimensions.get('window');

type Tx = {
  id: string;
  type: 'earned' | 'withdrawn' | 'received';
  amount: number;
  description: string;
  date: string;
  taskId?: string;
  taskTitle?: string;
  paidByUserId?: string;
  paidByName?: string;
  paidAt?: string;
  workStartedAt?: string | null;
  workEndedAt?: string | null;
  jobLatitude?: number | null;
  jobLongitude?: number | null;
  jobLocationText?: string | null;
};

export default function WalletScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t } = useLocalization();
  const [transactions, setTransactions] = useState<Tx[]>([]);

  const totalBalance = 85000;
  const totalEarned = 95000;
  const totalWithdrawn = 10000;

  useEffect(() => {
    (async () => {
      if (!user) return;
      const tx = await fetchWalletTransactions(user.id);
      setTransactions(tx as any);
    })();
  }, [user]);

  const formatCurrency = (amount: number) => {
    return `₡${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short',
      day: 'numeric'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earned': return '💰';
      case 'withdrawn': return '💸';
      case 'received': return '📥';
      default: return '💳';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earned': return '#10B981';
      case 'withdrawn': return '#EF4444';
      case 'received': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
          Wallet
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <View style={[styles.balanceCard, { backgroundColor: theme.colors.primary.blue }]}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(totalBalance)}</Text>
          <View style={styles.balanceStats}>
            <View style={styles.balanceStat}>
              <Text style={styles.balanceStatLabel}>Total Earned</Text>
              <Text style={styles.balanceStatValue}>{formatCurrency(totalEarned)}</Text>
            </View>
            <View style={styles.balanceStat}>
              <Text style={styles.balanceStatLabel}>Total Withdrawn</Text>
              <Text style={styles.balanceStatValue}>{formatCurrency(totalWithdrawn)}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.colors.surface }]}
            onPress={() => Alert.alert('Coming Soon', 'Withdraw feature will be available soon!')}
          >
            <Text style={styles.actionIcon}>💸</Text>
            <Text style={[styles.actionText, { color: theme.colors.text.primary }]}>
              Withdraw
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.colors.surface }]}
            onPress={() => Alert.alert('Coming Soon', 'Transfer feature will be available soon!')}
          >
            <Text style={styles.actionIcon}>📤</Text>
            <Text style={[styles.actionText, { color: theme.colors.text.primary }]}>
              Transfer
            </Text>
          </TouchableOpacity>
        </View>

        {/* Transaction History */}
        <View style={styles.transactionSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Transaction History
          </Text>
          <View style={[styles.transactionList, { backgroundColor: theme.colors.surface }]}>
            {transactions.map((transaction, index) => (
              <TouchableOpacity
                key={transaction.id}
                style={[
                  styles.transactionItem,
                  index < transactions.length - 1 && { 
                    borderBottomWidth: 1, 
                    borderBottomColor: theme.colors.border 
                  }
                ]}
                activeOpacity={0.8}
                onPress={() => router.push(`/payment/${transaction.id}`)}
              >
                <View style={styles.transactionLeft}>
                  <Text style={styles.transactionIcon}>
                    {getTransactionIcon(transaction.type)}
                  </Text>
                  <View style={styles.transactionInfo}>
                    <Text style={[styles.transactionDescription, { color: theme.colors.text.primary }]}>
                      {transaction.description}
                    </Text>
                    <Text style={[styles.transactionDate, { color: theme.colors.text.secondary }]}>
                      {formatDate(transaction.date)}
                    </Text>
                    {transaction.paidByName && (
                      <Text style={[styles.transactionDate, { color: theme.colors.text.secondary }]}> 
                        Paid by {transaction.paidByName} on {formatDate(transaction.paidAt || transaction.date)}
                      </Text>
                    )}
                    {(transaction.workStartedAt || transaction.workEndedAt) && (
                      <Text style={[styles.transactionDate, { color: theme.colors.text.secondary }]}> 
                        {transaction.workStartedAt ? `Started: ${formatDate(transaction.workStartedAt)}` : ''} {transaction.workEndedAt ? `• Ended: ${formatDate(transaction.workEndedAt)}` : ''}
                      </Text>
                    )}
                  </View>
                </View>
                <View style={styles.transactionRight}>
                  <Text style={[
                    styles.transactionAmount,
                    { color: getTransactionColor(transaction.type) }
                  ]}>
                    {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  balanceCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  balanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceStat: {
    alignItems: 'center',
  },
  balanceStatLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  balanceStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  transactionSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  transactionList: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  miniMapCard: {
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 12,
    backgroundColor: '#F5F5F5',
  },
  miniMap: {
    width: '100%',
    height: 120,
  },
  miniMapCaption: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionLink: {
    fontSize: 12,
    fontWeight: '500',
  },
});


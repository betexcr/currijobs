import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLocalization } from '../contexts/LocalizationContext';
import ChambitoMascot from '../components/ChambitoMascot';
import UserProfileCard from '../components/UserProfileCard';
import BottomNavigation from '../components/BottomNavigation';
import { fetchPaymentsForUser, fetchTasksByUser } from '../lib/database';
import type { Task } from '../lib/types';

interface ProfileSection {
  title: string;
  items: ProfileItem[];
}

interface ProfileItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  action: 'navigate' | 'toggle' | 'logout' | 'info';
  value?: boolean;
  onPress?: () => void;
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { theme } = useTheme();
  const { t } = useLocalization();
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<{ currentPosted: number; totalCompleted: number; earningsThisMonth: number; lifetimeEarnings: number }>({ currentPosted: 0, totalCompleted: 0, earningsThisMonth: 0, lifetimeEarnings: 0 });

  const formatCurrency = (amount: number) => `₡${Number(amount || 0).toLocaleString()}`;

  // Enhanced profile derived from real stats (no mock data)
  const enhancedProfile = useMemo(() => {
    return {
      id: user?.id || '',
      name: user?.email?.split('@')[0] || '',
      rating: Number(user?.rating || 0),
      total_reviews: Number(user?.total_reviews || 0),
      completed_tasks: stats.totalCompleted,
      total_earnings: stats.lifetimeEarnings,
      wallet_balance: 0,
      member_since: user?.created_at || new Date().toISOString(),
      verified: Boolean(user?.is_verified),
      location: user?.location || '',
    };
  }, [user, stats.totalCompleted, stats.lifetimeEarnings]);

  useEffect(() => {
    (async () => {
      if (!user) return;
      try {
        const [tx, tasks] = await Promise.all([
          fetchPaymentsForUser(user.id),
          fetchTasksByUser(user.id),
        ]);
        setPayments(tx || []);
        setMyTasks(tasks || []);
        const currentPosted = (tasks || []).filter(t => t.status === 'open').length;
        const totalCompleted = (tasks || []).filter(t => t.status === 'completed').length;
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();
        const getDate = (p: any) => new Date(p.paidAt || p.date || p.created_at);
        const earningsThisMonth = (tx || []).reduce((sum: number, p: any) => {
          const d = getDate(p);
          if (d.getMonth() === thisMonth && d.getFullYear() === thisYear) {
            return sum + Number(p.amount || 0);
          }
          return sum;
        }, 0);
        const lifetimeEarnings = (tx || []).reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);
        setStats({ currentPosted, totalCompleted, earningsThisMonth, lifetimeEarnings });
      } catch {
        // no-op: keep defaults
      }
    })();
  }, [user]);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: () => {
            signOut();
            router.replace('/welcome');
          }
        }
      ]
    );
  };

  const profileSections: ProfileSection[] = [
    {
      title: t('account'),
      items: [
        {
          id: 'profile',
          title: t('editProfile'),
          subtitle: t('editProfileSubtitle'),
          icon: '👤',
          action: 'navigate',
          onPress: () => Alert.alert('Coming Soon', 'Profile editing will be available soon!')
        },
        {
          id: 'verification',
          title: t('identityVerification'),
          subtitle: t('identityVerificationSubtitle'),
          icon: '✅',
          action: 'navigate',
          onPress: () => Alert.alert('Coming Soon', 'Identity verification will be available soon!')
        },
        {
          id: 'payment',
          title: t('paymentMethods'),
          subtitle: t('paymentMethodsSubtitle'),
          icon: '💳',
          action: 'navigate',
          onPress: () => Alert.alert('Coming Soon', 'Payment methods will be available soon!')
        }
      ]
    },
    {
      title: t('preferences'),
      items: [
        {
          id: 'notifications',
          title: t('pushNotifications'),
          subtitle: t('pushNotificationsSubtitle'),
          icon: '🔔',
          action: 'toggle',
          value: notificationsEnabled,
          onPress: () => setNotificationsEnabled(!notificationsEnabled)
        },
        {
          id: 'location',
          title: t('locationServices'),
          subtitle: t('locationServicesSubtitle'),
          icon: '📍',
          action: 'toggle',
          value: locationEnabled,
          onPress: () => setLocationEnabled(!locationEnabled)
        },
        {
          id: 'settings',
          title: t('appSettings'),
          subtitle: t('appSettingsSubtitle'),
          icon: '⚙️',
          action: 'navigate',
          onPress: () => router.push('/settings')
        },
        // Dark mode toggle moved to Settings screen for clarity
      ]
    },
    {
      title: t('support'),
      items: [
        {
          id: 'help',
          title: t('helpCenter'),
          subtitle: t('helpCenterSubtitle'),
          icon: '❓',
          action: 'navigate',
          onPress: () => Alert.alert('Help Center', 'Help center will be available soon!')
        },
        {
          id: 'contact',
          title: t('contactSupport'),
          subtitle: t('contactSupportSubtitle'),
          icon: '📞',
          action: 'navigate',
          onPress: () => Alert.alert('Contact Support', 'Contact support will be available soon!')
        },
        {
          id: 'feedback',
          title: t('sendFeedback'),
          subtitle: t('sendFeedbackSubtitle'),
          icon: '📝',
          action: 'navigate',
          onPress: () => Alert.alert('Feedback', 'Feedback feature will be available soon!')
        }
      ]
    },
    {
      title: t('legal'),
      items: [
        {
          id: 'privacy',
          title: t('privacyPolicy'),
          subtitle: t('privacyPolicySubtitle'),
          icon: '🔒',
          action: 'navigate',
          onPress: () => Alert.alert('Privacy Policy', 'Privacy policy will be available soon!')
        },
        {
          id: 'terms',
          title: t('termsOfService'),
          subtitle: t('termsOfServiceSubtitle'),
          icon: '📄',
          action: 'navigate',
          onPress: () => Alert.alert('Terms of Service', 'Terms of service will be available soon!')
        },
        {
          id: 'logout',
          title: t('logout'),
          subtitle: t('signOutSubtitle'),
          icon: '🚪',
          action: 'logout',
          onPress: handleLogout
        }
      ]
    }
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: '#1E3A8A' }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <ChambitoMascot mood="happy" size="small" />
            <Text style={[styles.headerTitle, { color: 'white' }]}>
              {t('profile')}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/')}
            style={[styles.backButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
          >
            <Text style={styles.backButtonText}>🗺️ Map</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* User Info Card with rating and wallet */}
      <View style={[styles.userCard, { backgroundColor: theme.colors.surface }]}> 
        <UserProfileCard 
          user={enhancedProfile} 
          onPress={() => router.push('/rank')} 
          onAvatarPress={() => router.push('/rank')}
        />
      </View>

      {/* Profile Sections */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Activity Overview */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>{t('overview')}</Text>
          <View style={[styles.sectionContent, { backgroundColor: theme.colors.surface }]}> 
            <View style={[styles.profileItem, { borderBottomWidth: 1, borderBottomColor: theme.colors.border }]}> 
              <View style={styles.itemLeft}>
                <Text style={styles.itemIcon}>📌</Text>
                <View style={styles.itemText}>
                  <Text style={[styles.itemTitle, { color: theme.colors.text.primary }]}>{t('currentTasksPosted')}</Text>
                  <Text style={[styles.itemSubtitle, { color: theme.colors.text.secondary }]}>
                    {stats.currentPosted} active
                  </Text>
                </View>
              </View>
              <View style={styles.itemRight}>
                <Text style={[styles.itemArrow, { color: theme.colors.text.secondary }]}>{stats.currentPosted}</Text>
              </View>
            </View>
            <View style={[styles.profileItem, { borderBottomWidth: 1, borderBottomColor: theme.colors.border }]}> 
              <View style={styles.itemLeft}>
                <Text style={styles.itemIcon}>✅</Text>
                <View style={styles.itemText}>
                  <Text style={[styles.itemTitle, { color: theme.colors.text.primary }]}>{t('totalTasksCompleted')}</Text>
                  <Text style={[styles.itemSubtitle, { color: theme.colors.text.secondary }]}>
                    {stats.totalCompleted} total
                  </Text>
                </View>
              </View>
              <View style={styles.itemRight}>
                <Text style={[styles.itemArrow, { color: theme.colors.text.secondary }]}>{stats.totalCompleted}</Text>
              </View>
            </View>
            <View style={[styles.profileItem, { borderBottomWidth: 1, borderBottomColor: theme.colors.border }]}> 
              <View style={styles.itemLeft}>
                <Text style={styles.itemIcon}>📈</Text>
                <View style={styles.itemText}>
                  <Text style={[styles.itemTitle, { color: theme.colors.text.primary }]}>{t('earningsThisMonth')}</Text>
                  <Text style={[styles.itemSubtitle, { color: theme.colors.text.secondary }]}>
                    {formatCurrency(stats.earningsThisMonth)}
                  </Text>
                </View>
              </View>
              <View style={styles.itemRight}>
                <Text style={[styles.itemArrow, { color: '#10B981' }]}>{formatCurrency(stats.earningsThisMonth)}</Text>
              </View>
            </View>
            <View style={styles.profileItem}> 
              <View style={styles.itemLeft}>
                <Text style={styles.itemIcon}>💼</Text>
                <View style={styles.itemText}>
                  <Text style={[styles.itemTitle, { color: theme.colors.text.primary }]}>{t('lifetimeEarnings')}</Text>
                  <Text style={[styles.itemSubtitle, { color: theme.colors.text.secondary }]}>
                    {formatCurrency(stats.lifetimeEarnings)}
                  </Text>
                </View>
              </View>
              <View style={styles.itemRight}>
                <Text style={[styles.itemArrow, { color: '#10B981' }]}>{formatCurrency(stats.lifetimeEarnings)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Payments */}
        {payments.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>{t('recentPayments')}</Text>
            <View style={[styles.sectionContent, { backgroundColor: theme.colors.surface }]}> 
              {payments.slice(0, 5).map((p, idx) => (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.profileItem, idx < Math.min(5, payments.length) - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.border }]}
                  onPress={() => router.push(`/payment/${p.id}`)}
                  activeOpacity={0.8}
                >
                  <View style={styles.itemLeft}>
                    <Text style={styles.itemIcon}>💰</Text>
                    <View style={styles.itemText}>
                      <Text style={[styles.itemTitle, { color: theme.colors.text.primary }]}>
                        {p.description}
                      </Text>
                      {p.paidByName && (
                        <Text style={[styles.itemSubtitle, { color: theme.colors.text.secondary }]}>{t('paidBy')}: {p.paidByName}</Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.itemRight}>
                    <Text style={[styles.itemArrow, { color: '#10B981' }]}>₡{Number(p.amount || 0).toLocaleString()}</Text>
                  </View>
                </TouchableOpacity>
              ))}
              <View style={styles.viewAllContainer}>
                <TouchableOpacity
                  onPress={() => router.push('/wallet')}
                  style={[styles.viewAllButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                >
                  <Text style={[styles.viewAllButtonText, { color: theme.colors.text.primary }]}>{t('viewAllPayments')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {profileSections.map((section, sectionIndex) => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              {section.title}
            </Text>
            <View style={[styles.sectionContent, { backgroundColor: theme.colors.surface }]}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.profileItem,
                    itemIndex < section.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.border }
                  ]}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                >
                  <View style={styles.itemLeft}>
                    <Text style={styles.itemIcon}>{item.icon}</Text>
                    <View style={styles.itemText}>
                      <Text style={[styles.itemTitle, { color: theme.colors.text.primary }]}>
                        {item.title}
                      </Text>
                      {item.subtitle && (
                        <Text style={[styles.itemSubtitle, { color: theme.colors.text.secondary }]}>
                          {item.subtitle}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.itemRight}>
                    {item.action === 'toggle' ? (
                      <Switch
                        value={item.value}
                        onValueChange={item.onPress}
                        trackColor={{ false: '#E5E7EB', true: '#FF6B35' }}
                        thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : item.value ? '#FFFFFF' : '#FFFFFF'}
                      />
                    ) : (
                      <Text style={[styles.itemArrow, { color: theme.colors.text.secondary }]}>
                        {item.action === 'logout' ? '' : '›'}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  userCard: {
    margin: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatar: {
    fontSize: 24,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userStatus: {
    fontSize: 14,
    marginBottom: 12,
  },
  userStats: {
    flexDirection: 'row',
    gap: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  walletSection: {
    marginTop: 16,
  },
  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
  },
  walletInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  walletDetails: {
    flex: 1,
  },
  walletLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 2,
  },
  walletAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  walletArrow: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionContent: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  profileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  itemText: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 14,
  },
  itemRight: {
    alignItems: 'center',
  },
  itemArrow: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewAllContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  viewAllButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  viewAllButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});


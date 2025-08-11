import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Dimensions } from 'react-native';
import { typography, spacing } from '../../lib/designSystem';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
// import { useTheme } from '../../contexts/ThemeContext';
import { fetchTaskById, fetchUserProfile, fetchPaymentsCountsForUser } from '../../lib/database';
import { Task } from '../../lib/types';
// import CategoryIcon from '../../components/CategoryIcon';
import ChambitoMascot from '../../components/ChambitoMascot';
import UserProfileCard from '../../components/UserProfileCard';
import { useLocalization } from '../../contexts/LocalizationContext';

const { height } = Dimensions.get('window');

export default function TaskDetailScreen() {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [poster, setPoster] = useState<any | null>(null);
  const [paymentsCount, setPaymentsCount] = useState<{ made: number; received: number }>({ made: 0, received: 0 });
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  // const { theme } = useTheme();
  const router = useRouter();
  const { t } = useLocalization();

  useEffect(() => {
    if (!user) {
      router.replace('/welcome');
      return;
    }
    fetchTaskDetails();
  }, [id, user]);

  const fetchTaskDetails = async () => {
    try {
      const taskData = await fetchTaskById(id as string);
      
      if (!taskData) {
        Alert.alert('Error', 'Task not found');
        return;
      }

      setTask(taskData);
      if (taskData.user_id) {
        try {
          const profile = await fetchUserProfile(taskData.user_id);
          if (profile) {
            const mapped = {
              id: profile.id,
              name: profile.full_name || 'User',
              avatar: profile.avatar_url,
              rating: profile.rating ?? 0,
              total_reviews: 0,
              completed_tasks: profile.total_jobs ?? 0,
              total_earnings: profile.total_earnings ?? 0,
              wallet_balance: 0,
              member_since: profile.created_at || new Date().toISOString(),
              location: profile.location,
              verified: profile.is_verified ?? false,
            };
            setPoster(mapped);
            const counts = await fetchPaymentsCountsForUser(taskData.user_id);
            setPaymentsCount(counts);
          } else {
            setPoster(null);
          }
        } catch {
          setPoster(null);
        }
      } else {
        setPoster(null);
      }
    } catch {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOffer = () => {
    Alert.alert(
      t('acceptOffer'),
      t('confirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('acceptOffer'), onPress: () => router.push(`/make-offer?taskId=${id}`) },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: '#F5F5F5' }]}>
        <View style={styles.loadingContainer}>
          <ChambitoMascot mood="thinking" size="large" />
          <Text style={styles.loadingText}>{t('loading')}</Text>
        </View>
      </View>
    );
  }

  if (!task) {
    return (
      <View style={[styles.container, { backgroundColor: '#F5F5F5' }]}>
        <View style={styles.errorContainer}>
          <ChambitoMascot mood="error" size="large" />
          <Text style={styles.errorText}>{t('noTasksFound')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with time and back button - Like in the image */}
      <View style={[styles.header, { backgroundColor: '#1E3A8A' }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.timeText}>5:41</Text>
          <View style={styles.signalIcons}>
            <Text style={styles.signalIcon}>📶</Text>
            <Text style={styles.batteryIcon}>🔋</Text>
          </View>
        </View>
      </View>

      {/* Orange Top Section with Chambito - Like in the image */}
      <View style={[styles.orangeSection, { backgroundColor: '#FF6B35' }]}>
        <ChambitoMascot mood="happy" size="large" />
      </View>

      {/* Task Details Card - Like in the image */}
      <View style={[styles.taskCard, { backgroundColor: '#F5F5F5' }]}>
        <View style={styles.taskCardContent}>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <Text style={styles.taskReward}>₡{task.reward?.toLocaleString()}</Text>
          <Text style={styles.taskLocation}>{task.location}</Text>
          <Text style={styles.taskDate}>Today</Text>
          
          {/* User Profile Section */}
          <View style={styles.userProfileSection}>
            <Text style={styles.sectionTitle}>{t('profile')}</Text>
            {poster && (
              <UserProfileCard
                user={poster}
                compact={true}
              />
            )}
            <Text style={{ marginTop: 6, color: '#6B7280' }}>
              Payments: made {paymentsCount.made} · received {paymentsCount.received}
            </Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.acceptButton, { backgroundColor: '#1E3A8A' }]}
          onPress={handleAcceptOffer}
        >
          <Text style={styles.acceptButtonText}>Accept Offer</Text>
        </TouchableOpacity>
        {task && (
          <TouchableOpacity
            style={[styles.acceptButton, { backgroundColor: '#0F3576', marginTop: 12 }]}
            onPress={() => {
              // Determine peer: if current user is owner, peer is assigned_to; otherwise peer is owner
              const ownerId = (task as any).user_id as string | undefined;
              const workerId = (task as any).assigned_to as string | undefined;
              const peerId = user?.id === ownerId ? workerId : ownerId;
              if (!peerId) { Alert.alert('Chat', 'No assigned user to chat with yet.'); return; }
              router.push({ pathname: `/chat/${task.id}`, params: { peerId } });
            }}
          >
            <Text style={styles.acceptButtonText}>Chat</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#1E3A8A',
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backIcon: {
    ...typography.title,
    color: '#FFFFFF',
  },
  timeText: {
    ...typography.subtitle,
    color: '#FFFFFF',
  },
  signalIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signalIcon: {
    ...typography.caption,
    marginRight: spacing.sm,
  },
  batteryIcon: {
    ...typography.caption,
  },
  orangeSection: {
    backgroundColor: '#FF6B35',
    height: height * 0.34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskCard: {
    backgroundColor: '#F5F5F5',
    flex: 1,
    marginTop: -spacing.xl,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
  },
  taskCardContent: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: spacing.sm,
  },
  taskTitle: {
    ...typography.title,
    color: '#1E3A8A',
    textAlign: 'center',
  },
  taskReward: {
    ...typography.title,
    color: '#FF6B35',
  },
  taskLocation: {
    ...typography.subtitle,
    color: '#6B7280',
    textAlign: 'center',
  },
  taskDate: {
    ...typography.caption,
    color: '#6B7280',
  },
  buttonContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  acceptButton: {
    backgroundColor: '#1E3A8A',
    borderRadius: 20,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  acceptButtonText: {
    ...typography.subtitle,
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    marginTop: 16,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    marginTop: 16,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  userProfileSection: {
    width: '100%',
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
});

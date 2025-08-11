import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useLocalization } from '../contexts/LocalizationContext';
import { mapProfileToProgress, computeEarnedBadges, getRankColor, BADGES } from '../lib/rank';
import UserRating from './UserRating';

interface UserProfileCardProps {
  user: {
    id: string;
    name: string;
    avatar?: string;
    rating: number;
    total_reviews: number;
    completed_tasks: number;
    total_earnings: number;
    wallet_balance: number;
    member_since: string;
    location?: string;
    verified: boolean;
    rank?: string; // optional explicit rank
    badges?: string[]; // optional explicit badges (emoji short list)
  };
  onPress?: () => void;
  compact?: boolean;
  onAvatarPress?: () => void;
  paymentsMade?: number; // show only payments made for other users
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({ 
  user, 
  onPress, 
  compact = false,
  onAvatarPress,
  paymentsMade,
}) => {
  const { theme } = useTheme();
  const { t } = useLocalization();
  const { level, rank, color } = mapProfileToProgress({
    id: user.id,
    rating: user.rating,
    total_earnings: user.total_earnings,
    // completed_tasks expected on EnhancedUserProfile
    // @ts-ignore
    completed_tasks: user.completed_tasks,
  } as any);
  const resolvedRank = user.rank || rank.name;
  const resolvedBadges = user.badges || (computeEarnedBadges({
    id: user.id,
    rating: user.rating,
    total_earnings: user.total_earnings,
    // @ts-ignore
    completed_tasks: user.completed_tasks,
  }).filter(b => b.earned).map(b => b.id).slice(0, 4));
  
  const formatCurrency = (amount: number) => {
    return `₡${amount.toLocaleString()}`;
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  };
  
  const Container = onPress ? TouchableOpacity : View;
  
  return (
    <Container 
      style={[
        styles.container, 
        { 
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
        compact && styles.compact
      ]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={onAvatarPress} activeOpacity={onAvatarPress ? 0.7 : 1}>
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.primary.blue }]}>
                <Text style={[styles.avatarText, { color: theme.colors.text.primary }]}>
                  {user.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          {/* Rank badge (top-left) */}
          <View style={[styles.rankBadge, { backgroundColor: getRankColor(resolvedRank as any) || '#999' }]}> 
            <Ionicons name="trophy" size={10} color="#111827" />
          </View>
          {user.verified && (
            <View style={[styles.verifiedBadge, { backgroundColor: theme.colors.primary.blue }]}>
              <Ionicons name="checkmark-circle" size={12} color="white" />
            </View>
          )}
        </View>
        
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: theme.colors.text.primary }]}>
            {user.name}
          </Text>
          {/* Inline rank pill */}
          {!compact && (
            <View style={[styles.rankPill, { borderColor: getRankColor(resolvedRank as any) || '#999', backgroundColor: (getRankColor(resolvedRank as any) || '#999') + '22' }]}> 
              <Text style={[styles.rankPillText, { color: theme.colors.text.primary }]}>
                {resolvedRank} · Nivel {level}
              </Text>
            </View>
          )}
          <UserRating 
            rating={user.rating} 
            totalReviews={user.total_reviews}
            size="small"
            showText={!compact}
          />
          {user.location && (
            <Text style={[styles.location, { color: theme.colors.text.secondary }]}>
              📍 {user.location}
            </Text>
          )}
        </View>
      </View>
      
      {!compact && (
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>
              {formatCurrency(user.total_earnings)}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>{t('earningsThisMonth' as any) || 'Earned Money'}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>
              {user.completed_tasks}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>{t('totalTasksCompleted')}</Text>
          </View>
        </View>
      )}
      
      {/* Payments made badge (shown if provided, both compact and non-compact) */}
      {typeof paymentsMade === 'number' && (
        <View style={styles.paymentsPill}>
          <Text style={styles.paymentsIcon}>💳</Text>
          <Text style={[styles.paymentsText, { color: theme.colors.text.primary }]}>Pagos realizados: {paymentsMade}</Text>
        </View>
      )}

      {/* Badges row */}
      {!compact && resolvedBadges?.length > 0 && (
        <View style={styles.badgesRow}>
          {resolvedBadges.slice(0, 4).map((badgeId, idx) => {
            const def = BADGES.find(b => b.id === badgeId);
            const label = def?.name || badgeId;
            return (
              <View key={`${badgeId}-${idx}`} style={[styles.badgePill, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}> 
                <Text style={[styles.badgeText, { color: theme.colors.text.primary }]}>🏅 {label}</Text>
              </View>
            );
          })}
        </View>
      )}
      
      <Text style={[styles.memberSince, { color: theme.colors.text.secondary }]}>
        {t('memberSince')} {formatDate(user.member_since)}
      </Text>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 8,
  },
  compact: {
    padding: 12,
    marginVertical: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  rankBadge: {
    position: 'absolute',
    top: -2,
    left: -2,
    borderRadius: 8,
    padding: 3,
    borderWidth: 1,
    borderColor: 'white',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    borderRadius: 8,
    padding: 2,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  rankPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 6,
  },
  rankPillText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  location: {
    fontSize: 12,
    marginTop: 2,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
    justifyContent: 'center',
  },
  paymentsPill: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 6,
    gap: 6,
  },
  paymentsIcon: {
    fontSize: 12,
  },
  paymentsText: {
    fontSize: 12,
    fontWeight: '600',
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
  },
  memberSince: {
    fontSize: 11,
    textAlign: 'center',
  },
});

export default UserProfileCard;


import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLocalization } from '../contexts/LocalizationContext';
import { fetchUserProfile, fetchReviewsForUserWithContext, type UserReviewWithContext, fetchUserProgress } from '../lib/database';
import { mapProfileToProgress, computeEarnedBadges, BADGES, getRankColor } from '../lib/rank';

export default function RankScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t } = useLocalization();
  const [profile, setProfile] = useState<any | null>(null);
  const [reviews, setReviews] = useState<UserReviewWithContext[]>([]);

  useEffect(() => {
    (async () => {
      if (!user) return;
      const p = await fetchUserProfile(user.id);
      setProfile(p || { id: user.id, full_name: user.email?.split('@')[0] || 'Usuario', rating: 0, total_jobs: 0, total_earnings: 0 });
      const revs = await fetchReviewsForUserWithContext(user.id);
      setReviews(revs);
      // Optionally pull stored progress (xp/level/badges) for future use
      const stored = await fetchUserProgress(user.id);
    })();
  }, [user]);

  const progress = useMemo(() => {
    if (!profile) return null;
    return mapProfileToProgress({
      id: profile.id,
      rating: profile.rating ?? 0,
      total_earnings: profile.total_earnings ?? 0,
      // completed_tasks lives as total_jobs on profiles
      // @ts-ignore
      completed_tasks: profile.total_jobs ?? 0,
    } as any);
  }, [profile]);

  const earned = useMemo(() => {
    if (!profile) return [] as ReturnType<typeof computeEarnedBadges>;
    return computeEarnedBadges({
      id: profile.id,
      rating: profile.rating ?? 0,
      // @ts-ignore
      completed_tasks: profile.total_jobs ?? 0,
      total_earnings: profile.total_earnings ?? 0,
    });
  }, [profile]);

  if (!user || !progress) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>Cargando rango…</Text>
      </View>
    );
  }

  const rankColor = progress.color;
  const { level, rank, progress: p } = progress;
  const earnedSet = new Set(earned.filter(e => e.earned).map(e => e.id));

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <Text style={[styles.title, { color: theme.colors.text.primary }]}>{t('yourRank') || 'Tu Rango'}</Text>
      <View style={[styles.rankCard, { borderColor: rankColor }]}> 
        <Text style={[styles.rankName, { color: theme.colors.text.primary }]}>{rank.name}</Text>
        <Text style={[styles.level, { color: theme.colors.text.secondary }]}>Nivel {level}</Text>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFg, { width: `${Math.round((p.progress || 0) * 100)}%`, backgroundColor: rankColor }]} />
        </View>
        <Text style={[styles.progressText, { color: theme.colors.text.secondary }]}>
          Progreso en {rank.name}: {Math.round((p.progress || 0) * 100)}%
        </Text>
        {!!profile?.rating && (
          <Text style={[styles.progressText, { color: theme.colors.text.secondary, marginTop: 4 }]}>⭐ Promedio: {Number(profile.rating).toFixed(1)}</Text>
        )}
      </View>

      <Text style={[styles.subtitle, { color: theme.colors.text.primary }]}>Insignias</Text>
      <View style={styles.badgesGrid}>
        {BADGES.map((b) => {
          const has = earnedSet.has(b.id);
          return (
            <View key={b.id} style={[styles.badgeItem, { backgroundColor: theme.colors.surface, opacity: has ? 1 : 0.35, borderColor: has ? getRankColor(rank.name) : theme.colors.border }]}> 
              <Text style={[styles.badgeName, { color: theme.colors.text.primary }]}>{b.name}</Text>
              <Text style={[styles.badgeDesc, { color: theme.colors.text.secondary }]}>{b.description}</Text>
              <Text style={[styles.badgeCat, { color: theme.colors.text.secondary }]}>{b.category}</Text>
            </View>
          );
        })}
      </View>

      <Text style={[styles.subtitle, { color: theme.colors.text.primary }]}>Historial de Reseñas</Text>
      <View style={{ gap: 8 }}>
        {reviews.map((r) => (
          <View key={r.id} style={[styles.reviewItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
            <View style={styles.reviewHeader}>
              <Text style={[styles.reviewTitle, { color: theme.colors.text.primary }]}>{r.task_title || 'Tarea'}</Text>
              <Text style={[styles.reviewRating, { color: theme.colors.text.primary }]}>⭐ {r.rating.toFixed(1)}</Text>
            </View>
            {!!r.comment && (
              <Text style={[styles.reviewComment, { color: theme.colors.text.secondary }]}>{r.comment}</Text>
            )}
            <View style={styles.reviewMetaRow}>
              <Text style={[styles.reviewMeta, { color: theme.colors.text.secondary }]}>Estado: {r.task_status || '—'}</Text>
              <Text style={[styles.reviewMeta, { color: theme.colors.text.secondary }]}>Pago: {r.payment_amount ? `₡${r.payment_amount.toLocaleString()}` : '—'} ({r.payment_status || '—'})</Text>
              <Text style={[styles.reviewMeta, { color: theme.colors.text.secondary }]}>Cliente: {r.reviewer_name || '—'}</Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={[styles.subtitle, { color: theme.colors.text.primary }]}>Cómo subir de rango</Text>
      <View style={[styles.tipCard, { backgroundColor: theme.colors.surface }]}> 
        <Text style={[styles.tip, { color: theme.colors.text.secondary }]}>• Completa más tareas y mantén una calificación alta.</Text>
        <Text style={[styles.tip, { color: theme.colors.text.secondary }]}>• Varía las categorías para optar por “Maestro de Categoría”.</Text>
        <Text style={[styles.tip, { color: theme.colors.text.secondary }]}>• Participa en eventos especiales para insignias de temporada.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  rankCard: { borderWidth: 2, borderRadius: 12, padding: 16, marginBottom: 16 },
  rankName: { fontSize: 20, fontWeight: '800' },
  level: { fontSize: 14, marginTop: 2 },
  progressBarBg: { height: 10, backgroundColor: '#E5E7EB', borderRadius: 6, marginTop: 10, overflow: 'hidden' },
  progressBarFg: { height: 10, borderRadius: 6 },
  progressText: { fontSize: 12, marginTop: 8 },
  subtitle: { fontSize: 18, fontWeight: '600', marginTop: 12, marginBottom: 8 },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badgeItem: { flexBasis: '48%', padding: 10, borderRadius: 10, borderWidth: 1 },
  badgeName: { fontSize: 14, fontWeight: '700' },
  badgeDesc: { fontSize: 12, marginTop: 4 },
  badgeCat: { fontSize: 11, marginTop: 6 },
  tipCard: { padding: 12, borderRadius: 12 },
  tip: { fontSize: 13, marginBottom: 4 },
  reviewItem: { borderWidth: 1, borderRadius: 12, padding: 12 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewTitle: { fontSize: 14, fontWeight: '700' },
  reviewRating: { fontSize: 12, fontWeight: '700' },
  reviewComment: { fontSize: 12, marginTop: 6 },
  reviewMetaRow: { marginTop: 6, gap: 6 },
  reviewMeta: { fontSize: 11 },
});



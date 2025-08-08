import { EnhancedUserProfile } from './types';

export type RankName =
  | 'Novato'
  | 'Aprendiz'
  | 'Oficial'
  | 'Experto'
  | 'Maestro'
  | 'Veterano'
  | 'Leyenda de Chambito';

export interface RankDefinition {
  name: RankName;
  minLevel: number; // inclusive
  maxLevel?: number; // inclusive; undefined means no upper bound
}

export const RANKS: RankDefinition[] = [
  { name: 'Novato', minLevel: 1, maxLevel: 4 },
  { name: 'Aprendiz', minLevel: 5, maxLevel: 9 },
  { name: 'Oficial', minLevel: 10, maxLevel: 19 },
  { name: 'Experto', minLevel: 20, maxLevel: 34 },
  { name: 'Maestro', minLevel: 35, maxLevel: 49 },
  { name: 'Veterano', minLevel: 50, maxLevel: 74 },
  { name: 'Leyenda de Chambito', minLevel: 75 },
];

export const RANK_COLORS: Record<RankName, string> = {
  Novato: '#9CA3AF',
  Aprendiz: '#34D399',
  Oficial: '#60A5FA',
  Experto: '#F59E0B',
  Maestro: '#8B5CF6',
  Veterano: '#EF4444',
  'Leyenda de Chambito': '#00BFFF',
};

// Simple deterministic hash for demo/derived values
const hash = (text: string): number => {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h;
};

export function computeLevel(profileLike: {
  id: string;
  completed_tasks?: number;
  rating?: number;
  total_earnings?: number;
}): number {
  const base = Math.max(0, Math.floor(profileLike.completed_tasks || 0));
  const ratingBoost = Math.max(0, ((profileLike.rating || 0) - 4) * 5);
  const earningsBoost = Math.floor((profileLike.total_earnings || 0) / 150000); // 1 level per ¢150k
  const seedBoost = (hash(profileLike.id) % 3); // 0-2 for variety in demo
  const level = Math.max(1, Math.min(120, base + ratingBoost + earningsBoost + seedBoost));
  return level;
}

export function getRankForLevel(level: number): RankDefinition {
  for (const r of RANKS) {
    if (level >= r.minLevel && (r.maxLevel === undefined || level <= r.maxLevel)) return r;
  }
  return RANKS[0];
}

export function getRankColor(rankName: RankName): string {
  return RANK_COLORS[rankName] || '#6B7280';
}

export function getLevelProgressWithinRank(level: number): { progress: number; currentMin: number; currentMax?: number } {
  const rank = getRankForLevel(level);
  const currentMin = rank.minLevel;
  const currentMax = rank.maxLevel;
  if (!currentMax) return { progress: 1, currentMin, currentMax };
  const span = Math.max(1, currentMax - currentMin + 1);
  const progress = Math.max(0, Math.min(1, (level - currentMin) / span));
  return { progress, currentMin, currentMax };
}

// Badge model
export type BadgeCategory = 'Performance' | 'Milestone' | 'Community' | 'Seasonal' | 'Special';

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  category: BadgeCategory;
}

export const BADGES: BadgeDefinition[] = [
  // Performance
  { id: 'five-stars', name: '5 Estrellas', description: 'Mantén 5.0 de calificación en 10+ trabajos.', category: 'Performance' },
  { id: 'speedster', name: 'Velocidad de Rayo', description: 'Completa 5 tareas antes del tiempo acordado.', category: 'Performance' },
  { id: 'category-master', name: 'Maestro de Categoría', description: '20+ tareas en una misma categoría.', category: 'Performance' },
  { id: 'attendance', name: 'Perfect Attendance', description: 'Inicia sesión 30 días seguidos.', category: 'Performance' },
  // Milestones
  { id: 'first-job', name: 'Primer Encargo', description: 'Completa tu primera tarea.', category: 'Milestone' },
  { id: 'hundred-wins', name: 'Cien Victorias', description: 'Completa 100 tareas.', category: 'Milestone' },
  { id: 'marathon', name: 'Maratón Chambito', description: 'Completa 10 tareas en una semana.', category: 'Milestone' },
  { id: 'special-mission', name: 'Misión Especial', description: 'Completa una “Mascot Mission”.', category: 'Milestone' },
  // Community & Social
  { id: 'community-helper', name: 'Ayudante de la Comunidad', description: 'Completa 5 tareas de ayuda comunitaria.', category: 'Community' },
  { id: 'eco-hero', name: 'EcoHéroe', description: '10 trabajos eco-amigables.', category: 'Community' },
  { id: 'ambassador', name: 'Embajador Chambito', description: 'Refiere 5 usuarios que completen tareas.', category: 'Community' },
  { id: 'mentor', name: 'Mentor', description: 'Ayuda a entrenar a un nuevo trabajador.', category: 'Community' },
  // Seasonal/Special
  { id: 'xmas-hero', name: 'Héroe Navideño', description: 'Completa tareas en la semana especial de diciembre.', category: 'Seasonal' },
  { id: 'deal-hunter', name: 'Cazador de Ofertas', description: 'Sé el primero en aceptar 10 tareas en tu zona.', category: 'Special' },
  { id: 'work-feast', name: 'Festín de Trabajo', description: 'Completa 3+ trabajos en una semana festiva.', category: 'Special' },
];

export interface EarnedBadge {
  id: string;
  earned: boolean;
  earnedAt?: string;
}

export function computeEarnedBadges(profileLike: {
  id: string;
  completed_tasks?: number;
  rating?: number;
  total_earnings?: number;
}): EarnedBadge[] {
  const completed = profileLike.completed_tasks || 0;
  const rating = profileLike.rating || 0;
  const now = new Date().toISOString();

  const earned = new Set<string>();
  if (completed >= 1) earned.add('first-job');
  if (completed >= 100) earned.add('hundred-wins');
  if (rating >= 5 && completed >= 10) earned.add('five-stars');
  // The rest require telemetry we don’t track yet; leave locked by default

  return BADGES.map(b => ({ id: b.id, earned: earned.has(b.id), earnedAt: earned.has(b.id) ? now : undefined }));
}

export function mapProfileToProgress(profile: EnhancedUserProfile | (Partial<EnhancedUserProfile> & { id: string })): {
  level: number;
  rank: RankDefinition;
  progress: { progress: number; currentMin: number; currentMax?: number };
  color: string;
} {
  const level = computeLevel({
    id: profile.id,
    completed_tasks: (profile as any).completed_tasks ?? (profile as any).total_jobs ?? 0,
    rating: (profile as any).rating ?? 0,
    total_earnings: (profile as any).total_earnings ?? 0,
  });
  const rank = getRankForLevel(level);
  const progress = getLevelProgressWithinRank(level);
  const color = getRankColor(rank.name);
  return { level, rank, progress, color };
}



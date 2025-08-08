// CurriJobs Design System tokens (Swiss-style inspired)
// Spacing scale (4pt grid)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

// Typography scale
export const typography = {
  display: { fontSize: 28, lineHeight: 34, fontWeight: '700' as const },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '700' as const },
  subtitle: { fontSize: 16, lineHeight: 22, fontWeight: '600' as const },
  body: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const },
  small: { fontSize: 10, lineHeight: 14, fontWeight: '600' as const },
};

// Container paddings
export const layout = {
  screenPadding: spacing.lg,
  cardPadding: spacing.lg,
  radius: 12,
  radiusLg: 16,
};

export default { spacing, typography, layout };



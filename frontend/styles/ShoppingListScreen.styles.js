import { StyleSheet } from 'react-native';
import { COLORS, THEME } from './colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: THEME.spacing.lg,
    backgroundColor: COLORS.surface,
  },
  headerRow: {
    marginBottom: THEME.spacing.md,
  },
  title: {
    fontSize: THEME.typography.fontSize.xxxl,
    fontWeight: THEME.typography.fontWeight.bold,
    color: COLORS.text,
  },
  subtitle: {
    marginTop: THEME.spacing.xs,
    color: COLORS.textSecondary,
    fontSize: THEME.typography.fontSize.sm,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: THEME.spacing.sm,
    paddingHorizontal: THEME.spacing.xl,
  },
  emptyTitle: {
    fontSize: THEME.typography.fontSize.lg,
    fontWeight: THEME.typography.fontWeight.semibold,
    color: COLORS.text,
    textAlign: 'center',
  },
  emptyText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  error: {
    color: COLORS.danger,
    textAlign: 'center',
    marginTop: THEME.spacing.xxl,
    fontSize: THEME.typography.fontSize.base,
  },
});
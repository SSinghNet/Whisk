import { StyleSheet } from 'react-native';
import { COLORS, THEME } from './colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: THEME.spacing.lg,
    backgroundColor: COLORS.surface,
  },
  list: {
    flex: 1,
    minHeight: 0,
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
  inlineLoader: {
    marginBottom: THEME.spacing.sm,
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
    marginTop: THEME.spacing.md,
    fontSize: THEME.typography.fontSize.base,
  },
  fab: {
    position: 'absolute',
    right: THEME.spacing.xl,
    bottom: THEME.spacing.xl * 1.5,
    width: THEME.sizing.fab,
    height: THEME.sizing.fab,
    borderRadius: THEME.sizing.fabRadius,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...THEME.shadow.light,
  },
  popupOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.overlay,
    padding: THEME.spacing.lg,
    justifyContent: 'center',
  },
  addPopupCard: {
    backgroundColor: COLORS.surface,
    borderRadius: THEME.sizing.radius.xl,
    padding: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxHeight: '82%',
  },
  addPopupTitle: {
    fontSize: THEME.typography.fontSize.xl,
    fontWeight: THEME.typography.fontWeight.bold,
    color: COLORS.text,
    marginBottom: THEME.spacing.md,
  },
  addPopupSearch: {
    marginBottom: THEME.spacing.sm,
  },
  addResultsList: {
    minHeight: 120,
  },
  addResultsEmpty: {
    textAlign: 'center',
    color: COLORS.textMuted,
    marginVertical: THEME.spacing.lg,
    fontSize: THEME.typography.fontSize.base,
  },
  addPopupClose: {
    alignSelf: 'flex-end',
    marginTop: THEME.spacing.sm,
    width: 40,
    height: 40,
    borderRadius: THEME.sizing.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceMuted,
  },
});
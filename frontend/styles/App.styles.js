import { StyleSheet } from 'react-native';
import { COLORS, THEME } from './colors';

export default StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: THEME.spacing.md,
  },
  mainContent: {
    flex: 1,
    minHeight: 0,
  },
  topNav: {
    flexDirection: 'row',
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  logoutBtn: {
    paddingVertical: THEME.spacing.sm,
    paddingHorizontal: THEME.spacing.md,
  },
  logoutText: {
    color: COLORS.textSecondary,
    fontWeight: THEME.typography.fontWeight.semibold,
    fontSize: THEME.typography.fontSize.sm,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
    paddingVertical: THEME.spacing.sm,
    paddingHorizontal: THEME.spacing.xs,
  },
  bottomNavButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: THEME.spacing.md,
    gap: THEME.spacing.xs,
    borderRadius: THEME.sizing.radius.xl,
    marginHorizontal: THEME.spacing.xs,
  },
  bottomNavActive: {
    backgroundColor: COLORS.selectedBg,
  },
  bottomNavText: {
    fontSize: THEME.typography.fontSize.xs,
    color: COLORS.textMuted,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  bottomNavTextActive: {
    color: COLORS.primary,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    color: COLORS.danger,
    textAlign: 'center',
    marginTop: THEME.spacing.xxl,
    fontSize: THEME.typography.fontSize.base,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: THEME.spacing.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: THEME.sizing.radius.xl,
    padding: THEME.spacing.md,
    margin: THEME.spacing.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    fontSize: THEME.typography.fontSize.xl,
    fontWeight: THEME.typography.fontWeight.semibold,
    color: COLORS.text,
  },
  header: {
    fontSize: THEME.typography.fontSize.xxxl,
    fontWeight: THEME.typography.fontWeight.bold,
    color: COLORS.text,
    marginBottom: THEME.spacing.md,
  },
  meta: {
    color: COLORS.textSecondary,
    marginVertical: THEME.spacing.sm,
    fontSize: THEME.typography.fontSize.base,
  },
  ingredientPreview: {
    color: COLORS.textSecondary,
  },
  backBtn: {
    marginBottom: THEME.spacing.md,
  },
  backText: {
    color: COLORS.primary,
  },
  sectionLabel: {
    fontSize: THEME.typography.fontSize.lg,
    fontWeight: THEME.typography.fontWeight.bold,
    marginTop: THEME.spacing.md,
    color: COLORS.text,
  },
  ingredientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: THEME.spacing.sm,
  },
  ingredientName: {
    color: COLORS.text,
  },
  ingredientAmount: {
    color: COLORS.textSecondary,
  },
  instructions: {
    color: COLORS.text,
    marginTop: THEME.spacing.md,
    lineHeight: 20,
  },
});

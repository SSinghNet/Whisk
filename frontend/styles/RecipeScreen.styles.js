import { StyleSheet } from 'react-native';
import { COLORS, THEME } from './colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: THEME.spacing.lg,
    backgroundColor: COLORS.surface,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  backBtn: {
    padding: THEME.spacing.md,
  },
  backText: {
    fontSize: THEME.typography.fontSize.base,
    color: COLORS.primary,
    fontWeight: THEME.typography.fontWeight.medium,
  },
  title: {
    fontSize: THEME.typography.fontSize.xxxl,
    fontWeight: THEME.typography.fontWeight.bold,
    color: COLORS.text,
  },
  item: {
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: THEME.sizing.radius.lg,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
    backgroundColor: COLORS.surface,
  },
  empty: {
    marginTop: THEME.spacing.xxl,
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: THEME.typography.fontSize.base,
  },
  error: {
    color: COLORS.danger,
    textAlign: 'center',
    marginTop: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
    fontSize: THEME.typography.fontSize.sm,
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
  fabText: {
    color: COLORS.buttonText,
    fontSize: THEME.typography.fontSize.huge,
    lineHeight: THEME.typography.fontSize.huge,
    fontWeight: THEME.typography.fontWeight.bold,
  },
  detailContainer: {
    flex: 1,
    padding: THEME.spacing.lg,
    backgroundColor: COLORS.surface,
  },
  detailScrollContent: {
    paddingBottom: THEME.spacing.xxl,
  },
  backButton: {
    marginBottom: THEME.spacing.lg,
  },
  recipeName: {
    fontSize: THEME.typography.fontSize.xxxxl,
    fontWeight: THEME.typography.fontWeight.bold,
    color: COLORS.text,
    marginBottom: THEME.spacing.lg,
  },
  sectionLabel: {
    fontSize: THEME.typography.fontSize.lg,
    fontWeight: THEME.typography.fontWeight.semibold,
    color: COLORS.text,
    marginTop: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
  },
  ingredientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSoft,
  },
  ingredientName: {
    fontSize: THEME.typography.fontSize.base,
    color: COLORS.text,
    flex: 1,
  },
  ingredientAmount: {
    fontSize: THEME.typography.fontSize.base,
    color: COLORS.textSecondary,
  },
  instructions: {
    fontSize: THEME.typography.fontSize.base,
    color: COLORS.text,
    lineHeight: 20,
  },
});

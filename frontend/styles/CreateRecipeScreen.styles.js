import { StyleSheet } from 'react-native';
import { COLORS, THEME } from './colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: THEME.spacing.lg,
    paddingBottom: THEME.spacing.sm,
  },
  backButton: {
    paddingRight: THEME.spacing.sm,
    paddingVertical: THEME.spacing.xs,
  },
  title: {
    fontSize: THEME.typography.fontSize.xxxl,
    fontWeight: THEME.typography.fontWeight.bold,
    color: COLORS.text,
  },
  scrollContent: {
    padding: THEME.spacing.lg,
    paddingBottom: THEME.spacing.xxl * 2,
  },
  label: {
    fontSize: THEME.typography.fontSize.sm,
    fontWeight: THEME.typography.fontWeight.semibold,
    color: COLORS.textSecondary,
    marginBottom: THEME.spacing.xs,
    marginTop: THEME.spacing.md,
  },
  hint: {
    fontSize: THEME.typography.fontSize.xs,
    color: COLORS.textMuted,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: THEME.sizing.radius.md,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.sm,
    backgroundColor: COLORS.inputFill,
    color: COLORS.text,
    fontSize: THEME.typography.fontSize.base,
  },
  textArea: {
    height: 100,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: THEME.spacing.md,
    padding: THEME.spacing.md,
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: THEME.sizing.radius.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  toggleLabel: {
    fontSize: THEME.typography.fontSize.base,
    fontWeight: THEME.typography.fontWeight.medium,
    color: COLORS.text,
    marginBottom: THEME.spacing.xs,
  },
  sectionTitle: {
    fontSize: THEME.typography.fontSize.lg,
    fontWeight: THEME.typography.fontWeight.semibold,
    color: COLORS.text,
    marginTop: THEME.spacing.lg,
    marginBottom: THEME.spacing.sm,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
    marginBottom: THEME.spacing.sm,
  },
  ingredientName: {
    flex: 2,
    marginBottom: 0,
  },
  ingredientAmount: {
    flex: 1,
    marginBottom: 0,
  },
  pickerWrapper: {
    flex: 1.5,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: THEME.sizing.radius.md,
    backgroundColor: COLORS.inputFill,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  picker: {
    height: 48,
    color: COLORS.text,
  },
  addIngredientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.xs,
    marginVertical: THEME.spacing.md,
  },
  addIngredientText: {
    color: COLORS.primary,
    fontSize: THEME.typography.fontSize.base,
    fontWeight: THEME.typography.fontWeight.medium,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: THEME.spacing.md,
    borderRadius: THEME.sizing.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: THEME.sizing.buttonHeight,
    marginTop: THEME.spacing.lg,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: COLORS.buttonText,
    fontWeight: THEME.typography.fontWeight.bold,
    fontSize: THEME.typography.fontSize.base,
  },
});

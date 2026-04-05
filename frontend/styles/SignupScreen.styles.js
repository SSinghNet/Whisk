import { StyleSheet } from 'react-native';
import { COLORS, THEME } from './colors';

export default StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: THEME.spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: COLORS.surface,
    borderRadius: THEME.sizing.radius.xxl,
    padding: THEME.spacing.xl,
    ...THEME.shadow.light,
  },
  title: {
    fontSize: THEME.typography.fontSize.xxxxl,
    fontWeight: THEME.typography.fontWeight.bold,
    marginBottom: THEME.spacing.xs,
    color: COLORS.text,
  },
  subtitle: {
    fontSize: THEME.typography.fontSize.md,
    color: COLORS.textSecondary,
    marginBottom: THEME.spacing.lg,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: THEME.sizing.radius.lg,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.md,
    fontSize: THEME.typography.fontSize.md,
    marginBottom: THEME.spacing.md,
    backgroundColor: COLORS.surface,
    color: COLORS.text,
  },
  disabledButton: { opacity: 0.6 },
  primaryButtonText: {
    color: COLORS.buttonText,
    fontSize: THEME.typography.fontSize.base,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  secondaryButton: {
    marginTop: THEME.spacing.lg,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: THEME.typography.fontSize.sm,
    fontWeight: THEME.typography.fontWeight.medium,
  },
  errorText: {
    color: COLORS.danger,
    marginBottom: THEME.spacing.md,
    fontSize: THEME.typography.fontSize.sm,
  },
});
import { StyleSheet } from 'react-native';
import { COLORS, THEME } from './colors';

export default StyleSheet.create({
  container: {
    padding: THEME.spacing.lg,
    backgroundColor: COLORS.surface,
  },
  title: {
    fontSize: THEME.typography.fontSize.xl,
    fontWeight: THEME.typography.fontWeight.semibold,
    marginBottom: THEME.spacing.md,
    color: COLORS.text,
  },
  row: {
    flexDirection: 'row',
    gap: THEME.spacing.md,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: THEME.sizing.radius.md,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.md,
    fontSize: THEME.typography.fontSize.base,
    backgroundColor: COLORS.surface,
    color: COLORS.text,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: THEME.sizing.radius.md,
    paddingHorizontal: THEME.spacing.lg,
    justifyContent: 'center',
    height: THEME.sizing.buttonHeight,
  },
  buttonText: {
    color: COLORS.buttonText,
    fontWeight: THEME.typography.fontWeight.semibold,
    fontSize: THEME.typography.fontSize.base,
  },
  error: {
    color: COLORS.danger,
    marginTop: THEME.spacing.md,
    fontSize: THEME.typography.fontSize.base,
  },
});
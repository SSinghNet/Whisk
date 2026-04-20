import { StyleSheet } from 'react-native';
import { COLORS, THEME } from '../styles/colors';

export const cardStyles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: THEME.sizing.radius.xl,
    padding: THEME.spacing.lg,
    backgroundColor: COLORS.surface,
    marginBottom: THEME.spacing.md,
    ...THEME.shadow.light,
  },
  selectedCard: {
    borderColor: COLORS.selectedBorder,
    backgroundColor: COLORS.selectedBg,
    ...THEME.shadow.light,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: THEME.spacing.sm,
  },
  main: {
    flex: 1,
    minWidth: 0,
    paddingRight: THEME.spacing.xs,
  },
  title: {
    fontSize: THEME.typography.fontSize.lg,
    fontWeight: THEME.typography.fontWeight.semibold,
    color: COLORS.text,
    letterSpacing: -0.2,
  },
  detail: {
    fontSize: THEME.typography.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  detailRow: {
    marginTop: THEME.spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.xs,
  },
  detailIcon: {
    flexShrink: 0,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.xs,
    flexShrink: 0,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: THEME.sizing.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  actionText: {
    color: COLORS.buttonText,
    fontSize: THEME.typography.fontSize.sm,
    fontWeight: THEME.typography.fontWeight.medium,
  },
  primary: {
    backgroundColor: COLORS.primarySoft,
    borderColor: 'rgba(79, 70, 229, 0.22)',
  },
  success: {
    backgroundColor: COLORS.successSoft,
    borderColor: 'rgba(22, 163, 74, 0.2)',
  },
  danger: {
    backgroundColor: COLORS.dangerSoft,
    borderColor: 'rgba(220, 38, 38, 0.2)',
  },
});

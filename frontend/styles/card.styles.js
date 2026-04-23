import { StyleSheet } from 'react-native';
import { COLORS, THEME } from '../styles/colors';

export const cardStyles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: THEME.sizing.radius.xl,
    padding: THEME.spacing.lg,
    paddingLeft: THEME.spacing.lg + 4,
    backgroundColor: COLORS.surface,
    marginBottom: THEME.spacing.md,
    overflow: 'hidden',
    ...THEME.shadow.light,
  },
  statusBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: THEME.sizing.radius.xl,
    borderBottomLeftRadius: THEME.sizing.radius.xl,
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
    marginBottom: 1,
  },
  title: {
    fontSize: THEME.typography.fontSize.lg,
    fontWeight: THEME.typography.fontWeight.semibold,
    color: COLORS.text,
    letterSpacing: -0.2,
  },
  badge: {
    flexShrink: 0,
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: 2,
    borderRadius: THEME.sizing.radius.full,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: THEME.typography.fontSize.xs,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  detail: {
    fontSize: THEME.typography.fontSize.sm,
    color: COLORS.textSecondary,
    marginTop: THEME.spacing.xs,
    lineHeight: 20,
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

import { StyleSheet } from 'react-native';
import { COLORS, THEME } from './colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  scrollContent: {
    padding: THEME.spacing.lg,
    paddingBottom: THEME.spacing.xxl * 2,
  },

  // Avatar
  avatarSection: {
    alignItems: 'center',
    paddingVertical: THEME.spacing.xxl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.md,
    ...THEME.shadow.medium,
  },
  avatarText: {
    color: COLORS.textInverse,
    fontSize: THEME.typography.fontSize.xxl,
    fontWeight: THEME.typography.fontWeight.bold,
    letterSpacing: 1,
  },
  email: {
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: THEME.spacing.xs,
  },
  memberSince: {
    fontSize: THEME.typography.fontSize.sm,
    color: COLORS.textMuted,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: THEME.sizing.radius.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: THEME.spacing.xl,
    overflow: 'hidden',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: THEME.spacing.xl,
    gap: THEME.spacing.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginVertical: THEME.spacing.lg,
  },
  statValue: {
    fontSize: THEME.typography.fontSize.xxxxl,
    fontWeight: THEME.typography.fontWeight.bold,
    color: COLORS.primary,
  },
  statLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.xs,
  },
  statLabel: {
    fontSize: THEME.typography.fontSize.xs,
    color: COLORS.textSecondary,
    fontWeight: THEME.typography.fontWeight.medium,
  },

  // Account section
  section: {
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: THEME.sizing.radius.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
    paddingBottom: THEME.spacing.sm,
    marginBottom: THEME.spacing.xl,
  },
  sectionTitle: {
    fontSize: THEME.typography.fontSize.xs,
    fontWeight: THEME.typography.fontWeight.semibold,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: THEME.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: THEME.spacing.md,
    gap: THEME.spacing.md,
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: THEME.typography.fontSize.xs,
    color: COLORS.textMuted,
    marginBottom: THEME.spacing.xs,
  },
  infoValue: {
    fontSize: THEME.typography.fontSize.base,
    color: COLORS.text,
    fontWeight: THEME.typography.fontWeight.medium,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.border,
    marginLeft: THEME.spacing.xl + THEME.spacing.sm,
  },

  // Sign out
  signOutBtn: {
    marginTop: THEME.spacing.sm,
  },
});

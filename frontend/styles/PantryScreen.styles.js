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
  title: {
    fontSize: THEME.typography.fontSize.xxxl,
    fontWeight: THEME.typography.fontWeight.bold,
    color: COLORS.text,
  },
  list: {
    flex: 1,
    minHeight: 0,
  },
  item: {
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: THEME.sizing.radius.lg,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
    backgroundColor: COLORS.surface,
  },
  itemLeft: {
    marginBottom: THEME.spacing.md,
  },
  itemTitle: {
    fontSize: THEME.typography.fontSize.lg,
    fontWeight: THEME.typography.fontWeight.semibold,
    color: COLORS.text,
  },
  itemMeta: {
    fontSize: THEME.typography.fontSize.sm,
    color: COLORS.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: THEME.spacing.lg,
    marginTop: THEME.spacing.md,
  },
  editPane: {
    marginTop: THEME.spacing.md,
  },
  smallInput: {
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: THEME.sizing.radius.md,
    padding: THEME.spacing.sm,
    marginBottom: THEME.spacing.sm,
    backgroundColor: COLORS.surface,
    color: COLORS.text,
    fontSize: THEME.typography.fontSize.base,
  },
  picker: {
    marginBottom: THEME.spacing.md,
  },
  edit: {
    color: COLORS.primary,
    fontWeight: THEME.typography.fontWeight.medium,
    fontSize: THEME.typography.fontSize.base,
  },
  save: {
    color: COLORS.success,
    fontWeight: THEME.typography.fontWeight.medium,
    fontSize: THEME.typography.fontSize.base,
  },
  cancel: {
    color: COLORS.textSecondary,
    fontWeight: THEME.typography.fontWeight.medium,
    fontSize: THEME.typography.fontSize.base,
  },
  delete: {
    color: COLORS.danger,
    fontWeight: THEME.typography.fontWeight.medium,
    fontSize: THEME.typography.fontSize.base,
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
    marginTop: THEME.spacing.xxl,
    fontSize: THEME.typography.fontSize.base,
  },
  expandBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: THEME.spacing.xs,
    minWidth: 32,
  },
  addEntryBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: THEME.spacing.xs,
    minWidth: 32,
  },
  expandBadgeText: {
    color: COLORS.textMuted,
    fontSize: THEME.typography.fontSize.sm,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  groupEntries: {
    marginTop: THEME.spacing.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSoft,
    paddingTop: THEME.spacing.sm,
    gap: THEME.spacing.sm,
  },
  groupEntryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
  },
  groupEntryDetails: {
    flex: 1,
    minWidth: 0,
  },
  groupEntryText: {
    color: COLORS.textSecondary,
    fontSize: THEME.typography.fontSize.sm,
    lineHeight: 20,
  },
  groupEntryActions: {
    flexDirection: 'row',
    gap: THEME.spacing.xs,
  },
  entryActionButton: {
    width: 36,
    height: 36,
    borderRadius: THEME.sizing.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  entryActionPrimary: {
    backgroundColor: COLORS.primarySoft,
    borderColor: 'rgba(79, 70, 229, 0.22)',
  },
  entryActionDanger: {
    backgroundColor: COLORS.dangerSoft,
    borderColor: 'rgba(220, 38, 38, 0.2)',
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
});

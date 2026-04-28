import { StyleSheet } from 'react-native';
import { COLORS, THEME } from './colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: THEME.spacing.lg,
    backgroundColor: COLORS.surface,
  },
  title: {
    fontSize: THEME.typography.fontSize.xxxl,
    fontWeight: THEME.typography.fontWeight.bold,
    marginBottom: THEME.spacing.md,
    color: COLORS.text,
  },
  back: {
    color: COLORS.primary,
    marginBottom: THEME.spacing.md,
    fontWeight: THEME.typography.fontWeight.medium,
    fontSize: THEME.typography.fontSize.base,
  },
  backRow: {
    marginBottom: THEME.spacing.md,
    alignSelf: 'flex-start',
    paddingVertical: THEME.spacing.xs,
    paddingRight: THEME.spacing.md,
  },
  resultsList: {
    flex: 1,
    minHeight: 0,
  },
  item: {
    padding: THEME.spacing.md,
    borderBottomWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  selectedItem: {
    backgroundColor: COLORS.selectedBg,
  },
  itemText: {
    fontSize: THEME.typography.fontSize.base,
    color: COLORS.text,
  },
  section: {
    marginTop: THEME.spacing.md,
    marginBottom: THEME.spacing.sm,
    fontWeight: THEME.typography.fontWeight.semibold,
    color: COLORS.text,
    fontSize: THEME.typography.fontSize.base,
  },
  empty: {
    textAlign: 'center',
    marginTop: THEME.spacing.lg,
    color: COLORS.textMuted,
    fontSize: THEME.typography.fontSize.base,
  },
  selectedBlock: {
    marginTop: THEME.spacing.lg,
    padding: THEME.spacing.md,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: THEME.sizing.radius.lg,
    backgroundColor: COLORS.surface,
  },
  selectedBlockScroll: {
    flexGrow: 1,
    paddingBottom: THEME.spacing.xxl,
  },
  input: {
    borderColor: COLORS.borderSoft,
    borderWidth: 1,
    borderRadius: THEME.sizing.radius.md,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
    backgroundColor: COLORS.surface,
    color: COLORS.text,
    fontSize: THEME.typography.fontSize.base,
  },
  popupActionsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: THEME.spacing.md,
    marginTop: THEME.spacing.sm,
  },
  popupActionHalf: {
    flex: 1,
    minHeight: 48,
  },
  addButton: {
    backgroundColor: COLORS.success,
    padding: THEME.spacing.md,
    borderRadius: THEME.sizing.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    color: COLORS.buttonText,
    fontWeight: THEME.typography.fontWeight.bold,
    fontSize: THEME.typography.fontSize.base,
  },
  picker: {
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: THEME.sizing.radius.md,
  },
  popupButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: THEME.spacing.md,
    borderRadius: THEME.sizing.radius.lg,
    marginVertical: THEME.spacing.md,
    alignItems: 'center',
  },
  popupButtonText: {
    color: COLORS.buttonText,
    fontWeight: THEME.typography.fontWeight.semibold,
    fontSize: THEME.typography.fontSize.base,
  },
  popupOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.lg,
  },
  popupInner: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: COLORS.surface,
    borderRadius: THEME.sizing.radius.xl,
    padding: THEME.spacing.lg,
    ...THEME.shadow.medium,
  },
  popupScrollContent: {
    paddingBottom: THEME.spacing.sm,
  },
  datePickerSection: {
    marginBottom: THEME.spacing.sm,
    alignSelf: 'stretch',
  },
  dateLabel: {
    fontSize: THEME.typography.fontSize.sm,
    fontWeight: THEME.typography.fontWeight.semibold,
    color: COLORS.textSecondary,
    marginBottom: THEME.spacing.xs,
  },
  dateTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: THEME.typography.fontSize.base,
    color: COLORS.text,
  },
  popupTitle: {
    fontSize: THEME.typography.fontSize.lg,
    fontWeight: THEME.typography.fontWeight.bold,
    marginBottom: THEME.spacing.md,
    color: COLORS.text,
  },
  popupClose: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: THEME.sizing.radius.lg,
    backgroundColor: COLORS.surface,
  },
  popupCloseText: {
    color: COLORS.primary,
    fontWeight: THEME.typography.fontWeight.semibold,
    fontSize: THEME.typography.fontSize.base,
  },
  error: {
    color: COLORS.danger,
    marginTop: THEME.spacing.md,
    fontSize: THEME.typography.fontSize.sm,
  },
});
import { StyleSheet } from 'react-native';
import { COLORS } from './colors';

export default StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: COLORS.surface },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 12, color: COLORS.text },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: COLORS.borderSoft,
    gap: 8,
  },
  name: { fontSize: 16, flex: 1, color: COLORS.text },
  editInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 16,
    backgroundColor: COLORS.surface,
    color: COLORS.text,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconAction: {
    padding: 4,
  },
  edit: { color: COLORS.primary, fontWeight: '500' },
  save: { color: COLORS.success, fontWeight: '500' },
  cancel: { color: COLORS.textSecondary, fontWeight: '500' },
  delete: { color: COLORS.danger, fontWeight: '500' },
  empty: { color: COLORS.textMuted, textAlign: 'center', marginTop: 40 },
  error: { color: COLORS.danger, textAlign: 'center', marginTop: 40 },
});
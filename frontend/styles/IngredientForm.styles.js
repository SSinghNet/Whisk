import { StyleSheet } from 'react-native';
import { COLORS } from './colors';

export default StyleSheet.create({
  container: { padding: 16, backgroundColor: COLORS.surface },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 12, color: COLORS.text },
  row: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: COLORS.surface,
    color: COLORS.text,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 20,
    justifyContent: 'center',
    height: 44,
  },
  buttonText: { color: COLORS.surface, fontWeight: '600', fontSize: 16 },
  error: { color: COLORS.danger, marginTop: 8, fontSize: 14 },
});
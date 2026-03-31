import { StyleSheet } from 'react-native';
import { COLORS } from './colors';

export default StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  topNav: { flexDirection: 'row', gap: 8, padding: 12, backgroundColor: COLORS.surface, elevation: 2 },
  navButton: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: COLORS.surface, borderRadius: 8 },
  navText: { color: COLORS.text, fontWeight: '600' },
  navActive: { backgroundColor: COLORS.primary, },
  logoutBtn: { marginLeft: 'auto', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: COLORS.danger },
  logoutText: { color: COLORS.surface, fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  error: { color: COLORS.danger, textAlign: 'center', marginTop: 24 },
  container: { flex: 1, backgroundColor: COLORS.surface, padding: 12 },
  card: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, margin: 8, borderWidth: 1, borderColor: COLORS.border },
  cardTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  header: { fontSize: 24, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  meta: { color: COLORS.textSecondary, marginVertical: 4 },
  ingredientPreview: { color: COLORS.textSecondary },
  backBtn: { marginBottom: 12 },
  backText: { color: COLORS.primary },
  sectionLabel: { fontSize: 16, fontWeight: '700', marginTop: 8, color: COLORS.text },
  ingredientRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  ingredientName: { color: COLORS.text },
  ingredientAmount: { color: COLORS.textSecondary },
  instructions: { color: COLORS.text, marginTop: 8, lineHeight: 20 },
});
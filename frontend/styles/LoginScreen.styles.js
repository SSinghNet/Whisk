import { StyleSheet } from 'react-native';
import { COLORS } from './colors';

export default StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 20,
    shadowColor: COLORS.cardShadow,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 6, color: COLORS.text },
  subtitle: { fontSize: 15, color: COLORS.textSecondary, marginBottom: 18 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 12,
    backgroundColor: COLORS.surface,
    color: COLORS.text,
  },
  disabledButton: { opacity: 0.6 },
  primaryButtonText: { color: COLORS.surface, fontSize: 16, fontWeight: '600' },
  secondaryButton: { marginTop: 14, alignItems: 'center' },
  secondaryButtonText: { color: COLORS.primary, fontSize: 14, fontWeight: '500' },
  errorText: { color: COLORS.danger, marginBottom: 8, fontSize: 13 },
});
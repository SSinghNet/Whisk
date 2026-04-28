import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, THEME } from '../styles/colors';

export default function ErrorMessage({ message, style }) {
  if (!message) return null;

  return (
    <View style={[styles.banner, style]}>
      <Ionicons name="alert-circle" size={18} color={COLORS.danger} style={styles.icon} />
      <Text style={styles.error}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.dangerSoft,
    borderRadius: THEME.sizing.radius.lg,
    paddingVertical: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.15)',
  },
  icon: {
    marginRight: THEME.spacing.sm,
    marginTop: 1,
  },
  error: {
    flex: 1,
    color: COLORS.danger,
    fontSize: THEME.typography.fontSize.sm,
    lineHeight: 20,
    fontWeight: THEME.typography.fontWeight.medium,
  },
});

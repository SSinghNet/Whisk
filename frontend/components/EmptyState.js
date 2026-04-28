import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, THEME } from '../styles/colors';

export default function EmptyState({ message, icon, title, style }) {
  return (
    <View style={[styles.wrap, style]}>
      {icon ? (
        <View style={styles.iconCircle}>
          <Ionicons name={icon} size={28} color={COLORS.textMuted} />
        </View>
      ) : null}
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: THEME.spacing.xxl,
    paddingHorizontal: THEME.spacing.lg,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.md,
  },
  title: {
    fontSize: THEME.typography.fontSize.lg,
    fontWeight: THEME.typography.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: THEME.spacing.xs,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: THEME.typography.fontSize.md,
    lineHeight: 22,
    maxWidth: 280,
  },
});

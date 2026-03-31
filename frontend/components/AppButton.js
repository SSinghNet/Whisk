import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '../styles/colors';

export default function AppButton({ title, onPress, variant = 'primary', disabled = false, loading = false, style }) {
  const bgColor =
    variant === 'primary' ? COLORS.primary :
    variant === 'secondary' ? COLORS.primaryAlt :
    variant === 'danger' ? COLORS.danger :
    COLORS.border;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.button, { backgroundColor: bgColor, opacity: disabled || loading ? 0.6 : 1 }, style]}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.surface} />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    marginVertical: 6,
  },
  text: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});

import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS, THEME } from '../styles/colors';

export default function AppButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}) {
  const variantStyles = {
    primary: {
      container: {
        backgroundColor: COLORS.primary,
        borderWidth: 0,
        minHeight: THEME.sizing.buttonHeight,
      },
      text: { color: COLORS.buttonText },
      spinner: COLORS.buttonText,
    },
    secondary: {
      container: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: COLORS.primary,
        minHeight: THEME.sizing.buttonHeight,
      },
      text: { color: COLORS.primary },
      spinner: COLORS.primary,
    },
    danger: {
      container: {
        backgroundColor: COLORS.danger,
        borderWidth: 0,
        minHeight: THEME.sizing.buttonHeight,
      },
      text: { color: COLORS.buttonText },
      spinner: COLORS.buttonText,
    },
    ghost: {
      container: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        minHeight: 0,
        paddingVertical: THEME.spacing.sm,
      },
      text: {
        color: COLORS.primary,
        fontSize: THEME.typography.fontSize.sm,
        fontWeight: THEME.typography.fontWeight.medium,
      },
      spinner: COLORS.primary,
    },
  };

  const v = variantStyles[variant] ?? variantStyles.primary;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[
        styles.button,
        v.container,
        { opacity: disabled || loading ? 0.55 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.spinner} />
      ) : (
        <Text style={[styles.text, v.text]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: THEME.sizing.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: THEME.spacing.xl,
    marginVertical: THEME.spacing.sm,
  },
  text: {
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
});

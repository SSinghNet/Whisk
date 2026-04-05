import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, THEME } from '../styles/colors';

export default function FloatingActionButton({
  icon = 'add',
  onPress,
  style,
  accessibilityLabel = 'Add',
}) {
  return (
    <TouchableOpacity
      style={[styles.fab, style]}
      onPress={onPress}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Ionicons name={icon} size={28} color={COLORS.buttonText} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
    ...THEME.shadow.medium,
  },
});

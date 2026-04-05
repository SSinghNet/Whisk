import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, THEME } from '../styles/colors';

export default function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search...',
  style,
}) {
  return (
    <View style={[styles.wrap, style]}>
      <Ionicons name="search" size={20} color={COLORS.textMuted} style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={COLORS.placeholder}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputFill,
    borderRadius: THEME.sizing.radius.xl,
    paddingHorizontal: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  icon: {
    marginRight: THEME.spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: THEME.sizing.minInputHeight,
    paddingVertical: THEME.spacing.sm,
    fontSize: THEME.typography.fontSize.md,
    color: COLORS.text,
  },
});

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../styles/colors';

export default function IngredientCard({
  title,
  details = [],
  selected = false,
  onPress,
  actions = [],
  style,
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.card, selected && styles.selectedCard, style]}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={styles.main}>
        <Text style={styles.title}>{title}</Text>
        {details.map((detail, index) => (
          <Text style={styles.detail} key={index}>{detail}</Text>
        ))}
      </View>
      {actions.length > 0 && (
        <View style={styles.actions}>
          {actions.map((action, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={action.onPress}
              style={[styles.actionButton, action.variant === 'danger' ? styles.danger : action.variant === 'success' ? styles.success : styles.primary]}
            >
              <Text style={styles.actionText}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: 10,
    padding: 12,
    backgroundColor: COLORS.surface,
    marginBottom: 10,
  },
  selectedCard: {
    borderColor: COLORS.primary,
    backgroundColor: '#e0f2fe',
  },
  main: {},
  title: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  detail: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  actionText: { color: COLORS.surface, fontSize: 13, fontWeight: '500' },
  primary: { backgroundColor: COLORS.primary },
  success: { backgroundColor: COLORS.success },
  danger: { backgroundColor: COLORS.danger },
});
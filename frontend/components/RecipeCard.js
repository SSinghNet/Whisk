import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cardStyles } from '../styles/card.styles';
import { COLORS } from '../styles/colors';

const ACTION_ICON_SIZE = 22;

function iconTint(variant) {
  if (variant === 'danger') return COLORS.danger;
  if (variant === 'success') return COLORS.success;
  return COLORS.primary;
}

export default function RecipeCard({
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
      style={[cardStyles.card, selected && cardStyles.selectedCard, style]}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={cardStyles.cardTopRow}>
        <View style={cardStyles.main}>
          <Text style={cardStyles.title}>{title}</Text>
          {details.map((detail, index) => (
            <Text style={cardStyles.detail} key={index}>{detail}</Text>
          ))}
        </View>
        {actions.length > 0 ? (
          <View style={cardStyles.actions}>
            {actions.map((action, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={action.onPress}
                accessibilityRole="button"
                accessibilityLabel={action.accessibilityLabel ?? action.label}
                style={[
                  cardStyles.actionButton,
                  action.variant === 'danger'
                    ? cardStyles.danger
                    : action.variant === 'success'
                    ? cardStyles.success
                    : cardStyles.primary,
                ]}
              >
                <Ionicons
                  name={action.icon}
                  size={ACTION_ICON_SIZE}
                  color={iconTint(action.variant)}
                />
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

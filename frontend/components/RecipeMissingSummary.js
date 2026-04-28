import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../styles/RecipeScreen.styles';
import { COLORS } from '../styles/colors';

export default function RecipeMissingSummary({ summary, statusConfig }) {
  const [collapsed, setCollapsed] = useState(false);

  if (!summary) {
    return null;
  }

  if (!summary.missing_ingredients?.length) {
    return (
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Pantry status</Text>
        <Text style={styles.summaryText}>Everything needed for this recipe is in your pantry.</Text>
      </View>
    );
  }

  return (
    <View style={styles.summaryCard}>
      <TouchableOpacity
        style={styles.summaryHeader}
        onPress={() => setCollapsed((value) => !value)}
        accessibilityRole="button"
        accessibilityLabel={collapsed ? 'Expand missing ingredients summary' : 'Collapse missing ingredients summary'}
      >
        <Text style={styles.summaryTitle}>Still needed</Text>
        <Ionicons
          name={collapsed ? 'chevron-down' : 'chevron-up'}
          size={18}
          color={COLORS.text}
        />
      </TouchableOpacity>

      {!collapsed ? summary.missing_ingredients.map((item) => {
        const config = statusConfig[item.status];
        const shortageText = item.missing_quantity != null
          ? `${item.missing_quantity} ${item.missing_unit || ''}`.trim()
          : null;

        return (
          <View key={item.ingredient_id} style={styles.summaryRow}>
            <Ionicons name={config.icon} size={16} color={config.color} />
            <Text style={styles.summaryText}>
              {item.name}
              {shortageText ? ` (${shortageText})` : ''}
            </Text>
          </View>
        );
      }) : null}
    </View>
  );
}

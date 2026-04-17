import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../styles/RecipeScreen.styles';

const formatAmount = (quantity, unit) => {
  if (quantity == null) {
    return unit || 'Amount unspecified';
  }

  return unit ? `${quantity} ${unit}` : `${quantity}`;
};

export default function RecipeIngredientStatusCard({ ingredient, statusConfig }) {
  const pantryStatus = ingredient.pantry_status || {};
  const config = statusConfig[pantryStatus.status] || statusConfig.missing;
  const pantryItems = pantryStatus.pantry_items || [];

  return (
    <View style={styles.ingredientStatusCard}>
      <View style={styles.ingredientStatusTopRow}>
        <View style={styles.ingredientTitleRow}>
          <Ionicons name={config.icon} size={18} color={config.color} />
          <View style={styles.ingredientTitleText}>
            <Text style={styles.ingredientName}>{ingredient.ingredient.name}</Text>
            <Text style={[styles.ingredientBadgeText, { color: config.color }]}>
              {config.label}
            </Text>
          </View>
        </View>

        <View style={styles.ingredientAmountsColumn}>
          <Text style={styles.ingredientNeedText}>
            Need: {formatAmount(ingredient.amount, ingredient.unit)}
          </Text>
          {pantryItems.length ? (
            <View style={styles.pantryList}>
              {pantryItems.map((item) => (
                <Text key={item.pantry_ingredient_id} style={styles.pantryItemText}>
                  Have: {formatAmount(item.quantity, item.unit)}
                </Text>
              ))}
            </View>
          ) : (
            <Text style={styles.pantryItemText}>Have: not in pantry</Text>
          )}
        </View>
      </View>
    </View>
  );
}

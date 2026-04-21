import { Alert, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/colors';
import IngredientCard from '../components/IngredientCard';
import styles from '../styles/ShoppingListScreen.styles';

export default function ShoppingListScreen({ items = [], onRemoveItem = null, onMoveToPantry = null }) {
  const handleDelete = async (item) => {
    if (!onRemoveItem) return;

    try {
      await onRemoveItem(item.ingredient_id);
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to remove shopping list item');
    }
  };

  const handleMoveToPantry = async (item) => {
    if (!onMoveToPantry) return;

    try {
      await onMoveToPantry(item);
      Alert.alert('Moved to pantry', `${item.ingredient?.name ?? 'Item'} was added back to pantry.`);
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to move item to pantry');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Shopping List</Text>
          <Text style={styles.subtitle}>Items you marked as running out</Text>
        </View>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="cart-outline" size={48} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>No shopping list items yet</Text>
          <Text style={styles.emptyText}>Use the pantry “ran out” action to add items here.</Text>
        </View>
      ) : (
        items.map((item) => (
          <IngredientCard
            key={item.ingredient_id}
            title={item.ingredient?.name ?? 'Unknown ingredient'}
            details={[
              `quantity: ${item.quantity ?? '-'}`,
              `unit: ${item.unit ?? '-'}`,
            ]}
            actions={[
              {
                icon: 'trash-outline',
                variant: 'danger',
                accessibilityLabel: `Remove ${item.ingredient?.name ?? 'item'} from shopping list`,
                onPress: () => handleDelete(item),
              },
              {
                icon: 'basket-outline',
                variant: 'success',
                accessibilityLabel: `Move ${item.ingredient?.name ?? 'item'} to pantry`,
                onPress: () => handleMoveToPantry(item),
              },
            ]}
          />
        ))
      )}
    </View>
  );
}
import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/colors';
import IngredientCard from '../components/IngredientCard';
import PantryItemQuantityPopup from '../components/PantryItemQuantityPopup';
import styles from '../styles/ShoppingListScreen.styles';

export default function ShoppingListScreen({ items = [], onRemoveItem = null, onMoveToPantry = null }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('count');
  const [expiryDate, setExpiryDate] = useState(null);

  const handleDelete = async (item) => {
    if (!onRemoveItem) return;

    try {
      await onRemoveItem(item.ingredient_id);
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to remove shopping list item');
    }
  };

  const handleMoveToPantry = async (item) => {
    setSelectedItem(item);
    setQuantity(String(item.quantity ?? 1));
    setUnit(item.unit ?? 'count');
    setExpiryDate(null);
  };

  const submitMoveToPantry = async () => {
    if (!onMoveToPantry || !selectedItem) return;

    const quantityValue = Number(quantity);
    if (Number.isNaN(quantityValue) || quantityValue < 1) {
      Alert.alert('Quantity must be a number greater than 0');
      return;
    }

    try {
      await onMoveToPantry(selectedItem, {
        quantity: quantityValue,
        unit,
        expiry_date: expiryDate ? expiryDate.toISOString().split('T')[0] : null,
      });
      setSelectedItem(null);
      Alert.alert('Moved to pantry', `${selectedItem.ingredient?.name ?? 'Item'} was added back to pantry.`);
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

      {selectedItem && (
        <PantryItemQuantityPopup
          title={`Add ${selectedItem.ingredient?.name ?? 'Item'} to Pantry`}
          quantity={quantity}
          onQuantityChange={setQuantity}
          unit={unit}
          onUnitChange={setUnit}
          expiryDate={expiryDate}
          onExpiryDateChange={setExpiryDate}
          primaryLabel="Add to Pantry"
          primaryIcon="bag-add-outline"
          onPrimary={submitMoveToPantry}
          onCancel={() => setSelectedItem(null)}
        />
      )}
    </View>
  );
}
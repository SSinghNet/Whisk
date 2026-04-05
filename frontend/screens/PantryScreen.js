import { useEffect, useState } from 'react';
import {
  View, Text, FlatList,
  ActivityIndicator, Alert, TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/colors';
import IngredientCard from '../components/IngredientCard';
import SearchBar from '../components/SearchBar';
import PantryItemQuantityPopup from '../components/PantryItemQuantityPopup';
import { getPantryItems, deletePantryItem, updatePantryItem } from '../lib/api';
import styles from '../styles/PantryScreen.styles';

function parsePantryExpiry(iso) {
  if (!iso) return new Date();
  const part = String(iso).split('T')[0];
  const [y, m, d] = part.split('-').map(Number);
  if (!y || !m || !d) return new Date();
  return new Date(y, m - 1, d);
}

export default function PantryScreen({ session, onAdd }) {
  const [pantry, setPantry] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [editQuantity, setEditQuantity] = useState('');
  const [editUnit, setEditUnit] = useState('count');
  const [editExpiryDate, setEditExpiryDate] = useState(new Date());

  const fetchPantry = async (q = '', { quietSearch = false } = {}) => {
    const busySetter = quietSearch ? setSearchLoading : setLoading;
    busySetter(true);
    setError(null);
    try {
      const data = await getPantryItems(session.access_token, q);
      setPantry(data);
    } catch (e) {
      setError(e.message);
    } finally {
      busySetter(false);
    }
  };

  useEffect(() => {
    fetchPantry();
  }, []);

  const handleDelete = (ingredientId) => {
    Alert.alert('Delete', 'Delete this pantry item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await deletePantryItem(session.access_token, ingredientId);
            await fetchPantry(search, { quietSearch: true });
          } catch (e) {
            Alert.alert('Error', e.message || 'Delete failed');
          }
        }
      }
    ]);
  };

  const startEdit = (item) => {
    setEditingItem(item);
    setEditQuantity(item.quantity?.toString() ?? '');
    setEditUnit(item.unit || 'count');
    setEditExpiryDate(parsePantryExpiry(item.expiry_date));
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditQuantity('');
    setEditUnit('count');
    setEditExpiryDate(new Date());
  };

  const saveEdit = async () => {
    if (!editingItem) return;
    const quantityValue = Number(editQuantity);
    if (Number.isNaN(quantityValue) || quantityValue < 1) {
      Alert.alert('Validation', 'Quantity must be a number greater than 0');
      return;
    }

    const payload = {
      quantity: quantityValue,
      unit: editUnit,
      expiry_date: editExpiryDate.toISOString().split('T')[0],
    };

    try {
      await updatePantryItem(session.access_token, editingItem.ingredient_id, payload);
      cancelEdit();
      await fetchPantry(search, { quietSearch: true });
    } catch (e) {
      Alert.alert('Error', e.message || 'Update failed');
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;
  if (error) return <Text style={styles.error}>{error}</Text>;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Pantry</Text>
      </View>

      <SearchBar
        placeholder="Search pantry..."
        value={search}
        onChangeText={(text) => {
          setSearch(text);
          fetchPantry(text, { quietSearch: true });
        }}
      />

      {searchLoading && (
        <ActivityIndicator size="small" style={{ marginVertical: 8 }} />
      )}

      <FlatList
        style={styles.list}
        data={pantry}
        keyExtractor={(item) => `${item.user_id}-${item.ingredient_id}`}
        ListEmptyComponent={<Text style={styles.empty}>No pantry items found.</Text>}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <IngredientCard
            title={item.ingredient?.name ?? 'Unknown ingredient'}
            details={[
              `quantity: ${item.quantity ?? '-'} ${item.unit ?? '-'}`,
              `expiry: ${item.expiry_date ? item.expiry_date.split('T')[0] : 'none'}`,
            ]}
            actions={[
              { icon: 'create-outline', accessibilityLabel: 'Edit', onPress: () => startEdit(item), variant: 'primary' },
              { icon: 'trash-outline', accessibilityLabel: 'Delete', onPress: () => handleDelete(item.ingredient_id), variant: 'danger' },
            ]}
          />
        )}
      />

      {editingItem && (
        <PantryItemQuantityPopup
          title={`Edit ${editingItem.ingredient?.name ?? 'item'} in Pantry`}
          quantity={editQuantity}
          onQuantityChange={setEditQuantity}
          unit={editUnit}
          onUnitChange={setEditUnit}
          expiryDate={editExpiryDate}
          onExpiryDateChange={setEditExpiryDate}
          primaryLabel="Save"
          primaryIcon="checkmark"
          onPrimary={saveEdit}
          onCancel={cancelEdit}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={onAdd}
        accessibilityRole="button"
        accessibilityLabel="Add pantry item"
      >
        <Ionicons name="add" size={32} color={COLORS.buttonText} />
      </TouchableOpacity>
    </View>
  );
}

import { useEffect, useState } from 'react';
import {
  View, Text, TextInput, FlatList,
  ActivityIndicator, Alert, TouchableOpacity
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import IngredientCard from '../components/IngredientCard';
import { getPantryItems, deletePantryItem, updatePantryItem } from '../lib/api';
import styles from '../styles/PantryScreen.styles';

const UNIT_OPTIONS = [
  'count', 'gram', 'ounce', 'pound', 'milliliter', 'liter', 'gallon', 'cup', 'tablespoon', 'teaspoon'
];

export default function PantryScreen({ session, onAdd }) {
  const [pantry, setPantry] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ quantity: '', unit: 'count', expiry_date: '' });

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
            await fetchPantry(search);
          } catch (e) {
            Alert.alert('Error', e.message || 'Delete failed');
          }
        }
      }
    ]);
  };

  const startEdit = (item) => {
    setEditingId(item.ingredient_id);
    setEditValues({
      quantity: item.quantity?.toString() ?? '',
      unit: item.unit ?? '',
      expiry_date: item.expiry_date ? item.expiry_date.split('T')[0] : '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({ quantity: '', unit: '', expiry_date: '' });
  };

  const saveEdit = async (ingredientId) => {
    try {
      const quantityValue = Number(editValues.quantity);
      if (Number.isNaN(quantityValue) || quantityValue <= 1) {
        Alert.alert('Validation', 'Quantity must be a number greater than 1');
        return;
      }

      const payload = {
        quantity: quantityValue,
        unit: editValues.unit,
      };
      if (editValues.expiry_date !== '') payload.expiry_date = editValues.expiry_date;

      await updatePantryItem(session.access_token, ingredientId, payload);
      cancelEdit();
      await fetchPantry(search);
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

      <TextInput
        style={styles.searchInput}
        placeholder="Search pantry..."
        autoCapitalize="none"
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
        data={pantry}
        keyExtractor={(item) => `${item.user_id}-${item.ingredient_id}`}
        ListEmptyComponent={<Text style={styles.empty}>No pantry items found.</Text>}
        renderItem={({ item }) => (
          editingId === item.ingredient_id ? (
            <View style={styles.editPane}>
              <TextInput
                style={styles.smallInput}
                placeholder="quantity"
                autoCapitalize="none"
                keyboardType="numeric"
                value={String(editValues.quantity)}
                onChangeText={(value) => setEditValues(prev => ({ ...prev, quantity: value }))}
              />
              <Picker
                selectedValue={editValues.unit}
                onValueChange={(value) => setEditValues(prev => ({ ...prev, unit: value }))}
                style={styles.picker}
              >
                {UNIT_OPTIONS.map((unit) => (
                  <Picker.Item key={unit} label={unit} value={unit} />
                ))}
              </Picker>
              <TextInput
                style={styles.smallInput}
                placeholder="expiry YYYY-MM-DD"
                autoCapitalize="none"
                value={editValues.expiry_date}
                onChangeText={(value) => setEditValues(prev => ({ ...prev, expiry_date: value }))}
              />
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => saveEdit(item.ingredient_id)}><Text style={styles.save}>Save</Text></TouchableOpacity>
                <TouchableOpacity onPress={cancelEdit}><Text style={styles.cancel}>Cancel</Text></TouchableOpacity>
              </View>
            </View>
          ) : (
            <IngredientCard
              title={item.ingredient?.name ?? 'Unknown ingredient'}
              details={[
                `quantity: ${item.quantity ?? '-'} ${item.unit ?? '-'}`,
                `expiry: ${item.expiry_date ? item.expiry_date.split('T')[0] : 'none'}`,
              ]}
              actions={[
                { label: 'Edit', onPress: () => startEdit(item), variant: 'primary' },
                { label: 'Delete', onPress: () => handleDelete(item.ingredient_id), variant: 'danger' },
              ]}
            />
          )
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={onAdd}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

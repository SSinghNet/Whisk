import { useEffect, useState } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  ActivityIndicator, Alert
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { searchIngredients, addPantryItem } from '../lib/api';
import IngredientForm from './IngredientForm';
import IngredientCard from '../components/IngredientCard';
import styles from '../styles/AddPantryIngredientScreen.styles';
const UNIT_OPTIONS = [
  'count', 'gram', 'ounce', 'pound', 'milliliter', 'liter', 'gallon', 'cup', 'tablespoon', 'teaspoon'
];

export default function AddPantryIngredientScreen({ session, onAdded, onCancel }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('count');
  const [expiry_date, setExpiryDate] = useState('');
  const [createPopup, setCreatePopup] = useState(false);

  const runSearch = async (q) => {
    setLoading(true);
    setError(null);
    try {
      const data = await searchIngredients(session.access_token, q);
      setResults(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query.length >= 2) {
      runSearch(query);
    } else {
      setResults([]);
    }
  }, [query]);

  const handleAddToPantry = async () => {
    if (!selected || !selected.ingredient_id) {
      Alert.alert('Select ingredient first');
      return;
    }
    const quantityValue = Number(quantity);
    if (Number.isNaN(quantityValue) || quantityValue < 1) {
      Alert.alert('Quantity must be a number greater than 0');
      return;
    }

    try {
      await addPantryItem(session.access_token, {
        ingredient_id: selected.ingredient_id,
        quantity: Number(quantity),
        unit,
        expiry_date: expiry_date || null,
      });
      onAdded && onAdded();
    } catch (e) {
      const message = e.message || 'Failed to add to pantry';
      if (message.toLowerCase().includes('already exists')) {
        Alert.alert('Duplicate Item', 'This ingredient is already in your pantry.')
      } else {
        Alert.alert('Error', message)
      }
    }
  };

  const handleIngredientCreated = async () => {
    setQuery('');
    setSelected(null);
    setResults([]);
    runSearch('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Pantry Item</Text>
      <TouchableOpacity onPress={onCancel}><Text style={styles.back}>← Back</Text></TouchableOpacity>

      <TextInput
        style={styles.searchInput}
        placeholder="Search ingredient (min 2 chars)"
        autoCapitalize="none"
        value={query}
        onChangeText={setQuery}
      />

      {loading ? <ActivityIndicator /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={results}
        keyExtractor={(item) => String(item.ingredient_id)}
        ListEmptyComponent={<Text style={styles.empty}>No results</Text>}
        renderItem={({ item }) => (
          <IngredientCard
            title={item.name}
            selected={selected?.ingredient_id === item.ingredient_id}
            onPress={() => setSelected(item)}
          />
        )}
      />

      <TouchableOpacity onPress={() => setCreatePopup(true)} style={styles.popupButton}>
        <Text style={styles.popupButtonText}>Create New Ingredient</Text>
      </TouchableOpacity>

      {createPopup && (
        <View style={styles.popupOverlay}>
          <View style={styles.popupInner}>
            <Text style={styles.popupTitle}>Create generic ingredient</Text>
            <IngredientForm session={session} onAdded={() => {
              setCreatePopup(false);
              handleIngredientCreated();
            }} />
            <TouchableOpacity onPress={() => setCreatePopup(false)} style={styles.popupClose}>
              <Text style={styles.popupCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {selected && (
        <View style={styles.selectedBlock}>
          <Text style={styles.section}>Selected: {selected.name}</Text>
          <TextInput
            style={styles.input}
            placeholder="Quantity"
            autoCapitalize="none"
            keyboardType="numeric"
            value={quantity}
            onChangeText={setQuantity}
          />
          <Picker
            selectedValue={unit}
            onValueChange={(value) => setUnit(value)}
            style={styles.picker}
          >
            {UNIT_OPTIONS.map((u) => <Picker.Item key={u} label={u} value={u} />)}
          </Picker>
          <TextInput
            style={styles.input}
            placeholder="Expiry date (YYYY-MM-DD)"
            autoCapitalize="none"
            value={expiry_date}
            onChangeText={setExpiryDate}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddToPantry}>
            <Text style={styles.addButtonText}>Add to Pantry</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

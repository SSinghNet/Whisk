import { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/colors';
import { searchIngredients, addPantryItem } from '../lib/api';
import SearchBar from '../components/SearchBar';
import IngredientForm from './IngredientForm';
import IngredientCard from '../components/IngredientCard';
import PantryItemQuantityPopup from '../components/PantryItemQuantityPopup';
import styles from '../styles/AddPantryIngredientScreen.styles';

export default function AddPantryIngredientScreen({ session, onAdded, onCancel, initialIngredient }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(initialIngredient ?? null);
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('count');
  const [expiry_date, setExpiryDate] = useState(null);
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
    runSearch(query);
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
        expiry_date: expiry_date ? expiry_date.toISOString().split('T')[0] : null,
      });
      onAdded && onAdded();
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to add to pantry');
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
      <TouchableOpacity
        onPress={onCancel}
        style={styles.backRow}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Ionicons name="chevron-back" size={22} color={COLORS.primary} />
      </TouchableOpacity>

      <SearchBar
        placeholder="Search ingredient (min 2 chars)"
        value={query}
        onChangeText={setQuery}
      />

      {loading ? <ActivityIndicator /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        style={styles.resultsList}
        data={results}
        keyExtractor={(item) => String(item.ingredient_id)}
        ListEmptyComponent={<Text style={styles.empty}>No results</Text>}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <IngredientCard
            title={item.name}
            selected={selected?.ingredient_id === item.ingredient_id}
            onPress={() => {
              setSelected(item);
              setExpiryDate(null);
            }}
          />
        )}
      />

      <TouchableOpacity
        onPress={() => setCreatePopup(true)}
        style={styles.popupButton}
        accessibilityRole="button"
        accessibilityLabel="Create new ingredient"
      >
        <Ionicons name="create-outline" size={26} color={COLORS.buttonText} />
      </TouchableOpacity>

      {createPopup && (
        <View style={styles.popupOverlay}>
          <View style={styles.popupInner}>
            <Text style={styles.popupTitle}>Create generic ingredient</Text>
            <IngredientForm session={session} onAdded={() => {
              setCreatePopup(false);
              handleIngredientCreated();
            }} />
            <TouchableOpacity
              onPress={() => setCreatePopup(false)}
              style={styles.popupClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Ionicons name="close-circle-outline" size={28} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {selected && (
        <PantryItemQuantityPopup
          title={`Add ${selected.name} to Pantry`}
          quantity={quantity}
          onQuantityChange={setQuantity}
          unit={unit}
          onUnitChange={setUnit}
          expiryDate={expiry_date}
          onExpiryDateChange={setExpiryDate}
          primaryLabel="Add to Pantry"
          primaryIcon="bag-add-outline"
          onPrimary={handleAddToPantry}
          onCancel={() => {
            setSelected(null);
            setExpiryDate(null);
          }}
        />
      )}
    </View>
  );
}

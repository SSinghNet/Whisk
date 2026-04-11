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
import { addPantryItem, getPantryItems, deletePantryItem, updatePantryItem } from '../lib/api';
import styles from '../styles/PantryScreen.styles';

function parsePantryExpiry(iso) {
  if (!iso) return new Date();
  const part = String(iso).split('T')[0];
  const [y, m, d] = part.split('-').map(Number);
  if (!y || !m || !d) return new Date();
  return new Date(y, m - 1, d);
}

function formatExpiry(iso) {
  return iso ? iso.split('T')[0] : 'none';
}

function groupPantryItems(items) {
  const grouped = new Map();

  for (const item of items) {
    const key = String(item.ingredient_id);
    const existing = grouped.get(key);

    if (existing) {
      existing.entries.push(item);
      continue;
    }

    grouped.set(key, {
      ingredient_id: item.ingredient_id,
      ingredient: item.ingredient,
      entries: [item],
    });
  }

  return Array.from(grouped.values()).map((group) => {
    const expiryDates = group.entries
      .map((entry) => entry.expiry_date)
      .filter(Boolean)
      .sort();

    return {
      ...group,
      nextExpiry: expiryDates[0] ?? null,
    };
  });
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
  const [addingIngredient, setAddingIngredient] = useState(null);
  const [addQuantity, setAddQuantity] = useState('');
  const [addUnit, setAddUnit] = useState('count');
  const [addExpiryDate, setAddExpiryDate] = useState(new Date());
  const [expandedIngredients, setExpandedIngredients] = useState({});

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
      await updatePantryItem(session.access_token, editingItem.pantry_ingredient_id, payload);
      cancelEdit();
      await fetchPantry(search, { quietSearch: true });
    } catch (e) {
      Alert.alert('Error', e.message || 'Update failed');
    }
  };

  const startAddEntry = (group) => {
    setAddingIngredient(group);
    setAddQuantity('');
    setAddUnit(group.entries[0]?.unit || 'count');
    setAddExpiryDate(new Date());
  };

  const cancelAddEntry = () => {
    setAddingIngredient(null);
    setAddQuantity('');
    setAddUnit('count');
    setAddExpiryDate(new Date());
  };

  const saveNewEntry = async () => {
    if (!addingIngredient) return;

    const quantityValue = Number(addQuantity);
    if (Number.isNaN(quantityValue) || quantityValue < 1) {
      Alert.alert('Validation', 'Quantity must be a number greater than 0');
      return;
    }

    try {
      await addPantryItem(session.access_token, {
        ingredient_id: addingIngredient.ingredient_id,
        quantity: quantityValue,
        unit: addUnit,
        expiry_date: addExpiryDate.toISOString().split('T')[0],
      });
      cancelAddEntry();
      setExpandedIngredients((current) => ({
        ...current,
        [addingIngredient.ingredient_id]: true,
      }));
      await fetchPantry(search, { quietSearch: true });
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to add pantry entry');
    }
  };

  const groupedPantry = groupPantryItems(pantry);

  const toggleExpanded = (ingredientId) => {
    setExpandedIngredients((current) => ({
      ...current,
      [ingredientId]: !current[ingredientId],
    }));
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
        data={groupedPantry}
        keyExtractor={(item) => String(item.ingredient_id)}
        ListEmptyComponent={<Text style={styles.empty}>No pantry items found.</Text>}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => {
          const isExpanded = !!expandedIngredients[item.ingredient_id];
          const entryCount = item.entries.length;

          return (
            <IngredientCard
              title={item.ingredient?.name ?? 'Unknown ingredient'}
              onPress={() => toggleExpanded(item.ingredient_id)}
              details={[
                `${entryCount} ${entryCount === 1 ? 'entry' : 'entries'}`,
                `next expiry: ${formatExpiry(item.nextExpiry)}`,
              ]}
              actions={[
                {
                  icon: isExpanded ? 'chevron-up' : 'chevron-down',
                  accessibilityLabel: `${isExpanded ? 'Collapse' : 'Expand'} ${item.ingredient?.name ?? 'ingredient'}`,
                  onPress: () => toggleExpanded(item.ingredient_id),
                },
              ]}
              rightContent={(
                <TouchableOpacity
                  onPress={() => startAddEntry(item)}
                  accessibilityRole="button"
                  accessibilityLabel={`Add another ${item.ingredient?.name ?? 'ingredient'} entry`}
                  style={styles.addEntryBadge}
                >
                  <Text style={styles.expandBadgeText}>{entryCount}</Text>
                  <Ionicons
                    name="add-circle-outline"
                    size={18}
                    color={COLORS.success}
                  />
                </TouchableOpacity>
              )}
            >
              {isExpanded ? (
                <View style={styles.groupEntries}>
                  {item.entries.map((entry, index) => (
                    <View
                      key={entry.pantry_ingredient_id ?? `${entry.ingredient_id}-${index}`}
                      style={styles.groupEntryRow}
                    >
                      <View style={styles.groupEntryDetails}>
                        <Text style={styles.groupEntryText}>
                          quantity: {entry.quantity ?? '-'} {entry.unit ?? '-'}
                        </Text>
                        <Text style={styles.groupEntryText}>
                          expiry: {formatExpiry(entry.expiry_date)}
                        </Text>
                      </View>
                      <View style={styles.groupEntryActions}>
                        <TouchableOpacity
                          onPress={() => startEdit(entry)}
                          accessibilityRole="button"
                          accessibilityLabel={`Edit ${item.ingredient?.name ?? 'pantry item'}`}
                          style={[styles.entryActionButton, styles.entryActionPrimary]}
                        >
                          <Ionicons name="create-outline" size={18} color={COLORS.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDelete(entry.pantry_ingredient_id)}
                          accessibilityRole="button"
                          accessibilityLabel={`Delete ${item.ingredient?.name ?? 'pantry item'}`}
                          style={[styles.entryActionButton, styles.entryActionDanger]}
                        >
                          <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              ) : null}
            </IngredientCard>
          );
        }}
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

      {addingIngredient && (
        <PantryItemQuantityPopup
          title={`Add another ${addingIngredient.ingredient?.name ?? 'item'} entry`}
          quantity={addQuantity}
          onQuantityChange={setAddQuantity}
          unit={addUnit}
          onUnitChange={setAddUnit}
          expiryDate={addExpiryDate}
          onExpiryDateChange={setAddExpiryDate}
          primaryLabel="Add Entry"
          primaryIcon="add-circle-outline"
          onPrimary={saveNewEntry}
          onCancel={cancelAddEntry}
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

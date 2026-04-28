import { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/colors';
import IngredientCard from '../components/IngredientCard';
import PantryItemQuantityPopup from '../components/PantryItemQuantityPopup';
import SearchBar from '../components/SearchBar';
import { searchIngredients } from '../lib/api';
import styles from '../styles/ShoppingListScreen.styles';

export default function ShoppingListScreen({
  session,
  items = [],
  onAddItem = null,
  onRemoveItem = null,
  onMoveToPantry = null,
  onRefresh = null,
}) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [moveQuantity, setMoveQuantity] = useState('');
  const [moveUnit, setMoveUnit] = useState('count');
  const [moveExpiryDate, setMoveExpiryDate] = useState(null);
  const [search, setSearch] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [addModeOpen, setAddModeOpen] = useState(false);
  const [ingredientQuery, setIngredientQuery] = useState('');
  const [ingredientResults, setIngredientResults] = useState([]);
  const [ingredientSearchLoading, setIngredientSearchLoading] = useState(false);
  const [ingredientError, setIngredientError] = useState(null);
  const [addingIngredientId, setAddingIngredientId] = useState(null);

  const visibleItems = useMemo(() => {
    if (onRefresh) {
      return items;
    }

    const normalized = String(search ?? '').trim().toLowerCase();
    if (!normalized) return items;

    return items.filter((item) => String(item.ingredient?.name ?? '').toLowerCase().includes(normalized));
  }, [items, onRefresh, search]);

  const runShoppingSearch = async (queryText) => {
    if (!onRefresh || !session?.access_token) {
      return;
    }

    setSearchLoading(true);
    try {
      await onRefresh(session, queryText);
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to search shopping list');
    } finally {
      setSearchLoading(false);
    }
  };

  const runIngredientSearch = async (queryText) => {
    if (!session?.access_token) {
      setIngredientResults([]);
      return;
    }

    setIngredientSearchLoading(true);
    setIngredientError(null);
    try {
      const data = await searchIngredients(session.access_token, queryText);
      setIngredientResults(Array.isArray(data) ? data : []);
    } catch (e) {
      setIngredientError(e.message || 'Failed to search ingredients');
    } finally {
      setIngredientSearchLoading(false);
    }
  };

  useEffect(() => {
    if (!addModeOpen) {
      return;
    }

    runIngredientSearch(ingredientQuery);
  }, [addModeOpen, ingredientQuery]);

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
    setMoveQuantity(String(item.quantity ?? 1));
    setMoveUnit(item.unit ?? 'count');
    setMoveExpiryDate(null);
  };

  const submitMoveToPantry = async () => {
    if (!onMoveToPantry || !selectedItem) return;

    const quantityValue = Number(moveQuantity);
    if (Number.isNaN(quantityValue) || quantityValue < 1) {
      Alert.alert('Quantity must be a number greater than 0');
      return;
    }

    try {
      await onMoveToPantry(selectedItem, {
        quantity: quantityValue,
        unit: moveUnit,
        expiry_date: moveExpiryDate ? moveExpiryDate.toISOString().split('T')[0] : null,
      });
      setSelectedItem(null);
      Alert.alert('Moved to pantry', `${selectedItem.ingredient?.name ?? 'Item'} was added back to pantry.`);
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to move item to pantry');
    }
  };

  const openAddMode = () => {
    setAddModeOpen(true);
    setIngredientQuery('');
    setIngredientResults([]);
    setIngredientError(null);
  };

  const closeAddMode = () => {
    setAddModeOpen(false);
    setIngredientQuery('');
    setIngredientResults([]);
    setIngredientError(null);
    setAddingIngredientId(null);
  };

  const addShoppingItemDirectly = async (ingredient) => {
    if (!onAddItem || !ingredient?.ingredient_id) return;
    setAddingIngredientId(ingredient.ingredient_id);

    try {
      await onAddItem({
        ingredient_id: ingredient.ingredient_id,
        ingredient: { name: ingredient.name },
        quantity: 1,
        unit: 'count',
      });

      setAddModeOpen(false);
      setAddingIngredientId(null);

      if (onRefresh && session?.access_token) {
        await runShoppingSearch(search);
      }

      Alert.alert('Added to shopping list', `${ingredient.name} was added to your shopping list.`);
    } catch (e) {
      setAddingIngredientId(null);
      Alert.alert('Error', e.message || 'Failed to add shopping list item');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Shopping List</Text>
          <Text style={styles.subtitle}>Items to buy, move to pantry, or remove</Text>
        </View>
      </View>

      <SearchBar
        placeholder="Search shopping list..."
        value={search}
        onChangeText={(text) => {
          setSearch(text);
          runShoppingSearch(text);
        }}
      />

      {searchLoading ? <ActivityIndicator size="small" style={styles.inlineLoader} /> : null}

      {visibleItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="cart-outline" size={48} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>{search ? 'No matching shopping items' : 'No shopping list items yet'}</Text>
          <Text style={styles.emptyText}>
            {search
              ? 'Try a different search term or add an item below.'
              : 'Use the add button or pantry ran out action to add items here.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={visibleItems}
          keyExtractor={(item) => String(item.ingredient_id)}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
          <IngredientCard
            title={item.ingredient?.name ?? 'Unknown ingredient'}
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
          )}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={openAddMode}
        accessibilityRole="button"
        accessibilityLabel="Add shopping list item"
      >
        <Ionicons name="add" size={32} color={COLORS.buttonText} />
      </TouchableOpacity>

      {addModeOpen ? (
        <View style={styles.popupOverlay}>
          <View style={styles.addPopupCard}>
            <Text style={styles.addPopupTitle}>Add Shopping Item</Text>

            <SearchBar
              placeholder="Search ingredient..."
              value={ingredientQuery}
              onChangeText={setIngredientQuery}
              style={styles.addPopupSearch}
            />

            {ingredientSearchLoading ? <ActivityIndicator size="small" style={styles.inlineLoader} /> : null}
            {ingredientError ? <Text style={styles.error}>{ingredientError}</Text> : null}

            <FlatList
              data={ingredientResults}
              keyExtractor={(item) => String(item.ingredient_id)}
              style={styles.addResultsList}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <Text style={styles.addResultsEmpty}>No ingredients found.</Text>
              }
              renderItem={({ item }) => (
                <IngredientCard
                  title={item.name}
                  actions={[
                    {
                      icon: 'add-circle-outline',
                      variant: 'success',
                      accessibilityLabel: `Add ${item.name} to shopping list`,
                      onPress: () => addShoppingItemDirectly(item),
                    },
                  ]}
                />
              )}
            />

            {addingIngredientId ? <ActivityIndicator size="small" style={styles.inlineLoader} /> : null}

            <TouchableOpacity
              onPress={closeAddMode}
              style={styles.addPopupClose}
              accessibilityRole="button"
              accessibilityLabel="Close add shopping item"
            >
              <Ionicons name="close" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {selectedItem && (
        <PantryItemQuantityPopup
          title={`Add ${selectedItem.ingredient?.name ?? 'Item'} to Pantry`}
          quantity={moveQuantity}
          onQuantityChange={setMoveQuantity}
          unit={moveUnit}
          onUnitChange={setMoveUnit}
          expiryDate={moveExpiryDate}
          onExpiryDateChange={setMoveExpiryDate}
          primaryLabel="Add to Pantry"
          primaryIcon="bag-add-outline"
          onPrimary={submitMoveToPantry}
          onCancel={() => setSelectedItem(null)}
        />
      )}
    </View>
  );
}
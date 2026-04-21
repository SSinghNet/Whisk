import { useEffect, useRef, useState } from 'react';
import {
  View, Text, FlatList, ScrollView,
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
  if (!iso) return null;
  const part = String(iso).split('T')[0];
  const [y, m, d] = part.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function formatExpiry(iso) {
  return iso ? iso.split('T')[0] : 'none';
}

function getDaysUntilExpiry(iso) {
  const expiryDate = parsePantryExpiry(iso);
  if (!expiryDate) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Math.floor((expiryDate.getTime() - today.getTime()) / 86400000);
}

function getExpiryTone(iso) {
  const daysUntilExpiry = getDaysUntilExpiry(iso);

  if (daysUntilExpiry == null) return 'Green';
  if (daysUntilExpiry > 7) return 'Green';
  if (daysUntilExpiry > 3) return 'Yellow';
  return 'Red';
}

function getExpiryLabel(iso) {
  const daysUntilExpiry = getDaysUntilExpiry(iso);

  if (daysUntilExpiry == null) return 'unknown';
  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry === 0) return 'expires today';
  if (daysUntilExpiry === 1) return '1 day left';
  return `${daysUntilExpiry} days left`;
}

function getExpiryColor(iso) {
  const tone = getExpiryTone(iso);

  if (tone === 'Green') return COLORS.expirationGreen;
  if (tone === 'Yellow') return COLORS.expirationYellow;
  return COLORS.expirationRed;
}

function getExpiredItems(items) {
  return items.filter((item) => {
    const daysUntilExpiry = getDaysUntilExpiry(item.expiry_date);
    return daysUntilExpiry != null && daysUntilExpiry < 0;
  });
}

function compareExpiryDates(a, b) {
  const aDays = getDaysUntilExpiry(a);
  const bDays = getDaysUntilExpiry(b);

  const aValue = aDays == null ? Number.POSITIVE_INFINITY : aDays;
  const bValue = bDays == null ? Number.POSITIVE_INFINITY : bDays;

  return aValue - bValue;
}

function asNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function categorizeIngredientName(name) {
  const normalized = String(name ?? '').toLowerCase();

  if (!normalized) return 'other';

  const matchAny = (keywords) => keywords.some((keyword) => normalized.includes(keyword));

  if (matchAny(['apple', 'banana', 'orange', 'grape', 'berry', 'mango', 'pear', 'melon', 'pineapple', 'fruit'])) return 'fruits';
  if (matchAny(['carrot', 'broccoli', 'spinach', 'lettuce', 'cucumber', 'pepper', 'onion', 'tomato', 'potato', 'vegetable', 'veggie'])) return 'vegetables';
  if (matchAny(['milk', 'cheese', 'yogurt', 'butter', 'cream'])) return 'dairy';
  if (matchAny(['juice', 'soda', 'water', 'coffee', 'tea', 'drink', 'beverage'])) return 'drinks';
  if (matchAny(['chicken', 'beef', 'pork', 'fish', 'egg', 'tofu', 'turkey', 'protein'])) return 'protein';
  if (matchAny(['rice', 'pasta', 'bread', 'oat', 'flour', 'grain', 'cereal'])) return 'grains';
  if (matchAny(['salt', 'pepper', 'cumin', 'paprika', 'oregano', 'spice', 'herb'])) return 'spices';

  return 'other';
}

function sortPantryItems(items, sortMode) {
  const sorted = [...items];

  switch (sortMode) {
    case 'alpha-desc':
      return sorted.sort((a, b) => String(b.ingredient?.name ?? '').localeCompare(String(a.ingredient?.name ?? '')));
    case 'expires-soonest':
      return sorted.sort((a, b) => compareExpiryDates(a.nextExpiry, b.nextExpiry));
    case 'expires-latest':
      return sorted.sort((a, b) => compareExpiryDates(b.nextExpiry, a.nextExpiry));
    case 'added-latest':
      return sorted.sort((a, b) => (b.latestEntryId ?? 0) - (a.latestEntryId ?? 0));
    case 'highest-qty':
      return sorted.sort((a, b) => (b.totalQuantity ?? 0) - (a.totalQuantity ?? 0));
    case 'lowest-qty':
      return sorted.sort((a, b) => (a.totalQuantity ?? 0) - (b.totalQuantity ?? 0));
    case 'category-asc':
      return sorted.sort((a, b) => {
        const categoryCompare = String(a.category ?? '').localeCompare(String(b.category ?? ''));
        if (categoryCompare !== 0) return categoryCompare;
        return String(a.ingredient?.name ?? '').localeCompare(String(b.ingredient?.name ?? ''));
      });
    case 'alpha-asc':
    default:
      return sorted.sort((a, b) => String(a.ingredient?.name ?? '').localeCompare(String(b.ingredient?.name ?? '')));
  }
}

function filterPantryItems(items, filterMode, categoryMode) {
  const expiryFiltered = filterMode === 'all'
    ? items
    : items.filter((item) => getExpiryTone(item.nextExpiry).toLowerCase() === filterMode);

  if (categoryMode === 'all') {
    return expiryFiltered;
  }

  return expiryFiltered.filter((item) => item.category === categoryMode);
}

const SORT_OPTIONS = [
  { label: 'Alphabetical (A-Z)', value: 'alpha-asc' },
  { label: 'Alphabetical (Z-A)', value: 'alpha-desc' },
  { label: 'Category (A-Z)', value: 'category-asc' },
  { label: 'Expires soonest', value: 'expires-soonest' },
  { label: 'Expires latest', value: 'expires-latest' },
  { label: 'Added latest', value: 'added-latest' },
  { label: 'Highest total quantity', value: 'highest-qty' },
  { label: 'Lowest total quantity', value: 'lowest-qty' },
];

const FILTER_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Expiry (red)', value: 'red' },
  { label: 'Expiry (yellow)', value: 'yellow' },
  { label: 'Expiry (green)', value: 'green' },
];

const CATEGORY_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Fruits', value: 'fruits' },
  { label: 'Vegetables', value: 'vegetables' },
  { label: 'Dairy', value: 'dairy' },
  { label: 'Drinks', value: 'drinks' },
  { label: 'Protein', value: 'protein' },
  { label: 'Grains', value: 'grains' },
  { label: 'Spices', value: 'spices' },
  { label: 'Other', value: 'other' },
];

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

    const category = categorizeIngredientName(group.ingredient?.name);
    const totalQuantity = group.entries.reduce((sum, entry) => sum + asNumber(entry.quantity), 0);
    const latestEntryId = group.entries.reduce((maxId, entry) => {
      const entryId = asNumber(entry.pantry_ingredient_id);
      return entryId > maxId ? entryId : maxId;
    }, 0);

    return {
      ...group,
      nextExpiry: expiryDates[0] ?? null,
      category,
      totalQuantity,
      latestEntryId,
    };
  });
}

export default function PantryScreen({ session, onAdd, onMarkRanOut = null }) {
  const [pantry, setPantry] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [editQuantity, setEditQuantity] = useState('');
  const [editUnit, setEditUnit] = useState('count');
  const [editExpiryDate, setEditExpiryDate] = useState(null);
  const [addingIngredient, setAddingIngredient] = useState(null);
  const [addQuantity, setAddQuantity] = useState('');
  const [addUnit, setAddUnit] = useState('count');
  const [addExpiryDate, setAddExpiryDate] = useState(null);
  const [expandedIngredients, setExpandedIngredients] = useState({});
  const [sortMode, setSortMode] = useState('alpha-asc');
  const [filterMode, setFilterMode] = useState('all');
  const [categoryMode, setCategoryMode] = useState('all');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const lastExpiredAlertRef = useRef('');

  const removeExpiredItems = async (expiredItems) => {
    try {
      await Promise.all(
        expiredItems.map((item) => deletePantryItem(session.access_token, item.pantry_ingredient_id))
      );

      await fetchPantry(search, { quietSearch: true });
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to remove expired pantry items');
    }
  };

  const maybeAlertExpiredItems = (items) => {
    const expiredItems = getExpiredItems(items);

    if (!expiredItems.length) {
      lastExpiredAlertRef.current = '';
      return;
    }

    const expiredKey = expiredItems
      .map((item) => item.pantry_ingredient_id)
      .sort()
      .join(',');

    if (lastExpiredAlertRef.current === expiredKey) {
      return;
    }

    lastExpiredAlertRef.current = expiredKey;

    const uniqueNames = [...new Set(expiredItems.map((item) => item.ingredient?.name ?? 'Unknown ingredient'))];
    const preview = uniqueNames.slice(0, 3).join(', ');
    const suffix = uniqueNames.length > 3 ? `, and ${uniqueNames.length - 3} more` : '';

    Alert.alert(
      'Expired pantry items',
      `You have ${expiredItems.length} expired item${expiredItems.length === 1 ? '' : 's'}: ${preview}${suffix}.`,
      [
        { text: 'Later', style: 'cancel' },
        {
          text: 'Remove expired',
          style: 'destructive',
          onPress: () => removeExpiredItems(expiredItems),
        },
      ]
    );
  };

  const fetchPantry = async (q = '', { quietSearch = false } = {}) => {
    const busySetter = quietSearch ? setSearchLoading : setLoading;
    busySetter(true);
    setError(null);
    try {
      const data = await getPantryItems(session.access_token, q);
      setPantry(data);
      if (!quietSearch) {
        maybeAlertExpiredItems(data);
      }
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
    setEditExpiryDate(null);
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
      expiry_date: editExpiryDate ? editExpiryDate.toISOString().split('T')[0] : null,
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
    setAddExpiryDate(null);
  };

  const cancelAddEntry = () => {
    setAddingIngredient(null);
    setAddQuantity('');
    setAddUnit('count');
    setAddExpiryDate(null);
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
        expiry_date: addExpiryDate ? addExpiryDate.toISOString().split('T')[0] : null,
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

  const markRanOut = async (entry) => {
    try {
      if (onMarkRanOut) {
        await onMarkRanOut({
          ingredient_id: entry.ingredient_id,
          ingredient: entry.ingredient,
          quantity: entry.quantity ?? 1,
          unit: entry.unit ?? 'count',
        });
      }
      await deletePantryItem(session.access_token, entry.pantry_ingredient_id);
      await fetchPantry(search, { quietSearch: true });
      Alert.alert('Added to shopping list', `${entry.ingredient?.name ?? 'Item'} was moved to your shopping list.`);
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to add item to shopping list');
    }
  };

  const groupedPantry = groupPantryItems(pantry);
  const visiblePantry = sortPantryItems(
    filterPantryItems(groupedPantry, filterMode, categoryMode),
    sortMode
  );
  const selectedSortOption = SORT_OPTIONS.find((option) => option.value === sortMode);
  const selectedFilterOption = FILTER_OPTIONS.find((option) => option.value === filterMode);
  const selectedCategoryOption = CATEGORY_OPTIONS.find((option) => option.value === categoryMode);

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
        <TouchableOpacity
          onPress={() => setIsFilterMenuOpen((current) => !current)}
          accessibilityRole="button"
          accessibilityLabel="Open sort and expiry filters"
          hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
          activeOpacity={0.75}
          style={[styles.filterButton, isFilterMenuOpen && styles.filterButtonActive]}
        >
          <Ionicons name="funnel-outline" size={20} color={isFilterMenuOpen ? COLORS.primary : COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      <SearchBar
        placeholder="Search pantry..."
        value={search}
        onChangeText={(text) => {
          setSearch(text);
          fetchPantry(text, { quietSearch: true });
        }}
      />

      <Text style={styles.filterSummary}>
        Sort: {selectedSortOption?.label ?? 'Alphabetical (A-Z)'} | Expiry: {selectedFilterOption?.label ?? 'All'} | Category: {selectedCategoryOption?.label ?? 'All'}
      </Text>

      {isFilterMenuOpen ? (
        <View style={styles.filterMenu}>
          <ScrollView
            style={styles.filterMenuScroll}
            contentContainerStyle={styles.filterMenuContent}
            showsVerticalScrollIndicator
            nestedScrollEnabled
          >
            <Text style={styles.filterSectionTitle}>Sort by</Text>
            {SORT_OPTIONS.map((option) => {
              const active = sortMode === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => setSortMode(option.value)}
                  style={styles.filterOptionRow}
                  accessibilityRole="button"
                  accessibilityLabel={`Sort by ${option.label}`}
                >
                  <Text style={[styles.filterOptionText, active && styles.filterOptionTextActive]}>{option.label}</Text>
                  {active ? <Ionicons name="checkmark" size={18} color={COLORS.primary} /> : null}
                </TouchableOpacity>
              );
            })}

            <Text style={styles.filterSectionTitle}>Filter by expiry</Text>
            {FILTER_OPTIONS.map((option) => {
              const active = filterMode === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => setFilterMode(option.value)}
                  style={styles.filterOptionRow}
                  accessibilityRole="button"
                  accessibilityLabel={`Filter by ${option.label}`}
                >
                  <Text style={[styles.filterOptionText, active && styles.filterOptionTextActive]}>{option.label}</Text>
                  {active ? <Ionicons name="checkmark" size={18} color={COLORS.primary} /> : null}
                </TouchableOpacity>
              );
            })}

            <Text style={styles.filterSectionTitle}>Filter by category</Text>
            {CATEGORY_OPTIONS.map((option) => {
              const active = categoryMode === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => setCategoryMode(option.value)}
                  style={styles.filterOptionRow}
                  accessibilityRole="button"
                  accessibilityLabel={`Filter category ${option.label}`}
                >
                  <Text style={[styles.filterOptionText, active && styles.filterOptionTextActive]}>{option.label}</Text>
                  {active ? <Ionicons name="checkmark" size={18} color={COLORS.primary} /> : null}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      {searchLoading && (
        <ActivityIndicator size="small" style={{ marginVertical: 8 }} />
      )}

      <FlatList
        style={styles.list}
        data={visiblePantry}
        keyExtractor={(item) => String(item.ingredient_id)}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {search || filterMode !== 'all'
              || categoryMode !== 'all'
              ? 'No pantry items match your current search or filters.'
              : 'No pantry items found.'}
          </Text>
        }
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
                `category: ${item.category}`,
                {
                  text: `next expiry: ${formatExpiry(item.nextExpiry)} (${getExpiryLabel(item.nextExpiry)})`,
                  iconName: 'ellipse',
                  iconColor: getExpiryColor(item.nextExpiry),
                },
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
                        <Text style={[styles.groupEntryText, styles[`expiry${getExpiryTone(entry.expiry_date)}`]]}>
                          expiry: {formatExpiry(entry.expiry_date)} ({getExpiryLabel(entry.expiry_date)})
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
                        <TouchableOpacity
                          onPress={() => markRanOut(entry)}
                          accessibilityRole="button"
                          accessibilityLabel={`Mark ${item.ingredient?.name ?? 'pantry item'} as ran out`}
                          style={[styles.entryActionButton, styles.entryActionSuccess]}
                        >
                          <Ionicons name="cart-outline" size={18} color={COLORS.success} />
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

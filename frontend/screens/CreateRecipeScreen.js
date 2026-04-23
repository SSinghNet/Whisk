import { useState, useEffect, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, Switch, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { createRecipe, getPantryItems } from '../lib/api';
import { COLORS } from '../styles/colors';
import styles from '../styles/CreateRecipeScreen.styles';

const UNIT_OPTIONS = [
  'count', 'gram', 'ounce', 'pound', 'milliliter', 'liter', 'gallon', 'cup', 'tablespoon', 'teaspoon',
];

const emptyIngredient = () => ({ name: '', amount: '', unit: 'count' });

export default function CreateRecipeScreen({ session, onCreated, onCancel }) {
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [ingredients, setIngredients] = useState([emptyIngredient()]);
  const [saving, setSaving] = useState(false);
  const [pantryItems, setPantryItems] = useState([]);

  useEffect(() => {
    getPantryItems(session.access_token)
      .then((data) => setPantryItems(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const pantryNameSet = useMemo(() => {
    const set = new Set();
    for (const item of pantryItems) {
      if (item.ingredient?.name) set.add(item.ingredient.name.toLowerCase().trim());
    }
    return set;
  }, [pantryItems]);

  const getPantryStatus = (name) => {
    const trimmed = name.trim().toLowerCase();
    if (!trimmed) return null;
    for (const pantryName of pantryNameSet) {
      if (pantryName.includes(trimmed) || trimmed.includes(pantryName)) return 'found';
    }
    return 'missing';
  };

  const addIngredient = () => setIngredients((prev) => [...prev, emptyIngredient()]);

  const removeIngredient = (index) =>
    setIngredients((prev) => prev.filter((_, i) => i !== index));

  const updateIngredient = (index, field, value) =>
    setIngredients((prev) =>
      prev.map((ing, i) => (i === index ? { ...ing, [field]: value } : ing))
    );

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Title is required');
      return;
    }

    const validIngredients = ingredients
      .filter((ing) => ing.name.trim())
      .map((ing) => ({
        name: ing.name.trim(),
        amount: ing.amount ? Number(ing.amount) : null,
        unit: ing.unit,
      }));

    setSaving(true);
    try {
      await createRecipe(session.access_token, {
        title: title.trim(),
        instructions: instructions.trim() || null,
        is_private: isPrivate,
        ingredients: validIngredients,
      });
      onCreated();
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to create recipe');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onCancel}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={22} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Create Recipe</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="Recipe title"
          placeholderTextColor={COLORS.placeholder}
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Instructions</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Step-by-step instructions..."
          placeholderTextColor={COLORS.placeholder}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          value={instructions}
          onChangeText={setInstructions}
        />

        <View style={styles.toggleRow}>
          <View>
            <Text style={styles.toggleLabel}>Private Recipe</Text>
            <Text style={styles.hint}>Only visible to you</Text>
          </View>
          <Switch
            value={isPrivate}
            onValueChange={setIsPrivate}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
            thumbColor={COLORS.surface}
          />
        </View>

        <Text style={styles.sectionTitle}>Ingredients</Text>

        {ingredients.map((ing, index) => {
          const status = getPantryStatus(ing.name);
          return (
            <View
              key={index}
              style={[
                styles.ingredientCard,
                status === 'found' && styles.ingredientCardFound,
                status === 'missing' && styles.ingredientCardMissing,
              ]}
            >
              <View style={styles.ingredientCardHeader}>
                <TextInput
                  style={[styles.input, styles.ingredientCardName]}
                  placeholder="Ingredient name"
                  placeholderTextColor={COLORS.placeholder}
                  value={ing.name}
                  onChangeText={(v) => updateIngredient(index, 'name', v)}
                />
                <View style={styles.ingredientStatusBadge}>
                  {status === 'found' && (
                    <View style={[styles.statusPill, styles.statusPillFound]}>
                      <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
                      <Text style={[styles.statusPillText, { color: COLORS.success }]}>In pantry</Text>
                    </View>
                  )}
                  {status === 'missing' && (
                    <View style={[styles.statusPill, styles.statusPillMissing]}>
                      <Ionicons name="close-circle-outline" size={14} color={COLORS.warning} />
                      <Text style={[styles.statusPillText, { color: COLORS.warning }]}>Not in pantry</Text>
                    </View>
                  )}
                </View>
                {ingredients.length > 1 && (
                  <TouchableOpacity
                    onPress={() => removeIngredient(index)}
                    accessibilityRole="button"
                    accessibilityLabel="Remove ingredient"
                    style={styles.removeBtn}
                  >
                    <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.ingredientCardAmounts}>
                <TextInput
                  style={[styles.input, styles.ingredientAmountInput]}
                  placeholder="Amount"
                  placeholderTextColor={COLORS.placeholder}
                  keyboardType="numeric"
                  value={ing.amount}
                  onChangeText={(v) => updateIngredient(index, 'amount', v)}
                />
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={ing.unit}
                    onValueChange={(v) => updateIngredient(index, 'unit', v)}
                    style={styles.picker}
                  >
                    {UNIT_OPTIONS.map((u) => (
                      <Picker.Item key={u} label={u} value={u} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>
          );
        })}

        <TouchableOpacity style={styles.addIngredientButton} onPress={addIngredient}>
          <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
          <Text style={styles.addIngredientText}>Add Ingredient</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
          accessibilityRole="button"
          accessibilityLabel="Save recipe"
        >
          {saving ? (
            <ActivityIndicator color={COLORS.buttonText} />
          ) : (
            <Text style={styles.saveButtonText}>Save Recipe</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

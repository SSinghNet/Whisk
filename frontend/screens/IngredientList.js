import { useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, TextInput
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/colors';
import IngredientCard from '../components/IngredientCard';
import { getIngredients, deleteIngredient, updateIngredient } from '../lib/api';
import styles from '../styles/IngredientList.styles';
export default function IngredientList({ session, onAdd }) {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  const fetchIngredients = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getIngredients(session?.access_token);
      setIngredients(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert("Delete", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive", onPress: async () => {
          try {
            await deleteIngredient(session?.access_token, id);
            await fetchIngredients();
          } catch {
            Alert.alert("Error", "Failed to delete ingredient");
          }
        }
      }
    ]);
  };

  const handleEditSave = async (id) => {
    if (!editingName.trim()) return;
    try {
      await updateIngredient(session?.access_token, id, editingName);
      setEditingId(null);
      setEditingName("");
      await fetchIngredients();
    } catch {
      Alert.alert("Error", "Failed to update ingredient");
    }
  };

  const handleEditStart = (item) => {
    setEditingId(item.ingredient_id);
    setEditingName(item.name);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingName("");
  };

  useEffect(() => { fetchIngredients(); }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;
  if (error) return <Text style={styles.error}>{error}</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ingredients</Text>
      <FlatList
        data={ingredients}
        keyExtractor={(item) => String(item.ingredient_id)}
        renderItem={({ item }) => (
          editingId === item.ingredient_id ? (
            <View style={styles.item}>
              <TextInput
                style={styles.editInput}
                autoCapitalize="none"
                value={editingName}
                onChangeText={setEditingName}
                autoFocus
              />
              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() => handleEditSave(item.ingredient_id)}
                  style={styles.iconAction}
                  accessibilityRole="button"
                  accessibilityLabel="Save"
                >
                  <Ionicons name="checkmark-circle" size={28} color={COLORS.success} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleEditCancel}
                  style={styles.iconAction}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel"
                >
                  <Ionicons name="close-circle-outline" size={28} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <IngredientCard
              title={item.name}
              actions={[
                { icon: 'add-circle', accessibilityLabel: 'Add to pantry', onPress: () => onAdd?.(item), variant: 'primary' },
                { icon: 'create-outline', accessibilityLabel: 'Edit', onPress: () => handleEditStart(item), variant: 'primary' },
                { icon: 'trash-outline', accessibilityLabel: 'Delete', onPress: () => handleDelete(item.ingredient_id), variant: 'danger' },
              ]}
              style={styles.item}
            />
          )
        )}
        ListEmptyComponent={<Text style={styles.empty}>No ingredients yet.</Text>}
      />
    </View>
  );
}

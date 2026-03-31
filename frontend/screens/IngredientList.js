import { useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, TextInput
} from "react-native";
import IngredientCard from '../components/IngredientCard';
import { getIngredients, deleteIngredient, updateIngredient } from '../lib/api';
import styles from '../styles/IngredientList.styles';
export default function IngredientList() {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  const fetchIngredients = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getIngredients();
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
            await deleteIngredient(id);
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
      await updateIngredient(id, editingName);
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
                <TouchableOpacity onPress={() => handleEditSave(item.ingredient_id)}>
                  <Text style={styles.save}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleEditCancel}>
                  <Text style={styles.cancel}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <IngredientCard
              title={item.name}
              actions={[
                { label: 'Edit', onPress: () => handleEditStart(item), variant: 'primary' },
                { label: 'Delete', onPress: () => handleDelete(item.ingredient_id), variant: 'danger' },
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

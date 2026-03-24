import { useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, TextInput
} from "react-native";
import Constants from 'expo-constants';

const host = Constants.expoConfig?.hostUri?.split(":")[0] ?? "localhost";
export const API_URL =
  process.env.EXPO_PUBLIC_APP_ENV === "production"
    ? "https://whisk-lznv.onrender.com"
    : `http://${host}:3000`;

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
      const res = await fetch(`${API_URL}/ingredient`);
      if (!res.ok) throw new Error("Failed to fetch ingredients");
      const data = await res.json();
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
            await fetch(`${API_URL}/ingredient/${id}`, { method: "DELETE" });
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
      const res = await fetch(`${API_URL}/ingredient/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingName.trim() }),
      });
      if (!res.ok) throw new Error("Failed to update ingredient");
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
          <View style={styles.item}>
            {editingId === item.ingredient_id ? (
              <>
                <TextInput
                  style={styles.editInput}
                  value={editingName}
                  onChangeText={setEditingName}
                  autoFocus
                />
                <TouchableOpacity onPress={() => handleEditSave(item.ingredient_id)}>
                  <Text style={styles.save}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleEditCancel}>
                  <Text style={styles.cancel}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.name}>{item.name}</Text>
                <TouchableOpacity onPress={() => handleEditStart(item)}>
                  <Text style={styles.edit}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.ingredient_id)}>
                  <Text style={styles.delete}>Delete</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No ingredients yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 12 },
  item: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingVertical: 12,
    borderBottomWidth: 1, borderColor: "#eee", gap: 8,
  },
  name: { fontSize: 16, flex: 1 },
  editInput: {
    flex: 1, borderWidth: 1, borderColor: "#ddd",
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, fontSize: 16,
  },
  edit: { color: "#2563eb", fontWeight: "500" },
  save: { color: "#16a34a", fontWeight: "500" },
  cancel: { color: "#6b7280", fontWeight: "500" },
  delete: { color: "#dc2626", fontWeight: "500" },
  empty: { color: "#999", textAlign: "center", marginTop: 40 },
  error: { color: "#dc2626", textAlign: "center", marginTop: 40 },
});
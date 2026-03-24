import { useState } from "react";
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform
} from "react-native";
import Constants from 'expo-constants';

const host = Constants.expoConfig?.hostUri?.split(":")[0] ?? "localhost";
export const API_URL =
  process.env.EXPO_PUBLIC_APP_ENV === "production"
    ? "https://whisk-lznv.onrender.com"
    : `http://${host}:3000`;



export default function IngredientForm({ onAdded }) {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleAdd = async () => {
        if (!name.trim()) return setError("Please enter an ingredient name");
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_URL}/ingredient`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name.trim() }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Failed to add ingredient");
            }
            setName("");
            onAdded?.();
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <View style={styles.container}>
                <Text style={styles.title}>Add Ingredient</Text>
                <View style={styles.row}>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Tomato"
                        value={name}
                        onChangeText={setName}
                        onSubmitEditing={handleAdd}
                        returnKeyType="done"
                    />
                    <TouchableOpacity style={styles.button} onPress={handleAdd} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Add</Text>}
                    </TouchableOpacity>
                </View>
                {error && <Text style={styles.error}>{error}</Text>}
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16 },
    title: { fontSize: 20, fontWeight: "600", marginBottom: 12 },
    row: { flexDirection: "row", gap: 8 },
    input: {
        flex: 1, borderWidth: 1, borderColor: "#ddd",
        borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16,
    },
    button: {
        backgroundColor: "#2563eb", borderRadius: 8,
        paddingHorizontal: 20, justifyContent: "center",
    },
    buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
    error: { color: "#dc2626", marginTop: 8, fontSize: 14 },
});
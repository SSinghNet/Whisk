import { useState } from "react";
import {
    View, Text, TextInput, TouchableOpacity,
    ActivityIndicator, KeyboardAvoidingView, Platform
} from "react-native";
import { createIngredient } from '../lib/api';
import styles from '../styles/IngredientForm.styles';



export default function IngredientForm({ session, onAdded }) {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleAdd = async () => {
        if (!name.trim()) return setError("Please enter an ingredient name");
        setLoading(true);
        setError(null);
        try {
            const headers = { "Content-Type": "application/json" };
            if (session?.access_token) {
                headers.Authorization = `Bearer ${session.access_token}`;
            }

            await createIngredient(session?.access_token, name);
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
                        autoCapitalize="none"
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

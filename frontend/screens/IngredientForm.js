import { useState } from "react";
import {
    View, Text, TextInput, TouchableOpacity,
    ActivityIndicator, KeyboardAvoidingView, Platform
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { createIngredient } from '../lib/api';
import styles from '../styles/IngredientForm.styles';
import { COLORS } from '../styles/colors';



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
                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleAdd}
                        disabled={loading}
                        accessibilityRole="button"
                        accessibilityLabel="Add ingredient"
                    >
                        {loading ? <ActivityIndicator color={COLORS.buttonText} /> : <Ionicons name="add-circle" size={26} color={COLORS.buttonText} />}
                    </TouchableOpacity>
                </View>
                {error && <Text style={styles.error}>{error}</Text>}
            </View>
        </KeyboardAvoidingView>
    );
}

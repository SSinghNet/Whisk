import { useEffect, useState } from 'react';
import {
    ActivityIndicator, FlatList, ScrollView, StatusBar,
    StyleSheet, Text, TouchableOpacity, View
} from 'react-native';
import Constants from 'expo-constants';

const host = Constants.expoConfig?.hostUri?.split(":")[0] ?? "localhost";
export const API_URL =
  process.env.EXPO_PUBLIC_APP_ENV === "production"
    ? "https://whisk-lznv.onrender.com"
    : `http://${host}:3000`;



function RecipeList({ recipes, onSelect }) {
    return (
        <View style={styles.container}>
            <Text style={styles.header}>Recipes</Text>
            <FlatList
                data={recipes}
                keyExtractor={item => String(item.id)}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.card} onPress={() => onSelect(item)}>
                        <Text style={styles.cardTitle}>{item.title}</Text>
                        <Text style={styles.meta}>
                            {(item.ingredients ?? []).length} ingredient{(item.ingredients ?? []).length !== 1 ? 's' : ''}
                        </Text>
                        <Text style={styles.ingredientPreview}>
                            {(item.ingredients ?? []).map(i => i.name).join(', ')}
                        </Text>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={styles.empty}>No recipes yet.</Text>}
            />
        </View>
    );
}

function RecipeDetail({ recipe, onBack }) {
    return (
        <ScrollView style={styles.container}>
            <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>

            <Text style={styles.header}>{recipe.title}</Text>

            <Text style={styles.sectionLabel}>Ingredients</Text>
            {recipe.ingredients.map((ing, idx) => (
                <View key={idx} style={styles.ingredientRow}>
                    <Text style={styles.ingredientName}>{ing.name}</Text>
                    <Text style={styles.ingredientAmount}>
                        {ing.amount != null ? `${ing.amount} ${ing.unit}` : ing.unit}
                    </Text>
                </View>
            ))}

            <Text style={styles.sectionLabel}>Instructions</Text>
            <Text style={styles.instructions}>
                {recipe.instructions ?? 'No instructions provided.'}
            </Text>
        </ScrollView>
    );
}

export default function App() {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        fetch(`${API_URL}/recipe`)
            .then(res => res.json())
            .then(data => setRecipes(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.center}>
                <Text style={styles.error}>Error: {error}</Text>
            </View>
        );
    }

    return (
        <>
            <StatusBar barStyle="dark-content" />
            {selected
                ? <RecipeDetail recipe={selected} onBack={() => setSelected(null)} />
                : <RecipeList recipes={recipes} onSelect={setSelected} />
            }
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 60,
        paddingHorizontal: 16,
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 16,
    },
    card: {
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        padding: 16,
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    meta: {
        fontSize: 13,
        color: '#888',
        marginBottom: 4,
    },
    ingredientPreview: {
        fontSize: 14,
        color: '#555',
    },
    backBtn: {
        marginBottom: 12,
    },
    backText: {
        fontSize: 16,
        color: '#007AFF',
    },
    sectionLabel: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 10,
    },
    ingredientRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    ingredientName: {
        fontSize: 15,
        color: '#222',
        textTransform: 'capitalize',
    },
    ingredientAmount: {
        fontSize: 15,
        color: '#555',
    },
    instructions: {
        fontSize: 15,
        color: '#333',
        lineHeight: 24,
        marginTop: 4,
        marginBottom: 40,
    },
    error: {
        color: 'red',
        fontSize: 14,
    },
    empty: {
        textAlign: 'center',
        color: '#aaa',
        marginTop: 40,
    },
});

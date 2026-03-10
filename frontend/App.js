import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StatusBar, StyleSheet, Text, View } from 'react-native';

const API_URL = 'http://10.75.243.13:3000';

export default function App() {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
        <View style={styles.container}>
            <StatusBar style="auto" />
            <Text style={styles.header}>Recipes</Text>
            <FlatList
                data={recipes}
                keyExtractor={item => String(item.id)}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={styles.meta}>
                            {item.ingredients.length} ingredient{item.ingredients.length !== 1 ? 's' : ''}
                        </Text>
                        <Text style={styles.ingredients}>
                            {item.ingredients.map(i => i.name).join(', ')}
                        </Text>
                    </View>
                )}
                ListEmptyComponent={<Text style={styles.empty}>No recipes yet.</Text>}
            />
        </View>
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
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    meta: {
        fontSize: 13,
        color: '#888',
        marginBottom: 4,
    },
    ingredients: {
        fontSize: 14,
        color: '#555',
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

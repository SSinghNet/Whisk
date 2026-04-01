import { useEffect, useState } from 'react';
import {
    ActivityIndicator, FlatList, ScrollView, StatusBar,
    Text, TouchableOpacity, View, SafeAreaView
} from 'react-native';
import IngredientForm from './screens/IngredientForm';
import BarcodeScannerScreen from './screens/BarcodeScannerScreen';
import PantryScreen from './screens/PantryScreen';
import AddPantryIngredientScreen from './screens/AddPantryIngredientScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import { supabase } from './lib/supabase';
import { getRecipes, createUserRecord } from './lib/api';
import styles from './styles/App.styles';

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
    const [session, setSession] = useState(null);
    const [authMode, setAuthMode] = useState('login');
    const [authLoading, setAuthLoading] = useState(false);
    const [authError, setAuthError] = useState(null);

    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [activeScreen, setActiveScreen] = useState('pantry');
    const [addIngredient, setAddIngredient] = useState(null);

    useEffect(() => {
        if (!session || activeScreen !== 'recipes') return;

        console.log(session.access_token)
        const fetchRecipes = async () => {
            setLoading(true);
            setError(null);

            try {
                const data = await getRecipes(session.access_token);
                if (!Array.isArray(data)) throw new Error('Invalid recipes response');
                setRecipes(data);
            } catch (err) {
                setError(err?.message || 'Failed to load recipes');
                setRecipes([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRecipes();
    }, [session, activeScreen]);

    async function handleLogin(formData) {
        setAuthLoading(true);
        setAuthError(null);

        const { data, error } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
        });

        if (error) {
            setAuthError(error.message);
            setAuthLoading(false);
            return;
        }

        setSession(data.session);
        setAuthLoading(false);
    }

    async function handleSignup(formData) {
        setAuthLoading(true);
        setAuthError(null);

        if (formData.password !== formData.confirmPassword) {
            setAuthError('Passwords do not match.');
            setAuthLoading(false);
            return;
        }

        const { data, error } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
        });

        if (error) {
            setAuthError(error.message);
            setAuthLoading(false);
            return;
        }

        await createUserRecord(data.session.access_token);

        setSession(data.session);
        setAuthLoading(false);
    }

    if (!session) {
        return authMode === 'login' ? (
            <LoginScreen
                onLogin={handleLogin}
                onSwitchToSignup={() => {
                    setAuthError(null);
                    setAuthMode('signup');
                }}
                loading={authLoading}
                error={authError}
            />
        ) : (
            <SignupScreen
                onSignup={handleSignup}
                onSwitchToLogin={() => {
                    setAuthError(null);
                    setAuthMode('login');
                }}
                loading={authLoading}
                error={authError}
            />
        );
    }

    if (activeScreen === 'recipes' && loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (activeScreen === 'recipes' && error) {
        return (
            <View style={styles.center}>
                <Text style={styles.error}>Error: {error}</Text>
            </View>
        );
    }

    async function handleLogout() {
        await supabase.auth.signOut();
        setSession(null);
        setRecipes([]);
        setSelectedRecipe(null);
        setActiveScreen('pantry');
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle='dark-content' />
            <View style={styles.topNav}>
                <TouchableOpacity onPress={() => setActiveScreen('recipes')} style={[styles.navButton, activeScreen === 'recipes' && styles.navActive]}>
                    <Text style={styles.navText}>Recipes</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveScreen('pantry')} style={[styles.navButton, activeScreen === 'pantry' && styles.navActive]}>
                    <Text style={styles.navText}>Pantry</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveScreen('scan')} style={[styles.navButton, activeScreen === 'scan' && styles.navActive]}>
                    <Text style={styles.navText}>Scan</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                    <Text style={styles.logoutText}>Log out</Text>
                </TouchableOpacity>
            </View>

            {activeScreen === 'recipes' && (
                selectedRecipe
                    ? <RecipeDetail recipe={selectedRecipe} onBack={() => setSelectedRecipe(null)} />
                    : <RecipeList recipes={recipes} onSelect={setSelectedRecipe} />
            )}

            {activeScreen === 'pantry' && (
                <PantryScreen
                    session={session}
                    onAdd={() => setActiveScreen('addPantry')}
                    onBack={() => setActiveScreen('recipes')}
                />
            )}

{activeScreen === 'addPantry' && (
                <AddPantryIngredientScreen
                    session={session}
                    initialIngredient={addIngredient}
                    onAdded={() => { setAddIngredient(null); setActiveScreen('pantry'); }}
                    onCancel={() => { setAddIngredient(null); setActiveScreen('pantry'); }}
                />
            )}
            {activeScreen === 'scan' && (
                <BarcodeScannerScreen
                    session={session}
                    onDone={() => setActiveScreen('pantry')}
                />
            )}

            {!['recipes','pantry','ingredients','addPantry','scan'].includes(activeScreen) && (
                <View style={styles.center}><Text>Unknown screen: {activeScreen}</Text></View>
            )}
            </SafeAreaView>
    );
}



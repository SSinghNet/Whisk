import { useEffect, useState } from 'react';
import {
    Alert, StatusBar,
    Text, TouchableOpacity, View, SafeAreaView
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import IngredientForm from './screens/IngredientForm';
import BarcodeScannerScreen from './screens/BarcodeScannerScreen';
import PantryScreen from './screens/PantryScreen';
import AddPantryIngredientScreen from './screens/AddPantryIngredientScreen';
import ShoppingListScreen from './screens/ShoppingListScreen';
import RecipeScreen from './screens/RecipeScreen';
import BrowseRecipesScreen from './screens/BrowseRecipesScreen';
import RecipeDetailScreen from './screens/RecipeDetailScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import UserProfileScreen from './screens/UserProfileScreen';
import { supabase } from './lib/supabase';
import { addPantryItem, addShoppingListItem, createUserRecord, deleteShoppingListItem, getShoppingList } from './lib/api';
import styles from './styles/App.styles';
import { COLORS } from './styles/colors';

export default function App() {
    const [session, setSession] = useState(null);
    const [authMode, setAuthMode] = useState('login');
    const [authLoading, setAuthLoading] = useState(false);
    const [authError, setAuthError] = useState(null);

    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [browsingRecipes, setBrowsingRecipes] = useState(false);
    const [activeScreen, setActiveScreen] = useState('pantry');
    const [addIngredient, setAddIngredient] = useState(null);
    const [shoppingListItems, setShoppingListItems] = useState([]);

    async function refreshShoppingList(currentSession = session) {
        if (!currentSession?.access_token) return;

        const data = await getShoppingList(currentSession.access_token);
        setShoppingListItems(Array.isArray(data) ? data : []);
    }

    async function addItemToShoppingList(item) {
        await addShoppingListItem(session.access_token, {
            ingredient_id: item.ingredient_id,
            quantity: item.quantity ?? 1,
            unit: item.unit ?? 'count',
        });
        await refreshShoppingList(session);
    }

    async function removeShoppingListItemByIngredient(ingredientId) {
        await deleteShoppingListItem(session.access_token, ingredientId);
        await refreshShoppingList(session);
    }

    async function moveShoppingListItemToPantry(item, pantryData = {}) {
        await addPantryItem(session.access_token, {
            ingredient_id: item.ingredient_id,
            quantity: pantryData.quantity ?? item.quantity ?? 1,
            unit: pantryData.unit ?? item.unit ?? 'count',
            expiry_date: pantryData.expiry_date ?? null,
        });
        await deleteShoppingListItem(session.access_token, item.ingredient_id);
        await refreshShoppingList(session);
    }

    useEffect(() => {
        if (!session?.access_token) {
            setShoppingListItems([]);
            return;
        }

        refreshShoppingList(session).catch((error) => {
            Alert.alert('Error', error.message || 'Failed to load shopping list');
        });
    }, [session]);

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

    async function handleLogout() {
        await supabase.auth.signOut();
        setSession(null);
        setSelectedRecipe(null);
        setBrowsingRecipes(false);
        setActiveScreen('pantry');
        setShoppingListItems([]);
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <StatusBar barStyle='dark-content' />

            {activeScreen === 'recipes' && (
                <View style={styles.mainContent}>
                    {selectedRecipe ? (
                        <RecipeDetailScreen
                            recipe={selectedRecipe}
                            onBack={() => setSelectedRecipe(null)}
                            session={session}
                            allowAddToList={browsingRecipes}
                        />
                    ) : browsingRecipes ? (
                        <BrowseRecipesScreen
                            session={session}
                            onBack={() => setBrowsingRecipes(false)}
                            onSelectRecipe={setSelectedRecipe}
                        />
                    ) : (
                        <RecipeScreen
                            session={session}
                            onOpenBrowse={() => setBrowsingRecipes(true)}
                            onSelectRecipe={setSelectedRecipe}
                        />
                    )}
                </View>
            )}

            {activeScreen === 'pantry' && (
                <View style={styles.mainContent}>
                    <PantryScreen
                        session={session}
                        onAdd={() => setActiveScreen('addPantry')}
                        onBack={() => setActiveScreen('recipes')}
                        onMarkRanOut={addItemToShoppingList}
                    />
                </View>
            )}

            {activeScreen === 'addPantry' && (
                <View style={styles.mainContent}>
                    <AddPantryIngredientScreen
                        session={session}
                        initialIngredient={addIngredient}
                        onAdded={() => { setAddIngredient(null); setActiveScreen('pantry'); }}
                        onCancel={() => { setAddIngredient(null); setActiveScreen('pantry'); }}
                    />
                </View>
            )}
            {activeScreen === 'shoppingList' && (
                <View style={styles.mainContent}>
                    <ShoppingListScreen
                        items={shoppingListItems}
                        onRemoveItem={removeShoppingListItemByIngredient}
                        onMoveToPantry={moveShoppingListItemToPantry}
                    />
                </View>
            )}
            {activeScreen === 'scan' && (
                <View style={styles.mainContent}>
                    <BarcodeScannerScreen
                        session={session}
                        onDone={() => setActiveScreen('pantry')}
                    />
                </View>
            )}

            {activeScreen === 'profile' && (
                <View style={styles.mainContent}>
                    <UserProfileScreen
                        session={session}
                        onLogout={handleLogout}
                    />
                </View>
            )}

            {!['recipes','pantry','ingredients','addPantry','scan','shoppingList','profile'].includes(activeScreen) && (
                <View style={styles.center}><Text>Unknown screen: {activeScreen}</Text></View>
            )}

            <View style={styles.bottomNav}>
                <TouchableOpacity 
                    onPress={() => setActiveScreen('pantry')} 
                    style={[styles.bottomNavButton, activeScreen === 'pantry' && styles.bottomNavActive]}
                >
                    <MaterialCommunityIcons 
                        name="basket" 
                        size={24} 
                        color={activeScreen === 'pantry' ? COLORS.primary : COLORS.textMuted}
                    />
                    <Text style={[styles.bottomNavText, activeScreen === 'pantry' && styles.bottomNavTextActive]}>Pantry</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={() => setActiveScreen('scan')} 
                    style={[styles.bottomNavButton, activeScreen === 'scan' && styles.bottomNavActive]}
                >
                    <MaterialCommunityIcons 
                        name="camera" 
                        size={24} 
                        color={activeScreen === 'scan' ? COLORS.primary : COLORS.textMuted}
                    />
                    <Text style={[styles.bottomNavText, activeScreen === 'scan' && styles.bottomNavTextActive]}>Scan</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={() => setActiveScreen('shoppingList')} 
                    style={[styles.bottomNavButton, activeScreen === 'shoppingList' && styles.bottomNavActive]}
                >
                    <MaterialCommunityIcons 
                        name="cart-outline" 
                        size={24} 
                        color={activeScreen === 'shoppingList' ? COLORS.primary : COLORS.textMuted}
                    />
                    <Text style={[styles.bottomNavText, activeScreen === 'shoppingList' && styles.bottomNavTextActive]}>Shopping</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => { setActiveScreen('recipes'); setBrowsingRecipes(false); setSelectedRecipe(null); }}
                    style={[styles.bottomNavButton, activeScreen === 'recipes' && styles.bottomNavActive]}
                >
                    <MaterialCommunityIcons
                        name="book-open"
                        size={24}
                        color={activeScreen === 'recipes' ? COLORS.primary : COLORS.textMuted}
                    />
                    <Text style={[styles.bottomNavText, activeScreen === 'recipes' && styles.bottomNavTextActive]}>Recipes</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setActiveScreen('profile')}
                    style={[styles.bottomNavButton, activeScreen === 'profile' && styles.bottomNavActive]}
                >
                    <MaterialCommunityIcons
                        name="account-circle-outline"
                        size={24}
                        color={activeScreen === 'profile' ? COLORS.primary : COLORS.textMuted}
                    />
                    <Text style={[styles.bottomNavText, activeScreen === 'profile' && styles.bottomNavTextActive]}>Profile</Text>
                </TouchableOpacity>
            </View>
            </SafeAreaView>
    );
}



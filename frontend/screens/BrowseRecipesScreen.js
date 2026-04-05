import { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import RecipeCard from '../components/RecipeCard';
import SearchBar from '../components/SearchBar';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import ScreenHeader from '../components/ScreenHeader';
import EmptyState from '../components/EmptyState';
import { getRecipes, addRecipeToUser } from '../lib/api';
import styles from '../styles/RecipeScreen.styles';

export default function BrowseRecipesScreen({ session, onBack, onSelectRecipe }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const fetchRecipes = async (q = '', { quietSearch = false } = {}) => {
    const busySetter = quietSearch ? setSearchLoading : setLoading;
    busySetter(true);
    setError(null);
    try {
      const allRecipes = await getRecipes(session.access_token);
      const filtered = Array.isArray(allRecipes)
        ? allRecipes.filter((r) =>
            r.title.toLowerCase().includes(q.toLowerCase())
          )
        : [];
      setRecipes(filtered);
    } catch (e) {
      setError(e.message);
      setRecipes([]);
    } finally {
      busySetter(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const handleSearch = (text) => {
    setSearch(text);
    fetchRecipes(text, { quietSearch: true });
  };

  const handleAdd = (recipeId) => {
    Alert.alert('Add Recipe', 'Add this recipe to your saved recipes?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Add',
        style: 'default',
        onPress: async () => {
          try {
            await addRecipeToUser(session.access_token, recipeId);
            Alert.alert('Success', 'Recipe added to your list!');
          } catch (e) {
            if (e.message.includes('already added')) {
              Alert.alert('Info', 'This recipe is already in your list.');
            } else {
              Alert.alert('Error', 'Failed to add recipe: ' + e.message);
            }
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Browse Recipes" onBack={onBack} />

      <ErrorMessage message={error} />

      <SearchBar
        value={search}
        onChangeText={handleSearch}
        placeholder="Search recipes..."
      />

      {loading && <LoadingSpinner />}
      
      {!loading && (
        <FlatList
          data={recipes}
          keyExtractor={(item) => String(item.recipe_id)}
          renderItem={({ item }) => (
            <RecipeCard
              title={item.title}
              details={[
                `${item.recipe_ingredient?.length || 0} ingredient${item.recipe_ingredient?.length !== 1 ? 's' : ''}`,
                item.yield_amount ? `Yield: ${item.yield_amount}${item.yield_unit ? ' ' + item.yield_unit : ''}` : '',
              ].filter(Boolean)}
              onPress={() => onSelectRecipe(item)}
              actions={[
                {
                  icon: 'add-circle',
                  accessibilityLabel: 'Add recipe',
                  variant: 'success',
                  onPress: () => handleAdd(item.recipe_id),
                },
              ]}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon={search ? 'search-outline' : 'compass-outline'}
              message={
                search ? 'No recipes match your search.' : 'No recipes available.'
              }
            />
          }
        />
      )}
    </View>
  );
}

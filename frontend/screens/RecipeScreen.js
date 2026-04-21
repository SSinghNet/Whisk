import { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Text,
} from 'react-native';
import RecipeCard from '../components/RecipeCard';
import SearchBar from '../components/SearchBar';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import ScreenHeader from '../components/ScreenHeader';
import FloatingActionButton from '../components/FloatingActionButton';
import EmptyState from '../components/EmptyState';
import { getUserRecipes, removeRecipeFromUser } from '../lib/api';
import styles from '../styles/RecipeScreen.styles';
import { Alert } from 'react-native';

export default function RecipeScreen({ session, onOpenBrowse, onCreateRecipe, onSelectRecipe }) {
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
      const data = await getUserRecipes(session.access_token, q);
      setRecipes(Array.isArray(data) ? data : []);
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

  const handleRemove = (recipeId) => {
    Alert.alert('Remove Recipe', 'Remove this recipe from your list?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeRecipeFromUser(session.access_token, recipeId);
            await fetchRecipes(search, { quietSearch: true });
          } catch (e) {
            Alert.alert('Error', 'Failed to remove recipe: ' + e.message);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Recipes" />
      
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
                  icon: 'remove-circle-outline',
                  accessibilityLabel: 'Remove recipe',
                  variant: 'danger',
                  onPress: () => handleRemove(item.recipe_id),
                },
              ]}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon={search ? 'search-outline' : 'book-outline'}
              message={
                search ? 'No recipes match your search.' : 'No recipes yet. Tap + to add one!'
              }
            />
          }
        />
      )}

      <FloatingActionButton
        onPress={() =>
          Alert.alert('Add Recipe', null, [
            { text: 'Create Custom Recipe', onPress: onCreateRecipe },
            { text: 'Browse Recipes', onPress: onOpenBrowse },
            { text: 'Cancel', style: 'cancel' },
          ])
        }
        accessibilityLabel="Add recipe"
      />
    </View>
  );
}

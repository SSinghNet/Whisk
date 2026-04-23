import { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RecipeCard from '../components/RecipeCard';
import SearchBar from '../components/SearchBar';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import ScreenHeader from '../components/ScreenHeader';
import FloatingActionButton from '../components/FloatingActionButton';
import EmptyState from '../components/EmptyState';
import { getUserRecipes, removeRecipeFromUser } from '../lib/api';
import styles from '../styles/RecipeScreen.styles';
import { COLORS, THEME } from '../styles/colors';
import { Alert } from 'react-native';

export default function RecipeScreen({ session, onOpenBrowse, onCreateRecipe, onSelectRecipe }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [showAddMenu, setShowAddMenu] = useState(false);

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
        onPress={() => setShowAddMenu(true)}
        accessibilityLabel="Add recipe"
      />

      <Modal
        visible={showAddMenu}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddMenu(false)}
      >
        <TouchableOpacity
          style={sheetStyles.overlay}
          activeOpacity={1}
          onPress={() => setShowAddMenu(false)}
        />
        <View style={sheetStyles.sheet}>
          <View style={sheetStyles.handle} />
          <Text style={sheetStyles.sheetTitle}>Add Recipe</Text>

          <TouchableOpacity
            style={sheetStyles.option}
            onPress={() => { setShowAddMenu(false); onCreateRecipe(); }}
            activeOpacity={0.7}
          >
            <View style={[sheetStyles.optionIconWrap, { backgroundColor: COLORS.primarySoft }]}>
              <Ionicons name="create-outline" size={22} color={COLORS.primary} />
            </View>
            <View style={sheetStyles.optionBody}>
              <Text style={sheetStyles.optionTitle}>Create Custom Recipe</Text>
              <Text style={sheetStyles.optionSubtitle}>Build your own from scratch</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <View style={sheetStyles.divider} />

          <TouchableOpacity
            style={sheetStyles.option}
            onPress={() => { setShowAddMenu(false); onOpenBrowse(); }}
            activeOpacity={0.7}
          >
            <View style={[sheetStyles.optionIconWrap, { backgroundColor: COLORS.successSoft }]}>
              <Ionicons name="search-outline" size={22} color={COLORS.success} />
            </View>
            <View style={sheetStyles.optionBody}>
              <Text style={sheetStyles.optionTitle}>Browse Recipes</Text>
              <Text style={sheetStyles.optionSubtitle}>Explore the recipe library</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={sheetStyles.cancelBtn}
            onPress={() => setShowAddMenu(false)}
            activeOpacity={0.7}
          >
            <Text style={sheetStyles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const sheetStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: THEME.sizing.radius.xxl,
    borderTopRightRadius: THEME.sizing.radius.xxl,
    paddingHorizontal: THEME.spacing.lg,
    paddingBottom: THEME.spacing.xxl + THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
    ...THEME.shadow.medium,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginBottom: THEME.spacing.lg,
  },
  sheetTitle: {
    fontSize: THEME.typography.fontSize.xl,
    fontWeight: THEME.typography.fontWeight.bold,
    color: COLORS.text,
    marginBottom: THEME.spacing.lg,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: THEME.spacing.md,
    gap: THEME.spacing.md,
  },
  optionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: THEME.sizing.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionBody: {
    flex: 1,
  },
  optionTitle: {
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.semibold,
    color: COLORS.text,
  },
  optionSubtitle: {
    fontSize: THEME.typography.fontSize.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: THEME.spacing.xs,
  },
  cancelBtn: {
    marginTop: THEME.spacing.lg,
    alignItems: 'center',
    paddingVertical: THEME.spacing.md,
  },
  cancelText: {
    fontSize: THEME.typography.fontSize.base,
    color: COLORS.textSecondary,
    fontWeight: THEME.typography.fontWeight.medium,
  },
});

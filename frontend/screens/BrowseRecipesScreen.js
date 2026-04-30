import { useState, useRef } from 'react';
import {
  View,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SearchBar from '../components/SearchBar';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import ScreenHeader from '../components/ScreenHeader';
import EmptyState from '../components/EmptyState';
import { searchEdamamRecipes } from '../lib/api';
import { COLORS, THEME } from '../styles/colors';

export default function BrowseRecipesScreen({ session, onBack, onSelectRecipe }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const debounceTimer = useRef(null);

  const fetchRecipes = async (q) => {
    if (!q.trim()) {
      setRecipes([]);
      setHasSearched(false);
      return;
    }
    setLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const data = await searchEdamamRecipes(session.access_token, q);
      setRecipes(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearch(text);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => fetchRecipes(text), 500);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Browse Recipes" onBack={onBack} />

      <SearchBar
        value={search}
        onChangeText={handleSearch}
        placeholder="Search millions of recipes..."
      />

      <ErrorMessage message={error} />

      {loading && <LoadingSpinner />}

      {!loading && !hasSearched && (
        <EmptyState
          icon="search-outline"
          message="Search for any dish, ingredient, or cuisine"
        />
      )}

      {!loading && hasSearched && (
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.edamam_id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => onSelectRecipe(item)}
              activeOpacity={0.75}
            >
              {item.image_url ? (
                <Image source={{ uri: item.image_url }} style={styles.cardImage} />
              ) : (
                <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
                  <Ionicons name="restaurant-outline" size={28} color={COLORS.textMuted} />
                </View>
              )}
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                <View style={styles.cardMeta}>
                  {item.source && (
                    <Text style={styles.cardSource} numberOfLines={1}>{item.source}</Text>
                  )}
                  {item.yield_amount && (
                    <Text style={styles.cardYield}>· {item.yield_amount} servings</Text>
                  )}
                </View>
                {item.meal_type?.length > 0 && (
                  <View style={styles.tagRow}>
                    {item.meal_type.slice(0, 2).map((t) => (
                      <View key={t} style={styles.tag}>
                        <Text style={styles.tagText}>{t}</Text>
                      </View>
                    ))}
                    {item.diet_labels?.slice(0, 1).map((t) => (
                      <View key={t} style={[styles.tag, styles.tagGreen]}>
                        <Text style={[styles.tagText, styles.tagTextGreen]}>{t}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} style={styles.chevron} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <EmptyState
              icon="search-outline"
              message="No recipes found. Try a different search."
            />
          }
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: THEME.spacing.lg,
  },
  list: {
    paddingBottom: THEME.spacing.xxl,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: THEME.sizing.radius.lg,
    marginBottom: THEME.spacing.md,
    overflow: 'hidden',
    ...THEME.shadow.light,
  },
  cardImage: {
    width: 90,
    height: 90,
  },
  cardImagePlaceholder: {
    backgroundColor: COLORS.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    flex: 1,
    padding: THEME.spacing.md,
    gap: THEME.spacing.xs,
  },
  cardTitle: {
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.semibold,
    color: COLORS.text,
    lineHeight: 20,
  },
  cardMeta: {
    flexDirection: 'row',
    gap: THEME.spacing.xs,
    alignItems: 'center',
  },
  cardSource: {
    fontSize: THEME.typography.fontSize.xs,
    color: COLORS.textMuted,
    flex: 1,
  },
  cardYield: {
    fontSize: THEME.typography.fontSize.xs,
    color: COLORS.textMuted,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: THEME.spacing.xs,
    marginTop: 2,
  },
  tag: {
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: 2,
    borderRadius: THEME.sizing.radius.full,
  },
  tagGreen: {
    backgroundColor: COLORS.successSoft,
  },
  tagText: {
    fontSize: THEME.typography.fontSize.xs,
    color: COLORS.primary,
    fontWeight: THEME.typography.fontWeight.medium,
    textTransform: 'capitalize',
  },
  tagTextGreen: {
    color: COLORS.success,
  },
  chevron: {
    marginRight: THEME.spacing.sm,
  },
});

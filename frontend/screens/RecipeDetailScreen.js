import { useEffect, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppButton from '../components/AppButton';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import RecipeMissingSummary from '../components/RecipeMissingSummary';
import RecipeIngredientStatusCard from '../components/RecipeIngredientStatusCard';
import styles from '../styles/RecipeScreen.styles';
import { COLORS } from '../styles/colors';
import { addRecipeToUser, getRecipe, makeRecipe, importEdamamRecipe } from '../lib/api';

const STATUS_CONFIG = {
  missing: {
    icon: 'close-circle',
    color: COLORS.danger,
    label: 'Missing from pantry',
  },
  insufficient: {
    icon: 'help-circle',
    color: COLORS.warning,
    label: 'Not enough in pantry',
  },
  available: {
    icon: 'checkmark-circle',
    color: COLORS.success,
    label: 'Available in pantry',
  },
};

const getRecipeId = (recipe) => recipe?.recipe_id;

export default function RecipeDetailScreen({
  recipe,
  onBack,
  session,
  allowAddToList = false,
}) {
  const [recipeDetail, setRecipeDetail] = useState(recipe);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadRecipe = async () => {
    const recipeId = getRecipeId(recipe);

    if (!session?.access_token || !recipeId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getRecipe(session.access_token, recipeId);
      setRecipeDetail(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setRecipeDetail(recipe);
    if (!recipe?.edamam_id && !recipe?.ai_suggestion) loadRecipe();
  }, [recipe?.recipe_id, recipe?.edamam_id, recipe?.ai_suggestion]);

  const handleImportEdamam = () => {
    Alert.alert('Add Recipe', 'Save this recipe to your list?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Add',
        onPress: async () => {
          setActionLoading(true);
          try {
            await importEdamamRecipe(session.access_token, {
              title: currentRecipe.title,
              image_url: currentRecipe.image_url,
              yield_amount: currentRecipe.yield_amount,
              yield_unit: null,
              ingredients: (currentRecipe.recipe_ingredient || []).map((ing) => ({
                name: ing.ingredient?.name || '',
                amount: ing.amount,
                unit: ing.unit,
              })),
            });
            Alert.alert('Added!', 'Recipe saved to your list.');
          } catch (e) {
            Alert.alert('Error', e.message);
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  const handleAddToList = () => {
    Alert.alert('Add Recipe', 'Add this recipe to your saved recipes?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Add',
        style: 'default',
        onPress: async () => {
          try {
            await addRecipeToUser(session.access_token, getRecipeId(recipe));
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

  const handleMakeRecipe = () => {
    Alert.alert(
      'Make Recipe',
      'Use the ingredients from your pantry for this recipe?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Make Recipe',
          onPress: async () => {
            setActionLoading(true);
            setError(null);

            try {
              const updatedRecipe = await makeRecipe(session.access_token, getRecipeId(recipe));
              setRecipeDetail(updatedRecipe);
              Alert.alert('Success', 'Pantry ingredients were deducted for this recipe.');
            } catch (e) {
              Alert.alert('Unable to make recipe', e.message);
              await loadRecipe();
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const currentRecipe = recipeDetail || recipe;
  const isExternal = !!currentRecipe?.edamam_id;
  const isAiSuggestion = !!currentRecipe?.ai_suggestion;
  const summary = currentRecipe?.pantry_status_summary;

  return (
    <ScrollView style={styles.detailContainer} contentContainerStyle={styles.detailScrollContent}>
      <TouchableOpacity
        onPress={onBack}
        style={styles.backButton}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Ionicons name="chevron-back" size={26} color={COLORS.primary} />
      </TouchableOpacity>

      <ErrorMessage message={error} />

      {loading ? <LoadingSpinner /> : null}

      {isAiSuggestion && (
        <View style={styles.aiBadge}>
          <Text style={styles.aiBadgeText}>✦ AI Generated</Text>
        </View>
      )}

      {isExternal && currentRecipe.image_url && (
        <Image
          source={{ uri: currentRecipe.image_url }}
          style={styles.heroImage}
          resizeMode="cover"
        />
      )}

      <Text style={styles.recipeName}>{currentRecipe.title}</Text>

      {isExternal && currentRecipe.source && (
        <Text style={styles.recipeSource}>from {currentRecipe.source}</Text>
      )}

      {!isExternal && <RecipeMissingSummary summary={summary} statusConfig={STATUS_CONFIG} />}

      {currentRecipe.yield_amount && (
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>Yield</Text>
          <Text style={styles.instructions}>
            {currentRecipe.yield_amount} {currentRecipe.yield_unit || ''}
          </Text>
        </View>
      )}

      {isAiSuggestion && currentRecipe.ingredients?.length > 0 && (
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>Ingredients</Text>
          {currentRecipe.ingredients.map((line, i) => (
            <Text key={i} style={styles.ingredientLine}>· {line}</Text>
          ))}
        </View>
      )}

      {isExternal && !isAiSuggestion && currentRecipe.ingredient_lines?.length > 0 && (
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>Ingredients</Text>
          {currentRecipe.ingredient_lines.map((line, i) => (
            <Text key={i} style={styles.ingredientLine}>· {line}</Text>
          ))}
        </View>
      )}

      {!isExternal && currentRecipe.recipe_ingredient?.length > 0 && (
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>Ingredients</Text>
          {currentRecipe.recipe_ingredient.map((ing) => (
            <RecipeIngredientStatusCard
              key={ing.ingredient_id}
              ingredient={ing}
              statusConfig={STATUS_CONFIG}
            />
          ))}
        </View>
      )}

      {currentRecipe.instructions && (
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>Instructions</Text>
          <Text style={styles.instructions}>{currentRecipe.instructions}</Text>
        </View>
      )}

      {isAiSuggestion ? (
        <AppButton
          title="Save to my recipes"
          onPress={() => {
            Alert.alert('Save Recipe', 'Save this AI-generated recipe to your list?', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Save',
                onPress: async () => {
                  setActionLoading(true);
                  try {
                    await importEdamamRecipe(session.access_token, {
                      title: currentRecipe.title,
                      image_url: null,
                      yield_amount: null,
                      ingredients: (currentRecipe.ingredients || []).map((ing) => ({
                        name: ing,
                        amount: null,
                        unit: null,
                      })),
                    });
                    Alert.alert('Saved!', 'Recipe added to your list.');
                  } catch (e) {
                    Alert.alert('Error', e.message);
                  } finally {
                    setActionLoading(false);
                  }
                },
              },
            ]);
          }}
          loading={actionLoading}
          disabled={actionLoading}
          style={styles.recipeActionButton}
        />
      ) : isExternal ? (
        <AppButton
          title="Add to my recipes"
          onPress={handleImportEdamam}
          loading={actionLoading}
          disabled={actionLoading}
          style={styles.recipeActionButton}
        />
      ) : (
        <>
          <AppButton
            title="Make Recipe"
            onPress={handleMakeRecipe}
            disabled={actionLoading || !summary?.can_make_recipe}
            loading={actionLoading}
            style={styles.recipeActionButton}
          />
          {allowAddToList && session ? (
            <AppButton
              title="Add to my recipes"
              onPress={handleAddToList}
              style={styles.recipeActionButton}
            />
          ) : null}
        </>
      )}
    </ScrollView>
  );
}

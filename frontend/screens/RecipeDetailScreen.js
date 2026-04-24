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

const formatYield = (recipe) => {
  if (!recipe?.yield_amount) return null;
  return [recipe.yield_amount, recipe.yield_unit && recipe.yield_unit !== 'count' ? recipe.yield_unit : null]
    .filter(Boolean)
    .join(' ');
};

const getAiIngredientLine = (ingredient) => {
  if (typeof ingredient === 'string') return ingredient;
  if (ingredient?.display) return ingredient.display;

  const amount = ingredient?.amount != null ? String(ingredient.amount) : null;
  const unit = ingredient?.unit && ingredient.unit !== 'count' ? ingredient.unit : null;
  return [amount, unit, ingredient?.name].filter(Boolean).join(' ');
};

const getMakeRecipeErrorMessage = (error, summary) => {
  if (!summary?.make_recipe_blockers?.length) {
    return error.message;
  }

  const missingAmounts = summary.make_recipe_blockers.filter((item) => item.reason === 'missing_amount');
  if (missingAmounts.length) {
    const names = missingAmounts.map((item) => item.name).join(', ');
    return `This recipe is missing ingredient amounts for: ${names}. Add amounts before making it.`;
  }

  return error.message;
};

const shouldDisableMakeRecipe = (summary) => {
  if (!summary?.make_recipe_blockers?.length) {
    return false;
  }

  return summary.make_recipe_blockers.some((item) => item.reason !== 'missing_amount');
};

export default function RecipeDetailScreen({
  recipe,
  onBack,
  session,
  allowAddToList = false,
  onAddIngredientToShoppingList = null,
}) {
  const [recipeDetail, setRecipeDetail] = useState(recipe);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [addListLoading, setAddListLoading] = useState(false);
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
    if (!recipe?.edamam_id && !recipe?.ai_suggestion && recipe?.recipe_id) {
      loadRecipe();
    }
  }, [recipe?.recipe_id, recipe?.edamam_id, recipe?.ai_suggestion, recipe?.pantry_status_summary]);

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
              instructions: currentRecipe.instructions,
              yield_amount: currentRecipe.yield_amount,
              yield_unit: currentRecipe.yield_unit,
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
              const updatedRecipe = await makeRecipe(session.access_token, getRecipeId(currentRecipe));
              setRecipeDetail(updatedRecipe);
              Alert.alert('Success', 'Pantry ingredients were deducted for this recipe.');
            } catch (e) {
              Alert.alert(
                'Unable to make recipe',
                getMakeRecipeErrorMessage(e, e.details || currentRecipe?.pantry_status_summary)
              );
              await loadRecipe();
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleAddIngredientToShoppingList = async (ingredient) => {
    if (!onAddIngredientToShoppingList) {
      return;
    }

    try {
      await onAddIngredientToShoppingList({
        ingredient_id: ingredient.ingredient_id,
        ingredient: ingredient.ingredient,
        quantity: ingredient.amount ?? 1,
        unit: ingredient.unit ?? 'count',
      });
      Alert.alert(
        'Added to shopping list',
        `${ingredient.ingredient?.name ?? 'Ingredient'} was added to your shopping list.`
      );
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to add ingredient to shopping list');
    }
  };

  const handleAddAllMissingToShoppingList = async () => {
    const missing = (currentRecipe.recipe_ingredient || []).filter((ing) => {
      const s = ing.pantry_status?.status;
      return s === 'missing' || s === 'insufficient';
    });

    if (!missing.length || !onAddIngredientToShoppingList) return;

    setAddListLoading(true);
    let added = 0;
    for (const ing of missing) {
      try {
        await onAddIngredientToShoppingList({
          ingredient_id: ing.ingredient_id,
          ingredient: ing.ingredient,
          quantity: ing.amount ?? 1,
          unit: ing.unit ?? 'count',
        });
        added++;
      } catch {
        // already on list — skip
      }
    }
    setAddListLoading(false);
    Alert.alert(
      'Shopping list updated',
      `${added} ingredient${added !== 1 ? 's' : ''} added to your shopping list.`
    );
  };

  const currentRecipe = recipeDetail || recipe;
  const isExternal = !!currentRecipe?.edamam_id;
  const isAiSuggestion = !!currentRecipe?.ai_suggestion;
  const summary = currentRecipe?.pantry_status_summary;
  const makeRecipeDisabled = actionLoading || shouldDisableMakeRecipe(summary);

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

      {formatYield(currentRecipe) && (
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>Yield</Text>
          <Text style={styles.instructions}>{formatYield(currentRecipe)}</Text>
        </View>
      )}

      {isAiSuggestion && currentRecipe.ingredients?.length > 0 && (
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>Ingredients</Text>
          {currentRecipe.ingredients.map((line, i) => (
            <Text key={i} style={styles.ingredientLine}>· {getAiIngredientLine(line)}</Text>
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
              onAddToShoppingList={() => handleAddIngredientToShoppingList(ing)}
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
                      instructions: currentRecipe.instructions,
                      yield_amount: currentRecipe.yield_amount,
                      yield_unit: currentRecipe.yield_unit,
                      ingredients: (currentRecipe.ingredients || []).map((ing) => ({
                        name: typeof ing === 'string' ? ing : ing.name,
                        amount: typeof ing === 'string' ? null : ing.amount,
                        unit: typeof ing === 'string' ? 'count' : ing.unit,
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
          {onAddIngredientToShoppingList && summary?.missing_ingredients?.length > 0 && (
            <AppButton
              title={`Add ${summary.missing_ingredients.length} missing to shopping list`}
              variant="secondary"
              onPress={handleAddAllMissingToShoppingList}
              loading={addListLoading}
              disabled={addListLoading || actionLoading}
              style={styles.recipeActionButton}
            />
          )}
          <AppButton
            title="Make Recipe"
            onPress={handleMakeRecipe}
            disabled={makeRecipeDisabled}
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

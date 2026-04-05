import { ScrollView, View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppButton from '../components/AppButton';
import styles from '../styles/RecipeScreen.styles';
import { COLORS } from '../styles/colors';
import { addRecipeToUser } from '../lib/api';

export default function RecipeDetailScreen({
  recipe,
  onBack,
  session,
  allowAddToList = false,
}) {
  const handleAddToList = () => {
    Alert.alert('Add Recipe', 'Add this recipe to your saved recipes?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Add',
        style: 'default',
        onPress: async () => {
          try {
            await addRecipeToUser(session.access_token, recipe.recipe_id);
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
    <ScrollView
      style={styles.detailContainer}
      contentContainerStyle={allowAddToList ? styles.detailScrollContent : undefined}
    >
      <TouchableOpacity
        onPress={onBack}
        style={styles.backButton}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Ionicons name="chevron-back" size={26} color={COLORS.primary} />
      </TouchableOpacity>

      <Text style={styles.recipeName}>{recipe.title}</Text>

      {recipe.yield_amount && (
        <View style={{ marginBottom: 16 }}>
          <Text style={styles.sectionLabel}>Yield</Text>
          <Text style={styles.instructions}>
            {recipe.yield_amount} {recipe.yield_unit || ''}
          </Text>
        </View>
      )}

      {recipe.recipe_ingredient && recipe.recipe_ingredient.length > 0 && (
        <View style={{ marginBottom: 16 }}>
          <Text style={styles.sectionLabel}>Ingredients</Text>
          {recipe.recipe_ingredient.map((ing, idx) => (
            <View key={idx} style={styles.ingredientRow}>
              <Text style={styles.ingredientName}>{ing.ingredient.name}</Text>
              <Text style={styles.ingredientAmount}>
                {ing.amount != null ? `${ing.amount} ${ing.unit}` : ing.unit}
              </Text>
            </View>
          ))}
        </View>
      )}

      {recipe.instructions && (
        <View style={{ marginBottom: 16 }}>
          <Text style={styles.sectionLabel}>Instructions</Text>
          <Text style={styles.instructions}>{recipe.instructions}</Text>
        </View>
      )}

      {allowAddToList && session ? (
        <AppButton
          title="Add to my recipes"
          onPress={handleAddToList}
          style={{ marginTop: 8 }}
        />
      ) : null}
    </ScrollView>
  );
}

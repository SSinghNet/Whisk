import prisma from '../../src/lib/prisma.js';

export async function ensureAppUserExists(supabaseUid, email) {
  let user = await prisma.app_user.findUnique({
    where: { supabase_uid: supabaseUid },
  });

  if (!user) {
    user = await prisma.app_user.create({
      data: {
        supabase_uid: supabaseUid,
        email,
      },
    });
  }

  return user;
}

export async function createTestIngredient(name = `ingredient-${Date.now()}`) {
  return prisma.ingredient.create({
    data: { name },
  });
}

export async function deletePantryItem(userId, ingredientId) {
  await prisma.pantry_ingredient.deleteMany({
    where: {
      user_id: userId,
      ingredient_id: ingredientId,
    },
  });
}

export async function deleteIngredient(ingredientId) {
  await prisma.ingredient.deleteMany({
    where: { ingredient_id: ingredientId },
  });
}
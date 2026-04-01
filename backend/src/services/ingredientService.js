import prisma from "../lib/prisma.js"

export const getIngredients = async (search) => {
  const where = search
    ? { name: { contains: search, mode: 'insensitive' } }
    : {}

  return await prisma.ingredient.findMany({ where })
}

export const getIngredientById = async (id) => {
  return await prisma.ingredient.findUnique({
    where: { ingredient_id: Number(id) }
  })
}

export const postIngredient = async (name) => {
  return await prisma.ingredient.create({
    data: { name }
  })
}

export const updateIngredient = async (id, name) => {
  const ingredientId = Number(id)

  const existing = await prisma.ingredient.findUnique({
    where: { ingredient_id: ingredientId }
  })

  if (!existing) {
    return null
  }

  return await prisma.ingredient.update({
    where: { ingredient_id: ingredientId },
    data: { name }
  })
}

export const deleteIngredient = async (id) => {
  const ingredientId = Number(id)

  const existing = await prisma.ingredient.findUnique({
    where: { ingredient_id: ingredientId }
  })

  if (!existing) {
    return null
  }

  return await prisma.ingredient.delete({
    where: { ingredient_id: ingredientId }
  })
}
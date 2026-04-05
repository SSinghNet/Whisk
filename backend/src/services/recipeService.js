import prisma from "../lib/prisma.js"
import { resolveUserId } from "./userService.js"

export const getRecipes = async (search) => {
    const where = search ? {
        title: { contains: search, mode: 'insensitive' },
    } : undefined

    return await prisma.recipe.findMany({
        where,
        include: {
            recipe_ingredient: {
                include: { ingredient: true },
            },
        },
        orderBy: { created_at: 'desc' },
    })
}

export const getUserRecipes = async (supabaseUid, search) => {
    const user_id = await resolveUserId(supabaseUid)

    const where = {
        user_recipe: {
            some: {
                user_id,
            },
        },
        ...(search ? {
            title: { contains: search, mode: 'insensitive' },
        } : {}),
    }

    return await prisma.recipe.findMany({
        where,
        include: {
            recipe_ingredient: {
                include: { ingredient: true },
            },
        },
        orderBy: { created_at: 'desc' },
    })
}

export const getRecipe = async (supabaseUid, recipeId) => {
    const user_id = await resolveUserId(supabaseUid)

    const recipe = await prisma.recipe.findUnique({
        where: { recipe_id: Number(recipeId) },
        include: {
            recipe_ingredient: {
                include: { ingredient: true },
            },
            user_recipe: {
                where: { user_id },
            },
        },
    })

    if (!recipe || recipe.user_recipe.length === 0) {
        return null
    }

    return recipe
}

export const createRecipe = async (data) => {
    return await prisma.recipe.create({
        data: {
            title: data.title,
            instructions: data.instructions || null,
            image_url: data.image_url || null,
            yield_amount: data.yield_amount || null,
            yield_unit: data.yield_unit || null,
        },
        include: {
            recipe_ingredient: {
                include: { ingredient: true },
            },
        },
    })
}

export const updateRecipe = async (recipeId, data) => {
    const existing = await prisma.recipe.findUnique({
        where: { recipe_id: Number(recipeId) },
    })

    if (!existing) {
        return null
    }

    const updateData = {}
    if (data.title !== undefined) updateData.title = data.title
    if (data.instructions !== undefined) updateData.instructions = data.instructions
    if (data.image_url !== undefined) updateData.image_url = data.image_url
    if (data.yield_amount !== undefined) updateData.yield_amount = data.yield_amount
    if (data.yield_unit !== undefined) updateData.yield_unit = data.yield_unit

    return await prisma.recipe.update({
        where: { recipe_id: Number(recipeId) },
        data: updateData,
        include: {
            recipe_ingredient: {
                include: { ingredient: true },
            },
        },
    })
}

export const deleteRecipe = async (recipeId) => {
    const existing = await prisma.recipe.findUnique({
        where: { recipe_id: Number(recipeId) },
    })

    if (!existing) {
        return false
    }

    await prisma.recipe.delete({
        where: { recipe_id: Number(recipeId) },
    })

    return true
}

export const addRecipeToUser = async (supabaseUid, recipeId) => {
    const user_id = await resolveUserId(supabaseUid)

    const recipe = await prisma.recipe.findUnique({
        where: { recipe_id: Number(recipeId) },
    })

    if (!recipe) {
        const error = new Error('Recipe not found')
        error.statusCode = 404
        throw error
    }

    const existing = await prisma.user_recipe.findUnique({
        where: {
            user_id_recipe_id: {
                user_id,
                recipe_id: Number(recipeId),
            },
        },
    })

    if (existing) {
        const error = new Error('Recipe already added by user')
        error.statusCode = 409
        throw error
    }

    return await prisma.user_recipe.create({
        data: {
            user_id,
            recipe_id: Number(recipeId),
        },
    })
}

export const removeRecipeFromUser = async (supabaseUid, recipeId) => {
    const user_id = await resolveUserId(supabaseUid)

    const existing = await prisma.user_recipe.findUnique({
        where: {
            user_id_recipe_id: {
                user_id,
                recipe_id: Number(recipeId),
            },
        },
    })

    if (!existing) {
        return false
    }

    await prisma.user_recipe.delete({
        where: {
            user_id_recipe_id: {
                user_id,
                recipe_id: Number(recipeId),
            },
        },
    })

    return true
}

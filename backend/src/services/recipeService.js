import prisma from "../lib/prisma.js"
import { resolveUserId } from "./userService.js"

const recipeInclude = {
    recipe_ingredient: {
        include: { ingredient: true },
    },
}

const toNumber = (value) => value == null ? null : Number(value)

const sortPantryItemsForUse = (items) => [...items].sort((a, b) => {
    const aExpiry = a.expiry_date ? new Date(a.expiry_date).getTime() : Number.MAX_SAFE_INTEGER
    const bExpiry = b.expiry_date ? new Date(b.expiry_date).getTime() : Number.MAX_SAFE_INTEGER

    if (aExpiry !== bExpiry) {
        return aExpiry - bExpiry
    }

    return Number(a.pantry_ingredient_id) - Number(b.pantry_ingredient_id)
})

const buildPantryLookup = (pantryItems) => pantryItems.reduce((lookup, item) => {
    const ingredientId = Number(item.ingredient_id)
    const existing = lookup.get(ingredientId) || []
    existing.push(item)
    lookup.set(ingredientId, existing)
    return lookup
}, new Map())

const buildIngredientAvailability = (recipeIngredient, pantryItems) => {
    const pantryEntries = pantryItems.map((item) => ({
        pantry_ingredient_id: Number(item.pantry_ingredient_id),
        quantity: toNumber(item.quantity),
        unit: item.unit,
        expiry_date: item.expiry_date,
    }))
    const requiredAmount = toNumber(recipeIngredient.amount)
    const requiredUnit = recipeIngredient.unit
    const matchingUnitEntries = pantryEntries.filter((item) => item.unit === requiredUnit)
    const knownMatchingQuantity = matchingUnitEntries.reduce(
        (total, item) => total + (item.quantity ?? 0),
        0
    )
    const hasMatchingQuantity = matchingUnitEntries.some((item) => item.quantity != null)

    let status = 'missing'
    let missingQuantity = requiredAmount
    let reason = 'not_in_pantry'

    if (pantryEntries.length > 0) {
        if (requiredAmount == null) {
            status = 'available'
            missingQuantity = 0
            reason = 'presence_only'
        } else if (knownMatchingQuantity >= requiredAmount) {
            status = 'available'
            missingQuantity = 0
            reason = 'enough_quantity'
        } else {
            status = 'insufficient'
            missingQuantity = hasMatchingQuantity ? Math.max(requiredAmount - knownMatchingQuantity, 0) : requiredAmount
            reason = matchingUnitEntries.length === 0
                ? 'unit_mismatch'
                : hasMatchingQuantity
                    ? 'insufficient_quantity'
                    : 'unknown_quantity'
        }
    }

    const deductionSupported = requiredAmount != null
    const canDeduct = deductionSupported && status === 'available'

    return {
        ...recipeIngredient,
        amount: requiredAmount,
        pantry_status: {
            status,
            reason,
            required_quantity: requiredAmount,
            required_unit: requiredUnit,
            pantry_quantity: hasMatchingQuantity ? knownMatchingQuantity : null,
            pantry_items: pantryEntries,
            missing_quantity: missingQuantity,
            missing_unit: requiredAmount == null || missingQuantity === 0 ? null : requiredUnit,
            deduction_supported: deductionSupported,
            can_deduct: canDeduct,
        },
    }
}

const buildRecipeAvailability = (recipe, pantryItems) => {
    const pantryLookup = buildPantryLookup(pantryItems)
    const recipeIngredients = recipe.recipe_ingredient.map((recipeIngredient) =>
        buildIngredientAvailability(
            recipeIngredient,
            pantryLookup.get(Number(recipeIngredient.ingredient_id)) || []
        )
    )

    const missingIngredients = recipeIngredients
        .filter(({ pantry_status }) => pantry_status.status !== 'available')
        .map(({ ingredient_id, ingredient, pantry_status }) => ({
            ingredient_id: Number(ingredient_id),
            name: ingredient.name,
            status: pantry_status.status,
            missing_quantity: pantry_status.missing_quantity,
            missing_unit: pantry_status.missing_unit,
            reason: pantry_status.reason,
        }))

    const makeRecipeBlockers = recipeIngredients
        .filter(({ pantry_status }) => !pantry_status.can_deduct)
        .map(({ ingredient_id, ingredient, pantry_status }) => ({
            ingredient_id: Number(ingredient_id),
            name: ingredient.name,
            reason: pantry_status.deduction_supported ? pantry_status.reason : 'missing_amount',
            status: pantry_status.status,
        }))

    return {
        ...recipe,
        recipe_ingredient: recipeIngredients,
        pantry_status_summary: {
            available_count: recipeIngredients.filter(({ pantry_status }) => pantry_status.status === 'available').length,
            insufficient_count: recipeIngredients.filter(({ pantry_status }) => pantry_status.status === 'insufficient').length,
            missing_count: recipeIngredients.filter(({ pantry_status }) => pantry_status.status === 'missing').length,
            missing_ingredients: missingIngredients,
            make_recipe_blockers: makeRecipeBlockers,
            can_make_recipe: makeRecipeBlockers.length === 0,
        },
    }
}

const getPantryItemsForRecipe = async (db, userId, recipe) => {
    const ingredientIds = recipe.recipe_ingredient.map(({ ingredient_id }) => Number(ingredient_id))

    if (!ingredientIds.length) {
        return []
    }

    return db.pantry_ingredient.findMany({
        where: {
            user_id: userId,
            ingredient_id: { in: ingredientIds },
        },
        orderBy: [
            { expiry_date: 'asc' },
            { pantry_ingredient_id: 'asc' },
        ],
    })
}

export const getRecipes = async (search) => {
    const where = search ? {
        title: { contains: search, mode: 'insensitive' },
    } : undefined

    return await prisma.recipe.findMany({
        where,
        include: recipeInclude,
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
        include: recipeInclude,
        orderBy: { created_at: 'desc' },
    })
}

export const getRecipe = async (supabaseUid, recipeId) => {
    const user_id = await resolveUserId(supabaseUid)

    const recipe = await prisma.recipe.findUnique({
        where: { recipe_id: Number(recipeId) },
        include: recipeInclude,
    })

    if (!recipe) {
        return null
    }

    const pantryItems = await getPantryItemsForRecipe(prisma, user_id, recipe)

    return buildRecipeAvailability(recipe, pantryItems)
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
        include: recipeInclude,
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
        include: recipeInclude,
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

export const makeRecipe = async (supabaseUid, recipeId) => {
    const user_id = await resolveUserId(supabaseUid)

    try {
        return await prisma.$transaction(async (tx) => {
            const recipe = await tx.recipe.findUnique({
                where: { recipe_id: Number(recipeId) },
                include: recipeInclude,
            })

            if (!recipe) {
                const error = new Error('Recipe not found')
                error.statusCode = 404
                throw error
            }

            const pantryItems = await getPantryItemsForRecipe(tx, user_id, recipe)
            const recipeWithAvailability = buildRecipeAvailability(recipe, pantryItems)

            if (!recipeWithAvailability.pantry_status_summary.can_make_recipe) {
                const error = new Error('Recipe cannot be made with current pantry ingredients')
                error.statusCode = 409
                error.details = recipeWithAvailability.pantry_status_summary
                throw error
            }

            const pantryLookup = buildPantryLookup(pantryItems)

            for (const recipeIngredient of recipeWithAvailability.recipe_ingredient) {
                const requiredAmount = recipeIngredient.pantry_status.required_quantity
                let remaining = requiredAmount
                const matchingPantryItems = sortPantryItemsForUse(
                    (pantryLookup.get(Number(recipeIngredient.ingredient_id)) || [])
                        .filter((item) => item.unit === recipeIngredient.unit && item.quantity != null)
                )

                for (const pantryItem of matchingPantryItems) {
                    if (remaining <= 0) {
                        break
                    }

                    const itemQuantity = Number(pantryItem.quantity)
                    const nextQuantity = Math.max(itemQuantity - remaining, 0)
                    remaining = Math.max(remaining - itemQuantity, 0)

                    if (nextQuantity === 0) {
                        await tx.pantry_ingredient.delete({
                            where: { pantry_ingredient_id: Number(pantryItem.pantry_ingredient_id) },
                        })
                    } else {
                        await tx.pantry_ingredient.update({
                            where: { pantry_ingredient_id: Number(pantryItem.pantry_ingredient_id) },
                            data: { quantity: nextQuantity },
                        })
                    }
                }
            }

            const updatedPantryItems = await getPantryItemsForRecipe(tx, user_id, recipe)
            return buildRecipeAvailability(recipe, updatedPantryItems)
        })
    } catch (error) {
        throw error
    }
}

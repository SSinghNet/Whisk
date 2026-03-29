import prisma from "../lib/prisma.js"
import { resolveUserId } from "./userService.js"

export const getPantry = async (supabaseUid, search) => {
    const user_id = await resolveUserId(supabaseUid)

    const where = {
        user_id,
        ...(search ? {
            ingredient: {
                name: { contains: search, mode: 'insensitive' },
            },
        } : {}),
    }

    return await prisma.pantry_ingredient.findMany({
        where,
        include: { ingredient: true },
    })
}

export const getPantryIngredient = async (supabaseUid, ingredientId) => {
    const user_id = await resolveUserId(supabaseUid)

    return await prisma.pantry_ingredient.findUnique({
        where: {
            user_id_ingredient_id: {
                user_id,
                ingredient_id: Number(ingredientId),
            },
        },
        include: { ingredient: true },
    })
}

export const postPantryIngredient = async (supabaseUid, data) => {
    const user_id = await resolveUserId(supabaseUid)

    const existing = await prisma.pantry_ingredient.findUnique({
        where: {
            user_id_ingredient_id: {
                user_id,
                ingredient_id: Number(data.ingredient_id),
            },
        },
    })

    if (existing) {
        const error = new Error('Ingredient already exists in pantry')
        error.statusCode = 409
        throw error
    }

    return await prisma.pantry_ingredient.create({
        data: {
            user_id,
            ingredient_id: Number(data.ingredient_id),
            quantity: data.quantity === undefined ? null : data.quantity,
            unit: data.unit,
            expiry_date: data.expiry_date ? new Date(data.expiry_date) : null,
        },
        include: { ingredient: true },
    })
}

export const updatePantryIngredient = async (supabaseUid, ingredientId, data) => {
    const user_id = await resolveUserId(supabaseUid)

    const existing = await prisma.pantry_ingredient.findUnique({
        where: {
            user_id_ingredient_id: {
                user_id,
                ingredient_id: Number(ingredientId),
            },
        },
    })

    if (!existing) {
        return null
    }

    const updateData = {}
    if (data.quantity !== undefined) updateData.quantity = data.quantity
    if (data.unit !== undefined) updateData.unit = data.unit
    if (data.expiry_date !== undefined) updateData.expiry_date = data.expiry_date ? new Date(data.expiry_date) : null

    return await prisma.pantry_ingredient.update({
        where: {
            user_id_ingredient_id: {
                user_id,
                ingredient_id: Number(ingredientId),
            },
        },
        data: updateData,
        include: { ingredient: true },
    })
}

export const deletePantryIngredient = async (supabaseUid, ingredientId) => {
    const user_id = await resolveUserId(supabaseUid)

    const existing = await prisma.pantry_ingredient.findUnique({
        where: {
            user_id_ingredient_id: {
                user_id,
                ingredient_id: Number(ingredientId),
            },
        },
    })

    if (!existing) {
        return null
    }

    await prisma.pantry_ingredient.delete({
        where: {
            user_id_ingredient_id: {
                user_id,
                ingredient_id: Number(ingredientId),
            },
        },
    })

    return existing
}
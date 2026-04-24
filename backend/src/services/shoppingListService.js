import prisma from '../lib/prisma.js'
import { resolveUserId } from './userService.js'

const toNumber = (value) => Number(value)

export const getShoppingList = async (supabaseUid) => {
    const user_id = await resolveUserId(supabaseUid)

    return await prisma.user_shoppinglist.findMany({
        where: { user_id },
        include: { ingredient: true },
        orderBy: [
            { ingredient: { name: 'asc' } },
            { ingredient_id: 'asc' },
        ],
    })
}

export const postShoppingListItem = async (supabaseUid, data) => {
    const user_id = await resolveUserId(supabaseUid)
    const ingredient_id = toNumber(data.ingredient_id)
    const quantity = data.quantity === undefined ? 1 : toNumber(data.quantity)

    const existing = await prisma.user_shoppinglist.findFirst({
        where: {
            user_id,
            ingredient_id,
        },
        include: { ingredient: true },
    })

    if (existing) {
        return await prisma.user_shoppinglist.update({
            where: {
                ingredient_id_user_id: {
                    ingredient_id,
                    user_id,
                },
            },
            data: {
                quantity: (Number(existing.quantity) || 0) + quantity,
                unit: data.unit ?? existing.unit,
            },
            include: { ingredient: true },
        })
    }

    return await prisma.user_shoppinglist.create({
        data: {
            user_id,
            ingredient_id,
            quantity,
            unit: data.unit ?? 'count',
        },
        include: { ingredient: true },
    })
}

export const deleteShoppingListItem = async (supabaseUid, ingredientId) => {
    const user_id = await resolveUserId(supabaseUid)
    const ingredient_id = toNumber(ingredientId)

    const existing = await prisma.user_shoppinglist.findFirst({
        where: {
            user_id,
            ingredient_id,
        },
    })

    if (!existing) {
        return null
    }

    await prisma.user_shoppinglist.delete({
        where: {
            ingredient_id_user_id: {
                ingredient_id,
                user_id,
            },
        },
    })

    return existing
}
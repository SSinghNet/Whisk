import { jest } from '@jest/globals'

const mockPrisma = {
  pantry_ingredient: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}

const mockResolveUserId = jest.fn()

jest.unstable_mockModule('../../src/lib/prisma.js', () => ({
  default: mockPrisma,
}))

jest.unstable_mockModule('../../src/services/userService.js', () => ({
  resolveUserId: mockResolveUserId,
}))

const pantryService = await import('../../src/services/pantryService.js')

describe('pantryService (unit)', () => {
  const mockUserId = 1

  beforeEach(() => {
    jest.clearAllMocks()
    mockResolveUserId.mockResolvedValue(mockUserId)
  })

  describe('postPantryIngredient', () => {
    test('creates a pantry item when not existing', async () => {
      mockPrisma.pantry_ingredient.findUnique.mockResolvedValue(null)

      mockPrisma.pantry_ingredient.create.mockResolvedValue({
        user_id: mockUserId,
        ingredient_id: 10,
        quantity: 3,
        unit: 'cup',
      })

      const result = await pantryService.postPantryIngredient('uid', {
        ingredient_id: 10,
        quantity: 3,
        unit: 'cup',
      })

      expect(result).toHaveProperty('ingredient_id', 10)
      expect(mockPrisma.pantry_ingredient.create).toHaveBeenCalledWith({
        data: {
          user_id: mockUserId,
          ingredient_id: 10,
          quantity: 3,
          unit: 'cup',
          expiry_date: null,
        },
        include: { ingredient: true },
      })
    })

    test('throws error if ingredient already exists', async () => {
      mockPrisma.pantry_ingredient.findUnique.mockResolvedValue({ ingredient_id: 10 })

      await expect(
        pantryService.postPantryIngredient('uid', {
          ingredient_id: 10,
        })
      ).rejects.toMatchObject({
        message: 'Ingredient already exists in pantry',
        statusCode: 409,
      })
    })
  })

  describe('updatePantryIngredient', () => {
    test('returns null if ingredient not found', async () => {
      mockPrisma.pantry_ingredient.findUnique.mockResolvedValue(null)

      const result = await pantryService.updatePantryIngredient('uid', 10, {
        quantity: 5,
      })

      expect(result).toBeNull()
    })

    test('updates only provided fields', async () => {
      mockPrisma.pantry_ingredient.findUnique.mockResolvedValue({ ingredient_id: 10 })

      mockPrisma.pantry_ingredient.update.mockResolvedValue({
        ingredient_id: 10,
        quantity: 5,
      })

      const result = await pantryService.updatePantryIngredient('uid', 10, {
        quantity: 5,
      })

      expect(mockPrisma.pantry_ingredient.update).toHaveBeenCalledWith({
        where: {
          user_id_ingredient_id: {
            user_id: mockUserId,
            ingredient_id: 10,
          },
        },
        data: { quantity: 5 },
        include: { ingredient: true },
      })

      expect(result.quantity).toBe(5)
    })
  })

  describe('deletePantryIngredient', () => {
    test('returns null if ingredient not found', async () => {
      mockPrisma.pantry_ingredient.findUnique.mockResolvedValue(null)

      const result = await pantryService.deletePantryIngredient('uid', 10)

      expect(result).toBeNull()
    })

    test('deletes ingredient if found', async () => {
      mockPrisma.pantry_ingredient.findUnique.mockResolvedValue({
        ingredient_id: 10,
      })

      mockPrisma.pantry_ingredient.delete.mockResolvedValue({})

      const result = await pantryService.deletePantryIngredient('uid', 10)

      expect(mockPrisma.pantry_ingredient.delete).toHaveBeenCalledWith({
        where: {
          user_id_ingredient_id: {
            user_id: mockUserId,
            ingredient_id: 10,
          },
        },
      })

      expect(result).toHaveProperty('ingredient_id', 10)
    })
  })
})
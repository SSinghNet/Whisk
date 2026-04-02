import { jest } from '@jest/globals'

const mockPrisma = {
  ingredient: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}

jest.unstable_mockModule('../../src/lib/prisma.js', () => ({
  default: mockPrisma,
}))

const ingredientService = await import('../../src/services/ingredientService.js')

describe('ingredientService (unit)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getIngredients', () => {
    test('returns all ingredients when no search is provided', async () => {
      mockPrisma.ingredient.findMany.mockResolvedValue([
        { ingredient_id: 1, name: 'rice' },
        { ingredient_id: 2, name: 'beans' },
      ])

      const result = await ingredientService.getIngredients()

      expect(mockPrisma.ingredient.findMany).toHaveBeenCalledWith({
        where: {},
      })
      expect(result).toHaveLength(2)
    })

    test('filters ingredients when search is provided', async () => {
      mockPrisma.ingredient.findMany.mockResolvedValue([
        { ingredient_id: 1, name: 'rice' },
      ])

      const result = await ingredientService.getIngredients('rice')

      expect(mockPrisma.ingredient.findMany).toHaveBeenCalledWith({
        where: {
          name: { contains: 'rice', mode: 'insensitive' },
        },
      })
      expect(result).toEqual([{ ingredient_id: 1, name: 'rice' }])
    })
  })

  describe('getIngredientById', () => {
    test('returns ingredient by id', async () => {
      mockPrisma.ingredient.findUnique.mockResolvedValue({
        ingredient_id: 1,
        name: 'rice',
      })

      const result = await ingredientService.getIngredientById(1)

      expect(mockPrisma.ingredient.findUnique).toHaveBeenCalledWith({
        where: { ingredient_id: 1 },
      })
      expect(result).toEqual({ ingredient_id: 1, name: 'rice' })
    })
  })

  describe('postIngredient', () => {
    test('creates an ingredient', async () => {
      mockPrisma.ingredient.create.mockResolvedValue({
        ingredient_id: 1,
        name: 'rice',
      })

      const result = await ingredientService.postIngredient('rice')

      expect(mockPrisma.ingredient.create).toHaveBeenCalledWith({
        data: { name: 'rice' },
      })
      expect(result).toEqual({ ingredient_id: 1, name: 'rice' })
    })
  })

  describe('updateIngredient', () => {
    test('returns null if ingredient does not exist', async () => {
      mockPrisma.ingredient.findUnique.mockResolvedValue(null)

      const result = await ingredientService.updateIngredient(1, 'brown rice')

      expect(result).toBeNull()
    })

    test('updates ingredient name if ingredient exists', async () => {
      mockPrisma.ingredient.findUnique.mockResolvedValue({
        ingredient_id: 1,
        name: 'rice',
      })

      mockPrisma.ingredient.update.mockResolvedValue({
        ingredient_id: 1,
        name: 'brown rice',
      })

      const result = await ingredientService.updateIngredient(1, 'brown rice')

      expect(mockPrisma.ingredient.update).toHaveBeenCalledWith({
        where: { ingredient_id: 1 },
        data: { name: 'brown rice' },
      })
      expect(result).toEqual({
        ingredient_id: 1,
        name: 'brown rice',
      })
    })
  })

  describe('deleteIngredient', () => {
    test('returns null if ingredient does not exist', async () => {
      mockPrisma.ingredient.findUnique.mockResolvedValue(null)

      const result = await ingredientService.deleteIngredient(1)

      expect(result).toBeNull()
    })

    test('deletes ingredient if it exists', async () => {
      mockPrisma.ingredient.findUnique.mockResolvedValue({
        ingredient_id: 1,
        name: 'rice',
      })

      mockPrisma.ingredient.delete.mockResolvedValue({
        ingredient_id: 1,
        name: 'rice',
      })

      const result = await ingredientService.deleteIngredient(1)

      expect(mockPrisma.ingredient.delete).toHaveBeenCalledWith({
        where: { ingredient_id: 1 },
      })
      expect(result).toEqual({
        ingredient_id: 1,
        name: 'rice',
      })
    })
  })
})
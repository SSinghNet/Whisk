import { Router } from 'express'
import { getIngredients, getIngredient, postIngredient, updateIngredient, deleteIngredient } from '../controllers/ingredientController.js'

const router = Router()

router.get('/', getIngredients)
router.get('/:id', getIngredient)
router.post('/', postIngredient)
router.patch('/:id', updateIngredient)
router.delete('/:id', deleteIngredient)

export default router
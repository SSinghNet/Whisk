import { Router } from "express"
import { getPantry, getPantryIngredient, postPantryIngredient, updatePantryIngredient, deletePantryIngredient } from "../controllers/pantryController.js"

const router = Router()

router.get('/', getPantry)
router.get('/:id', getPantryIngredient)
router.post('/', postPantryIngredient)
router.patch('/:id', updatePantryIngredient)
router.delete('/:id', deletePantryIngredient)

export default router
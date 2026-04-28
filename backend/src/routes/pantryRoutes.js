import { Router } from "express"
import { getPantry, getPantryIngredient, postPantryIngredient, updatePantryIngredient, deletePantryIngredient } from "../controllers/pantryController.js"
import { validate } from '../middleware/validate.js'
import { IdParamSchema, SearchQuerySchema } from "../schemas/shared.schema.js"
import { PantryIngredientCreateSchema, PantryIngredientUpdateSchema } from "../schemas/pantry.schema.js"

const router = Router()

router.get('/', validate({query: SearchQuerySchema}), getPantry)
router.get('/:id',validate({params:IdParamSchema}), getPantryIngredient)
router.post('/', validate({body: PantryIngredientCreateSchema}),postPantryIngredient)
router.patch('/:id',validate({body: PantryIngredientUpdateSchema, params:IdParamSchema}), updatePantryIngredient)
router.delete('/:id', validate({params:IdParamSchema}), deletePantryIngredient)

export default router
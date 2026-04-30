import { Router } from 'express'
import { validate } from '../middleware/validate.js'
import { getIngredients, getIngredient, postIngredient, updateIngredient, deleteIngredient } from '../controllers/ingredientController.js'
import { IdParamSchema, SearchQuerySchema } from "../schemas/shared.schema.js"
import { IngredientCreateSchema } from "../schemas/ingredient.schema.js"

const router = Router()

router.get('/',validate({query: SearchQuerySchema}),getIngredients)
router.get('/:id',validate({params:IdParamSchema}), getIngredient)
router.post('/', validate({body:IngredientCreateSchema}),postIngredient)
router.patch('/:id', validate({body:IngredientCreateSchema, params:IdParamSchema}),updateIngredient)
router.delete('/:id', validate({params:IdParamSchema}), deleteIngredient)

export default router
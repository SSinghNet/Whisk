import { Router } from "express"
import {
    getRecipes,
    getUserRecipes,
    getRecipe,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    addRecipeToUser,
    removeRecipeFromUser,
    makeRecipe,
} from "../controllers/recipeController.js"

const router = Router()

router.get('/', getRecipes)
router.get('/user', getUserRecipes)
router.get('/:id', getRecipe)
router.post('/', createRecipe)
router.patch('/:id', updateRecipe)
router.delete('/:id', deleteRecipe)
router.post('/:id/users', addRecipeToUser)
router.delete('/:id/users', removeRecipeFromUser)
router.post('/:id/make', makeRecipe)

export default router

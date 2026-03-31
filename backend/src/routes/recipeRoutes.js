import { Router } from "express";
import { getRecipes, getRecipe } from "../controllers/recipeController.js";

const router = Router();

router.get('/', getRecipes);
router.get('/:id', getRecipe);

export default router;

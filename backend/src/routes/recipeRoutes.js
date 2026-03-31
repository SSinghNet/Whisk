import { Router } from "express";
import {
  getRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe
} from "../controllers/recipeController.js";

const router = Router();

// GET /recipes
router.get('/', getRecipes);

// GET /recipes/:id
router.get('/:id', getRecipe);

// POST /recipes
router.post('/', createRecipe);

// PUT /recipes/:id
router.put('/:id', updateRecipe);

// DELETE /recipes/:id
router.delete('/:id', deleteRecipe);

export default router;
import pool from '../config/db.js';
import RecipeResponse from '../models/Recipe.js';

const RECIPE_WITH_INGREDIENTS = `
    SELECT
        r.recipe_id,
        r.title,
        r.instructions,
        r.image_url,
        r.yield_amount,
        r.yield_unit,
        r.created_at,
        COALESCE(
            json_agg(
                json_build_object(
                    'ingredient_id', i.ingredient_id,
                    'name', i.name,
                    'amount', ri.amount,
                    'unit', ri.unit
                )
            ) FILTER (WHERE i.ingredient_id IS NOT NULL),
            '[]'
        ) AS ingredients
    FROM recipe r
    LEFT JOIN recipe_ingredient ri ON r.recipe_id = ri.recipe_id
    LEFT JOIN ingredient i ON ri.ingredient_id = i.ingredient_id
`;

export const getRecipes = async (_req, res, next) => {
    try {
        const { rows } = await pool.query(
            RECIPE_WITH_INGREDIENTS + ' GROUP BY r.recipe_id ORDER BY r.created_at DESC'
        );
        res.json(rows.map(row => new RecipeResponse(row)));
    } catch (err) {
        next(err);
    }
};

// param: id
export const getRecipe = async (req, res, next) => {
    const { id } = req.params;
    try {
        const { rows } = await pool.query(
            RECIPE_WITH_INGREDIENTS + ' WHERE r.recipe_id = $1 GROUP BY r.recipe_id',
            [id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        res.json(new RecipeResponse(rows[0]));
    } catch (err) {
        next(err);
    }
};

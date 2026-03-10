import pool from '../config/db.js';

export const getRecipes = async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM recipe');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ db: 'error', error: err.message });
    }
};

// param: id
export const getRecipe = async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await pool.query('SELECT * FROM recipe WHERE recipe_id = $1', [id]);
        res.json(rows[0] || { message: 'Recipe not found' });
    } catch (err) {
        res.status(500).json({ db: 'error', error: err.message });
    }
};
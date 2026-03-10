import 'dotenv/config';
import pool from './src/config/db.js';

async function seed() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Test user
        const userRes = await client.query(`
            INSERT INTO app_user (email, password_hash)
            VALUES ('test@whisk.app', 'not-a-real-hash')
            ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
            RETURNING user_id
        `);
        const userId = userRes.rows[0].user_id;
        console.log(`User: ${userId}`);

        // Ingredients
        const ingredients = [
            'spaghetti', 'canned tomatoes', 'garlic', 'olive oil',
            'fresh basil', 'parmesan', 'salt', 'black pepper'
        ];
        const ingredientIds = {};
        for (const name of ingredients) {
            const r = await client.query(`
                INSERT INTO ingredient (name)
                VALUES ($1)
                ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
                RETURNING ingredient_id
            `, [name]);
            ingredientIds[name] = r.rows[0].ingredient_id;
        }
        console.log('Ingredients seeded');

        // Recipe
        const recipeRes = await client.query(`
            INSERT INTO recipe (user_id, title, instructions)
            VALUES ($1, 'Spaghetti Marinara', $2)
            ON CONFLICT DO NOTHING
            RETURNING recipe_id
        `, [userId, `1. Boil spaghetti in salted water until al dente.\n2. Sauté minced garlic in olive oil over medium heat.\n3. Add canned tomatoes, season with salt and pepper, simmer 15 min.\n4. Toss pasta with sauce, top with basil and parmesan.`]);

        let recipeId;
        if (recipeRes.rows.length > 0) {
            recipeId = recipeRes.rows[0].recipe_id;
        } else {
            const existing = await client.query(
                `SELECT recipe_id FROM recipe WHERE title = 'Spaghetti Marinara' AND user_id = $1`, [userId]
            );
            recipeId = existing.rows[0].recipe_id;
        }
        console.log(`Recipe: ${recipeId}`);

        // Recipe ingredients
        const recipeIngredients = [
            ['spaghetti', 200, 'gram'],
            ['canned tomatoes', 400, 'gram'],
            ['garlic', 3, 'count'],
            ['olive oil', 2, 'tablespoon'],
            ['fresh basil', 10, 'count'],
            ['parmesan', 30, 'gram'],
        ];
        for (const [name, amount, unit] of recipeIngredients) {
            await client.query(`
                INSERT INTO recipe_ingredient (recipe_id, ingredient_id, amount, unit)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT DO NOTHING
            `, [recipeId, ingredientIds[name], amount, unit]);
        }
        console.log('Recipe ingredients seeded');

        await client.query('COMMIT');
        console.log('Seed complete.');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Seed failed:', err.message);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

seed();

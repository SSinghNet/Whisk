import pool from '../config/db.js';

export const getDBHealth = async (_req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({ db: 'connected' });
    } catch (err) {
        res.status(500).json({ db: 'error', error: err.message });
    }
};

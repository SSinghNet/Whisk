import express from 'express';
import errorHandler from './middleware/errorHandler.js';

import pool from './config/db.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.json({ message: 'Whisk API is running' });
});

// Quick DB health check
app.get('/health', async (_req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({ db: 'connected' });
    } catch (err) {
        res.status(500).json({ db: 'error', error: err.message });
    }
});

app.use(errorHandler);

export default app;
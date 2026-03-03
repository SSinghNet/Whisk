import 'dotenv/config';
import express from 'express';
import pool from './db/index.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

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

app.listen(port, () => {
  console.log(`Whisk API listening on port ${port}`);
});

import express from 'express';
import errorHandler from './middleware/errorHandler.js';
import dbRoutes from './routes/dbRoutes.js';


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.json({ message: 'Whisk API is running' });
});

app.use("/db", dbRoutes)

app.use(errorHandler);

export default app;
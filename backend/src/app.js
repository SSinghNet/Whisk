import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';

import errorHandler from './middleware/errorHandler.js';
import dbRoutes from './routes/dbRoutes.js';
import recipeRoutes from './routes/recipeRoutes.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', (_req, res) => {
    res.json({ message: 'Whisk API is running' });
});

app.use('/db', dbRoutes)
app.use('/recipe', recipeRoutes)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.use(errorHandler);

export default app;
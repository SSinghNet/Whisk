import express from 'express'
import swaggerUi from 'swagger-ui-express'
import './schemas/index.schema.js'
import './lib/bigint.js'   
import { generateOpenAPIDocument } from './lib/swagger.js'
import errorHandler from './middleware/errorHandler.js'
import auth from './middleware/auth.js'
import dbRoutes from './routes/dbRoutes.js'
import recipeRoutes from './routes/recipeRoutes.js'
import userRoutes from './routes/userRoutes.js'


const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (_req, res) => {
  res.json({ message: 'Whisk API is running' })
})

app.use('/db', dbRoutes)
app.use('/recipe', auth, recipeRoutes)
app.use('/users', auth, userRoutes)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(generateOpenAPIDocument()))

app.use(errorHandler)

export default app
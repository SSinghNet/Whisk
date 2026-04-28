import { Router } from 'express'
import { recommend } from '../controllers/recommendationController.js'

const router = Router()

router.post('/', recommend)

export default router

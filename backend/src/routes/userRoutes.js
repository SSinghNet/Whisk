import { Router } from 'express'
import { register, getMe, updateMe, deleteMe } from '../controllers/userController.js'

const router = Router()

router.post('/register', register)
router.get('/me', getMe)
router.put('/me', updateMe)
router.delete('/me', deleteMe)

export default router
import { z } from 'zod'
import { registry } from '../lib/swagger.js'
import { BigIntId, Timestamp } from './shared.schema.js'

// Response schema 
export const UserResponseSchema = registry.register(
  'User',
  z.object({
    user_id:    BigIntId,
    email:      z.email(),
    created_at: Timestamp,
  })
)

// Create schema 
export const CreateUserSchema = z.object({
  email:    z.email(),
  password: z.string().min(8),
})



// Register routes with Swagger
registry.registerPath({
  method: 'post',
  path: '/users/register',
  summary: 'Register a new user',
  tags: ['Users'],
  request: {
    body: {
      content: { 'application/json': { schema: CreateUserSchema } }
    }
  },
  responses: {
    201: {
      description: 'User created',
      content: { 'application/json': { schema: UserResponseSchema } }
    }
  }
})


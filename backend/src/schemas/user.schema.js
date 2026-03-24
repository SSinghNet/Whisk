import { z } from 'zod'
import { registry } from '../lib/swagger.js'


export const UserResponseSchema = registry.register(
  'User',
  z.object({
    user_id:    z.number(),
    email:      z.email(),
    created_at: z.iso.datetime(),
  })
)

export const UpdateUserSchema = z.object({
  email: z.email(),
})

registry.registerPath({
  method: 'get',
  path: '/users/me',
  summary: 'Get current user profile',
  tags: ['Users'],
  responses: {
    200: {
      description: 'User profile',
      content: { 'application/json': { schema: UserResponseSchema } }
    },
    404: { description: 'User not found' }
  }
})

registry.registerPath({
  method: 'put',
  path: '/users/me',
  summary: 'Update current user email',
  tags: ['Users'],
  request: {
    body: {
      content: { 'application/json': { schema: UpdateUserSchema } }
    }
  },
  responses: {
    200: {
      description: 'User updated',
      content: { 'application/json': { schema: UserResponseSchema } }
    }
  }
})

registry.registerPath({
method: 'delete',
  path: '/users/me',
  summary: 'Delete current user account',
  tags: ['Users'],
  responses: {
    204: { description: 'User deleted' }
  }
})
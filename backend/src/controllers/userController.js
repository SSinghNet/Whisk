import { getUserById, updateUser, deleteUser } from '../services/userService.js'

export async function getMe(req, res) {
  const userId = 2n // temporary hardcoded ID until auth is set up

  const user = await getUserById(userId)

  if (!user) {
    return res.status(404).json({ message: 'User not found' })
  }

  res.status(200).json(user)
}

export async function updateMe(req, res) {
  const userId = 1n // temporary hardcoded ID until auth is set up

  // Validate request body with Zod
  const parsed = UpdateUserSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten() })
  }

  const user = await updateUser(userId, parsed.data)
  res.status(200).json(user)
}

export async function deleteMe(req, res) {
  const userId = 1n // temporary hardcoded ID until auth is set up

  await deleteUser(userId)

  res.status(204).send()
}
import { createUser, getUserBySupabaseUid, updateUser, deleteUser } from '../services/userService.js'

export async function register(req, res) {
  const { id: supabaseUid, email } = req.user

  const existing = await getUserBySupabaseUid(supabaseUid)
  if (existing) {
    return res.status(200).json(existing)
  }

  const user = await createUser(supabaseUid, email)
  res.status(201).json(user)
}

export async function getMe(req, res) {
  const user = await getUserBySupabaseUid(req.user.id)

  if (!user) {
    return res.status(404).json({ message: 'User not found' })
  }

  res.status(200).json(user)
}

export async function updateMe(req, res) {
  const user = await updateUser(req.user.id, req.body)
  res.status(200).json(user)
}

export async function deleteMe(req, res) {
  await deleteUser(req.user.id)
  res.status(204).send()
}

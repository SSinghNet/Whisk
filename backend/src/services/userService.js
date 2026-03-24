import prisma from '../lib/prisma.js'

export async function getUserById(userId) {
  return await prisma.app_user.findUnique({
    where: { user_id: userId },
    select: {
      user_id:    true,
      email:      true,
      created_at: true,
    }
  })
}

export async function updateUser(userId, data) {
  return await prisma.app_user.update({
    where: { user_id: userId },
    data,
    select: {
      user_id:    true,
      email:      true,
      created_at: true,
    }
  })
}

export async function deleteUser(userId) {
  return await prisma.app_user.delete({
    where: { user_id: userId }
  })
}

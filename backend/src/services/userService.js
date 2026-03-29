import prisma from '../lib/prisma.js'

export async function createUser(supabaseUid, email) {
  return await prisma.app_user.create({
    data: { supabase_uid: supabaseUid, email },
    select: { user_id: true, email: true, created_at: true },
  })
}

export async function getUserBySupabaseUid(supabaseUid) {
  return await prisma.app_user.findUnique({
    where: { supabase_uid: supabaseUid },
    select: { user_id: true, email: true, created_at: true },
  })
}

export async function resolveUserId(supabaseUid) {
  const user = await getUserBySupabaseUid(supabaseUid)
  if (!user) {
    const error = new Error("User not found")
    error.status = 404
    throw error
  }
  return user.user_id
}

export async function updateUser(supabaseUid, data) {
  return await prisma.app_user.update({
    where: { supabase_uid: supabaseUid },
    data,
    select: { user_id: true, email: true, created_at: true },
  })
}

export async function deleteUser(supabaseUid) {
  return await prisma.app_user.delete({
    where: { supabase_uid: supabaseUid },
  })
}

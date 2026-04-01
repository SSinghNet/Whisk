import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export async function loginTestUser() {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    throw new Error('Missing TEST_USER_EMAIL or TEST_USER_PASSWORD in .env.test');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  if (!data?.session?.access_token) {
    throw new Error('No access token returned from Supabase');
  }

  return {
    token: data.session.access_token,
    user: data.user,
  };
}
// Creates two test Supabase Auth users and links them to app_user rows.
// User A gets the existing seed recipe; User B has no recipes.
//
// Usage: node seed-auth.js

import 'dotenv/config'
import pkg from 'pg'
import { createClient } from '@supabase/supabase-js'

const { Client } = pkg

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
)

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
})

async function run() {
    await client.connect()

    // Create User A (has recipes)
    const { data: userA, error: errA } = await supabase.auth.admin.createUser({
        email: 'usera@whisk.test',
        password: 'password123',
        email_confirm: true,
    })
    if (errA) throw new Error(`User A: ${errA.message}`)
    console.log('Created User A:', userA.user.id)

    // Create User B (no recipes)
    const { data: userB, error: errB } = await supabase.auth.admin.createUser({
        email: 'userb@whisk.test',
        password: 'password123',
        email_confirm: true,
    })
    if (errB) throw new Error(`User B: ${errB.message}`)
    console.log('Created User B:', userB.user.id)

    // Insert app_user rows
    const { rows: [appUserA] } = await client.query(
        `INSERT INTO app_user (supabase_uid, email)
         VALUES ($1, $2)
         ON CONFLICT (supabase_uid) DO UPDATE SET email = EXCLUDED.email
         RETURNING user_id`,
        [userA.user.id, userA.user.email]
    )
    const { rows: [appUserB] } = await client.query(
        `INSERT INTO app_user (supabase_uid, email)
         VALUES ($1, $2)
         ON CONFLICT (supabase_uid) DO UPDATE SET email = EXCLUDED.email
         RETURNING user_id`,
        [userB.user.id, userB.user.email]
    )
    console.log('App user A:', appUserA.user_id, '| App user B:', appUserB.user_id)

    // Reassign seed recipe to User A (update any existing recipes with no real owner)
    const { rowCount } = await client.query(
        `UPDATE recipe SET user_id = $1 WHERE user_id NOT IN ($1, $2)`,
        [appUserA.user_id, appUserB.user_id]
    )
    console.log(`Reassigned ${rowCount} recipe(s) to User A`)

    await client.end()
    console.log('\nDone.')
    console.log('User A — email: usera@whisk.test  password: password123  (has recipes)')
    console.log('User B — email: userb@whisk.test  password: password123  (no recipes)')
}

run().catch(e => { console.error(e.message); process.exit(1) })

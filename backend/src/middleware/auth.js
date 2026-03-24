import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function auth(req, res, next) {
    const authHeader = req.headers.authorization

    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Missing or invalid Authorization header' })
    }

    const token = authHeader.slice(7)

    const { data, error } = await supabase.auth.getUser(token)

    if (error || !data.user) {
        return res.status(401).json({ message: 'Invalid or expired token' })
    }

    req.user = data.user
    next()
}

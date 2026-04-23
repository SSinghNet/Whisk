import { getRecommendations } from '../services/recommendationService.js'

export const recommend = async (req, res) => {
  const supabase_uid = req.user.id

  try {
    const suggestions = await getRecommendations(supabase_uid)
    res.status(200).json(suggestions)
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to get recommendations' })
  }
}

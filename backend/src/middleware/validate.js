export const validate = ({ body, params, query }) => {
  return (req, res, next) => {
    try {
      // Validate body
      if (body) {
        const result = body.safeParse(req.body)
        if (!result.success) {
          return res.status(400).json({
            message: "Invalid request body",
            errors: result.error.flatten(),
          })
        }
        req.body = result.data
      }

      // Validate params
      if (params) {
        const result = params.safeParse(req.params)
        if (!result.success) {
          return res.status(400).json({
            message: "Invalid route params",
            errors: result.error.flatten(),
          })
        }
        Object.assign(req.query, result.data)
      }

      // Validate query
      if (query) {
        const result = query.safeParse(req.query)
        if (!result.success) {
          return res.status(400).json({
            message: "Invalid query params",
            errors: result.error.flatten(),
          })
        }
        Object.assign(req.query, result.data)
      }

      next()
    } catch (err) {
      next(err)
    }
  }
}
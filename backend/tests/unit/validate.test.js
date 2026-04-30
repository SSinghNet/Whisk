import { jest } from '@jest/globals'
import { z } from 'zod'
import { validate } from '../../src/middleware/validate.js'
import { IdParamSchema, SearchQuerySchema } from '../../src/schemas/shared.schema.js'

describe('validate middleware', () => {
  const bodySchema = z.object({ name: z.string().min(1, 'Name cannot be empty') })
  const paramsSchema = IdParamSchema;
  const querySchema = SearchQuerySchema;

  function buildRes() {
    const res = {}
    res.status = jest.fn().mockReturnValue(res)
    res.json = jest.fn().mockReturnValue(res)
    return res
  }

  // ---------------------------------------------------------------------------
  // body
  // ---------------------------------------------------------------------------
  test('calls next() when body validation passes', () => {
    const req = { body: { name: 'rice' }, params: {}, query: {} }
    const res = buildRes()
    const next = jest.fn()

    validate({ body: bodySchema })(req, res, next)

    expect(next).toHaveBeenCalledWith()
  })

  test('returns 400 when body is invalid', () => {
    const req = { body: { name: '' }, params: {}, query: {} }
    const res = buildRes()
    const next = jest.fn()

    validate({ body: bodySchema })(req, res, next)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Invalid request body',
    }))
    expect(next).not.toHaveBeenCalled()
  })

  test('replaces req.body with parsed data', () => {
    const req = { body: { name: '  rice  ' }, params: {}, query: {} }
    const res = buildRes()
    const next = jest.fn()

    const trimSchema = z.object({ name: z.string().trim() })
    validate({ body: trimSchema })(req, res, next)

    expect(req.body.name).toBe('rice')
  })

  // ---------------------------------------------------------------------------
  // params
  // ---------------------------------------------------------------------------
  test('calls next() when params validation passes', () => {
    const req = { body: {}, params: { id: '1' }, query: {} }
    const res = buildRes()
    const next = jest.fn()

    validate({ params: paramsSchema })(req, res, next)

    expect(next).toHaveBeenCalledWith()
  })

  test('returns 400 when params are invalid', () => {
    const req = { body: {}, params: { id: 'abc' }, query: {} }
    const res = buildRes()
    const next = jest.fn()

    validate({ params: paramsSchema })(req, res, next)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Invalid route params',
    }))
    expect(next).not.toHaveBeenCalled()
  })

    test('returns 400 when params is not an integer', () => {
    const req = { body: {}, params: { id: '-1' }, query: {} }
    const res = buildRes()
    const next = jest.fn()

    validate({ params: paramsSchema })(req, res, next)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Invalid route params',
    }))
    expect(next).not.toHaveBeenCalled()
  })

  test('returns 400 when params is not a positive integer', () => {
    const req = { body: {}, params: { id: '-1' }, query: {} }
    const res = buildRes()
    const next = jest.fn()

    validate({ params: paramsSchema })(req, res, next)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Invalid route params',
    }))
    expect(next).not.toHaveBeenCalled()
  })

  // ---------------------------------------------------------------------------
  // query
  // ---------------------------------------------------------------------------
  test('calls next() when query validation passes', () => {
    const req = { body: {}, params: {}, query: { search: 'rice' } }
    const res = buildRes()
    const next = jest.fn()

    validate({ query: querySchema })(req, res, next)

    expect(next).toHaveBeenCalledWith()
  })

  test('returns 400 when query is invalid', () => {
    const req = { body: {}, params: {}, query: { search: '' } }
    const res = buildRes()
    const next = jest.fn()

    validate({ query: querySchema })(req, res, next)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Invalid query params',
    }))
    expect(next).not.toHaveBeenCalled()
  })
})
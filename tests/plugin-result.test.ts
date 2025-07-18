import { describe, it, expect } from 'vitest'

import { createApp } from "../src/index"
import { badRequest, conflict, forbidden, notFound, ok, tooManyRequests, unauthorized } from '../src/plugins/result'
import { z } from 'zod/v4'
import { ZodTypeProvider } from '../src/plugins/zod'
import { unexpected } from '../src/plugins/result'

describe('result plugin', async () => {
  
  it('all response schemas should be included in swagger', async () => {
    const app = await createApp()
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/plugin-test-ok',

      schema: {
        response: {
          200: ok(z.object({ name: z.string() })),
          400: badRequest,
          401: unauthorized,
          403: forbidden,
          404: notFound,
          409: conflict,
          429: tooManyRequests,
          500: unexpected
        }
      },

      async handler() {
        return {
          success: true,
          error: null,
          result: {
            name: 'John Doe'
          }
        }
      }
    })
    await app.prepare()

    const res = await app.inject({
      url: '/swagger/json'
    })

    expect(res.body).toBe('{"swagger":"2.0","info":{"title":"Router Application","version":"1.0.0"},"definitions":{},"paths":{"/plugin-test-ok":{"get":{"responses":{"200":{"description":"OK","schema":{"description":"OK","type":"object","properties":{"success":{"anyOf":[{"type":"boolean","enum":[true]},{"type":"boolean"}]},"error":{"type":"null","enum":[null]},"result":{"type":"object","properties":{"name":{"type":"string"}},"required":["name"],"additionalProperties":false}},"required":["success","error","result"],"additionalProperties":false}},"400":{"description":"Bad request","schema":{"description":"Bad request","type":"object","properties":{"success":{"type":"boolean","enum":[false]},"error":{"type":"object","properties":{"code":{"type":"string","enum":["BAD_REQUEST"]},"message":{"type":"string"},"details":{"anyOf":[{"type":"object","propertyNames":{"type":"string"},"additionalProperties":{"type":"string"}},{"type":"null"}]}},"required":["code","message","details"],"additionalProperties":false},"result":{"type":"null","enum":[null]}},"required":["success","error","result"],"additionalProperties":false}},"401":{"description":"Unauthorized","schema":{"description":"Unauthorized","type":"object","properties":{"success":{"type":"boolean","enum":[false]},"error":{"type":"object","properties":{"code":{"type":"string","enum":["UNAUTHORIZED"]},"message":{"type":"string"},"details":{"anyOf":[{"type":"object","propertyNames":{"type":"string"},"additionalProperties":{"type":"string"}},{"type":"null"}]}},"required":["code","message","details"],"additionalProperties":false},"result":{"type":"null","enum":[null]}},"required":["success","error","result"],"additionalProperties":false}},"403":{"description":"Forbidden","schema":{"description":"Forbidden","type":"object","properties":{"success":{"type":"boolean","enum":[false]},"error":{"type":"object","properties":{"code":{"type":"string","enum":["FORBIDDEN"]},"message":{"type":"string"},"details":{"anyOf":[{"type":"object","propertyNames":{"type":"string"},"additionalProperties":{"type":"string"}},{"type":"null"}]}},"required":["code","message","details"],"additionalProperties":false},"result":{"type":"null","enum":[null]}},"required":["success","error","result"],"additionalProperties":false}},"404":{"description":"Not found","schema":{"description":"Not found","type":"object","properties":{"success":{"type":"boolean","enum":[false]},"error":{"type":"object","properties":{"code":{"type":"string","enum":["NOT_FOUND"]},"message":{"type":"string"},"details":{"anyOf":[{"type":"object","propertyNames":{"type":"string"},"additionalProperties":{"type":"string"}},{"type":"null"}]}},"required":["code","message","details"],"additionalProperties":false},"result":{"type":"null","enum":[null]}},"required":["success","error","result"],"additionalProperties":false}},"409":{"description":"Conflict","schema":{"description":"Conflict","type":"object","properties":{"success":{"type":"boolean","enum":[false]},"error":{"type":"object","properties":{"code":{"type":"string","enum":["CONFLICT"]},"message":{"type":"string"},"details":{"anyOf":[{"type":"object","propertyNames":{"type":"string"},"additionalProperties":{"type":"string"}},{"type":"null"}]}},"required":["code","message","details"],"additionalProperties":false},"result":{"type":"null","enum":[null]}},"required":["success","error","result"],"additionalProperties":false}},"429":{"description":"Too many requests","schema":{"description":"Too many requests","type":"object","properties":{"success":{"type":"boolean","enum":[false]},"error":{"type":"object","properties":{"code":{"type":"string","enum":["TOO_MANY_REQUESTS"]},"message":{"type":"string"},"details":{"anyOf":[{"type":"object","propertyNames":{"type":"string"},"additionalProperties":{"type":"string"}},{"type":"null"}]}},"required":["code","message","details"],"additionalProperties":false},"result":{"type":"null","enum":[null]}},"required":["success","error","result"],"additionalProperties":false}},"500":{"description":"Internal server error","schema":{"description":"Internal server error","type":"object","properties":{"success":{"type":"boolean","enum":[false]},"error":{"type":"object","properties":{"code":{"type":"string","enum":["UNEXPECTED_SERVER_ERROR"]},"message":{"type":"string"},"details":{"anyOf":[{"type":"object","propertyNames":{"type":"string"},"additionalProperties":{"type":"string"}},{"type":"null"}]}},"required":["code","message","details"],"additionalProperties":false},"result":{"type":"null","enum":[null]}},"required":["success","error","result"],"additionalProperties":false}}}}}}}')
  })
  it ('reply.ok should return the correct response', async () => {
    const app = await createApp()
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/plugin-test-ok',

      schema: {
        response: {
          200: ok(
            z.object({
              users: z.array(
                z.object({
                  id: z.string(),
                  name: z.string()
                })
              )
            })
          )
        }
      },

      async handler(req, reply) {
        return reply.ok({
          users: [
            {
              id: '1',
              name: 'John Doe'
            }
          ]
        })
      }
    })

    const res = await app.inject({
      url: '/plugin-test-ok',
    })

    expect(res.statusCode).toBe(200)
    expect(res.json().success).toBe(true)
    expect(res.json().result.users).toHaveLength(1)
  })

  it('reply.unexpected should return the correct response', async () => {
    const app = await createApp()

    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/plugin-test-unexpected',

      async handler(req, reply) {
        return reply.unexpected('test')
      }
    })

    const res = await app.inject({
      url: '/plugin-test-unexpected',
    })

    expect(res.statusCode).toBe(500)
    expect(res.json().success).toBe(false)
    expect(res.json().error.message).toBe('test')
  })

  it('reply.notFound should return the correct response', async () => {
    const app = await createApp()

    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/plugin-test-not-found',

      async handler(req, reply) {
        return reply.notFound('test')
      }
    })

    const res = await app.inject({
      url: '/plugin-test-not-found',
    })

    expect(res.statusCode).toBe(404)
    expect(res.json().success).toBe(false)
    expect(res.json().error.message).toBe('test')
  })

  it('reply.badRequest should return the correct response', async () => {
    const app = await createApp()

    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/plugin-test-bad-request',

      async handler(req, reply) {
        return reply.badRequest('test')
      }
    })

    const res = await app.inject({
      url: '/plugin-test-bad-request',
    })

    expect(res.statusCode).toBe(400)
    expect(res.json().success).toBe(false)
    expect(res.json().error.message).toBe('test')
  })

  it('reply.unauthorized should return the correct response', async () => {
    const app = await createApp()

    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/plugin-test-unauthorized',

      async handler(req, reply) {
        return reply.unauthorized('test')
      }
    })
    
    const res = await app.inject({
      url: '/plugin-test-unauthorized',
    })

    expect(res.statusCode).toBe(401)
    expect(res.json().success).toBe(false)
    expect(res.json().error.message).toBe('test')
  })

  it('reply.forbidden should return the correct response', async () => {
    const app = await createApp()

    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/plugin-test-forbidden',

      async handler(req, reply) {
        return reply.forbidden('test')
      }
    })
    
    const res = await app.inject({
      url: '/plugin-test-forbidden',
    })

    expect(res.statusCode).toBe(403)
    expect(res.json().success).toBe(false)
    expect(res.json().error.message).toBe('test')
  })

  it('reply.conflict should return the correct response', async () => {
    const app = await createApp()

    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/plugin-test-conflict',

      async handler(req, reply) {
        return reply.conflict('test')
      }
    })
    
    const res = await app.inject({
      url: '/plugin-test-conflict',
    })

    expect(res.statusCode).toBe(409)
    expect(res.json().success).toBe(false)
    expect(res.json().error.message).toBe('test')
  })

  it('reply.tooManyRequests should return the correct response', async () => {
    const app = await createApp()

    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/plugin-test-too-many-requests',

      async handler(req, reply) {
        return reply.tooManyRequests('test')
      }
    })
    
    const res = await app.inject({
      url: '/plugin-test-too-many-requests',
    })

    expect(res.statusCode).toBe(429)
    expect(res.json().success).toBe(false)
    expect(res.json().error.message).toBe('test')
  })
})
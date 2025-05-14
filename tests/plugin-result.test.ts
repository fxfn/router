import { describe, it } from 'node:test'
import assert from 'node:assert'

import { createApp } from "../src/index"
import { badRequest, conflict, forbidden, notFound, ok, tooManyRequests, unauthorized } from '@/plugins/result'
import z from 'zod'
import { ZodTypeProvider } from '@/plugins/zod'
import { unexpected } from '@/plugins/result'

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

      async handler(req, reply) {
        return reply.ok({ name: 'John Doe' })
      }
    })

    const res = await app.inject({
      url: '/json'
    })

    assert.ok(
      res.body === '{"swagger":"2.0","info":{"title":"Router Application","version":"1.0.0"},"definitions":{},"paths":{"/plugin-test-ok":{"get":{"responses":{"200":{"description":"OK","schema":{"description":"OK","type":"object","properties":{"success":{"enum":[true]},"error":{"enum":[null]},"result":{"type":"object","properties":{"name":{"type":"string"}},"required":["name"]}},"required":["success","error","result"]}},"400":{"description":"Bad request","schema":{"description":"Bad request","type":"object","properties":{"success":{"enum":[false]},"error":{"type":"object","properties":{"code":{"enum":["BAD_REQUEST"]},"message":{"type":"string"},"details":{"anyOf":[{"type":"object","propertyNames":{"type":"string"},"additionalProperties":{"type":"string"}},{"type":"null"}]}},"required":["code","message","details"]},"result":{"enum":[null]}},"required":["success","error","result"]}},"401":{"description":"Unauthorized","schema":{"description":"Unauthorized","type":"object","properties":{"success":{"enum":[false]},"error":{"type":"object","properties":{"code":{"enum":["UNAUTHORIZED"]},"message":{"type":"string"},"details":{"anyOf":[{"type":"object","propertyNames":{"type":"string"},"additionalProperties":{"type":"string"}},{"type":"null"}]}},"required":["code","message","details"]},"result":{"enum":[null]}},"required":["success","error","result"]}},"403":{"description":"Forbidden","schema":{"description":"Forbidden","type":"object","properties":{"success":{"enum":[false]},"error":{"type":"object","properties":{"code":{"enum":["FORBIDDEN"]},"message":{"type":"string"},"details":{"anyOf":[{"type":"object","propertyNames":{"type":"string"},"additionalProperties":{"type":"string"}},{"type":"null"}]}},"required":["code","message","details"]},"result":{"enum":[null]}},"required":["success","error","result"]}},"404":{"description":"Not found","schema":{"description":"Not found","type":"object","properties":{"success":{"enum":[false]},"error":{"type":"object","properties":{"code":{"enum":["NOT_FOUND"]},"message":{"type":"string"},"details":{"anyOf":[{"type":"object","propertyNames":{"type":"string"},"additionalProperties":{"type":"string"}},{"type":"null"}]}},"required":["code","message","details"]},"result":{"enum":[null]}},"required":["success","error","result"]}},"409":{"description":"Conflict","schema":{"description":"Conflict","type":"object","properties":{"success":{"enum":[false]},"error":{"type":"object","properties":{"code":{"enum":["CONFLICT"]},"message":{"type":"string"},"details":{"anyOf":[{"type":"object","propertyNames":{"type":"string"},"additionalProperties":{"type":"string"}},{"type":"null"}]}},"required":["code","message","details"]},"result":{"enum":[null]}},"required":["success","error","result"]}},"429":{"description":"Too many requests","schema":{"description":"Too many requests","type":"object","properties":{"success":{"enum":[false]},"error":{"type":"object","properties":{"code":{"enum":["TOO_MANY_REQUESTS"]},"message":{"type":"string"},"details":{"anyOf":[{"type":"object","propertyNames":{"type":"string"},"additionalProperties":{"type":"string"}},{"type":"null"}]}},"required":["code","message","details"]},"result":{"enum":[null]}},"required":["success","error","result"]}},"500":{"description":"Internal server error","schema":{"description":"Internal server error","type":"object","properties":{"success":{"enum":[false]},"error":{"type":"object","properties":{"code":{"enum":["UNEXPECTED_SERVER_ERROR"]},"message":{"type":"string"},"details":{"anyOf":[{"type":"object","propertyNames":{"type":"string"},"additionalProperties":{"type":"string"}},{"type":"null"}]}},"required":["code","message","details"]},"result":{"enum":[null]}},"required":["success","error","result"]}}}}}}}', 
      'swagger json should match the snapshot'
    )
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

    assert.ok(res.statusCode === 200, 'Status code should be 200')
    assert.ok(res.json().success, 'Success should be true')
    assert.ok(res.json().result.users.length === 1, 'Result should have 1 user')
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

    assert.ok(res.statusCode === 500, 'Status code should be 500')
    assert.ok(res.json().success === false, 'Success should be false')
    assert.ok(res.json().error.message === 'test', 'Error message should be "test"')
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

    assert.ok(res.statusCode === 404, 'Status code should be 404')
    assert.ok(res.json().success === false, 'Success should be false')
    assert.ok(res.json().error.message === 'test', 'Error message should be "test"')
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

    assert.ok(res.statusCode === 400, 'Status code should be 400')
    assert.ok(res.json().success === false, 'Success should be false')
    assert.ok(res.json().error.message === 'test', 'Error message should be "test"')
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

    assert.ok(res.statusCode === 401, 'Status code should be 401')
    assert.ok(res.json().success === false, 'Success should be false')
    assert.ok(res.json().error.message === 'test', 'Error message should be "test"')
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

    assert.ok(res.statusCode === 403, 'Status code should be 403')
    assert.ok(res.json().success === false, 'Success should be false')
    assert.ok(res.json().error.message === 'test', 'Error message should be "test"')
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

    assert.ok(res.statusCode === 409, 'Status code should be 409')
    assert.ok(res.json().success === false, 'Success should be false')
    assert.ok(res.json().error.message === 'test', 'Error message should be "test"')
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

    assert.ok(res.statusCode === 429, 'Status code should be 429')
    assert.ok(res.json().success === false, 'Success should be false')
    assert.ok(res.json().error.message === 'test', 'Error message should be "test"')
  })
})
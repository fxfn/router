import { App, createApp } from "../../packages/router/src/index"
import { ZodTypeProvider } from "../../packages/router/src/plugins/zod"
import assert from "node:assert"
import { afterEach, beforeEach, describe, it } from "node:test"
import z from "zod"

describe('zod type provider', () => {
  let app: App | null

  beforeEach(async () => {
    app = await createApp()

    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'get',
      url: '/res-test-1',
      schema: {
        querystring: z.object({
          name: z.string().min(2),
          year: z.coerce.number().min(18)
        }),
        response: {
          200: z.object({
            message: z.string()
          })
        }
      },
      handler: async (req, reply) => {
        reply.send({ foo: `hi ${req.query.name}` } as any)
      }
    })
  })

  afterEach(async () => {
    if (app) {
      await app.close()
      app = null
    }
  })

  it('should validate the response types correctly', async () => {
    if (!app) throw new Error('App not initialized')

    const res = await app.inject({
      method: 'get',
      path: '/res-test-1',
      query: {
        name: 'jay',
        year: '2025'
      }
    })

    assert.ok(JSON.parse(res.body).code === 'FST_ERR_RESPONSE_SERIALIZATION', "Should return a status code of 500")
    assert.ok(res.statusCode === 500, "Should return a status code of 500")
  })
})

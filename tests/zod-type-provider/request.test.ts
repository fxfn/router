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
      url: '/req-test-1',
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
        reply.send({ message: `hi ${req.query.name}` })
      }
    })
  })

  afterEach(async () => {
    if (app) {
      await app.close()
      app = null
    }
  })

  it('should validate the request types correctly', async () => {
    if (!app) throw new Error('App not initialized')
    
    const res = await app.inject({
      method: 'get',
      path: '/req-test-1',
      query: {
        name: '1'
      }
    })

    assert.ok(res.statusCode === 400, "Should return a status code of 400")
  })
})
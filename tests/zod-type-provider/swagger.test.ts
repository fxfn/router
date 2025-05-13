import { afterEach, beforeEach, describe, it } from "node:test"
import assert from "node:assert"
import { App, createApp } from "@/index"
import { ZodTypeProvider } from "@/plugins/zod"
import z from "zod"

describe('zod type provider', () => {
  let app: App | null

  beforeEach(async () => {
    app = await createApp()

    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'get',
      url: '/hello',
      schema: {
        tags: ['hello'],
        querystring: z.object({
          name: z.string(),
        }),
        response: {
          200: z.object({
            message: z.string()
          })
        }
      },
      handler: (request, reply) => {
        return {
          message: `Hello ${request.query.name}`
        }
      }
    })
    
    await app.ready()
  })
  
  afterEach(async () => {
    if (app) {
      await app.close()
      app = null
    }
  })

  it('should generate a swagger schema', async () => {
    if (!app) throw new Error('App not initialized')

    const res = await app.inject({
      method: 'get',
      url: '/json'
    })

    assert.ok(
      res.body.includes('{"/hello":{"get":{"tags":["hello"],"parameters":[{"type":"string","required":true,"in":"query","name":"name"}]'),
      "Should include the definition for the hello route"
    )
  })
})
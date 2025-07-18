
import { describe, it, expect } from "vitest"
import { z } from "zod/v4"
import { App, createApp } from "../src"
import { ZodTypeProvider } from "../src/plugins/zod"

const url = `/plugin-zod-test`

let app: App

describe('zod type provider', async () => {
  it('should not throw an error when registering a route', async () => {
    app = await createApp()
    
    expect(async () => {
      app.withTypeProvider<ZodTypeProvider>().route({
        method: 'get',
        url,
        schema: {
          tags: ['hello'],
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
          // @ts-expect-error
          reply.send({ foo: `hi ${req.query.name}` })
        }
      })
    }).not.toThrow()

    await app.prepare()
  })

  it('should validate the request types correctly', async () => {
    
    const res = await app.inject({
      path: url,
      query: {
        name: 'name'
      }
    })

    expect(res.statusCode).toBe(400)
  })

  it('should validate the response types correctly', async () => {

    const res = await app.inject({
      path: url,
      query: {
        name: 'name',
        year: '2025'
      }
    })

    expect(JSON.parse(res.body).code).toBe('FST_ERR_RESPONSE_SERIALIZATION')
    expect(res.statusCode).toBe(500)
  })

  it('should generate a swagger schema', async () => {

    const res = await app.inject({
      url: '/swagger/json'
    })

    expect(res.body).toContain(`{"swagger":"2.0","info":{"title":"Router Application","version":"1.0.0"},"definitions":{},"paths":{"/plugin-zod-test":{"get":{"tags":["hello"],"parameters":[{"type":"string","minLength":2,"required":true,"in":"query","name":"name"},{"type":"number","minimum":18,"required":true,"in":"query","name":"year"}],"responses":{"200":{"description":"Default Response","schema":{"type":"object","properties":{"message":{"type":"string"}},"required":["message"],"additionalProperties":false}}}}}}}`)
  })
})
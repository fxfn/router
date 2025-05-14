
import assert from "node:assert"
import { describe, it } from "node:test"
import z from "zod"
import { App, createApp } from "../src"
import { ZodTypeProvider } from "../src/plugins/zod"

const url = `/plugin-zod-test`

let app: App

describe('zod type provider', async () => {
  it('should not throw an error when registering a route', async () => {
    app = await createApp()
    
    assert.doesNotThrow(
      async () => {
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
      },
      'should not throw an error when registering a route'
    )

    await app.prepare()
  })

  it('should validate the request types correctly', async () => {
    
    const res = await app.inject({
      path: url,
      query: {
        name: 'name'
      }
    })

    assert.ok(res.statusCode === 400, "Should return a status code of 400")
  })

  it('should validate the response types correctly', async () => {

    const res = await app.inject({
      path: url,
      query: {
        name: 'name',
        year: '2025'
      }
    })

    assert.ok(JSON.parse(res.body).code === 'FST_ERR_RESPONSE_SERIALIZATION', "Should return a status code of 500")
    assert.ok(res.statusCode === 500, "Should return a status code of 500")
  })

  it('should generate a swagger schema', async () => {

    const res = await app.inject({
      url: '/json'
    })

    assert.ok(
      res.body.includes(`{"${url}":{"get":{"tags":["hello"],"parameters":[{"type":"string","minLength":2,"required":true,"in":"query","name":"name"},{"type":"number","minimum":18,"required":true,"in":"query","name":"year"}]`),
      `Should include the definition for the ${url} route`
    )
  })
})
import { createApp } from "../../packages/router/src/index"
import { ZodTypeProvider } from "../../packages/router/src/plugins/zod"
import z from "zod"

async function main() {
  const app = await createApp()

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
          message: z.string(),
          date: z.iso.datetime()
        })
      }
    },
    handler: (request, reply) => {
      return {
        message: `Hello ${request.query.name}`,
        date: new Date().toISOString()
      }
    }
  })
  
  await app.ready()
  app.swagger()
  app.prettyRoutes()

  await app.listen({ port: 3000 })
}

main()
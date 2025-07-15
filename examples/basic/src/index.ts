import { createApp, IRoute } from "@fxfn/router"
import { ZodTypeProvider } from "@fxfn/router/plugins/zod"
import { FastifyRequest } from "fastify"
import { z } from "zod/v4"

type SayHelloRequest = FastifyRequest<{
  Querystring: {
    name: string
  }
}>

async function main() {
  const app = await createApp()
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'get',
    url: '/hello',
    schema: {
      querystring: z.object({
        name: z.string()
      }),
      response: {
        200: z.object({
          message: z.string()
        })
      }
    },
    handler: (req) => {
      return {
        message: `Hello ${req.query.name}`
      }
    }
  })

  await app.prepare()

  const info = await app.listen({ host: '0.0.0.0', port: 4444 })
  console.log(info)
  app.prettyRoutes()
}

main()
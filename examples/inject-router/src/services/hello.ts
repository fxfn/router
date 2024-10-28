import { IRoute, RouteReply, RouteRequest } from "@/interfaces/services/route"
import { z } from "zod"

export class HelloRoute implements IRoute {
  url = '/hello'
  method = 'get' as const

  schema = {
    querystring: z.object({
      name: z.string()
    }),
    response: {
      200: z.object({
        name: z.string()
      })
    }
  }
  async handler(
    req: RouteRequest<HelloRoute>, 
    reply: RouteReply<HelloRoute>
  ) {
    return reply.send({ name: req.query.name })
  }
}
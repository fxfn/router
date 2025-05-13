import { FastifyReply } from "fastify"
import { IRoute, RouteRequest } from "@fxfn/router/interfaces/route.js"
import { z } from "zod"

class HelloRoute implements IRoute {
  url = '/hello'
  method = ['get', 'post']

  schema = {
    querystring: z.object({
      name: z.string()
    }),
    response: {
      200: z.object({
        message: z.string()
      })
    }
  }

  async handler(request: RouteRequest<HelloRoute>, reply: FastifyReply) {
    return { message: "123" }
  }
}

export default HelloRoute
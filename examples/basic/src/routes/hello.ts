import { IRoute, type RouteRequest } from "@fxfn/router"
import { z } from "zod/v4"

export class SayHelloRoute implements IRoute {
  method = 'get'
  url = '/hello'

  schema = {
    querystring: z.object({
      name: z.string()
    }),
    response: {
      200: z.object({
        message: z.string()
      })
    },
  }

  async handler(req: RouteRequest<SayHelloRoute>) {
    return {
      message: `Hello ${req.query.name}`
    }
  }
}
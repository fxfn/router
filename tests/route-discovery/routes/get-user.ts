import { IRoute, RouteRequest } from "@/interfaces/route"
import z from "zod/v4"

export class GetUserRoute implements IRoute {
  method = 'get'
  url = '/users/:id'

  schema = {
    params: z.object({
      id: z.string()
    }),
    response: {
      200: z.object({
        user: z.object({
          id: z.string().describe('The id of the user'),
          name: z.string().describe('The name of the user'),
          date_created: z.iso.datetime().describe('The date the user was created')
        })
      })
    },
  }

  async handler(req: RouteRequest<GetUserRoute>) {
    return {
      user: {
        name: 'fake name',
        id: req.params.id,
        date_created: new Date().toISOString()
      }
    }
  }
}
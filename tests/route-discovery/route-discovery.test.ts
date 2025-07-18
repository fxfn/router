import { createApp } from "../../src/index"
import { IRoute, RouteRequest } from "../../src/interfaces/route"
import { describe, it, expect } from "vitest"
import { z } from "zod/v4"
import { TestContainer } from "../lib/container"

describe('route discovery', () => {

  it('should discover routes from the container', async () => {
    const app = await createApp({
      container: new TestContainer() 
    })

    class GetUsersRoute implements IRoute {
      method = 'get'
      url = '/users'
      schema = {
        tags: ['users'],
        querystring: z.object({
          filter: z.string().nullish(),
          limit: z.number().default(20)
        }),
        response: {
          200: z.any()
        }
      }

      async handler(req: RouteRequest<GetUsersRoute>) {
        return {
          users: [
            {
              name: "fake name",
              email: "fake@email.com"
            }
          ]
        }
      }
    }

    app.container.register(IRoute, { useClass: GetUsersRoute })
    await app.prepare()

    const res = await app.inject({
      method: 'get',
      url: '/users'
    })
    
    expect(res.statusCode).toBe(200)
  })
})


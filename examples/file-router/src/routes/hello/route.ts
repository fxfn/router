import { type Route, type App } from "#/github.com/fxfn/router"
import { z } from "zod"

export default (route: Route, app: App) => route({
  method: 'get',
  schema: {
    querystring: z.object({
      name: z.string()
    })
  },
  async handler(req, res) {
    return res.send({ name: req.query.name })
  }
})
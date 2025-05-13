import { createApp } from "@fxfn/router/index.js"

import { registerRoutes } from "./routes"

async function main() {
  const app = await createApp({
    title: 'Test application',
    version: '1.0.0'
  })

  await registerRoutes(app)
  await app.ready()
  app.swagger()
  app.prettyRoutes()
  app.listen({ port: 3000 })
}

main()
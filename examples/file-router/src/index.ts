import { createApp } from "#/github.com/fxfn/router"

async function main() {
  const app = await createApp({
    fileRouter: {
      paths: ['./routes']
    }
  })

  app.listen({ port: 3000 })
}

main()
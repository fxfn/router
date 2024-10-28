import { createApp } from '#/github.com/fxfn/router'

async function main() {
  const app = await createApp()

  app.route({
    method: 'get',
    url: '/hello',
    async handler(req, res) {
      return res.send('hello world')
    }
  })

  app.listen({ port: 3000 })
}

main()
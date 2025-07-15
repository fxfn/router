import fp from "fastify-plugin"
import { FastifyInstance } from "fastify"
import { IRoute } from "../../interfaces/route"
import { Constructor } from "../../interfaces/container"
import { RouteDiscoveryStrategy } from "../../interfaces/route-discovery"

export type RouteDiscoveryOptions = {
  discovery?: {}
}

declare module 'fastify' {
  interface FastifyInstance {
    discoverRoutes: () => Promise<void>
    registerRoutes: () => void
  }
}

async function plugin(app: FastifyInstance, options: RouteDiscoveryOptions) {

  app.decorate('discoverRoutes', async () => {
    const strategies = app.container.resolveAll(RouteDiscoveryStrategy)
    for (let strategy of strategies) {
      const routes = await strategy.discover(app)
      for (const route of routes) {
        app.container.register(IRoute, { useClass: route as unknown as Constructor<IRoute> })
      }
    }
  })

  app.decorate('registerRoutes', () => {
    const routes = app.container.resolveAll(IRoute)

    for (const route of routes) {
      const urls = Array.isArray(route.url) ? route.url : [route.url]
      for (const url of urls) {
        app.route({
          method: route.method,
          url: url.startsWith(app.basePath) ? url : `${app.basePath}${url}`.replace('//', '/'),
          schema: {
            ...route.schema,
          },
          handler: route.handler.bind(route)
        })
      }
    }
  })
}

export default fp(plugin, {
  name: 'route-discovery',
  fastify: '>=5.0.0'
})
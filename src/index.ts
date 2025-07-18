import fastify, { FastifyHttpOptions } from "fastify"
import basePath, { BasePathOptions } from "./plugins/base-path"
import container, { ContainerOptions } from "./plugins/container"
import prettyRoutes from "./plugins/pretty-routes"
import swagger, { SwaggerOptions } from "./plugins/swagger"
import zod from "./plugins/zod"
import routeDiscovery, { RouteDiscoveryOptions } from "./plugins/route-discovery"
import result, { ResultOptions } from "./plugins/result"
import apiClient, { APIClientOptions } from "./plugins/api-client"
import urlContentType from "./plugins/url-content-type"

export type CreateAppOptions = FastifyHttpOptions<any, any>
  & BasePathOptions
  & SwaggerOptions
  & ContainerOptions
  & RouteDiscoveryOptions
  & ResultOptions
  & APIClientOptions

declare module 'fastify' {
  interface FastifyInstance {
    basePath: string
    resolve: (url: string) => string
    prepare: () => Promise<FastifyInstance<any, any, any, any>>
  }
}

export async function createApp(options?: CreateAppOptions) {
  const app = fastify({
    caseSensitive: false,
    exposeHeadRoutes: false,
    ...options
  })

  const pluginOptions = options ?? {}
  app.register(urlContentType, pluginOptions)
  app.register(basePath, pluginOptions)
  app.register(result, pluginOptions)
  app.register(zod, pluginOptions)
  app.register(apiClient, pluginOptions)
  app.register(prettyRoutes, pluginOptions)
  app.register(swagger, pluginOptions)
  app.register(container, pluginOptions)
  app.register(routeDiscovery, pluginOptions)

  app.prepare = async () => {
    if (options && options.container) {
      await app.discoverRoutes()
      app.registerRoutes()
    }

    await app.ready()
    return app
  }

  return app
}

export type App = Awaited<ReturnType<typeof createApp>>
export { IAppService } from "./interfaces/app-service"
export { IRoute, type RouteRequest, type RouteReply } from "./interfaces/route"
export { RouteDiscoveryStrategy } from "./interfaces/route-discovery"
export * from "./constants"
export { FileSystemRouteDiscoveryStrategy } from "./plugins/route-discovery/strategies/filesystem"

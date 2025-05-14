import fastify, { FastifyHttpOptions, FastifyInstance } from "fastify"
import { IncomingMessage, ServerResponse } from "node:http"
import { Http2ServerRequest, Http2ServerResponse } from "node:http2"
import basePath, { BasePathOptions } from "./plugins/base-path"
import container, { ContainerOptions } from "./plugins/container"
import prettyRoutes from "./plugins/pretty-routes"
import swagger, { SwaggerOptions } from "./plugins/swagger"
import zod from "./plugins/zod"
import routeDiscovery, { RouteDiscoveryOptions } from "./plugins/route-discovery"
import result, { ResultOptions } from "./plugins/result"
import apiClient, { APIClientOptions } from "./plugins/api-client"

export type App = FastifyInstance<
  any,
  IncomingMessage | Http2ServerRequest,
  ServerResponse | Http2ServerResponse
>

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

  app.register(basePath, options)
  app.register(result, options)
  app.register(zod)
  app.register(apiClient, options)
  app.register(prettyRoutes)
  app.register(swagger, options)
  app.register(container, options)
  app.register(routeDiscovery, options)

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

export { IRoute } from "./interfaces/route"
export { RouteDiscoveryStrategy } from "./interfaces/route-discovery"
export { FileSystemRouteDiscoveryStrategy, FileSystemRouteDiscoverySearchPatterns } from "./plugins/route-discovery/strategies/filesystem"

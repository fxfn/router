import fastify, { FastifyHttpOptions, FastifyInstance } from "fastify"
import basePath, { BasePathOptions } from "./plugins/base-path"
import zod from "./plugins/zod"
import prettyRoutes from "./plugins/pretty-routes"
import swagger, { SwaggerOptions } from "./plugins/swagger"
import { IncomingMessage, ServerResponse } from "http"
import { Http2ServerRequest, Http2ServerResponse } from "http2"
import container, { ContainerOptions } from "./plugins/container"

export type App = FastifyInstance<
  any,
  IncomingMessage | Http2ServerRequest,
  ServerResponse | Http2ServerResponse
>

export type CreateAppOptions = FastifyHttpOptions<any, any>
  & BasePathOptions
  & SwaggerOptions
  & ContainerOptions

declare module 'fastify' {
  interface FastifyInstance {
    basePath: string
    resolve: (url: string) => string
  }
}

export async function createApp(options?: CreateAppOptions) {
  const app = fastify({
    caseSensitive: false,
    exposeHeadRoutes: false,
    ...options
  })

  app.register(basePath, options)
  app.register(zod)
  app.register(prettyRoutes)
  app.register(swagger, options)
  app.register(container, options)

  return app
}
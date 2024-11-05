import fastify, { FastifyHttpOptions, FastifyInstance } from "fastify"
import { fileRoutes, type FileRouteOptions } from "./plugins/file-routes"
import { zodTypes } from "./plugins/zod"
import { errors } from "./plugins/errors"
import { swagger } from "./plugins/swagger"
import { result } from "./plugins/result"
import { prettyPrint } from "./plugins/print-routes"

export let app: FastifyInstance
export type App = typeof app

type RouterPlugin = (fastify: FastifyInstance) => Promise<void>

declare module "fastify" {
  interface FastifyInstance {
    basePath: string
    resolve: (url: string) => string
  }
}

type CreateAppOptions = FastifyHttpOptions<any, any> & {
  fileRouter?: FileRouteOptions
  basePath?: string
}

export async function createApp(options?: CreateAppOptions, plugins?: RouterPlugin[]) {
  app = fastify({
    caseSensitive: false,
    exposeHeadRoutes: false,
    ...options
  })

  app.decorate('basePath', options?.basePath || '/')
  app.decorate('resolve', (url: string) => {
    return [app.basePath, url.replace('/', '')].join('/').replace('//', '/')
  })

  app.register(zodTypes)
  app.register(errors)
  app.register(result)
  app.register(swagger)
  if (options?.fileRouter) {
    app.register(fileRoutes, { ...options?.fileRouter })
  }
  app.register(prettyPrint)
  
  for (let plugin of plugins || []) {
    app.register(plugin)
  }

  return app
}

export * from "./route"
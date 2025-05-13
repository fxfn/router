import { App } from "@fxfn/router/index.js"
import { container } from "@fxfn/inject/container.js"
import { glob } from "node:fs/promises"
import path from "node:path"
import { IRoute } from "@fxfn/router/interfaces/route.js"

export function route(route: new () => IRoute) {
  container.register(IRoute, { useClass: route })
}

export async function registerRoutes(app: App) {

  const search = [
    './routes/**/*.ts',
    './routes/*.ts',
    './routes/**/*.js',
    './routes/*.js'
  ]

  for (const pattern of search) {
    try {
      for await (const file of glob(pattern, { cwd: import.meta.dirname })) {
        console.log(`found route ${file}`)
        let module = await import(path.resolve(file))
        route(module.default)
      }
    } catch (error) {
      if (error.code === 'MODULE_NOT_FOUND') {
        continue
      }
      
      throw error
    }
  }

  const routes = container.resolveAll(IRoute)
  for (const route of routes) {
    
    const urls = Array.isArray(route.url) ? route.url : [route.url]
    for (const url of urls) {
      app.route({
        method: route.method,
        url,
        handler: route.handler.bind(route)
      })
    }
  }
}
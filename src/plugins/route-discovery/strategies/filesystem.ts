import { IRoute } from "@/interfaces/route"
import { glob } from "node:fs/promises"
import { RouteDiscoveryStrategy } from "@/interfaces/route-discovery"
import { App } from "@/index"
import { resolve } from "node:path"

/**
 * This is the token that is used to register the search patterns 
 * for the filesystem route discovery strategy.
 */
export const FileSystemRouteDiscoverySearchPatterns = Symbol('FileSystemRouteDiscoverySearchPatterns')

/**
 * This strategy will discover routes and register them in the container.
 * By default it will look for routes in the ./routes directoy and subdirectories.
 * By default it will look for *.ts and *.js files.
 * 
 * You can override the search patterns by registering a different value 
 * for the `FileSystemRouteDiscoverySearchPatterns` token.
 * see `tests/route-discovery/filesystem-discovery.test.ts` for an example.
 */
export class FileSystemRouteDiscoveryStrategy extends RouteDiscoveryStrategy {
  async discover(app: App) {
    const routes: IRoute[] = []

    const searchPatterns = app.container.resolve<string[]>(FileSystemRouteDiscoverySearchPatterns) ?? [
      './routes/**/*.ts',
      './routes/*.ts',
      './routes/**/*.js',
      './routes/*.js',
    ]

    for (const pattern of searchPatterns) {
      const files = await glob(pattern, {
        cwd: process.cwd(),
      })

      for await (const file of files) {
        const route = await import(resolve(process.cwd(), file))

        // iterate over all the exports in the route file that we just loaded.
        for (let key of Object.keys(route)) {
          const isClass = typeof route[key] === 'function' 
            && route[key].prototype 
            && /^\s*class\s+/.test(route[key].toString())

          if (isClass) {
            routes.push(route[key])
          }
        }
      }
    }

    return routes
  }
}
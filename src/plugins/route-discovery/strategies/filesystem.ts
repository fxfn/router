import { IRoute } from "../../../interfaces/route"
import { glob } from "node:fs/promises"
import { RouteDiscoveryStrategy } from "../../../interfaces/route-discovery"
import { type App } from "../../../index"
import { resolve } from "node:path"
import { RouterFileSystemRouteDiscoverySearchPatterns } from "../../../constants"

/**
 * This strategy will discover routes and register them in the container.
 * By default it will look for routes in the ./routes directoy and subdirectories.
 * By default it will look for *.ts and *.js files.
 * 
 * You can override the search patterns by registering a different value 
 * for the `FileSystemRouteDiscoverySearchPattern` token.
 * see `tests/route-discovery/filesystem-discovery.test.ts` for an example.
 */
export class FileSystemRouteDiscoveryStrategy extends RouteDiscoveryStrategy {
  async discover(app: App) {
    const routes: IRoute[] = []

    const defaultSearchPatterns = [
      './routes/**/*.ts',
      './routes/*.ts',
      './routes/**/*.js',
      './routes/*.js',
    ]

    let searchPatterns = defaultSearchPatterns
    try {
      searchPatterns = app.container.resolve(RouterFileSystemRouteDiscoverySearchPatterns)
    }
    catch {
      // no search patterns registered, use the default
    }

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
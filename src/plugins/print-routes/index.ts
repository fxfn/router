import { type FastifyInstance, type FastifyPluginOptions } from "fastify"
import fp from "fastify-plugin"

declare module "fastify" {
  interface FastifyInstance {
    prettyPrintRoutes: () => void
  }
}

async function plugin(fastify: FastifyInstance, options: FastifyPluginOptions) {
  // Store the original printRoutes function
  const originalPrintRoutes = fastify.printRoutes

  // Override the printRoutes function
  fastify.prettyPrintRoutes = function() {
    const routeTree = originalPrintRoutes.call(this)
    
    // Split the route tree into lines and process each one
    const routes = routeTree.split('\n')
    
    console.log('\nRoutes:')
    routes.forEach(route => {
      // Skip empty lines
      if (!route.trim()) return
      
      // Parse the route line
      const match = route.match(/([│├└].*)?([^ ]+) \((.*)\)/)
      if (match) {
        const [_, prefix, path, method] = match
        
        // If this is a nested route (has prefix), reconstruct the full path
        if (prefix) {
          const parentPath = routes
            .slice(0, routes.indexOf(route))
            .reverse()
            .find(r => !r.startsWith('│') && !r.startsWith('├') && !r.startsWith('└'))
            ?.match(/([^ ]+) \((.*)\)/)?.[1]
          
          if (parentPath) {
            // Remove the last part of the parent path if it matches the current path
            const parentParts = parentPath.split('/')
            const currentPath = path === 's' ? '' : `/${path}`
            console.log(`${parentPath}${currentPath} (${method})`)
            return
          }
        }
        
        // Print non-nested routes as-is
        console.log(`${path} (${method})`)
      }
    })
    
    console.log('') // Add empty line at the end
  }
}

export const fullRouteLogger = fp(plugin)
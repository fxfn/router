import { FastifyInstance } from "fastify";
import fp from "fastify-plugin"

declare module "fastify" {
  interface FastifyInstance {
    prettyRoutes(): void
  }
}

async function plugin(fastify: FastifyInstance) {

  fastify.decorate('prettyRoutes', () => {

    const input = fastify.printRoutes({ commonPrefix: false, includeHooks: false, includeMeta: false })

    function transformEndpoints(input: string): string {
      // First, let's handle the conversion of singular endpoints to plural
      const parentChildPattern = /^(.*?├── .*?)\n│\s+└── s\s+\((GET|POST|PUT|DELETE)\)/gm;
      
      return input.replace(parentChildPattern, (match, parentLine) => {
          // Get the base path and preserve the formatting
          const prefix = parentLine.match(/^.*?├──/)[0];
          const path = parentLine.match(/├── (.*?) \(/)[1];
          return `${parentLine}\n${prefix} ${path}s (GET)`;
      });
    }

    console.log(
      transformEndpoints(input)
    )
  })
}

export default fp(plugin, {
  name: 'pretty-routes',
  fastify: '>=5.0.0'
})
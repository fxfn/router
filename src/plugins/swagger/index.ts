import fastifySwagger from "@fastify/swagger"
import fastifySwaggerUi from "@fastify/swagger-ui"
import { FastifyInstance } from "fastify"
import fp from "fastify-plugin"
import { zodToJsonSchema } from "../zod/lib/zod-to-json-schema"
import { FastifySwaggerOptions } from "@fastify/swagger"

export type SwaggerOptions = {
  title?: string,
  version?: string
}

async function plugin(fastify: FastifyInstance, options: SwaggerOptions) {
  fastify.register(fastifySwagger, {
    stripBasePath: true,
    swagger: {
      info: {
        title: options.title || 'Router Application',
        version: options.version || '1.0.0'
      },
    },
    transform: zodToJsonSchema
  })

  fastify.register(fastifySwaggerUi, {
    routePrefix: fastify.basePath,
    logo: {
      content: '',
      type: 'image/svg+xml'
    },
    uiConfig: {
      deepLinking: true,
      showExtensions: true,
    }
  })

  if (fastify.basePath !== '/') {
    fastify.route({
      url: '/swagger',
      method: 'get',
      handler: (_, reply) => reply.redirect(`${fastify.basePath}/swagger`)
    })
  }
}

export default fp(plugin, {
  name: 'swagger',
  fastify: '>=5.0.0'
})
import fastifySwagger from "@fastify/swagger"
import fastifySwaggerUi from "@fastify/swagger-ui"
import { FastifyInstance } from "fastify";
import fp from "fastify-plugin"
import { jsonSchemaTransform } from "fastify-type-provider-zod";

async function plugin(app: FastifyInstance) {
  app.register(fastifySwagger, {
    stripBasePath: true,
    swagger: {
      info: {
        title: 'blocks',
        version: 'v1',
      },
      basePath: app.basePath,
    },
    transform: jsonSchemaTransform,
  })

  app.register(fastifySwaggerUi, {
    routePrefix: '/swagger',
    uiConfig: {
      deepLinking: true,
      showExtensions: true,
    },
  })
}

export const swagger = fp(plugin)
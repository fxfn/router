import { FastifyInstance, RouteOptions } from "fastify";
import fp from "fastify-plugin";
import * as fs from "node:fs";
import { dirname } from "node:path";
import { generateApiSchema } from "./lib/generate-api-schema";

export type APIClientOptions = {
  apiClient?: {
    enabled?: boolean
    outputPath?: string
  }
}

const defaultOptions: APIClientOptions = {
  apiClient: {
    enabled: false,
    outputPath: 'dist/api.d.ts'
  }
}

async function plugin(fastify: FastifyInstance, options: APIClientOptions) {

  const opts = Object.assign({}, defaultOptions, options)
  const routes: RouteOptions[] = []

  fastify.addHook('onRoute', async (route) => {
    if (!route.schema || route.schema.hide) {
      return
    }

    if (opts.apiClient.enabled) {
      routes.push(route)
    }
  })

  fastify.addHook('onReady', async () => {
    if (!opts.apiClient.enabled) {
      return
    }

    const outputDir = dirname(opts.apiClient.outputPath)
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir)
    }

    fs.writeFileSync(
      opts.apiClient.outputPath,
      generateApiSchema(routes)
    );
  })
}

export default fp(plugin, { fastify: ">=5.0.0" })
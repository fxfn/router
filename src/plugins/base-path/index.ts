import { FastifyInstance } from "fastify";
import fp from "fastify-plugin"
import path from "node:path";

export type BasePathOptions = {
  basePath?: string
}

declare module 'fastify' {
  interface FastifyInstance {
    basePath: string
    resolve: (url: string) => string
  }
}

async function plugin(fastify: FastifyInstance, options: BasePathOptions) {
  fastify.decorate('basePath', options.basePath || '/')
  fastify.decorate('resolve', (url: string) => {
    return [fastify.basePath, url.replace('/', '')].join('/').replace('//', '/')
  })
}

export default fp(plugin, {
  name: 'base-path',
  fastify: '>=5.0.0'
})
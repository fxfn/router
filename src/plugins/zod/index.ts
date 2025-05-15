import { FastifyInstance } from "fastify"
import fp from "fastify-plugin"
import { schemaCompilier, validatorCompiler } from "./lib/zod-schema-compiler"

async function plugin(fastify: FastifyInstance) {
  fastify.setSerializerCompiler(schemaCompilier)
  fastify.setValidatorCompiler(validatorCompiler)
}

export default fp(plugin, {
  name: 'zod-types',
  fastify: '>=5.0.0'
})

export { ZodTypeProvider } from "./lib/zod-schema-compiler"
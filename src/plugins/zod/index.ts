import fp from "fastify-plugin"
import { FastifyInstance } from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod"

async function zodTypesPlugin(fastify: FastifyInstance) {
  fastify.setValidatorCompiler(validatorCompiler)
  fastify.setSerializerCompiler(serializerCompiler)
}

export const zodTypes = fp(zodTypesPlugin, { fastify: ">=3.0.0" })
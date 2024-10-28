import { type FastifyInstance } from "fastify"
import fp from "fastify-plugin"

import { error } from "./error"
import { badRequest, badRequestError } from "../result/bad-request"
import { notFound } from "../result/not-found"
import { unauthorizedError } from "../result/unauthorized"
import { ZodError } from "zod"
import { unexpected } from "../result/unexpected"

declare module "fastify" {

  interface FastifyInstance {
    error: typeof error
  }
}

export async function errorHandler(fastify: FastifyInstance) {

  fastify.setErrorHandler(async function (error, request, reply) {
    if (error.code === 'FST_ERR_RESPONSE_SERIALIZATION') {
      return reply.status(500).send(
        unexpected.parse({
          success: false,
          error: {
            message: `The response was not what was expected`,
            details: error.cause instanceof ZodError ? error.cause.issues : error.cause
          },
          result: null
        })
      )
    }

    if (error.code === 'FST_ERR_VALIDATION') {
      console.log("!!!!!!", error)
      return reply.status(400).send(
        badRequest.parse({
          success: false,
          error: {
            message: `The request ${error.validationContext} was not valid`,
            details: error.validation
          },
          result: null
        })
      )
    }

    if (error.code === 'FST_ERR_ROUTE_MISSING_HANDLER') {
      return reply.status(404).send(
        notFound.parse({
          success: false,
          error: {
            message: `The route was not found`
          },
          result: null
        })
      )
    }

    return reply.status(500).send({ 
      success: false, 
      error: { 
        statusCode: 500,
        code: "SERVER_ERROR",
        message: error.message
      },
      result: null
    })
  })

  fastify.decorate('error', error)
}

export const errors = fp(errorHandler, { fastify: ">=3.0.0" })
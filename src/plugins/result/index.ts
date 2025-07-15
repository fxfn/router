import fp from "fastify-plugin"
import { FastifyInstance } from "fastify"
import { z } from "zod/v4"
import { ok } from "./status/ok"
import { unexpected, unexpectedError } from "./status/unexpected"
import { notFound, notFoundError } from "./status/not-found"
import { forbidden, forbiddenError } from "./status/forbidden"
import { unauthorized, unauthorizedError } from "./status/unauthorized"
import { badRequest, badRequestError } from "./status/bad-request"
import { conflict, conflictError } from "./status/conflict"
import { tooManyRequests, tooManyRequestsError } from "./status/too-many-requests"

declare module 'fastify' {
  interface FastifyReply {
    ok(data: unknown): FastifyReply
    unexpected(message: string, details?: Record<string, string>): FastifyReply
    notFound(message: string, details?: Record<string, string>): FastifyReply
    badRequest(message: string, details?: Record<string, string>): FastifyReply
    unauthorized(message: string, details?: Record<string, string>): FastifyReply
    forbidden(message: string, details?: Record<string, string>): FastifyReply
    conflict(message: string, details?: Record<string, string>): FastifyReply
    tooManyRequests(message: string, details?: Record<string, string>): FastifyReply
  }
}

export type ResultOptions = {
  result?: {} & any
}

async function plugin(app: FastifyInstance, options: ResultOptions) {

  app.decorateReply('ok', function(result: unknown) {
    return this.status(200).send(
      ok(z.object({}).loose().or(z.array(z.any()))).parse({
        success: true,
        error: null,
        result
      })
    )
  })
  
  app.decorateReply('unexpected', unexpectedError)
  app.decorateReply('notFound', notFoundError)
  app.decorateReply('badRequest', badRequestError)
  app.decorateReply('unauthorized', unauthorizedError)
  app.decorateReply('forbidden', forbiddenError)
  app.decorateReply('conflict', conflictError)
  app.decorateReply('tooManyRequests', tooManyRequestsError)
}

export default fp(plugin, {
  name: 'result',
  fastify: '>=5.0.0'
})

export { 
  ok,
  unexpected,
  notFound,
  badRequest,
  unauthorized,
  forbidden,
  conflict,
  tooManyRequests
}
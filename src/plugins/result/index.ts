import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { z } from "zod";

import { ok } from "./ok"
import { notFound, notFoundError } from "./not-found"
import { badRequest, badRequestError } from "./bad-request"; 
import { unauthorized, unauthorizedError } from "./unauthorized";
import { unexpectedError } from "./unexpected";

declare module "fastify" {

  interface FastifyReply {
    ok(result: object): FastifyReply
    notFound(message?: string): FastifyReply
    badRequest(message?: string): FastifyReply
    unauthorized(message?: string): FastifyReply
    unexpected(message?: string): FastifyReply
  }
}

async function plugin(fastify: FastifyInstance) {

  fastify.decorateReply('notFound', notFoundError)
  fastify.decorateReply('badRequest', badRequestError)
  fastify.decorateReply('unauthorized', unauthorizedError)
  fastify.decorateReply('unexpected', unexpectedError)
  fastify.decorateReply('ok', function(result: object) {
    return this.send(ok(z.object({}).passthrough()).parse({
      success: true,
      error: null,
      result
    }))
  })
}

export const result = fp(plugin)
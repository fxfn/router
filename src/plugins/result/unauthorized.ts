import { FastifyReply } from "fastify";
import { z } from "zod";
import { error } from "../errors/error"

export const unauthorized = error.merge(z.object({
  error: z.object({
    statusCode: z.literal(401).default(401),
    code: z.string().default("UNAUTHORIZED"),
    message: z.string()
  })
})).describe('Unauthorized')

export function unauthorizedError(this: FastifyReply, message?: string) {
  const error: z.infer<typeof unauthorized> = {
    success: false,
    error: {
      statusCode: 401,
      code: 'UNAUTHORIZED',
      message: message || "Unauthorized"
    },
    result: null
  }

  return this.code(401).send(error)
}
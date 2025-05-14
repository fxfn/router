import { z } from "zod"
import { error } from "./error"
import { FastifyReply } from "fastify"

export const badRequest = z.object({
  ...error.shape,
  error: z.object({
    code: z.literal('BAD_REQUEST'),
    message: z.string(),
    details: z.record(z.string(), z.string()).nullable()
  })
}).describe('Bad request')

export function badRequestError(this: FastifyReply, message: string, details?: Record<string, string>) {
  const error: z.infer<typeof badRequest> = {
    success: false,
    error: {
      code: 'BAD_REQUEST',
      message: message ?? 'Bad request',
      details: details ?? null
    },
    result: null
  }

  return this.status(400).send(error)
}
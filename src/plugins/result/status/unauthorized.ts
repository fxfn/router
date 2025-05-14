import { z } from "zod"
import { error } from "./error"
import { FastifyReply } from "fastify"

export const unauthorized = z.object({
  ...error.shape,
  error: z.object({
    code: z.literal('UNAUTHORIZED'),
    message: z.string(),
    details: z.record(z.string(), z.string()).nullable()
  })
}).describe('Unauthorized')

export function unauthorizedError(this: FastifyReply, message: string, details?: Record<string, string>) {
  const error: z.infer<typeof unauthorized> = {
    success: false,
    error: {
      code: 'UNAUTHORIZED',
      message: message ?? 'Unauthorized',
      details: details ?? null
    },
    result: null
  }

  return this.status(401).send(error)
}
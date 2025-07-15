import { z } from "zod/v4"
import { error } from "./error"
import { FastifyReply } from "fastify"

export const tooManyRequests = z.object({
  ...error.shape,
  error: z.object({
    code: z.literal('TOO_MANY_REQUESTS'),
    message: z.string(),
    details: z.record(z.string(), z.string()).nullable()
  })
}).describe('Too many requests')

export function tooManyRequestsError(this: FastifyReply, message: string, details?: Record<string, string>) {
  const error: z.infer<typeof tooManyRequests> = {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: message ?? 'Too many requests. Please try again later.',
      details: details ?? null
    },
    result: null
  }

  return this.status(429).send(error)
}
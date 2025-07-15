import { z } from "zod/v4"
import { error } from "./error"
import { FastifyReply } from "fastify"

export const unexpected = z.object({
  ...error.shape,
  error: z.object({
    code: z.literal('UNEXPECTED_SERVER_ERROR'),
    message: z.string(),
    details: z.record(z.string(), z.string()).nullable()
  })
}).describe('Internal server error')

export function unexpectedError(this: FastifyReply, message: string, details?: Record<string, string>) {
  const error: z.infer<typeof unexpected> = {
    success: false,
    error: {
      code: 'UNEXPECTED_SERVER_ERROR',
      message: message ?? 'Unexpected server error',
      details: details ?? null
    },
    result: null
  }

  return this.status(500).send(error)
}
import { z } from "zod"
import { error } from "./error"
import { FastifyReply } from "fastify"

export const notFound = z.object({
  ...error.shape,
  error: z.object({
    code: z.literal('NOT_FOUND'),
    message: z.string(),
    details: z.record(z.string(), z.string()).nullable()
  })
}).describe('Not found')

export function notFoundError(this: FastifyReply, message: string, details?: Record<string, string>) {
  const error: z.infer<typeof notFound> = {
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: message ?? 'Not found',
      details: details ?? null
    },
    result: null
  }

  return this.status(404).send(error)
}
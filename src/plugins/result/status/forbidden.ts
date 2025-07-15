import { z } from "zod/v4"
import { error } from "./error"
import { FastifyReply } from "fastify"

export const forbidden = z.object({
  ...error.shape,
  error: z.object({
    code: z.literal('FORBIDDEN'),
    message: z.string(),
    details: z.record(z.string(), z.string()).nullable()
  })
}).describe('Forbidden')

export function forbiddenError(this: FastifyReply, message: string, details?: Record<string, string>) {
  const error: z.infer<typeof forbidden> = {
    success: false,
    error: {
      code: 'FORBIDDEN',
      message: message ?? 'Forbidden',
      details: details ?? null
    },
    result: null
  }

  return this.status(403).send(error)
}
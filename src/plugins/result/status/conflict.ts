import { z } from "zod/v4"
import { error } from "./error"
import { FastifyReply } from "fastify"

export const conflict = z.object({
  ...error.shape,
  error: z.object({
    code: z.literal('CONFLICT'),
    message: z.string(),
    details: z.record(z.string(), z.string()).nullable()
  })
}).describe('Conflict')

export function conflictError(this: FastifyReply, message: string, details?: Record<string, string>) {
  const error: z.infer<typeof conflict> = {
    success: false,
    error: {
      code: 'CONFLICT',
      message: message ?? 'Conflict detected with the state of the resource',
      details: details ?? null
    },
    result: null
  }

  return this.status(409).send(error)
}
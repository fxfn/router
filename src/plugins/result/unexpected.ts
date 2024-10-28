import { z } from "zod"
import { error } from "../errors/error";
import { FastifyReply } from "fastify";

export const unexpected = error.merge(z.object({
  error: z.object({
    statusCode: z.literal(500).default(500),
    code: z.string().default("UNEXPECTED_SERVER_ERROR"),
    message: z.string(),
    details: z.any().default([])
  }),
  result: z.literal(null)
}))

export function unexpectedError(this: FastifyReply, message?: string) {
  const error: z.infer<typeof unexpected> = {
    success: false,
    error: {
      statusCode: 500,
      code: 'UNEXPECTED_SERVER_ERROR',
      message: message || "Unexpected server error"
    },
    result: null
  }

  return this.code(500).send(error)
}
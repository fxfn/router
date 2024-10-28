import { FastifyReply } from "fastify";
import { z } from "zod";
import { error } from "../errors/error"

export const notFound = error.merge(z.object({
  error: z.object({
    statusCode: z.literal(404).default(404),
    code: z.literal("NOT_FOUND").default("NOT_FOUND"),
    message: z.string()
  })
})).describe("Not found")

export function notFoundError(this: FastifyReply, message?: string) {
  const error: z.infer<typeof notFound> = {
    success: false,
    error: {
      statusCode: 404,
      code: 'NOT_FOUND',
      message: message || "Not found"
    },
    result: null
  }

  return this.code(404).send(error)
}
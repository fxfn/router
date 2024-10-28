import { z } from "zod"
import { error } from "../errors/error";
import { FastifyReply } from "fastify";

export const badRequest = error.merge(z.object({
  error: z.object({
    statusCode: z.literal(400).default(400),
    code: z.string().default("BAD_REQEUST"),
    message: z.string(),
    details: z.any().default([])
  }),
  result: z.literal(null)
}))

export function badRequestError(this: FastifyReply, message?: string) {
  const error: z.infer<typeof badRequest> = {
    success: false,
    error: {
      statusCode: 400,
      code: 'BAD_REQUEST',
      message: message || "Bad request"
    },
    result: null
  }

  return this.code(400).send(error)
}
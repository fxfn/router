import createError from "@fastify/error";
import { z, ZodError } from "zod/v4";

export class ResponseSerializationError extends createError<[{ cause: ZodError }]>('FST_ERR_RESPONSE_SERIALIZATION', 'Response doesn\'t match the schema', 500) {
  cause!: z.ZodError

  constructor(
    public method: string,
    public url: string,
    options: { cause: z.ZodError }
  ) {
    super({ cause: options.cause })
  }
}
import { z } from "zod"

export const error = z.object({
  success: z.literal(false),
  error: z.object({
    statusCode: z.number(),
    code: z.string(),
    message: z.string()
  }),
  result: z.literal(null)
})
import { z, type ZodSchema } from "zod"

export const ok = (result: ZodSchema) => z.object({
  success: z.literal(true),
  error: z.literal(null),
  result
})

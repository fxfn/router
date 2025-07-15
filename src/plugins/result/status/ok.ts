import z from "zod/v4";

export const ok = <T extends z.ZodType>(result?: T) => z.object({
  success: z.literal(true).or(z.boolean()),
  error: z.literal(null),
  result: result ?? z.null()
}).describe('OK')
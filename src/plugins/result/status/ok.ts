import z from "zod";

export const ok = <T extends z.ZodType>(result?: T) => z.object({
  success: z.literal(true),
  error: z.literal(null),
  result: result ?? z.null()
}).describe('OK')
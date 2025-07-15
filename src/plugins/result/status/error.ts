import z from "zod/v4"

export const error = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.string(), z.string()).nullable()
  }),
  result: z.literal(null)
})

export function createError(code: string, message: string, details?: Record<string, string>) {
  return error.parse({
    success: false,
    error: {
      code,
      message,
      details: details ?? null
    },
    result: null
  })
}
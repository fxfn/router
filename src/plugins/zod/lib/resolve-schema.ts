import z from "zod"
import { InvalidSchemaError } from "../errors/invalid-schema-error"

export function resolveSchema(maybeSchema: z.ZodType | { properties: z.ZodType }): z.ZodType {
  if ('safeParse' in maybeSchema) {
    return maybeSchema
  }
  if ('properties' in maybeSchema) {
    return maybeSchema.properties
  }

  throw new InvalidSchemaError(JSON.stringify(maybeSchema))
}
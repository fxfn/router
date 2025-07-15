import { FastifySchemaCompiler, FastifyTypeProvider } from "fastify"
import { FastifySerializerCompiler } from "fastify/types/schema"
import { z } from "zod/v4"
import { ResponseSerializationError } from "../errors/response-serialization-error"
import { resolveSchema } from "./resolve-schema"

export interface ZodTypeProvider extends FastifyTypeProvider {
  validator: this['schema'] extends z.ZodType ? z.output<this['schema']> : unknown
  serializer: this['schema'] extends z.ZodType ? z.input<this['schema']> : unknown
}

export type SchemaCompilerOptions = {
  replacer?: (this: any, key: string, value: any) => any
}

export const createSerializerCompiler = (
  options?: SchemaCompilerOptions
): FastifySerializerCompiler<z.ZodType | { properties: z.ZodType }> => ({ schema: maybeSchema, method, url }) => data => {

  const schema = resolveSchema(maybeSchema)
  const result = schema.safeParse(data)
  if (result.error) {
    throw new ResponseSerializationError(method, url, { cause: result.error })
  }

  return JSON.stringify(result.data, options?.replacer)
}

export const schemaCompilier = createSerializerCompiler({})

export const ZodFastifySchemaValidationErrorSymbol = Symbol.for('ZodFastifySchemaValidationError')

export const validatorCompiler: FastifySchemaCompiler<z.ZodType> = ({ schema }) => data => {

  // fix dates in schema
  for (const key in (schema as any).shape) {
    // @ts-ignore
    if (schema.shape[key].def.type === 'date') {
      // @ts-ignore
      schema.shape[key] = z.string().or(z.date()).or(z.iso.datetime()).transform((date) => date ? new Date(date) : null)
    }
  }

  const result = schema.safeParse(data)
  if (result.error) {

    const errors = result.error.issues.map(issue => ({
      [ZodFastifySchemaValidationErrorSymbol]: true,
      keyword: issue.code,
      instancePath: `/${issue.path.join('/')}`,
      schemaPath: `#/${issue.path.join('/')}/${issue.code}`,
      params: { issue },
      message: issue.message
    }))

    return { error: errors as unknown as Error }
  }

  return { value: result.data }
}
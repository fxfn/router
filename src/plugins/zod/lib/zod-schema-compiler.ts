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

  // Helper function to check if a field is ultimately a date type
  const isDateType = (zodField: any): boolean => {
    if (zodField.def.type === 'date') {
      return true
    }
    if (zodField.def.type === 'optional' || zodField.def.type === 'nullish' || zodField.def.type === 'nullable') {
      return isDateType(zodField.def.innerType)
    }
    return false
  }

  // Helper function to transform date fields recursively
  const transformDateFields = (schemaObj: any) => {
    if (!schemaObj.shape) return

    for (const key in schemaObj.shape) {
      const field = schemaObj.shape[key]
      
      // Handle array types
      if (field.def.type === 'array') {
        transformDateFields(field.def.element)
        continue
      }
      
      // Handle object types (nested objects)
      if (field.def.type === 'object') {
        transformDateFields(field)
        continue
      }
      
      // Check if it's a date field (direct date or wrapped in optional/nullish/nullable)
      const isDateField = isDateType(field)
      
      if (isDateField) {
        // Create a new schema that accepts strings and transforms them to dates
        const dateSchema = z.string()
          .or(z.date())
          .or(z.iso.datetime())
          .transform((date) => date ? new Date(date) : null)
        
        // Preserve the original wrapper (optional/nullish/nullable)
        if (field.def.type === 'optional') {
          schemaObj.shape[key] = dateSchema.optional()
        } else if (field.def.type === 'nullish') {
          schemaObj.shape[key] = dateSchema.nullish()
        } else if (field.def.type === 'nullable') {
          schemaObj.shape[key] = dateSchema.nullable()
        } else {
          schemaObj.shape[key] = dateSchema
        }
      }
    }
  }

  // Transform date fields in the schema
  transformDateFields(schema)

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
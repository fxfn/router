import { FastifySchema } from "fastify"
import { z } from "zod/v4"
import { resolveSchema } from "./resolve-schema"

type FreeformRecord = Record<string, any>

export const createJsonSchemaTransform = ({ skipList }: { skipList: readonly string[] }) => {
  return ({ schema, url }: { schema: FastifySchema, url: string }) => {

    if (!schema) {
      return {
        schema,
        url
      }
    }

    const { response, headers, querystring, body, params, hide, ...rest } = schema as any
    const transformed: FreeformRecord = {}
    if (skipList.includes(url) || hide) {
      transformed.hide = true
      return { schema: transformed, url }
    }

    const zodSchemas: FreeformRecord = { headers, querystring, body, params }
    for (const prop in zodSchemas) {
      const zodSchema = zodSchemas[prop]
      if (zodSchema) {
        transformed[prop] = z.toJSONSchema(zodSchema, {
          unrepresentable: 'any',
          override: (ctx) => {
            const def = ctx.zodSchema._zod.def
            if (def.type === 'date') {
              ctx.jsonSchema.type = 'string'
              ctx.jsonSchema.format = 'date-time'
            }
          }
        })
      }
    }

    if (response) {
      transformed.response = {}

      for (const prop in response as any) {
        const schema = resolveSchema((response as any)[prop])
        const transformedResponse = z.toJSONSchema(schema, {
          unrepresentable: 'any',
          override: (ctx) => {
            const def = ctx.zodSchema._zod.def
            if (def.type === 'date') {
              ctx.jsonSchema.type = 'string'
              ctx.jsonSchema.format = 'date-time'
            }
            if (def.type === 'null') {
              ctx.jsonSchema.type = 'string'
              ctx.jsonSchema.default = null
            }
          }
        })
        transformed.response[prop] = transformedResponse
      }
    }

    for (const prop in rest) {
      const meta = rest[prop as keyof typeof rest]
      if (meta) {
        transformed[prop] = meta
      }
    }

    return { schema: transformed, url }
  }
}

const defaultSkipList = [
  '/static/*',
  '/json',
  '/yaml'
]

export const zodToJsonSchema = createJsonSchemaTransform({ skipList: defaultSkipList })
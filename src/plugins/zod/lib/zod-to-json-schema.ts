import { FastifySchema } from "fastify"
import { z } from "zod"
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

    const { response, headers, querystring, body, params, hide, ...rest } = schema
    const transformed: FreeformRecord = {}
    if (skipList.includes(url) || hide) {
      transformed.hide = true
      return { schema: transformed, url }
    }

    const zodSchemas: FreeformRecord = { headers, querystring, body, params }
    for (const prop in zodSchemas) {
      const zodSchema = zodSchemas[prop]
      if (zodSchema) {
        transformed[prop] = z.toJSONSchema(zodSchema)
      }
    }

    if (response) {
      transformed.response = {}

      for (const prop in response as any) {
        const schema = resolveSchema((response as any)[prop])
        const transformedResponse = z.toJSONSchema(schema)
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
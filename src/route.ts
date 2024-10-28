import { ContextConfigDefault, FastifyInstance, FastifyRequest, FastifySchema, HTTPMethods, RawReplyDefaultExpression, RawRequestDefaultExpression, RawServerDefault, RouteGenericInterface, RouteOptions } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"

export function route<
  RouteGeneric extends RouteGenericInterface = RouteGenericInterface,
  ContextConfig = ContextConfigDefault,
  SchemaCompiler extends FastifySchema = FastifySchema,
>(
  this: unknown,
  opts: Omit<RouteOptions<RawServerDefault, RawRequestDefaultExpression<RawServerDefault>, RawReplyDefaultExpression<RawServerDefault>, RouteGeneric, ContextConfig, SchemaCompiler, ZodTypeProvider>, 'url' | 'method'> & {
    method?: HTTPMethods | HTTPMethods[],
    auth?: boolean,
    scope?: string[]
    url?: string
    verifiers?: {
      all?: Array<(req: FastifyRequest, app: FastifyInstance) => Promise<boolean>>
      any?: Array<(req: FastifyRequest, app: FastifyInstance) => Promise<boolean>>
    }
  }
) {
  return opts
}

export type Route = typeof route

export function createRegisterRoute(app: FastifyInstance) {
  return function registerRoute<
    RouteGeneric extends RouteGenericInterface = RouteGenericInterface,
    ContextConfig = ContextConfigDefault,
    SchemaCompiler extends FastifySchema = FastifySchema,
  >(
    url: string,
    method: HTTPMethods | HTTPMethods[],
    opts: Omit<
      RouteOptions<
        RawServerDefault, 
        RawRequestDefaultExpression<RawServerDefault>, 
        RawReplyDefaultExpression<RawServerDefault>, 
        RouteGeneric, 
        ContextConfig, 
        SchemaCompiler, 
        ZodTypeProvider
      > & { 
        auth?: boolean 
        scope?: string[]
        verifiers?: {
          any?: Array<(req: FastifyRequest, app: FastifyInstance) => Promise<boolean>>,
          all?: Array<(req: FastifyRequest, app: FastifyInstance) => Promise<boolean>>
        }
      }, 'url' | 'method'
    >
  ) {
    const tags = url.replace(app.basePath, '/').replace('//', '/').split('/')
    const tag = tags.length > 1
      ? tags[1]
      : "common"

    app.route({
      url,
      method,
      ...opts,
      schema: {
        tags: [tag],
        ...opts.schema
      } as any,
    })
  }
}
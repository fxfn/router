import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify"
import { z, ZodType } from "zod/v4"

type RouteHandler = (req: RouteRequest, reply: RouteReply) => Promise<boolean>

export type RouteRequest<T extends Pick<IRoute, 'schema'> = IRoute> = FastifyRequest<{
  Body: z.infer<NonNullable<T["schema"]["body"]>>
  Querystring: z.infer<NonNullable<T["schema"]["querystring"]>>
  Params: z.infer<NonNullable<T["schema"]["params"]>>
}>

export type RouteReply<T extends Pick<IRoute, 'schema'> = IRoute> = FastifyReply<{
  Reply: z.infer<NonNullable<T["schema"]["response"]>[200]>
}>

export type PreRequestHook = RouteHandler

export type RouteSchema = {
  auth?: {
    user?: boolean,
    bearer?: boolean,
  }
  body?: ZodType
  querystring?: ZodType
  params?: ZodType
  headers?: ZodType
  response?: {
    [index: number]: ZodType
  }
  tags?: string[]
}

export type RouteVerifiers = 
  | {
    any?: RouteHandler[],
    all?: RouteHandler[],
  }
  | undefined

export abstract class IRoute {
  abstract url: string | string[]
  abstract method: HTTPMethods | HTTPMethods[]
  abstract schema: RouteSchema
  abstract verifiers?: RouteVerifiers
  abstract handler(
    request: RouteRequest, 
    reply: FastifyReply
  ): Promise<
    NonNullable<this['schema']['response']>[200]['_output']
  >
}
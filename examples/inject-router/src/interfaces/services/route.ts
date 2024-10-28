import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify"
import { TypeOf, ZodSchema } from "zod"

export type RouteRequest<T extends IRoute = IRoute> = FastifyRequest<{
  Body: TypeOf<NonNullable<T["schema"]["body"]>>
  Querystring: TypeOf<NonNullable<T["schema"]["querystring"]>>
}>

export type RouteReply<T extends IRoute = IRoute> = FastifyReply<{
  Reply: TypeOf<NonNullable<T["schema"]["response"]>[200]>
}>

type RouteSchema = {
  body?: ZodSchema
  querystring?: ZodSchema
  params?: ZodSchema
  headers?: ZodSchema
  response?: {
    [index: number]: ZodSchema
  }
}

export abstract class IRoute {
  abstract url: string
  abstract method: HTTPMethods | HTTPMethods[]
  abstract schema: RouteSchema
  abstract handler(req: RouteRequest, reply: FastifyReply): Promise<FastifyReply>
}
import { describe, it, expect } from "vitest";
import { createApp } from "../src";
import { z } from "zod/v4";
import { badRequest, notFound, ok, unauthorized, unexpected } from "../src/plugins/result";
import { existsSync, readFileSync, unlinkSync } from "node:fs";

describe('api client plugin', () => {
  it('should generate api definiton', async () => {
    const app = await createApp({
      apiClient: {
        enabled: true,
        outputPath: 'simple-api.d.ts'
      }
    })

    app.route({
      method: 'post',
      url: '/users/:id',
      schema: {
        params: z.object({
          id: z.string()
        }),
        body: z.object({
          user: z.object({
            name: z.string(),
            email: z.email()
          })
        }),
        response: {
          200: ok(
            z.object({
              message: z.string()
            })
          )
        }
      },

      async handler(req, reply) {
        return reply.ok({
          message: 'Thanks for creating a user'
        })
      }
    })
    
    await app.ready()

    const content = readFileSync('simple-api.d.ts').toString()
    expect(content).toContain('export type APISchema = {')
    expect(content).toContain('export type APISchema = {')
    unlinkSync('simple-api.d.ts')
  })

  it('should generate api definition for a complex schema', async () => {
    const app = await createApp({
      apiClient: {
        enabled: true,
        outputPath: 'complex-api.d.ts'
      }
    })

    app.route({
      method: 'get',
      url: '/users',
      schema: {
        querystring: z.object({
          filter: z.string().nullish(),
          max_result_ccount: z.number().nullish(),
          skip_count: z.number().nullish(),
          sorting: z.enum(['asc', 'desc']).nullish()
        }),
        response: {
          200: ok(z.object({
            items: z.array(
              z.object({
                id: z.uuid(),
                name: z.string(),
                email: z.email(),
                active: z.boolean(),
                last_login: z.iso.datetime(),
                created_at: z.iso.datetime(),
                foo: z.intersection(
                  z.object({
                    bar: z.string()
                  }),
                  z.object({
                    baz: z.string()
                  })
                ),
                bar: z.string().default('foo'),
                settings: z.array(
                  z.tuple([z.string(), z.string()])
                ),
                details: z.discriminatedUnion('role', [
                  z.object({
                    role: z.literal('admin'),
                    permissions: z.literal(['create', 'read', 'update', 'delete'])
                  }),
                  z.object({
                    role: z.literal('user'),
                    permissions: z.literal(['read'])
                  })
                ])
              })
            ),
            total: z.number()
          })),
          404: notFound,
          400: badRequest,
          401: unauthorized,
          500: unexpected
        }
      },

      async handler(req, reply) {
        return reply.ok({
          items: [{
            id: crypto.randomUUID(),
            name: 'John Doe',
            email: 'john.doe@example.com',
            active: true,
            last_login: new Date(),
            created_at: new Date(),
            foo: {
              bar: 'foo',
              baz: 'foo'
            },
            settings: [
              ['theme', 'light'],
              ['language', 'en']
            ],
            details: {
              role: 'admin',
              permissions: ['create', 'read', 'update', 'delete']
            }
          }, {
            id: crypto.randomUUID(),
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
            active: true,
            last_login: new Date(),
            created_at: new Date(),
            foo: {
              bar: 'foo',
              baz: 'foo'
            },
            settings: [
              ['theme', 'dark'],
              ['language', 'fr']
            ],
            details: {
              role: 'user',
              permissions: ['read']
            }
          }],
          total: 2
        })
      }
    })

    await app.ready()
    expect(existsSync('complex-api.d.ts')).toBe(true)

    const content = readFileSync('complex-api.d.ts').toString()
    expect(content).toContain('export type APISchema = {')
    expect(content).toContain('export type APISchema = {')
    unlinkSync('complex-api.d.ts')
  })
})
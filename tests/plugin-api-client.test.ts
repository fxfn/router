import { describe, it } from "node:test";
import assert from "node:assert";
import { createApp } from "../src";
import z from "zod";
import { badRequest, notFound, ok, unauthorized, unexpected } from "@/plugins/result";
import { existsSync, readFileSync } from "node:fs";

describe('api client plugin', () => {
  it('should generate api definiton', async () => {
    const app = await createApp({
      apiClient: {
        enabled: true,
        outputPath: 'dist/api.d.ts'
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
          ),
          404: notFound,
          400: badRequest,
          401: unauthorized,
          500: unexpected
        }
      },

      async handler(req, reply) {
        return reply.ok({
          message: 'Thanks for creating a user'
        })
      }
    })
    
    await app.ready()
    assert.ok(
      existsSync('dist/api.d.ts')
    )

    const content = readFileSync('dist/api.d.ts').toString()
    assert.ok(content.includes('export type APISchema = {'))
    assert.ok(content.includes('export type APISchema = {'))
  })
})
import { describe, it } from "node:test"
import assert from "node:assert"
import { createApp } from "#/github.com/fxfn/router"

describe('app', () => {
  it('createApp should return a fastify instance', async () => {
    const app = await createApp()
    assert.ok(app != null, "createApp is null")
  })
})
import { createApp } from "@/index"
import { RouteDiscoveryStrategy } from "@/interfaces/route-discovery"
import { FileSystemRouteDiscoverySearchPatterns, FileSystemRouteDiscoveryStrategy } from "@/plugins/route-discovery/strategies/filesystem"
import assert from "node:assert"
import { describe, it } from "node:test"
import { TestContainer } from "../lib/container"

describe('route discovery - filesystem', () => {

  it('should discover routes from the filesystem', async () => {
    const app = await createApp({
      container: new TestContainer()
    })

    app.container.register(FileSystemRouteDiscoverySearchPatterns, { 
      useValue: [
        './tests/route-discovery/routes/*.ts',
      ]
    })
    app.container.register(RouteDiscoveryStrategy, { useClass: FileSystemRouteDiscoveryStrategy })

    await app.prepare()
    const res = await app.inject({
      method: 'get',
      url: '/users/abc-123'
    })

    assert.ok(res.statusCode === 200, `/users/abc-123 filesystem route was not registered, status code should be 200 was ${res.statusCode}`)
  })
})


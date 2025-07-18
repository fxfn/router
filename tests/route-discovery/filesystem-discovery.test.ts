import { createApp } from "../../src/index"
import { RouteDiscoveryStrategy } from "../../src/interfaces/route-discovery"
import { FileSystemRouteDiscoveryStrategy } from "../../src/plugins/route-discovery/strategies/filesystem"
import { RouterFileSystemRouteDiscoverySearchPatterns } from "../../src/constants"
import { describe, it, expect } from "vitest"
import { TestContainer } from "../lib/container"

describe('route discovery - filesystem', () => {

  it('should discover routes from the filesystem', async () => {
    const app = await createApp({
      container: new TestContainer()
    })

    app.container.register(RouterFileSystemRouteDiscoverySearchPatterns, { 
      useValue: [
        './packages/router/tests/route-discovery/routes/*.ts',
      ]
    })
    app.container.register(RouteDiscoveryStrategy, { useClass: FileSystemRouteDiscoveryStrategy })

    await app.prepare()
    const res = await app.inject({
      method: 'get',
      url: '/users/abc-123'
    })

    expect(res.statusCode).toBe(200)
  })
})


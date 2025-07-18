import { createApp } from "../src/index"
import { describe, it, expect } from "vitest"
import { TestContainer } from "./lib/container"

describe('inject plugin', () => {
  it('should throw an error if app.container is accessed without a container', async () => {
    const app = await createApp()
    expect(() => app.container.resolve('test')).toThrow('You called app.container but you did not provide a container. Please use createApp({ container: ... }) to provide a container.')
  })

  it('should not throw an error if app.container is accessed if a container is provided', async () => {
    const app = await createApp({ container: new TestContainer() })
    expect(app.container).toBeInstanceOf(TestContainer)

    class MyClass {
      foo = "bar"
    }

    expect(() => app.container.register('test', { useClass: MyClass })).not.toThrow()
  })
})

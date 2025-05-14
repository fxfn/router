import { createApp } from "@/index"
import assert from "node:assert"
import { describe, it } from "node:test"
import { TestContainer } from "./lib/container"

describe('inject plugin', () => {
  it('should throw an error if app.container is accessed without a container', async () => {
    const app = await createApp()
    assert.throws(() => app.container.resolve('test'), Error, 'You called app.container.resolve() but you did not provide a container. Please use createApp({ container: ... }) to provide a container.')
  })

  it('should not throw an error if app.container is accessed if a container is provided', async () => {
    const app = await createApp({ container: new TestContainer() })
    assert.ok(app.container instanceof TestContainer, 'app.container should be an instance of TestContainer')

    class MyClass {
      foo = "bar"
    }

    assert.doesNotThrow(
      () => app.container.register('test', { useClass: MyClass }),
      'should not throw an error if a container is provided'
    )
  })
})

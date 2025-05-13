import fp from "fastify-plugin"
import { FastifyInstance } from "fastify"
import { AbstractConstructor, Constructor, Container, Provider } from "../../interfaces/container.js"

export type ContainerOptions = {
  container?: Container
}

declare module 'fastify' {
  interface FastifyInstance {
    container: Container
  }
}

async function plugin(app: FastifyInstance, options: ContainerOptions) {

  class FakeContainer extends Container {
    register<T>(token: string | symbol | Constructor<T> | AbstractConstructor<T>, providerOrConstructor: Provider<T> | Constructor<T>, options?: { lifecycle: Lifecycle; tag?: string }): void {
      throw new Error('You called app.container.register() but you did not provide a container. Please use createApp({ container: ... }) to provide a container.')
    }

    resolve<T>(token: string | symbol | Constructor<T> | AbstractConstructor<T>, tag?: string): T {
      throw new Error('You called app.container.resolve() but you did not provide a container. Please use createApp({ container: ... }) to provide a container.')
    }

    resolveAll<T>(token: string | symbol | Constructor<T> | AbstractConstructor<T>, tag?: string): T[] {
      throw new Error('You called app.container.resolveAll() but you did not provide a container. Please use createApp({ container: ... }) to provide a container.')
    }

    createContainer(): Container {
      throw new Error('You called app.container.createContainer() but you did not provide a container. Please use createApp({ container: ... }) to provide a container.')
    }
  }

  if (options.container) {
    app.decorate('container', options.container)
  } else {
    app.decorate('container', new FakeContainer())
  }
}

export default fp(plugin, {
  name: 'container',
  fastify: '>=5.0.0'
})
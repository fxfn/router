import fp from "fastify-plugin"
import { FastifyInstance } from "fastify"
import { 
  AbstractConstructor, Constructor, Container, 
  Lifecycle, NoConatinerError, Provider 
} from "../../interfaces/container.js"

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
      throw new NoConatinerError()
    }

    resolve<T>(token: string | symbol | Constructor<T> | AbstractConstructor<T>, tag?: string): T {
      throw new NoConatinerError()
    }

    resolveAll<T>(token: string | symbol | Constructor<T> | AbstractConstructor<T>, tag?: string): T[] {
      throw new NoConatinerError()
    }

    createContainer(): Container {
      throw new NoConatinerError()
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
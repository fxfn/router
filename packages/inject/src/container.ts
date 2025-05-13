import { Registry } from "./registry"
import { isProvider, type Provider } from "./providers";
import { isClassProvider } from "./providers/class-provider";
import { Lifecycle } from "./lifecycle";
import { Constructor, InjectionToken } from "./types";

type RegistrationOptions = {
  lifecycle: Lifecycle;
  tag?: string
};

type Registration<T = any> = {
  provider: Provider<T>;
  options: RegistrationOptions;
  instance?: T;
  tag?: string
};

type ContainerConstructorOptions = {
  parent: Container
}

export class Container<T = any> {

  private _registry = new Registry<Registration>()
  parent?: Container

  private construct<T>(
    ctor: Constructor<T>
  ): T {
    const instance: T = (() => {
      return new ctor()
    })()

    return instance
  }

  constructor(opts?: ContainerConstructorOptions) {
    this.parent = opts?.parent
  }

  register<T>(
    token: InjectionToken<T>, 
    providerOrConstructor: Provider<T> | Constructor<T>,
    options: RegistrationOptions = { lifecycle: Lifecycle.Transient }
  ) {
    let provider: Provider<T>
    let tag = providerOrConstructor.tag || undefined
    if (!isProvider(providerOrConstructor)) {
      provider = { useClass: providerOrConstructor }
    }
    else {
      provider = providerOrConstructor
    }

    this._registry.set(token, { provider, tag, options })
  }

  private resolveRegistration<T>(registration: Registration): T {
    const isSingleton = registration.options.lifecycle === Lifecycle.Singleton
    const isContainerScoped = registration.options.lifecycle === Lifecycle.ContainerScoped

    const returnInstance = isSingleton || isContainerScoped
    
    let resolved: T
    if (isClassProvider(registration.provider)) {
      if (returnInstance) {
        if (!registration.instance) {
          registration.instance = this.construct(registration.provider.useClass)
        }

        resolved = registration.instance
      }
      else {
        resolved = this.construct(registration.provider.useClass)
      }

      return resolved
    }

    throw new Error('UnknownRegistration')
  }

  private isRegistered<T>(token: InjectionToken<T>): boolean {
    return this._registry.has(token)
  }

  private getRegistration<T>(token: InjectionToken<T>, tag?: string): Registration | null {
    if (this.isRegistered(token)) {
      return this._registry.get(token, tag)!
    }

    return null
  }

  private getAllRegistration<T>(token: InjectionToken<T>): Registration[] | null {
    if (this.isRegistered(token)) {
      return this._registry.getAll(token)
    }

    return null
  }

  resolve<T>(token: InjectionToken<T>, tag?: string): T {
    let registration = this.getRegistration(token, tag)
    if (registration) {
      return this.resolveRegistration(registration) as T
    }

    throw new Error('UndefinedConstructor')
  }

  resolveAll<T>(token: InjectionToken<T>, tag?: string): T[] {
    let registrations = this.getAllRegistration(token)
    if (registrations) {
      return registrations.map(item => this.resolveRegistration(item))
    }

    return []
  }

  createContainer(): Container {
    return new Container({ parent: this })
  }
}

export const container = new Container()
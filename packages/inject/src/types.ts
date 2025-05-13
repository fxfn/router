export type Constructor<T = {}> = (new (...args: any[]) => T) & { tag?: string}

export type AbstractConstructor<T = {}> = abstract new (...args: any[]) => T

export type InjectionToken<T = any> =
  | Constructor<T>
  | AbstractConstructor<T>
  | string
  | symbol

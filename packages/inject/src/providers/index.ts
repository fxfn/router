import { type ClassProvider, isClassProvider } from "./class-provider";

export type Provider<T = any> =
  { tag?: string} & (
    | ClassProvider<T>
  )

export function isProvider(provider: any): provider is Provider {
  return (
    isClassProvider(provider)
  )
}
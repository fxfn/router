import { type Provider } from ".";
import { Constructor } from "../types";

export interface ClassProvider<T> {
  useClass: Constructor<T>
}

export function isClassProvider<T>(
  provider: Provider<T>
): provider is ClassProvider<any> {
  return !!(provider as ClassProvider<T>).useClass;
}
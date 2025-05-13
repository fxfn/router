import { container } from "../container"
import { InjectionToken } from "../types"

export function injectAll(token: InjectionToken<any>) {
  return function (
    target: undefined,
    context: ClassFieldDecoratorContext<any, any>
  ) {
    return function (value: any): any {
      return container.resolveAll(token)
    }
  }
}
import { container } from "../container"
import { Lifecycle } from "../lifecycle"

type Constructor<T = {}> = new (...args: any[]) => T

export function singleton<Class extends Constructor>(
  Value: Class,
  context: ClassDecoratorContext<Class>
) {
  container.register(Value, { useClass: Value }, { lifecycle: Lifecycle.Singleton })
  return Value
}
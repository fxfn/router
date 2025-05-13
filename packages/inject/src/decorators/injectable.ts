import { container } from "../container"
import { singleton } from "./singleton"

type Constructor<T = {}> = new (...args: any[]) => T

export function injectable<Class extends Constructor>(
  Value: Class,
  context: ClassDecoratorContext<Class>
) {
  container.register(Value, { useClass: Value })
  return Value
}

injectable.singleton = singleton
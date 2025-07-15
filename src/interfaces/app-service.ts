import { createApp } from ".."
import { Container } from "./container"

export abstract class IAppService {
  abstract app: Awaited<ReturnType<typeof createApp>>
  abstract prepare(container?: Container): Promise<void>
  abstract listen(port?: number | string): Promise<string>
}
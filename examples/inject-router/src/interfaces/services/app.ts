export abstract class IAppService {
  abstract listen(port: number | string): Promise<void>
}
import { IAppService } from "@/interfaces/services/app";
import { injectable } from "#/github.com/fxfn/inject"
import { createApp, type App } from "#/github.com/fxfn/router"
import { IRoute } from "@/interfaces/services/route";

@injectable
export class AppService implements IAppService {

  app!: App

  @injectAll(IRoute)
  routes!: IRoute[]

  async listen(port: number | string) {
    this.app = await createApp()

    for (const route of this.routes) {
      this.app.route({
        ...route,
        handler: route.handler.bind(route)
      })
    }

    await this.app.ready()
    await this.app.listen({
      port: Number(port),
      host: '0.0.0.0'
    })
  }
}
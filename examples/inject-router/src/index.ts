import { container } from "#/github.com/fxfn/inject"
import { IAppService } from "./interfaces/services/app"
import { IRoute } from "./interfaces/services/route"
import { AppService } from "./services/app"
import { HelloRoute } from "./services/hello"

async function main() {
  container.register(IAppService, { useClass: AppService })
  container.register(IRoute, { useClass: HelloRoute })

  const app = container.resolve(IAppService)
  await app.listen(3000)
}

main()
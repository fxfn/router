import fp from "fastify-plugin"
import glob from "fast-glob"
import { ContextConfigDefault, FastifyInstance, FastifyRequest, FastifySchema, RawReplyDefaultExpression, RawRequestDefaultExpression, RawServerDefault, RouteGenericInterface, RouteOptions } from "fastify"
import { resolve } from "path"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import { transformPathToUrl } from "./utils/path-to-url"
import { route } from "#/github.com/fxfn/router/route"

type OmitUrl<T> = Omit<T, 'url'>

function createRegisterRoute(app: FastifyInstance) {
  return function registerRoute<
    RouteGeneric extends RouteGenericInterface = RouteGenericInterface,
    ContextConfig = ContextConfigDefault,
    SchemaCompiler extends FastifySchema = FastifySchema,
  >(
    url: string,
    opts: OmitUrl<
      RouteOptions<
        RawServerDefault, 
        RawRequestDefaultExpression<RawServerDefault>, 
        RawReplyDefaultExpression<RawServerDefault>, 
        RouteGeneric, 
        ContextConfig, 
        SchemaCompiler, 
        ZodTypeProvider
      > & { 
        auth?: boolean 
        scope?: string[]
        verifiers?: {
          any?: Array<(req: FastifyRequest, app: FastifyInstance) => Promise<boolean>>,
          all?: Array<(req: FastifyRequest, app: FastifyInstance) => Promise<boolean>>
        }
      }
    >
  ) {
    const tags = url.replace(app.basePath, '/').replace('//', '/').split('/')
    const tag = tags.length > 1
      ? tags[1]
      : "common"

    app.route({
      url,
      ...opts,
      schema: {
        tags: [tag],
        ...opts.schema
      } as SchemaCompiler
    })
  }
}

export type FileRouteOptions = {
  index?: string
  paths?: string[]
}

const defaultFileRouteOptions = {
  index: "route",
  paths: ["./routes"]
}

async function fileRoutesPlugin(app: FastifyInstance, options: FileRouteOptions) {
  const opts = Object.assign({}, defaultFileRouteOptions, options)
  
  for (const path of opts.paths) {
    const paths: string[] = []
    paths.push(resolve(`${path}/**/${opts.index}.js`))
    paths.push(resolve(`${path}/**/${opts.index}.ts`))

    let files = await glob(paths, {
      absolute: true,
      ignore: ['.DS_Store'],
      onlyFiles: true,
    })

    if (files.length == 0) {
      let error = new Error("NoRoutesFound")
      error.message = `Could not find any routes in the paths:\n${paths.join('\n')}`
      throw error
    }

    let register = createRegisterRoute(app)

    for (let file of files) {
      let mod = await import(file)


      // get route from file path
      const url = transformPathToUrl(file.split(path.replace('.', ''))[1], opts.index)
      const details = mod.default(route, app)

      // register route
      register(app.resolve(url), details)
    }
  }
}

export const fileRoutes = fp<FileRouteOptions>(fileRoutesPlugin, {
  fastify: ">=3.0.0"
})
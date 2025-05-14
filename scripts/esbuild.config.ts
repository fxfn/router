import { readdir } from 'fs/promises'
import { join, relative } from 'path'
import { Plugin } from 'esbuild'

async function findRouteFiles(dir: string): Promise<string[]> {
  const files: string[] = []
  const entries = await readdir(dir, { withFileTypes: true })
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...await findRouteFiles(fullPath))
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      files.push(fullPath)
    }
  }
  
  return files
}

export const routeDiscoveryPlugin: Plugin = {
  name: 'route-discovery',
  setup(build) {
    // Create a virtual module for routes
    build.onResolve({ filter: /^virtual:routes$/ }, args => ({
      path: args.path,
      namespace: 'routes'
    }))

    build.onLoad({ filter: /^virtual:routes$/, namespace: 'routes' }, async () => {
      const routesDir = join(process.cwd(), 'routes')
      const routeFiles = await findRouteFiles(routesDir)
      
      // Create imports for all route files using relative paths
      const imports = routeFiles
        .map(file => {
          const relativePath = relative(process.cwd(), file).replace(/\\/g, '/')
          return `import './${relativePath}'`
        })
        .join('\n')
      
      return {
        contents: imports,
        loader: 'ts',
        resolveDir: process.cwd()
      }
    })
  }
} 
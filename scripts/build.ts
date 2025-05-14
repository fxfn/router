import { build } from 'esbuild'
import { routeDiscoveryPlugin } from './esbuild.config'

async function runBuild() {
  await build({
    entryPoints: ['index.ts'],
    bundle: true,
    outdir: 'dist',
    format: 'cjs',
    platform: 'node',
    plugins: [routeDiscoveryPlugin],
    inject: ['virtual:routes']
  })
}

runBuild().catch(err => {
  console.error(err)
  process.exit(1)
}) 
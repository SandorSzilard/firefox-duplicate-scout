import { build, context } from 'esbuild';
import { cp, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = resolve(root, 'dist');
const watch = process.argv.includes('--watch');

async function copyStatic() {
  await mkdir(dist, { recursive: true });
  await cp(resolve(root, 'static'), dist, { recursive: true });
}

const options = {
  entryPoints: {
    background: resolve(root, 'src/background.ts'),
    popup: resolve(root, 'src/ui/popup.ts'),
    report: resolve(root, 'src/ui/report.ts'),
    options: resolve(root, 'src/ui/options.ts'),
  },
  outdir: dist,
  bundle: true,
  format: 'esm',
  target: ['firefox142'],
  sourcemap: true,
  minify: false,
  logLevel: 'info',
};

await rm(dist, { recursive: true, force: true });
await copyStatic();

if (watch) {
  const ctx = await context(options);
  await ctx.watch();
  console.log('Watching TypeScript sources. Static files are copied at startup; rerun after editing static files.');
} else {
  await build(options);
}

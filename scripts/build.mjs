import esbuild from 'esbuild';
import './build-assets.mjs';

await esbuild.build({
  entryPoints: ['src/worker.js'],
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2022',
  outfile: 'dist/worker.js',
  minify: true,
  sourcemap: false,
  logLevel: 'info'
});

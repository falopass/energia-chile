import fs from 'node:fs/promises';
import esbuild from 'esbuild';

const rawPublicPlugin = {
  name: 'raw-public-assets',
  setup(build) {
    build.onLoad({ filter: /src[\\/]public[\\/](styles\.css|app\.js)$/ }, async args => ({
      contents: await fs.readFile(args.path, 'utf8'),
      loader: 'text'
    }));
  }
};

await esbuild.build({
  entryPoints: ['src/worker.js'],
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2022',
  outfile: 'dist/worker.js',
  minify: true,
  sourcemap: false,
  plugins: [rawPublicPlugin],
  logLevel: 'info'
});

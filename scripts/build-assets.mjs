import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import esbuild from 'esbuild';
import sharp from 'sharp';

const dir = 'dist/assets';
await fs.mkdir(dir, { recursive: true });
for (const sub of ['logo', 'icons', 'og', 'pictos']) await fs.cp(`brand/${sub}`, `${dir}/brand/${sub}`, { recursive: true });
await fs.cp('brand/fonts', `${dir}/brand/fonts`, { recursive: true });
await fs.cp('brand/icons', dir, { recursive: true });
const assets = {};
async function hashed(key, bytes, ext) {
  const hash = crypto.createHash('sha256').update(bytes).digest('hex').slice(0, 12);
  const path = `/assets/${key}.${hash}.${ext}`;
  await fs.mkdir(`${dir}/assets`, { recursive: true });
  await fs.writeFile(dir + path, bytes);
  assets[key] = path;
}
await hashed('logo', await sharp('brand/logo/horizontal.png').resize({ width: 500 }).webp({ quality: 90 }).toBuffer(), 'webp');
for (const name of ['refrigerador', 'lavadora', 'aire-acondicionado']) {
  await hashed(name, await sharp(`brand/pictos/${name}.webp`).resize(112, 112).webp().toBuffer(), 'webp');
}
for (const name of ['epilogue-latin', 'epilogue-latin-ext', 'ibm-plex-sans-latin', 'ibm-plex-sans-latin-ext']) {
  await hashed(name, await fs.readFile(`brand/fonts/${name}.woff2`), 'woff2');
}
const metadata = JSON.parse(await fs.readFile('brand/fonts/fonts.json', 'utf8'));
const faces = metadata.map(f => `@font-face{font-family:"${f.family}";font-style:normal;font-weight:${f.family === 'Epilogue' ? '400 800' : '400 700'};font-display:swap;src:url("${assets[f.name.replace('.woff2', '')]}") format("woff2");unicode-range:${f.range}}`).join('\n');
await hashed('styles', faces + '\n' + await fs.readFile('src/public/styles.css', 'utf8'), 'css');
const app = await esbuild.build({ entryPoints: ['src/public/app.js'], bundle: true, minify: true, write: false, target: 'es2022' });
await hashed('app', app.outputFiles[0].contents, 'js');
await fs.writeFile('src/data/assets.json', JSON.stringify(assets) + '\n');
console.log('Assets preparados: marca original, fuentes y CSS/JS con hash.');

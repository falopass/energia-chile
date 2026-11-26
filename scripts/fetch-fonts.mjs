// Descarga los WOFF2 por subconjunto que publica Google Fonts para Epilogue e IBM Plex Sans.
// Se ejecuta a mano: las fuentes quedan versionadas en brand/fonts/ y el build solo las copia.
// Las dos familias son variables, así que un archivo por subconjunto cubre todos los pesos
// y los duplicados que devuelve la API (uno por peso pedido) se descartan por hash.
import fs from 'node:fs/promises';
import crypto from 'node:crypto';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36';
const url = 'https://fonts.googleapis.com/css2?family=Epilogue:wght@400..800&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap';
const css = await fetch(url, { headers: { 'user-agent': UA } }).then(r => r.text());

const wanted = new Set(['latin', 'latin-ext']);
const out = 'brand/fonts';
await fs.rm(out, { recursive: true, force: true });
await fs.mkdir(out, { recursive: true });

const seen = new Map();
for (const [, subset, block] of css.matchAll(/\/\* ([a-z-]+) \*\/\s*@font-face\s*\{([^}]*)\}/g)) {
  const family = block.match(/font-family:\s*'([^']+)'/)?.[1];
  const href = block.match(/url\((https:\/\/[^)]+)\)/)?.[1];
  const range = block.match(/unicode-range:\s*([^;]+);/)?.[1].trim();
  if (!wanted.has(subset) || !href || !family) continue;
  const bytes = new Uint8Array(await fetch(href, { headers: { 'user-agent': UA } }).then(r => r.arrayBuffer()));
  const hash = crypto.createHash('sha256').update(bytes).digest('hex');
  if (seen.has(hash)) continue;
  const name = `${family.toLowerCase().replace(/\s+/g, '-')}-${subset}.woff2`;
  await fs.writeFile(`${out}/${name}`, bytes);
  seen.set(hash, { name, family, subset, range, bytes: bytes.length });
}

const written = [...seen.values()];
await fs.writeFile(`${out}/fonts.json`, JSON.stringify(written, null, 2) + '\n');
console.log(written.map(f => `${f.name} ${f.bytes}B`).join('\n'));
console.log('total', written.reduce((sum, f) => sum + f.bytes, 0), 'bytes en', written.length, 'archivos');

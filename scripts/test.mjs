import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import fs from 'node:fs/promises';
import { applianceCalculation, btuCalculation, solarCalculation, clp } from '../src/lib/calc.js';

execSync('node scripts/build.mjs', { stdio: 'pipe' });
const mod = await import('../dist/worker.js');
assert.equal(typeof mod.indexablePaths, 'function');
const paths = mod.indexablePaths();
assert.equal(paths.length, 3000, `se esperaban 3000 URLs indexables, hay ${paths.length}`);
assert.equal(new Set(paths).size, paths.length, 'hay URLs duplicadas');

async function get(path) {
  const res = await mod.default.fetch(new Request(`https://energia-chile.ddiegosebastianbb.workers.dev${path}`), {}, {});
  const body = await res.text();
  return { res, body };
}

const checks = [
  ['/', 'Entiende tu cuenta de luz', 200],
  ['/consumo-electrico/refrigerador/independencia/', 'Consumo de un refrigerador en Independencia', 200],
  ['/consumo-electrico/aire-acondicionado/iquique/', 'Consumo de un aire acondicionado en Iquique', 200],
  ['/btu/puente-alto/', 'Calculadora BTU en Puente Alto', 200],
  ['/paneles-solares/temuco/', 'Paneles solares en Temuco', 200],
  ['/tarifas/', 'Tarifas eléctricas residenciales por comuna', 200],
  ['/guias/paneles-solares-netbilling/', 'Netbilling residencial', 200],
  ['/metodologia/', 'Metodología de cálculo', 200],
  ['/comuna-inexistente/', 'Página no encontrada', 404]
];

for (const [path, needle, status] of checks) {
  const { res, body } = await get(path);
  assert.equal(res.status, status, `${path}: status ${res.status}`);
  assert.ok(body.includes(needle), `${path}: falta contenido esperado`);
  assert.ok(!body.includes('undefined'), `${path}: contiene undefined`);
  assert.ok(!body.includes('NaN'), `${path}: contiene NaN`);
}

const { body: sm } = await get('/sitemap.xml');
assert.equal((sm.match(/<url>/g) || []).length, 3000, 'el sitemap no tiene 3000 URLs');
assert.equal(new Set([...sm.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1])).size, 3000);
assert.ok([...sm.matchAll(/<loc>(.*?)<\/loc>/g)].every(m => m[1].startsWith('https://energia-chile.ddiegosebastianbb.workers.dev/')));
const { body: robots } = await get('/robots.txt');
assert.ok(robots.includes('Sitemap: https://energia-chile.ddiegosebastianbb.workers.dev/sitemap.xml'));
const { body: ads } = await get('/ads.txt');
assert.equal(ads.trim(), 'google.com, pub-4950005977906560, DIRECT, f08c47fec0942fa0');
const keyPath = '/ec9f4a7c2e8b4d7aa5f6d1c3b9e02741.txt';
const key = await get(keyPath);
assert.equal(key.res.status, 200);
assert.equal(`/${key.body.trim()}.txt`, keyPath);
for (const iconPath of ['/favicon.png', '/favicon.ico']) {
  const res = await mod.default.fetch(new Request(`https://energia-chile.ddiegosebastianbb.workers.dev${iconPath}`), {}, {});
  assert.equal(res.status, 200, iconPath);
  assert.equal(res.headers.get('content-type'), 'image/png');
  const bytes = new Uint8Array(await res.arrayBuffer());
  assert.deepEqual([...bytes.slice(0, 8)], [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], `${iconPath}: no es un PNG válido`);
}

const forbidden = /<svg|\.svg\b|data:image\/svg|\p{Emoji_Presentation}|\p{Extended_Pictographic}|\uFE0F/iu;
for (const path of paths) {
  const { res, body } = await get(path);
  assert.equal(res.status, 200, path);
  assert.ok(!/undefined|NaN/.test(body), `${path}: valores inválidos`);
  assert.ok(!forbidden.test(body), `${path}: imagen vectorial o emoji`);
  assert.ok(body.includes('class="tool-switch'), `${path}: falta selector de herramientas`);
}
for (const dir of ['src', 'dist']) {
  for (const file of await fs.readdir(dir, { recursive: true })) {
    if (!/\.(js|css|json)$/.test(file)) continue;
    const source = await fs.readFile(`${dir}/${file}`, 'utf8');
    const decoded = source.replace(/\\u\{([0-9a-f]+)\}/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16))).replace(/\\u([0-9a-f]{4})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
    assert.ok(!forbidden.test(decoded), `${dir}/${file}: imagen vectorial o emoji`);
  }
}
const a = applianceCalculation({ watts: 1000, hoursPerDay: 2, priceKwh: 200 });
assert.equal(a.kwhMonth, 60); assert.equal(a.costMonth, 12000); assert.equal(a.costYear, 144000);
const b = btuCalculation({ areaM2: 15, climate: { coolingBaseBtuhM2: 500, heatingBaseBtuhM2: 700 }, priceKwh: 200 });
assert.equal(b.raw, 8076); assert.equal(b.recommended, 9000);
const s = solarCalculation({ monthlyKwh: 250, ghiDay: 4.8, priceKwh: 200, injectionKwh: 100 });
// 2400 kWh objetivo / (4,8 * 365 * 0,78) = 1,756 kWp: cuatro paneles de 550 W.
assert.equal(s.panels, 4); assert.equal(s.installedKwp, 2.2);
assert.ok(Math.abs(s.generationYear - 3006.432) < 1e-8);
assert.equal(clp(224.56, 2), '$224,56', 'conservar centavos del precio kWh');
console.log(`PASS ${paths.length} páginas únicas HTTP 200, 0 SVG/emojis/undefined/NaN, bundle y src auditados; 3 calculadoras, sitemap, robots, ads.txt, IndexNow`);

import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';

execSync('node scripts/build.mjs', { stdio: 'pipe' });
const mod = await import('../dist/worker.js');
assert.equal(typeof mod.indexablePaths, 'function');
const paths = mod.indexablePaths();
assert.equal(paths.length, 3000, `se esperaban 3000 URLs indexables, hay ${paths.length}`);
assert.equal(new Set(paths).size, paths.length, 'hay URLs duplicadas');

async function get(path) {
  const res = await mod.default.fetch(new Request(`http://local.test${path}`), {}, {});
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
const { body: robots } = await get('/robots.txt');
assert.ok(robots.includes('Sitemap: http://local.test/sitemap.xml'));
const { body: ads } = await get('/ads.txt');
assert.ok(ads.includes('pub-XXXXXXXXXXXXXXXX'));
console.log(`PASS ${paths.length} URLs indexables, sitemap, robots, ads.txt y páginas clave`);

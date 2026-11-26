import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const base = process.env.TEST_BASE_URL || 'http://localhost:8795';
const env = { ...process.env, AGENT_BROWSER_SESSION: process.env.AGENT_BROWSER_SESSION || 'chile-ui-tests' };
const browser = (...args) => execFileSync('agent-browser', args, { env, encoding: 'utf8' }).trim();
const evaluate = code => JSON.parse(browser('eval', '-b', Buffer.from(code).toString('base64')));
const open = path => browser('open', base + path);
const fill = (name, value) => browser('fill', `[name="${name}"]`, String(value));
const output = key => evaluate(`document.querySelector('[data-out="${key}"]').textContent`);
const settled = key => browser('wait', '--fn', `Math.abs(Number(document.querySelector('[data-out="${key}"]').dataset.numeric) - ${key === 'costMonth' ? 12000 : 2.2}) < .000001`);
const clean = () => assert.equal(evaluate(`/undefined|NaN|Infinity/.test(document.querySelector('[data-calculator]').textContent)`), false);

try {
  open('/');
  browser('fill', '#comuna-search', 'Maipu');
  assert.equal(evaluate(`document.querySelector('[data-jump-select]').options.length`), 2);
  browser('fill', '#comuna-search', 'sin-comuna-xyz');
  assert.equal(evaluate(`document.querySelector('[data-jump-select]').options.length`), 1);
  browser('fill', '#comuna-search', '');
  assert.equal(evaluate(`document.querySelector('[data-jump-select]').options.length`), 329);

  open('/consumo-electrico/refrigerador/independencia/');
  fill('watts', 1000); fill('hours', 2); fill('days', 30); fill('price', 200);
  settled('costMonth');
  assert.equal(output('costMonth'), '$12.000');
  browser('wait', '--fn', `document.querySelector('[data-out="costYear"]').textContent === '$144.000'`);
  assert.equal(output('kwhMonth'), '60,0 kWh');
  fill('hours', 24); fill('hours', 1); fill('hours', 2);
  settled('costMonth'); assert.equal(output('costMonth'), '$12.000');
  fill('watts', ''); fill('price', ''); clean();
  assert.equal(evaluate(`document.querySelector('.tab-1').getAttribute('href')`), '/btu/independencia/');

  open('/btu/puente-alto/');
  const baseCooling = evaluate(`Number(document.querySelector('[name="baseCooling"]').value)`);
  fill('area', 25);
  const expectedBtu = Math.round(25 * baseCooling + 2 * 240 * 1.2);
  browser('wait', '--fn', `Number(document.querySelector('[data-out="btu"]').dataset.numeric) === ${expectedBtu}`);
  assert.equal(output('btu'), new Intl.NumberFormat('es-CL').format(expectedBtu) + ' BTU/h');
  browser('select', '[name="orientation"]', 'sur');
  const southBtu = Math.round(25 * baseCooling + 2 * 240 * .75);
  browser('wait', '--fn', `Number(document.querySelector('[data-out="btu"]').dataset.numeric) === ${southBtu}`);
  browser('select', '[name="mode"]', 'calefaccion'); clean();
  fill('area', ''); fill('height', ''); clean();

  open('/paneles-solares/temuco/');
  fill('monthlyKwh', 250); fill('ghi', 4.8); fill('coverage', 80); fill('panelW', 550);
  settled('kwp'); assert.equal(output('kwp'), '2,20 kWp');
  browser('wait', '--fn', `document.querySelector('[data-out="panels"]').textContent === '4 paneles'`);
  assert.equal(output('panels'), '4 paneles');
  browser('scrollintoview', '.solar-chart');
  assert.equal(evaluate(`document.querySelectorAll('.chart > div').length`), 12);
  fill('monthlyKwh', 3000); fill('coverage', 100); fill('ghi', 1); clean();
  fill('monthlyKwh', ''); fill('ghi', ''); fill('panelW', ''); fill('price', ''); clean();
  assert.equal(evaluate(`Number.isFinite(Number(document.querySelector('[data-out="kwp"]').dataset.numeric))`), true);

  browser('set', 'viewport', '390', '844');
  open('/');
  assert.equal(evaluate(`document.documentElement.scrollWidth <= window.innerWidth`), true);
  open('/paneles-solares/temuco/');
  assert.equal(evaluate(`document.documentElement.scrollWidth <= window.innerWidth`), true);
  fill('monthlyKwh', 500); clean();
  browser('screenshot', '/home/factory-user/repos/energia-chile/chile-mobile.png');
  const errors = browser('errors', '--json');
  assert.ok(!errors.includes('"message"'), errors);
  console.log('PASS navegador: búsqueda 328 comunas/acento/vacío, 3 calculadoras, cambios repetidos, campos vacíos, extremos solares, 12 barras, navegación local y móvil 390px sin desborde');
} finally {
  browser('close');
}

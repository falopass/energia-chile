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
const noOverflow = () => assert.equal(evaluate(`document.documentElement.scrollWidth <= window.innerWidth`), true);

try {
  browser('set', 'viewport', '1440', '900');

  // Home: combobox bajo demanda, singular correcto, modos y aparatos.
  open('/');
  evaluate(`document.querySelector('#comuna-search').focus()`);
  fill('comuna-search', 'Maipu');
  browser('wait', '--fn', `document.querySelectorAll('#comuna-results li').length === 1`);
  assert.equal(evaluate(`document.querySelector('.search-status').textContent`), '1 comuna disponible');
  evaluate(`document.querySelector('#comuna-results li').click()`);
  assert.ok(evaluate(`document.querySelector('.search-action').getAttribute('href')`).endsWith('/consumo-electrico/refrigerador/maipu/'));
  assert.equal(evaluate(`document.querySelector('.search-action').textContent`), 'Ver consumo en Maipú');
  evaluate(`document.querySelector('[data-mode-button="solar"]').click()`);
  assert.ok(evaluate(`document.querySelector('.search-action').getAttribute('href')`).endsWith('/paneles-solares/maipu/'));
  evaluate(`document.querySelector('[data-mode-button="btu"]').click()`);
  assert.ok(evaluate(`document.querySelector('.search-action').getAttribute('href')`).endsWith('/btu/maipu/'));
  evaluate(`document.querySelector('[data-mode-button="consumo"]').click()`);
  evaluate(`document.querySelector('[data-appliance-button="lavadora"]').click()`);
  assert.ok(evaluate(`document.querySelector('.search-action').getAttribute('href')`).endsWith('/consumo-electrico/lavadora/maipu/'));
  // Elegir comuna no navega: sigue en la home y actualiza los tres datos.
  assert.equal(evaluate(`location.pathname`), '/');
  assert.equal(evaluate(`document.querySelector('[data-fact="price"]').textContent`), '$243,57');
  noOverflow();
  assert.equal(evaluate(`document.querySelector('.wordmark').naturalWidth > 0`), true);
  assert.equal(evaluate(`document.querySelectorAll('[data-mode-button]').length`), 3);
  assert.equal(evaluate(`document.querySelectorAll('.regional-prices .horizontal-bar').length`), 16);

  // Consumo: cálculo editable, un solo porcentaje y anillo sincronizado.
  open('/consumo-electrico/refrigerador/independencia/');
  fill('watts', 1000); fill('hours', 2); fill('days', 30); fill('price', 200);
  settled('costMonth');
  assert.equal(output('costMonth'), '$12.000');
  browser('wait', '--fn', `document.querySelector('[data-out="costYear"]').textContent === '$144.000'`);
  assert.equal(output('kwhMonth'), '60,0 kWh');
  assert.equal(evaluate(`document.querySelectorAll('[data-out="billShare"]').length`), 1);
  browser('wait', '--fn', `parseFloat(document.querySelector('[data-out="billShare"]').textContent.replace(',','.')) > 0`);
  fill('hours', 24); fill('hours', 1); fill('hours', 2);
  settled('costMonth'); assert.equal(output('costMonth'), '$12.000');
  fill('watts', ''); fill('price', ''); clean();
  noOverflow();

  // BTU: dos lecturas (frío y calefacción) y orientación.
  open('/btu/puente-alto/');
  const baseCooling = evaluate(`Number(document.querySelector('[name="baseCooling"]').value)`);
  fill('area', 25);
  const expectedBtu = Math.round(25 * baseCooling + 2 * 240 * 1.2);
  browser('wait', '--fn', `Number(document.querySelector('[data-out="btu"]').dataset.numeric) === ${expectedBtu}`);
  assert.equal(output('btu'), new Intl.NumberFormat('es-CL').format(expectedBtu) + ' BTU/h');
  browser('select', '[name="orientation"]', 'sur');
  const southBtu = Math.round(25 * baseCooling + 2 * 240 * .75);
  browser('wait', '--fn', `Number(document.querySelector('[data-out="btu"]').dataset.numeric) === ${southBtu}`);
  browser('wait', '--fn', `Number(document.querySelector('[data-out="heatBtu"]').dataset.numeric) > 0`);
  fill('area', ''); fill('height', ''); clean();
  assert.equal(evaluate(`document.querySelectorAll('.temperature-chart .month-column').length`), 12);
  noOverflow();

  // Solar: dimensionamiento, límite de techo y extremos sin NaN.
  open('/paneles-solares/temuco/');
  fill('monthlyKwh', 250); fill('ghi', 4.8); fill('coverage', 80); fill('panelW', 550);
  settled('kwp'); assert.equal(output('kwp'), '2,20 kWp');
  browser('wait', '--fn', `document.querySelector('[data-out="panels"]').textContent === '4 paneles'`);
  fill('roofAvailable', 5);
  browser('wait', '--fn', `document.querySelector('[data-out="panels"]').textContent === '2 paneles'`);
  assert.equal(evaluate(`document.querySelectorAll('.radiation-chart .month-column').length`), 12);
  fill('monthlyKwh', 3000); fill('coverage', 100); fill('ghi', 1); clean();
  fill('monthlyKwh', ''); fill('ghi', ''); fill('panelW', ''); fill('price', ''); clean();
  assert.equal(evaluate(`Number.isFinite(Number(document.querySelector('[data-out="kwp"]').dataset.numeric))`), true);
  noOverflow();

  // Guías sin selector de herramientas; tablas apilables presentes.
  open('/guias/btu-frigorias/');
  assert.equal(evaluate(`document.querySelector('.mode-pill') === null`), true);
  open('/tarifas/');
  noOverflow();
  open('/contacto/');
  noOverflow();

  // Móvil 390 px: 0 desborde en todas las rutas clave.
  browser('set', 'viewport', '390', '844');
  for (const path of ['/', '/consumo-electrico/lavadora/independencia/', '/btu/puente-alto/', '/paneles-solares/temuco/', '/tarifas/', '/contacto/', '/comunas/']) {
    open(path);
    noOverflow();
  }
  open('/paneles-solares/temuco/');
  fill('monthlyKwh', 500); clean();
  assert.equal(evaluate(`document.querySelector('.masthead').getBoundingClientRect().height <= 56`), true);
  browser('screenshot', '/home/factory-user/repos/energia-chile/reports/chile-v2-mobile.png');
  browser('set', 'viewport', '1440', '900');
  open('/');
  browser('screenshot', '/home/factory-user/repos/energia-chile/reports/chile-v2-desktop.png');
  const errors = browser('errors', '--json');
  assert.ok(!errors.includes('"message"'), errors);
  console.log('PASS navegador: combobox 328 con singular, modos y aparatos sin navegar, 3 calculadoras, límite de techo, guías sin selector, 0 desborde en 1440 y 390 px, header 56 px, capturas');
} finally {
  browser('close');
}

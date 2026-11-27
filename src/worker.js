import DATA from './data/generated.json';
import { GUIDES } from './lib/guides.js';
import { communeIndex } from './lib/local-data.js';
import { EDITORIAL_PAGES, variation2027Json } from './lib/editorial-pages.js';
import {
  homePage, preciosPage, consumoHubPage, applianceHubPage, applianceCommunePage,
  btuHubPage, btuCommunePage, solarHubPage, solarCommunePage, heatingCommunePage,
  comunasPage, regionPage, tarifasPage, guiasPage, guidePage,
  simplePage, notFoundPage, editorialContentPage, esc
} from './lib/render.js';

const data = { ...DATA, guides: GUIDES };
const INDEXNOW_KEY = 'ec9f4a7c2e8b4d7aa5f6d1c3b9e02741';

const staticPageKinds = [
  ['metodologia', '/metodologia/'], ['fuentes', '/fuentes/'], ['privacidad', '/privacidad/'],
  ['contacto', '/contacto/'], ['sobre', '/sobre-nosotros/'], ['terminos', '/terminos/'], ['faq', '/preguntas-frecuentes/']
];

function html(body, status = 200, cache = 'public, max-age=3600, s-maxage=86400') {
  return new Response(body, {
    status,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': cache,
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'strict-origin-when-cross-origin',
      'permissions-policy': 'camera=(), microphone=(), geolocation=()',
      'content-security-policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests",
      'strict-transport-security': 'max-age=31536000; includeSubDomains'
    }
  });
}

function text(body, type = 'text/plain; charset=utf-8', cache = 'public, max-age=3600') {
  return new Response(body, { headers: { 'content-type': type, 'cache-control': cache, 'x-content-type-options': 'nosniff' } });
}

function redirect(location) {
  return new Response(null, { status: 301, headers: { location } });
}

function commune(slug) {
  return data.communes.find(c => c.slug === slug);
}

function appliance(slug) {
  return data.appliances.find(a => a.slug === slug);
}

export function indexablePaths() {
  const paths = [
    '/', '/consumo-electrico/', '/btu/', '/paneles-solares/', '/comunas/', '/precios/', '/tarifas/', '/guias/',
    '/metodologia/', '/fuentes/', '/privacidad/', '/contacto/', '/sobre-nosotros/', '/terminos/', '/preguntas-frecuentes/'
  ];
  for (const p of EDITORIAL_PAGES) paths.push(p.path);
  for (const a of data.appliances) paths.push(`/consumo-electrico/${a.slug}/`);
  for (const g of GUIDES) paths.push(g.path);
  for (const regionSlug of new Set(data.communes.map(c => c.regionSlug))) paths.push(`/region/${regionSlug}/`);
  for (const c of data.communes) {
    for (const a of data.appliances) paths.push(`/consumo-electrico/${a.slug}/${c.slug}/`);
    paths.push(`/btu/${c.slug}/`, `/paneles-solares/${c.slug}/`, `/calefaccion/${c.slug}/`);
  }
  return paths;
}

function sitemap(origin) {
  const paths = indexablePaths();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map(path => `  <url><loc>${esc(origin + path)}</loc><lastmod>${data.generatedAt.slice(0, 10)}</lastmod><changefreq>${path.split('/').length <= 3 ? 'weekly' : 'monthly'}</changefreq></url>`).join('\n')}
</urlset>`;
  return text(xml, 'application/xml; charset=utf-8', 'public, max-age=86400');
}

function robots(origin) {
  return text(`User-agent: *
Allow: /
Disallow: /health

Sitemap: ${origin}/sitemap.xml
`);
}

function llmsTxt(origin) {
  return `# Energía Chile

> Calculadoras de consumo eléctrico, dimensionamiento BTU y paneles solares netbilling para las 328 comunas de Chile, con tarifas residenciales BT1/BT1A vigentes al 01-11-2026 (pliegos CNE/SEC) y climatología NASA POWER 2001-2025.

## Páginas principales
- ${origin}/ — portada con buscador de comuna y comparación regional de tarifas
- ${origin}/consumo-electrico/ — costo mensual de 7 aparatos por comuna
- ${origin}/btu/ — BTU para enfriar o calefaccionar según clima comunal
- ${origin}/paneles-solares/ — kWp, ahorro y retorno netbilling por comuna
- ${origin}/precios/ — precios de aparatos, calefacción y kits solares con fecha de consulta
- ${origin}/tarifas/ — tabla filtrable de tarifas BT1 por comuna y distribuidora
- ${origin}/2027/cuentas-luz/ — variación regional confirmada para cuentas residenciales 2027
- ${origin}/subsidio-electrico/ — sexta convocatoria, requisitos y montos conocidos
- ${origin}/calefaccion/ — comparación de calor útil por sistema
- ${origin}/calefaccion/temuco/ — ejemplo comunal; existe para las 328 comunas
- ${origin}/pda/ — restricciones PDA y recambio de calefactores por ciudad
- ${origin}/recambio-calefactores/ — llamados abiertos, copagos y fechas
- ${origin}/verano/ — aire acondicionado, ventilador y refrigerador en verano
- ${origin}/comunas/ — índice de las 328 comunas de norte a sur
- ${origin}/guias/ — guías prácticas (consumo, BTU, netbilling, boleta)
- ${origin}/metodologia/ — fórmulas, supuestos y límites
- ${origin}/fuentes/ — fuentes oficiales con fecha de vigencia

## Datos
- Índice JSON de comunas: ${origin}/api/comunas.json (nombre, slug, región, latitud, tarifa variable $/kWh, radiación y temperaturas)
- Variación regional 2027 JSON: ${origin}/api/variacion-2027.json (-4,4% promedio nacional, tabla por región, fuentes CNE/Ministerio)
- Valores con IVA, en pesos chilenos, referenciales y editables; no son cotizaciones.
`;
}

function adsTxt() {
  return text('google.com, pub-4950005977906560, DIRECT, f08c47fec0942fa0\n');
}

function route(path, origin) {
  if (path === '/') return html(homePage(data, origin));
  if (path === '/consumo-electrico/') return html(consumoHubPage(data, origin));
  if (path === '/btu/') return html(btuHubPage(data, origin));
  if (path === '/paneles-solares/') return html(solarHubPage(data, origin));
  if (path === '/comunas/') return html(comunasPage(data, origin));
  if (path === '/precios/') return html(preciosPage(data, origin));
  if (path === '/tarifas/') return html(tarifasPage(data, origin));
  if (path === '/guias/') return html(guiasPage(data, origin));

  const editorial = EDITORIAL_PAGES.find(p => p.path === path);
  if (editorial) return html(editorialContentPage(editorial, origin));

  const heatingMatch = path.match(/^\/calefaccion\/([a-z0-9-]+)\/$/);
  if (heatingMatch) {
    const c = commune(heatingMatch[1]);
    if (c) return html(heatingCommunePage(data, c, origin));
  }

  const regionMatch = path.match(/^\/region\/([a-z0-9-]+)\/$/);
  if (regionMatch) {
    const page = regionPage(data, regionMatch[1], origin);
    if (page) return html(page);
  }

  const guideMatch = path.match(/^\/guias\/([a-z0-9-]+)\/$/);
  if (guideMatch) {
    const guide = GUIDES.find(g => g.slug === guideMatch[1]);
    if (guide) return html(guidePage(guide, origin));
  }

  const applianceHubMatch = path.match(/^\/consumo-electrico\/([a-z0-9-]+)\/$/);
  if (applianceHubMatch) {
    const a = appliance(applianceHubMatch[1]);
    if (a) return html(applianceHubPage(data, a, origin));
  }

  const applianceCommuneMatch = path.match(/^\/consumo-electrico\/([a-z0-9-]+)\/([a-z0-9-]+)\/$/);
  if (applianceCommuneMatch) {
    const a = appliance(applianceCommuneMatch[1]);
    const c = commune(applianceCommuneMatch[2]);
    if (a && c) return html(applianceCommunePage(data, a, c, origin));
  }

  const btuMatch = path.match(/^\/btu\/([a-z0-9-]+)\/$/);
  if (btuMatch) {
    const c = commune(btuMatch[1]);
    if (c) return html(btuCommunePage(data, c, origin));
  }

  const solarMatch = path.match(/^\/paneles-solares\/([a-z0-9-]+)\/$/);
  if (solarMatch) {
    const c = commune(solarMatch[1]);
    if (c) return html(solarCommunePage(data, c, origin));
  }

  const simple = staticPageKinds.find(([, p]) => p === path);
  if (simple) return html(simplePage(simple[0], origin));

  return html(notFoundPage(origin, data), 404, 'no-store');
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = url.origin;

    if (url.pathname !== '/' && !url.pathname.endsWith('/') && !url.pathname.includes('.')) {
      return redirect(`${url.pathname}/${url.search}`);
    }

    if (url.pathname === '/api/variacion-2027.json') {
      return new Response(JSON.stringify(variation2027Json), {
        headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=86400', 'x-content-type-options': 'nosniff' }
      });
    }
    if (url.pathname === '/api/comunas.json') {
      return new Response(JSON.stringify(communeIndex(data)), {
        headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=86400', 'x-content-type-options': 'nosniff' }
      });
    }
    if (url.pathname === '/llms.txt') return text(llmsTxt(origin));
    if (url.pathname === '/robots.txt') return robots(origin);
    if (url.pathname === '/sitemap.xml') return sitemap(origin);
    if (url.pathname === '/ads.txt') return adsTxt();
    if (url.pathname === `/${INDEXNOW_KEY}.txt`) return text(INDEXNOW_KEY);
    if (url.pathname === '/indexnow' || url.pathname === '/indexnow/') {
      return text(`IndexNow key: ${INDEXNOW_KEY}\nKey URL: ${origin}/${INDEXNOW_KEY}.txt\nSubmission endpoint: https://api.indexnow.org/indexnow\n`);
    }
    if (url.pathname === '/health') return text('ok');

    try {
      return route(url.pathname, origin);
    } catch (error) {
      console.error('route_error', url.pathname, error?.stack || error);
      return html('<h1>Error interno</h1><p>No pudimos generar esta página.</p>', 500, 'no-store');
    }
  }
};

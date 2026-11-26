import DATA from './data/generated.json';
import styles from './public/styles.css';
import appJs from './public/app.js';
import { GUIDES } from './lib/guides.js';
import {
  homePage, consumoHubPage, applianceHubPage, applianceCommunePage,
  btuHubPage, btuCommunePage, solarHubPage, solarCommunePage,
  comunasPage, regionPage, tarifasPage, guiasPage, guidePage,
  simplePage, notFoundPage, esc
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
      'permissions-policy': 'camera=(), microphone=(), geolocation=()'
    }
  });
}

// Icono de 32x32 generado como PNG RGB sin comprimir en origen: evita formatos vectoriales y un archivo binario en el repo.
const FAVICON_PNG = 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAQElEQVR42mPgk7egKWIYtYDWFhzr4kJDoxYMegt2xFqjoVELRi0YtQBmAVPLcTQ0asGoBaMWjFpAOwtG26YYCABSXtMVH2Sy4AAAAABJRU5ErkJggg==';

function favicon() {
  const binary = atob(FAVICON_PNG);
  const bytes = Uint8Array.from(binary, ch => ch.charCodeAt(0));
  return new Response(bytes, { headers: { 'content-type': 'image/png', 'cache-control': 'public, max-age=604800, immutable' } });
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
    '/', '/consumo-electrico/', '/btu/', '/paneles-solares/', '/comunas/', '/tarifas/', '/guias/',
    '/metodologia/', '/fuentes/', '/privacidad/', '/contacto/', '/sobre-nosotros/', '/terminos/', '/preguntas-frecuentes/'
  ];
  for (const a of data.appliances) paths.push(`/consumo-electrico/${a.slug}/`);
  for (const g of GUIDES) paths.push(g.path);
  for (const regionSlug of new Set(data.communes.map(c => c.regionSlug))) paths.push(`/region/${regionSlug}/`);
  for (const c of data.communes) {
    for (const a of data.appliances) paths.push(`/consumo-electrico/${a.slug}/${c.slug}/`);
    paths.push(`/btu/${c.slug}/`, `/paneles-solares/${c.slug}/`);
  }
  return paths;
}

function sitemap(origin) {
  const paths = indexablePaths();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map(path => `  <url><loc>${esc(origin + path)}</loc><changefreq>${path.split('/').length <= 3 ? 'weekly' : 'monthly'}</changefreq></url>`).join('\n')}
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

function adsTxt() {
  return text('google.com, pub-4950005977906560, DIRECT, f08c47fec0942fa0\n');
}

function route(path, origin) {
  if (path === '/') return html(homePage(data, origin));
  if (path === '/consumo-electrico/') return html(consumoHubPage(data, origin));
  if (path === '/btu/') return html(btuHubPage(data, origin));
  if (path === '/paneles-solares/') return html(solarHubPage(data, origin));
  if (path === '/comunas/') return html(comunasPage(data, origin));
  if (path === '/tarifas/') return html(tarifasPage(data, origin));
  if (path === '/guias/') return html(guiasPage(data, origin));

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

  return html(notFoundPage(origin), 404, 'no-store');
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = url.origin;

    if (url.pathname !== '/' && !url.pathname.endsWith('/') && !url.pathname.includes('.')) {
      return redirect(`${url.pathname}/${url.search}`);
    }

    if (url.pathname === '/assets/styles.css') return text(styles, 'text/css; charset=utf-8', 'public, max-age=86400, immutable');
    if (url.pathname === '/assets/app.js') return text(appJs, 'text/javascript; charset=utf-8', 'public, max-age=86400, immutable');
    if (url.pathname === '/favicon.png' || url.pathname === '/favicon.ico') return favicon();
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

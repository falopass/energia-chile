import assert from 'node:assert/strict';

const origin = 'https://energia-chile.ddiegosebastianbb.workers.dev';
const keyPath = '/ec9f4a7c2e8b4d7aa5f6d1c3b9e02741.txt';
const get = async path => {
  const response = await fetch(origin + path, { signal: AbortSignal.timeout(30000) });
  assert.equal(response.status, 200, `${path}: HTTP ${response.status}`);
  return response.text();
};
const sitemap = await get('/sitemap.xml');
const urlList = Array.from(sitemap.matchAll(/<loc>([^<]+)<\/loc>/g), match => match[1]);
assert.equal(urlList.length, 3000);
assert.equal(new Set(urlList).size, 3000);
assert.ok(urlList.every(url => url.startsWith(origin + '/')));
const key = (await get(keyPath)).trim();
assert.equal(keyPath, `/${key}.txt`, 'La clave debe coincidir con la ruta pública');
const payload = { host: new URL(origin).host, key, keyLocation: origin + keyPath, urlList };
if (process.argv.includes('--dry-run')) {
  console.log(`DRY RUN: ${urlList.length} URLs únicas; sitemap y clave verificados en producción`);
} else {
  const response = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(60000)
  });
  console.log(`IndexNow: HTTP ${response.status}; ${urlList.length} URLs enviadas`);
  assert.ok([200, 202].includes(response.status), `IndexNow rechazó el envío: HTTP ${response.status}`);
}

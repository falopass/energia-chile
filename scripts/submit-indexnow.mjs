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
assert.equal(urlList.length, 3006);
assert.equal(new Set(urlList).size, 3006);
assert.ok(urlList.every(url => url.startsWith(origin + '/')));
const key = (await get(keyPath)).trim();
assert.equal(keyPath, `/${key}.txt`, 'La clave debe coincidir con la ruta pública');
const payload = { host: new URL(origin).host, key, keyLocation: origin + keyPath };
// La API rechaza con 403 un único envío de las 3.006 URLs, pero acepta lotes pequeños.
const batchSize = Number(process.argv.find(arg => arg.startsWith('--batch='))?.split('=')[1] || 500);
const batches = [];
for (let i = 0; i < urlList.length; i += batchSize) batches.push(urlList.slice(i, i + batchSize));

if (process.argv.includes('--dry-run')) {
  console.log(`DRY RUN: ${urlList.length} URLs únicas en ${batches.length} lotes de hasta ${batchSize}; sitemap y clave verificados en producción`);
} else {
  const statuses = [];
  for (const [index, batch] of batches.entries()) {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...payload, urlList: batch }),
      signal: AbortSignal.timeout(60000)
    });
    statuses.push(response.status);
    console.log(`Lote ${index + 1}/${batches.length}: ${batch.length} URLs, HTTP ${response.status}`);
    if (index < batches.length - 1) await new Promise(resolve => setTimeout(resolve, 1500));
  }
  const rejected = statuses.filter(status => ![200, 202].includes(status));
  console.log(`IndexNow: ${urlList.length} URLs en ${batches.length} lotes; statuses ${[...new Set(statuses)].join(', ')}`);
  assert.equal(rejected.length, 0, `IndexNow rechazó ${rejected.length} lotes: ${rejected.join(', ')}`);
}

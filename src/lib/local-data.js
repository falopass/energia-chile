const cache = new WeakMap();
export function regionalData(data) {
  if (cache.has(data)) return cache.get(data);
  const groups = new Map();
  for (const c of data.communes) {
    if (!groups.has(c.regionSlug)) groups.set(c.regionSlug, []);
    groups.get(c.regionSlug).push(c);
  }
  const regions = [...groups].map(([slug, communes]) => ({
    slug, name: communes[0].region, communes,
    lat: communes.reduce((n, c) => n + c.lat, 0) / communes.length,
    price: communes.reduce((n, c) => n + c.tariffs[0].marginalKwh, 0) / communes.length,
    ghi: communes.reduce((n, c) => n + c.calc.climate.ghi, 0) / communes.length
  })).sort((a, b) => b.lat - a.lat);
  cache.set(data, regions);
  return regions;
}
export function communeIndex(data) {
  return data.communes.map(c => ({
    name: c.name, slug: c.slug, region: c.region, regionSlug: c.regionSlug, lat: c.lat,
    price: c.tariffs[0].marginalKwh, ghi: c.calc.climate.ghi,
    summer: c.calc.climate.summerTempC, winter: c.calc.climate.winterTempC
  }));
}

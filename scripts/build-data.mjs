import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const rawDir = path.join(root, 'data/raw');
const mapacheDir = path.join(rawDir, 'mapache');
const outFile = path.join(root, 'src/data/generated.json');
const cacheFile = path.join(rawDir, 'nasa-power-cache.json');

const REGION_ORDER = [
  'Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo', 'Valparaíso',
  'Metropolitana de Santiago', "Libertador General Bernardo O'Higgins", 'Maule', 'Ñuble',
  'Biobío', 'La Araucanía', 'Los Ríos', 'Los Lagos',
  'Aysén del General Carlos Ibáñez del Campo', 'Magallanes y de la Antártica Chilena'
];

const DISTRIBUTOR_PRIORITY = [
  'eepa', 'electrica_colina', 'edecsa', 'litoral', 'cooprel', 'luz_linares', 'luz_parral',
  'enel', 'chilquinta', 'saesa', 'frontel', 'luz_osorno', 'edelaysen', 'edelmag', 'cge'
];

const APPLIANCES = [
  {
    slug: 'refrigerador', name: 'refrigerador', plural: 'refrigeradores', watts: 110, hoursPerDay: 12,
    inputLabel: 'potencia promedio mientras el compresor trabaja', defaultUse: '24 horas conectado; el compresor trabaja en ciclos',
    benchmarkKwhMonth: 39.6,
    tip: 'La etiqueta E2.0 informa el consumo mensual del modelo: úsala antes que la potencia nominal cuando compres.'
  },
  {
    slug: 'aire-acondicionado', name: 'aire acondicionado', plural: 'aires acondicionados', watts: 1090, hoursPerDay: 3,
    inputLabel: 'potencia eléctrica de un split inverter de 12.000 BTU', defaultUse: '3 horas diarias en días de uso intenso',
    benchmarkKwhMonth: 32.7,
    tip: 'La potencia cambia con la carga; un inverter suele operar buena parte del tiempo bajo su máximo.'
  },
  {
    slug: 'lavadora', name: 'lavadora', plural: 'lavadoras', watts: 600, hoursPerDay: 0.4,
    inputLabel: 'potencia promedio de un ciclo con agua fría', defaultUse: '12 ciclos de una hora al mes',
    benchmarkKwhMonth: 7.2,
    tip: 'Lavar con agua fría y cargas completas evita el mayor consumo asociado a calentar agua.'
  },
  {
    slug: 'microondas', name: 'microondas', plural: 'microondas', watts: 1200, hoursPerDay: 0.4,
    inputLabel: 'potencia de salida de un microondas hogareño', defaultUse: '24 minutos diarios',
    benchmarkKwhMonth: 14.4,
    tip: 'Su potencia es alta, pero el uso es corto: los minutos reales mandan más que el tamaño del equipo.'
  },
  {
    slug: 'freidora-de-aire', name: 'freidora de aire', plural: 'freidoras de aire', watts: 1400, hoursPerDay: 0.5,
    inputLabel: 'potencia típica de una freidora familiar', defaultUse: '30 minutos diarios',
    benchmarkKwhMonth: 21,
    tip: 'Cocinar varias porciones en una sola tanda reduce el tiempo total encendida.'
  },
  {
    slug: 'ventilador', name: 'ventilador', plural: 'ventiladores', watts: 60, hoursPerDay: 6,
    inputLabel: 'potencia de un ventilador de pie en velocidad media', defaultUse: '6 horas diarias',
    benchmarkKwhMonth: 10.8,
    tip: 'Un ventilador consume una fracción de un aire acondicionado, aunque no baja la temperatura del aire.'
  },
  {
    slug: 'television', name: 'televisión LED', plural: 'televisiones LED', watts: 100, hoursPerDay: 4,
    inputLabel: 'potencia de una TV LED de 50 a 55 pulgadas', defaultUse: '4 horas diarias',
    benchmarkKwhMonth: 12,
    tip: 'El brillo alto y los modos tienda elevan el consumo; el modo cine/ahorro suele bastar en casa.'
  }
];

function extractTgbCommunes() {
  const bundle = fs.readFileSync(path.join(rawDir, 'tgb-bundle.js'), 'utf8');
  const start = bundle.indexOf('const zg=');
  if (start < 0) throw new Error('No se encontró el dataset de comunas en el bundle de tgb.cl');
  const startArray = bundle.indexOf('[', start);
  let depth = 0, end = -1, inString = false, escaped = false;
  for (let i = startArray; i < bundle.length; i++) {
    const ch = bundle[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') { inString = true; continue; }
    if (ch === '[') depth++;
    if (ch === ']') {
      depth--;
      if (depth === 0) { end = i + 1; break; }
    }
  }
  if (end < 0) throw new Error('No se pudo delimitar el dataset de comunas');
  const regions = eval(bundle.slice(startArray, end));
  const rows = [];
  for (const region of regions) {
    for (const comuna of region.comunas) {
      rows.push({
        cut: Number(comuna.cut),
        code: String(comuna.cut).padStart(5, '0'),
        name: comuna.nombre,
        province: comuna.provincia,
        region: region.nombre,
        regionRoman: region.romano,
        surfaceKm2: comuna.superficie,
        lat: comuna.lat,
        lon: comuna.lon
      });
    }
  }
  return rows;
}

function readTariffs() {
  const files = fs.readdirSync(mapacheDir).filter(f => !['comunas.json', 'regiones.json'].includes(f) && f.endsWith('.json'));
  const byCode = new Map();
  const sources = [];
  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(mapacheDir, file), 'utf8'));
    const distributorSlug = data.distribuidora;
    const source = {
      distributor: distributorSlug,
      name: data.nombre,
      tariff: data.tarifa_hogar,
      validFrom: data.vigente_desde,
      pliegoUrl: data.pliego?.url || null,
      page: data.pliego?.pagina || null,
      communeCount: Object.keys(data.por_comuna || {}).length
    };
    sources.push(source);
    for (const item of data.comunas || []) {
      const code = item.codigo;
      const detail = data.por_comuna?.[code];
      if (!detail) continue;
      const charge = {};
      let fixedMonthly = 0;
      let marginalKwh = 0;
      let energyKwh = 0;
      const breakdown = [];
      for (const x of detail.desglose || []) {
        const value = Number(x.con_iva || 0);
        if (x.unidad === '$/mes') fixedMonthly += value;
        if (x.unidad === '$/kWh') {
          marginalKwh += value;
          if (x.cargo === 'energia') energyKwh += value;
        }
        charge[x.cargo] = value;
        breakdown.push({ key: x.cargo, name: x.nombre, value, unit: x.unidad, quantity: x.cantidad, subtotal: x.subtotal_con_iva, vat: x.tratamiento_iva });
      }
      const row = {
        distributor: distributorSlug,
        distributorName: data.nombre,
        tariff: detail.tarifa || data.tarifa_hogar,
        validFrom: detail.vigente_desde || data.vigente_desde,
        bill250: detail.cuenta_tipo,
        averageKwh250: detail.kwh_hogar,
        marginalKwh,
        energyKwh,
        fixedMonthly,
        charges: charge,
        breakdown,
        pliegoUrl: detail.pliego?.url || data.pliego?.url || null,
        pliegoPage: detail.pliego?.pagina || data.pliego?.pagina || null
      };
      const numericCode = Number(code);
      if (!byCode.has(numericCode)) byCode.set(numericCode, []);
      byCode.get(numericCode).push(row);
    }
  }
  for (const rows of byCode.values()) {
    rows.sort((a, b) => {
      const ai = DISTRIBUTOR_PRIORITY.indexOf(a.distributor);
      const bi = DISTRIBUTOR_PRIORITY.indexOf(b.distributor);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi) || a.distributorName.localeCompare(b.distributorName, 'es');
    });
  }
  return { byCode, sources };
}

function slugify(text) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/ñ/g, 'n').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function round(n, digits = 2) {
  const f = 10 ** digits;
  return Math.round((n + Number.EPSILON) * f) / f;
}

async function fetchNasa(row) {
  const params = new URLSearchParams({
    parameters: 'ALLSKY_SFC_SW_DWN,T2M,T2M_MAX,T2M_MIN',
    community: 'SB',
    longitude: String(row.lon),
    latitude: String(row.lat),
    format: 'JSON'
  });
  const url = `https://power.larc.nasa.gov/api/temporal/climatology/point?${params}`;
  const res = await fetch(url, { headers: { 'user-agent': 'energia-chile-data-builder/1.0 contacto@example.com' } });
  if (!res.ok) throw new Error(`NASA POWER ${res.status} para ${row.name}`);
  const json = await res.json();
  const p = json.properties?.parameter || {};
  const monthly = {};
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  for (const m of months) {
    monthly[m] = {
      radiationKwhM2Day: round((p.ALLSKY_SFC_SW_DWN?.[m] ?? 0) * 24 / 1000, 2),
      tempC: round(p.T2M?.[m] ?? 0, 1),
      tempMaxC: round(p.T2M_MAX?.[m] ?? 0, 1),
      tempMinC: round(p.T2M_MIN?.[m] ?? 0, 1)
    };
  }
  return {
    annualRadiationKwhM2Day: round((p.ALLSKY_SFC_SW_DWN?.ANN ?? 0) * 24 / 1000, 2),
    annualTempC: round(p.T2M?.ANN ?? 0, 1),
    monthly,
    source: 'NASA POWER climatology 2001-2025',
    coordinates: { lat: row.lat, lon: row.lon }
  };
}

async function mapLimit(items, limit, worker) {
  const results = new Array(items.length);
  let index = 0;
  async function run() {
    while (index < items.length) {
      const i = index++;
      results[i] = await worker(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: limit }, run));
  return results;
}

function climateSummary(monthly) {
  const months = Object.values(monthly);
  const summer = (months[0].tempC + months[1].tempC + months[11].tempC) / 3;
  const winter = (months[5].tempC + months[6].tempC + months[7].tempC) / 3;
  const summerMax = (months[0].tempMaxC + months[1].tempMaxC + months[11].tempMaxC) / 3;
  const winterMin = (months[5].tempMinC + months[6].tempMinC + months[7].tempMinC) / 3;
  return { summerTempC: round(summer, 1), winterTempC: round(winter, 1), summerMaxC: round(summerMax, 1), winterMinC: round(winterMin, 1) };
}

function coolingBaseBtuhM2(climate) {
  return Math.round(Math.max(360, Math.min(720, 420 + (climate.summerTempC - 18) * 32 + (climate.ghi - 4.5) * 55)));
}

function heatingBaseBtuhM2(climate) {
  return Math.round(Math.max(330, Math.min(980, 380 + Math.max(0, 16 - climate.winterTempC) * 48)));
}

function buildCalculations(commune) {
  const climate = {
    ghi: commune.climate.annualRadiationKwhM2Day,
    ...climateSummary(commune.climate.monthly)
  };
  return {
    coolingBaseBtuhM2: coolingBaseBtuhM2(climate),
    heatingBaseBtuhM2: heatingBaseBtuhM2(climate),
    solarKwhKwpYear: Math.round(commune.climate.annualRadiationKwhM2Day * 365 * 0.78),
    climate
  };
}

async function main() {
  const communes = extractTgbCommunes();
  const { byCode, sources } = readTariffs();
  const covered = communes.filter(c => byCode.has(c.cut));
  const missing = communes.filter(c => !byCode.has(c.cut));
  console.log(`Comunas oficiales: ${communes.length}; con tarifa residencial: ${covered.length}; sin pliego procesado: ${missing.length}`);

  let cache = {};
  if (fs.existsSync(cacheFile)) cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
  const missingNasa = covered.filter(c => !cache[c.code]);
  console.log(`NASA POWER cache: ${Object.keys(cache).length}; por descargar: ${missingNasa.length}`);
  if (missingNasa.length) {
    const results = await mapLimit(missingNasa, 4, async row => {
      const climate = await fetchNasa(row);
      return [row.code, climate];
    });
    for (const [code, climate] of results) cache[code] = climate;
    fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2));
  }

  const enriched = covered.map(c => {
    const climate = cache[c.code];
    const tariffs = byCode.get(c.cut);
    const primary = tariffs[0];
    const base = {
      ...c,
      slug: slugify(c.name),
      regionSlug: slugify(c.region),
      climate,
      tariffs: tariffs.map(t => ({
        distributor: t.distributor,
        distributorName: t.distributorName,
        tariff: t.tariff,
        validFrom: t.validFrom,
        bill250: round(t.bill250, 0),
        averageKwh250: round(t.averageKwh250, 2),
        marginalKwh: round(t.marginalKwh, 2),
        energyKwh: round(t.energyKwh, 2),
        fixedMonthly: round(t.fixedMonthly, 0),
        charges: Object.fromEntries(Object.entries(t.charges).map(([k, v]) => [k, round(v, 3)])),
        breakdown: t.breakdown.map(x => ({ ...x, value: round(x.value, 3), subtotal: round(x.subtotal, 0) })),
        pliegoUrl: t.pliegoUrl,
        pliegoPage: t.pliegoPage
      })),
      primaryDistributor: primary.distributor,
      primaryDistributorName: primary.distributorName
    };
    base.calc = buildCalculations(base);
    return base;
  }).sort((a, b) => REGION_ORDER.indexOf(a.region) - REGION_ORDER.indexOf(b.region) || a.name.localeCompare(b.name, 'es'));

  const generated = {
    generatedAt: new Date().toISOString(),
    tariffSnapshot: '2026-11-01',
    communeCount: enriched.length,
    programmaticPageCount: enriched.length * 9,
    contentPageCount: 48,
    expectedIndexableUrls: enriched.length * 9 + 48,
    appliances: APPLIANCES,
    communes: enriched,
    sources: {
      tariffs: sources,
      communes: 'Listado de regiones, comunas, CUT, provincia, superficie y coordenadas publicado por tgb.cl/comunas (extracto de datos públicos, consultado el 26-11-2026).',
      tariffProcessing: 'Precios BT1/BT1A leídos de los pliegos oficiales de cada distribuidora, vigentes al 01-11-2026; la lectura estructurada pública de mapache.ai se usó como capa de verificación y extracción.',
      solar: 'NASA POWER climatology, promedio mensual/anual 2001-2025 en el centroide aproximado de cada comuna.',
      netbilling: 'Ley 20.571 y guía de Generación Distribuida para Autoconsumo de la SEC.',
      applianceMethodology: 'Perfiles eléctricos de referencia editables; potencias orientadas por etiquetas de eficiencia chilenas, cartilla Ministerio de Energía y fichas de equipos vendidos en Chile.'
    },
    assumptions: {
      billReferenceKwh: 250,
      solarPerformanceRatio: 0.78,
      solarSelfConsumptionDefault: 0.72,
      solarCostPerWpCLP: 1832,
      panelWattDefault: 550,
      vatIncluded: true,
      currency: 'CLP',
      locale: 'es-CL'
    }
  };

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(generated));
  const stats = {
    communes: enriched.length,
    urls: generated.expectedIndexableUrls,
    minMarginal: Math.min(...enriched.map(c => c.tariffs[0].marginalKwh)),
    maxMarginal: Math.max(...enriched.map(c => c.tariffs[0].marginalKwh)),
    minGhi: Math.min(...enriched.map(c => c.climate.annualRadiationKwhM2Day)),
    maxGhi: Math.max(...enriched.map(c => c.climate.annualRadiationKwhM2Day))
  };
  fs.writeFileSync(path.join(root, 'src/data/meta.json'), JSON.stringify(stats, null, 2));
  console.log('Datos generados', stats);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

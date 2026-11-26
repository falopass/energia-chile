import { nf, nf1, nf2, clp, num, pct, slugify, applianceCalculation, btuCalculation, solarCalculation, monthlyBillEstimate } from './calc.js';

export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

function abs(origin, path) {
  return `${origin}${path}`;
}

export function layout({ origin, path, title, description, children, jsonLd = [], image = null }) {
  const canonical = abs(origin, path);
  const schemas = jsonLd.filter(Boolean).map(item => `<script type="application/ld+json">${JSON.stringify(item).replace(/</g, '\\u003c')}</script>`).join('\n');
  return `<!doctype html>
<html lang="es-CL">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(canonical)}">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta property="og:type" content="website">
<meta property="og:locale" content="es_CL">
<meta property="og:site_name" content="Energía Chile">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(canonical)}">
${image ? `<meta property="og:image" content="${esc(abs(origin, image))}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/assets/styles.css?v=1">
${schemas}
</head>
<body>
<a class="skip" href="#contenido">Saltar al contenido</a>
<header class="topbar">
  <div class="container nav">
    <a class="brand" href="/" aria-label="Energía Chile, inicio">
      <span class="brand-mark" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M13 2 4.8 13.2h5.7L9.6 22l8.6-11.8h-5.7L13 2Z" fill="currentColor"/></svg></span>
      <span>Energía Chile<small>datos locales · CLP</small></span>
    </a>
    <nav class="nav-links" aria-label="Navegación principal">
      <a href="/consumo-electrico/">Consumo</a>
      <a href="/btu/">BTU</a>
      <a href="/paneles-solares/">Solar</a>
      <a href="/tarifas/">Tarifas</a>
      <a href="/comunas/">Comunas</a>
      <a href="/guias/">Guías</a>
      <a class="nav-cta" href="/#herramientas">Calcular</a>
    </nav>
  </div>
</header>
<main id="contenido">${children}</main>
<footer class="footer">
  <div class="container">
    <div class="footer-grid">
      <div>
        <a class="brand" href="/" style="color:#fff"><span class="brand-mark" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M13 2 4.8 13.2h5.7L9.6 22l8.6-11.8h-5.7L13 2Z" fill="currentColor"/></svg></span><span>Energía Chile<small>referencia independiente</small></span></a>
        <p class="muted" style="margin-top:16px">Calculadoras y datos públicos para entender el consumo eléctrico, dimensionar aire acondicionado y estimar generación solar en comunas de Chile.</p>
      </div>
      <div><h3>Herramientas</h3><div class="footer-links"><a href="/consumo-electrico/">Consumo por aparato</a><a href="/btu/">Calculadora BTU</a><a href="/paneles-solares/">Paneles solares</a><a href="/tarifas/">Tarifas BT1</a></div></div>
      <div><h3>Datos</h3><div class="footer-links"><a href="/comunas/">Todas las comunas</a><a href="/metodologia/">Metodología</a><a href="/fuentes/">Fuentes oficiales</a><a href="/preguntas-frecuentes/">Preguntas frecuentes</a></div></div>
      <div><h3>Sitio</h3><div class="footer-links"><a href="/sobre-nosotros/">Sobre nosotros</a><a href="/contacto/">Contacto</a><a href="/privacidad/">Privacidad</a><a href="/terminos/">Términos</a></div></div>
    </div>
    <div class="footer-bottom"><span>© ${new Date().getFullYear()} Energía Chile. Información referencial, verifica siempre tu boleta y pliego tarifario.</span><span>Datos tarifarios vigentes al 01-11-2026 · Clima NASA POWER</span></div>
  </div>
</footer>
<script src="/assets/app.js?v=1" defer></script>
</body>
</html>`;
}

export function breadcrumbs(items) {
  return `<nav class="breadcrumbs container" aria-label="Ruta de navegación"><ol>${items.map((item, i) => `<li>${i < items.length - 1 ? `<a href="${esc(item.href)}">${esc(item.name)}</a>` : `<span aria-current="page">${esc(item.name)}</span>`}</li>`).join('')}</ol></nav>`;
}

function icon(type) {
  if (type === 'sun') return '<svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/></svg>';
  if (type === 'air') return '<svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 8h10a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h7a2.5 2.5 0 1 1-2.5 2.5"/></svg>';
  return '<svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M13 2 4.8 13.2h5.7L9.6 22l8.6-11.8h-5.7L13 2Z"/></svg>';
}

export function communeSelector(data, current = null, basePath = '') {
  const options = data.communes.map(c => `<option value="${esc(basePath.replace('{comuna}', c.slug))}" ${current?.slug === c.slug ? 'selected' : ''}>${esc(c.name)} (${esc(c.region)})</option>`).join('');
  return `<div class="selector-inline no-print"><label for="comuna-select">Cambiar comuna<br><select id="comuna-select" data-jump-select><option value="">Selecciona una comuna…</option>${options}</select></label></div>`;
}

function applianceSelector(data, commune, current) {
  return `<div class="selector-inline no-print"><label>Cambiar aparato<br><select data-jump-select><option value="">Selecciona un aparato…</option>${data.appliances.map(a => `<option value="/consumo-electrico/${a.slug}/${commune.slug}/" ${a.slug === current.slug ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}</select></label></div>`;
}

function formatDateCl(iso) {
  const [y, m, d] = iso.split('-');
  return `${d}-${m}-${y}`;
}

function dataStrip(commune, tariff) {
  return `<div class="data-strip">
    <div class="mini-stat"><b>${clp(tariff.marginalKwh, 2)}</b><span>costo variable por kWh con IVA</span></div>
    <div class="mini-stat"><b>${clp(tariff.fixedMonthly)}</b><span>cargo fijo mensual con IVA</span></div>
    <div class="mini-stat"><b>${num(commune.calc.climate.ghi, 2)} kWh/m²/día</b><span>radiación solar media anual</span></div>
    <div class="mini-stat"><b>${num(commune.calc.climate.summerTempC, 1)}°C</b><span>temperatura media de verano</span></div>
  </div>`;
}

export function applianceCalculator({ appliance, commune, tariff, compact = false }) {
  const calc = applianceCalculation({ watts: appliance.watts, hoursPerDay: appliance.hoursPerDay, priceKwh: tariff.marginalKwh });
  return `<section class="calculator" data-calculator="appliance" aria-labelledby="calc-title">
    <div class="calc-grid">
      <form class="calc-form" onsubmit="return false">
        <span class="tag">calculadora editable</span>
        <h2 id="calc-title" style="margin-top:12px">Calcula el costo mensual</h2>
        <label>Potencia del equipo (W)<input type="number" inputmode="decimal" name="watts" min="1" max="10000" step="1" value="${appliance.watts}"></label>
        <div class="field-row"><div><label>Horas de uso al día<input type="number" inputmode="decimal" name="hours" min="0" max="24" step="0.1" value="${appliance.hoursPerDay}"></label></div><div><label>Días al mes<input type="number" inputmode="numeric" name="days" min="1" max="31" step="1" value="30"></label></div></div>
        <label>Precio variable por kWh (CLP)<input type="number" inputmode="decimal" name="price" min="1" max="500" step="0.01" value="${tariff.marginalKwh.toFixed(2)}"></label>
        <p class="assumptions">Supuesto inicial: ${esc(appliance.defaultUse)}. Ajusta los campos con tu etiqueta, medidor enchufable o hábitos reales.</p>
      </form>
      <div class="calc-result">
        <div class="result-main"><div class="result-label">Costo mensual estimado en ${esc(commune.name)}</div><div class="result-value" data-out="costMonth">${clp(calc.costMonth)}</div><div class="result-sub"><span data-out="kwhMonth">${num(calc.kwhMonth, 1)} kWh</span> al mes · precio variable ${clp(tariff.marginalKwh, 2)}/kWh</div></div>
        <div class="result-grid">
          <div class="mini-stat"><b data-out="costYear">${clp(calc.costYear)}</b><span>al año</span></div>
          <div class="mini-stat"><b data-out="costHour">${clp(calc.costHour)}</b><span>por hora encendido</span></div>
          <div class="mini-stat"><b data-out="share250">${num(calc.share250 * 100, 1)}%</b><span>de una boleta de 250 kWh</span></div>
        </div>
        <p class="assumptions">No incluye cargo fijo porque ya se paga aunque el aparato esté apagado. En ${esc(commune.name)}, ese cargo es ${clp(tariff.fixedMonthly)} mensuales con IVA.</p>
      </div>
    </div>
  </section>`;
}

export function btuCalculator({ commune, tariff }) {
  const calc = btuCalculation({ areaM2: 15, climate: { coolingBaseBtuhM2: commune.calc.coolingBaseBtuhM2, heatingBaseBtuhM2: commune.calc.heatingBaseBtuhM2 }, priceKwh: tariff.marginalKwh });
  return `<section class="calculator" data-calculator="btu" aria-labelledby="btu-title">
    <div class="calc-grid">
      <form class="calc-form" onsubmit="return false">
        <span class="tag blue">dimensionamiento orientativo</span>
        <h2 id="btu-title" style="margin-top:12px">Calcula los BTU de tu espacio</h2>
        <div class="field-row"><div><label>Superficie (m²)<input type="number" inputmode="decimal" name="area" min="4" max="200" step="0.5" value="15"></label></div><div><label>Altura (m)<input type="number" inputmode="decimal" name="height" min="2.2" max="5" step="0.1" value="2.5"></label></div></div>
        <div class="field-row"><div><label>Personas habituales<input type="number" inputmode="numeric" name="occupants" min="1" max="15" step="1" value="2"></label></div><div><label>Ventanas (m²)<input type="number" inputmode="decimal" name="windows" min="0" max="30" step="0.5" value="2"></label></div></div>
        <div class="field-row"><div><label>Orientación<select name="orientation"><option value="norte">Norte</option><option value="oriente">Oriente</option><option value="poniente">Poniente</option><option value="sur">Sur</option></select></label></div><div><label>Aislación<select name="insulation"><option value="normal">Normal</option><option value="buena">Buena</option><option value="deficiente">Deficiente</option></select></label></div></div>
        <label>Uso principal<select name="mode"><option value="frio">Frío en verano</option><option value="calefaccion">Calefacción con bomba de calor</option></select></label>
        <input type="hidden" name="baseCooling" value="${commune.calc.coolingBaseBtuhM2}">
        <input type="hidden" name="baseHeating" value="${commune.calc.heatingBaseBtuhM2}">
        <input type="hidden" name="price" value="${tariff.marginalKwh}">
        <p class="assumptions">El clima local ya está incorporado: ${num(commune.calc.climate.summerTempC, 1)}°C de temperatura media estival y ${num(commune.calc.climate.winterTempC, 1)}°C promedio de invierno.</p>
      </form>
      <div class="calc-result">
        <div class="result-main"><div class="result-label">Carga térmica estimada</div><div class="result-value" data-out="btu">${nf.format(Math.round(calc.raw))} BTU/h</div><div class="result-sub">Equipo comercial sugerido: <strong data-out="recommended">${nf.format(calc.recommended)} BTU</strong></div></div>
        <div class="result-grid">
          <div class="mini-stat"><b data-out="thermalKw">${num(calc.thermalKw, 2)} kW</b><span>capacidad térmica</span></div>
          <div class="mini-stat"><b data-out="inputKw">${num(calc.inputKw, 2)} kW</b><span>potencia eléctrica ref.</span></div>
          <div class="mini-stat"><b data-out="costMonth">${clp(calc.monthlyCost30h)}</b><span>por 30 h/mes en ${esc(commune.name)}</span></div>
        </div>
        <p class="assumptions">Para calefacción, el modo correspondiente usa el invierno local. No reemplaza el cálculo de un instalador para casas con doble altura, muro cortina o uso comercial.</p>
      </div>
    </div>
  </section>`;
}

export function solarCalculator({ commune, tariff, monthlyKwh = 250 }) {
  const calc = solarCalculation({ monthlyKwh, ghiDay: commune.calc.climate.ghi, priceKwh: tariff.marginalKwh, injectionKwh: tariff.energyKwh });
  return `<section class="calculator" data-calculator="solar" aria-labelledby="solar-title">
    <div class="calc-grid">
      <form class="calc-form" onsubmit="return false">
        <span class="tag sun">netbilling residencial</span>
        <h2 id="solar-title" style="margin-top:12px">Dimensiona paneles solares</h2>
        <div class="field-row"><div><label>Consumo mensual (kWh)<input type="number" inputmode="numeric" name="monthlyKwh" min="50" max="3000" step="10" value="${monthlyKwh}"></label></div><div><label>Cobertura objetivo (%)<input type="number" inputmode="numeric" name="coverage" min="20" max="100" step="5" value="80"></label></div></div>
        <div class="field-row"><div><label>Radiación local (kWh/m²/día)<input type="number" inputmode="decimal" name="ghi" min="1" max="8" step="0.01" value="${commune.calc.climate.ghi}"></label></div><div><label>Panel (W)<input type="number" inputmode="numeric" name="panelW" min="300" max="700" step="10" value="550"></label></div></div>
        <div class="field-row"><div><label>Autoconsumo (%)<input type="number" inputmode="numeric" name="selfConsumption" min="20" max="100" step="1" value="72"></label></div><div><label>Tarifa variable (CLP/kWh)<input type="number" inputmode="decimal" name="price" min="50" max="500" step="0.01" value="${tariff.marginalKwh}"></label></div></div>
        <input type="hidden" name="injection" value="${tariff.energyKwh}">
        <p class="assumptions">Costo referencial por tamaño residencial: $1.700–$1.080 por Wp instalado, más $115.877 de conexión SEC para sistemas ≤10 kW (valor 2025). No incluye financiamiento.</p>
      </form>
      <div class="calc-result">
        <div class="result-main"><div class="result-label">Sistema sugerido</div><div class="result-value" data-out="kwp">${num(calc.installedKwp, 2)} kWp</div><div class="result-sub"><strong data-out="panels">${nf.format(calc.panels)} paneles</strong> · <span data-out="roof">${num(calc.roofM2, 1)} m²</span> de techo útil</div></div>
        <div class="result-grid">
          <div class="mini-stat"><b data-out="generation">${nf.format(Math.round(calc.generationYear))} kWh/año</b><span>generación esperada</span></div>
          <div class="mini-stat"><b data-out="savings">${clp(calc.savingsMonth)}</b><span>ahorro mensual ref.</span></div>
          <div class="mini-stat"><b data-out="payback">${num(calc.paybackYears, 1)} años</b><span>payback simple</span></div>
        </div>
        <p class="assumptions">Inversión estimada: <strong data-out="cost">${clp(calc.totalCost)}</strong>. Las inyecciones se valoran al cargo por energía local (${clp(tariff.energyKwh, 2)}/kWh), no a la tarifa completa.</p>
      </div>
    </div>
  </section>`;
}

function monthlyChart(commune) {
  const entries = Object.entries(commune.climate.monthly);
  const max = Math.max(...entries.map(([, v]) => v.radiationKwhM2Day));
  const bars = entries.map(([month, v]) => `<div style="height:${Math.max(4, v.radiationKwhM2Day / max * 100)}%" data-label="${month}: ${num(v.radiationKwhM2Day, 1)} kWh/m²/día"></div>`).join('');
  const labels = ['E','F','M','A','M','J','J','A','S','O','N','D'].map(m => `<span>${m}</span>`).join('');
  return `<div><div class="chart" aria-label="Radiación solar mensual">${bars}</div><div class="chart-labels">${labels}</div></div>`;
}

function tariffTable(commune) {
  return `<div class="table-wrap"><table><thead><tr><th>Distribuidora</th><th class="num">Variable $/kWh</th><th class="num">Cargo fijo</th><th class="num">Boleta 250 kWh</th><th>Fuente</th></tr></thead><tbody>${commune.tariffs.map(t => `<tr><td><strong>${esc(t.distributorName)}</strong><br><span class="small muted">${esc(t.tariff)} · vigente ${formatDateCl(t.validFrom)}</span></td><td class="num mono">${clp(t.marginalKwh, 2)}</td><td class="num mono">${clp(t.fixedMonthly)}</td><td class="num mono">${clp(t.bill250)}</td><td>${t.pliegoUrl ? `<a href="${esc(t.pliegoUrl)}" rel="nofollow noopener" target="_blank">pliego oficial</a>` : 'pliego oficial'}</td></tr>`).join('')}</tbody></table></div>`;
}

function communeFacts(commune, tariff) {
  return `<div class="card"><h3>Datos locales usados</h3><div class="stat-list">
    <div class="stat-line"><span>Distribuidora de referencia</span><b>${esc(tariff.distributorName)}</b></div>
    <div class="stat-line"><span>Tarifa residencial</span><b>${esc(tariff.tariff)}</b></div>
    <div class="stat-line"><span>Boleta tipo 250 kWh</span><b>${clp(tariff.bill250)}</b></div>
    <div class="stat-line"><span>Radiación anual</span><b>${num(commune.calc.climate.ghi, 2)} kWh/m²/día</b></div>
    <div class="stat-line"><span>Verano / invierno</span><b>${num(commune.calc.climate.summerTempC, 1)}°C / ${num(commune.calc.climate.winterTempC, 1)}°C</b></div>
    <div class="stat-line"><span>Coordenadas usadas</span><b>${num(Math.abs(commune.lat), 3)}°S, ${num(Math.abs(commune.lon), 3)}°O</b></div>
  </div></div>`;
}

function relatedCommunes(data, commune, pathTemplate, limit = 8) {
  const near = data.communes.filter(c => c.region === commune.region && c.slug !== commune.slug).slice(0, limit);
  return `<div class="link-list">${near.map(c => `<a href="${esc(pathTemplate.replace('{comuna}', c.slug))}"><span>${esc(c.name)}</span><small>${esc(c.province)}</small></a>`).join('')}</div>`;
}

export function homePage(data, origin) {
  const cheapest = [...data.communes].sort((a, b) => a.tariffs[0].marginalKwh - b.tariffs[0].marginalKwh)[0];
  const expensive = [...data.communes].sort((a, b) => b.tariffs[0].marginalKwh - a.tariffs[0].marginalKwh)[0];
  const sunniest = [...data.communes].sort((a, b) => b.calc.climate.ghi - a.calc.climate.ghi)[0];
  const examples = ['independencia', 'puente-alto', 'la-florida', 'maipu', 'iquique', 'concepcion', 'temuco', 'puerto-montt'].map(slug => data.communes.find(c => c.slug === slug)).filter(Boolean);
  const children = `
<section class="hero"><div class="container hero-grid"><div>
  <span class="eyebrow">Chile · datos comunales · precios con IVA</span>
  <h1>Entiende tu cuenta de luz antes de comprar, encender o instalar.</h1>
  <p class="lead">Calculadoras de consumo eléctrico, BTU y paneles solares con tarifas residenciales reales por comuna, clima local NASA POWER y resultados editables en pesos chilenos.</p>
  <div class="hero-actions"><a class="btn" href="/consumo-electrico/">Calcular consumo</a><a class="btn secondary" href="/paneles-solares/">Estimar paneles solares</a></div>
</div><div class="hero-panel"><span class="tag sun">cobertura nacional</span>
  <div class="kpi"><div><b>${nf.format(data.expectedIndexableUrls)}</b><br><span>URLs indexables con datos propios</span></div><span>páginas</span></div>
  <div class="kpi"><div><b>${nf.format(data.communeCount)}</b><br><span>comunas con tarifa residencial procesada</span></div><span>comunas</span></div>
  <div class="kpi"><div><b>${num(sunniest.calc.climate.ghi, 2)}</b><br><span>kWh/m²/día en ${esc(sunniest.name)}, el mejor potencial solar</span></div><span>radiación</span></div>
  <div class="kpi"><div><b>${clp(cheapest.tariffs[0].marginalKwh, 0)}–${clp(expensive.tariffs[0].marginalKwh, 0)}</b><br><span>rango del costo variable por kWh entre comunas</span></div><span>tarifa</span></div>
</div></div></section>
<section class="section" id="herramientas"><div class="container"><div class="section-head"><div><h2>Tres herramientas, una misma pregunta: ¿cuánto me costará?</h2><p>Los resultados se calculan en la página y se pueden ajustar con tus propios hábitos, superficie o consumo mensual.</p></div></div><div class="grid-3">
  <a class="card tool-card" href="/consumo-electrico/"><span class="tool-icon">${icon('bolt')}</span><h3>Consumo por aparato</h3><p>Refrigerador, aire acondicionado, lavadora, microondas, freidora de aire, ventilador y TV con la tarifa variable de cada comuna.</p><span class="card-link">Calcular consumo →</span></a>
  <a class="card tool-card blue" href="/btu/"><span class="tool-icon">${icon('air')}</span><h3>Calculadora BTU</h3><p>Dimensiona aire acondicionado o bomba de calor según m², orientación, aislación y clima local de verano e invierno.</p><span class="card-link">Dimensionar BTU →</span></a>
  <a class="card tool-card sun" href="/paneles-solares/"><span class="tool-icon">${icon('sun')}</span><h3>Paneles solares</h3><p>Estima kWp, número de paneles, inversión, generación anual y payback netbilling usando radiación de tu comuna.</p><span class="card-link">Estimar sistema solar →</span></a>
</div></div></section>
<section class="section"><div class="container"><div class="section-head"><div><h2>Explora por comuna</h2><p>Empieza con una comuna grande o usa el índice completo. Cada página local incorpora pliego BT1, radiación y temperaturas propias.</p></div><a class="btn secondary" href="/comunas/">Ver todas</a></div><div class="commune-grid">${examples.map(c => `<a href="/paneles-solares/${c.slug}/"><strong>${esc(c.name)}</strong><span>${clp(c.tariffs[0].marginalKwh, 2)}/kWh · ${num(c.calc.climate.ghi, 1)} kWh/m²/día</span></a>`).join('')}</div></div></section>
<section class="section"><div class="container grid-2"><div class="card pad-lg"><span class="tag">transparencia</span><h2 style="margin-top:12px">Datos trazables, no texto inflado</h2><p>Las páginas comunales comparten estructura porque calculan lo mismo, pero no son texto reemplazado: cada una usa su distribuidora, precio variable, cargo fijo, boleta de referencia, radiación mensual y temperatura estacional.</p><p class="muted">La metodología y las fuentes oficiales están publicadas para auditar cada supuesto.</p><a href="/metodologia/">Ver metodología →</a></div><div class="card pad-lg"><span class="tag sun">actualización</span><h2 style="margin-top:12px">Vigencia clara de los precios</h2><p>Los pliegos procesados corresponden a tarifas BT1/BT1A vigentes desde el 01-11-2026. Las distribuidoras actualizan precios por factores de estacionalidad e indexación, por lo que cada página muestra su fecha y fuente.</p><p class="muted">En ${esc(expensive.name)} el costo variable llega a ${clp(expensive.tariffs[0].marginalKwh, 2)}/kWh; en ${esc(cheapest.name)} parte en ${clp(cheapest.tariffs[0].marginalKwh, 2)}/kWh.</p><a href="/tarifas/">Comparar tarifas →</a></div></div></section>
<section class="section"><div class="container"><div class="section-head"><div><h2>Guías prácticas</h2><p>Contexto para interpretar el resultado sin convertir cifras referenciales en promesas comerciales.</p></div><a href="/guias/" class="btn secondary">Todas las guías</a></div><div class="grid-3">${guideCards(data).slice(0, 3).join('')}</div></div></section>`;
  return layout({
    origin,
    path: '/',
    title: 'Energía Chile: consumo eléctrico, BTU y paneles solares por comuna',
    description: 'Calcula consumo eléctrico, BTU y paneles solares con tarifas residenciales por comuna de Chile, clima local y resultados en pesos chilenos.',
    children,
    jsonLd: [{ '@context': 'https://schema.org', '@type': 'WebSite', name: 'Energía Chile', url: origin }]
  });
}

function guideCards(data) {
  return data.guides.map(g => `<a class="card tool-card" href="${esc(g.path)}"><span class="tool-icon">${icon(g.icon || 'bolt')}</span><h3>${esc(g.title)}</h3><p>${esc(g.excerpt)}</p><span class="card-link">Leer guía →</span></a>`);
}

export function consumoHubPage(data, origin) {
  const children = `${breadcrumbs([{ name: 'Inicio', href: '/' }, { name: 'Consumo eléctrico' }])}
<section class="page-title container"><h1>Consumo eléctrico por aparato en Chile</h1><p class="lead">Calcula cuánto cuesta usar un aparato en tu comuna. El precio por kWh no es nacional: cambia con la distribuidora, el sistema eléctrico y los cargos de transmisión.</p></section>
<section class="section container"><div class="grid-3">${data.appliances.map(a => `<a class="card tool-card" href="/consumo-electrico/${a.slug}/"><span class="tool-icon">${icon('bolt')}</span><h3>${esc(a.name)}</h3><p>Supuesto base: ${esc(a.defaultUse)}. Resultados en CLP según la tarifa BT1 local.</p><span class="card-link">Calcular ${esc(a.name)} →</span></a>`).join('')}</div></section>
<section class="section container"><div class="card pad-lg"><h2>Cómo leer el resultado</h2><p>El costo de un aparato adicional usa el <strong>precio variable por kWh</strong>, no la boleta promedio. El cargo fijo se informa aparte porque se paga aunque no enciendas nada. La potencia de placa puede ser máxima; un medidor enchufable o la etiqueta de eficiencia suele entregar un promedio más realista.</p><div class="callout">Si tu consumo mensual ya supera 350 kWh, algunos recargos o beneficios tarifarios pueden cambiar. Verifica el detalle de tu boleta antes de tomar una decisión grande.</div></div></section>`;
  return layout({ origin, path: '/consumo-electrico/', title: 'Consumo eléctrico por aparato en Chile | Energía Chile', description: 'Calcula el costo mensual de refrigerador, aire acondicionado, lavadora y otros aparatos según la tarifa eléctrica de tu comuna.', children });
}

export function applianceHubPage(data, appliance, origin) {
  const ranked = [...data.communes].sort((a, b) => b.tariffs[0].marginalKwh - a.tariffs[0].marginalKwh);
  const examples = ranked.slice(0, 4).concat(ranked.slice(-4));
  const children = `${breadcrumbs([{ name: 'Inicio', href: '/' }, { name: 'Consumo eléctrico', href: '/consumo-electrico/' }, { name: appliance.name }])}
<section class="page-title container"><h1>¿Cuánto consume un ${esc(appliance.name)} en Chile?</h1><p class="lead">${esc(appliance.tip)} Compara el costo mensual con el precio variable real de 328 comunas y ajusta potencia, horas y días de uso.</p>${communeSelector(data, null, `/consumo-electrico/${appliance.slug}/{comuna}/`)}</section>
<section class="section container"><div class="section-head"><div><h2>Comunas destacadas por costo</h2><p>Los primeros resultados muestran tarifas altas y bajas; no implican mejor o peor servicio.</p></div></div><div class="commune-grid">${examples.map(c => `<a href="/consumo-electrico/${appliance.slug}/${c.slug}/"><strong>${esc(c.name)}</strong><span>${clp(c.tariffs[0].marginalKwh, 2)}/kWh · ${clp(applianceCalculation({ watts: a.watts, hoursPerDay: a.hoursPerDay, priceKwh: c.tariffs[0].marginalKwh }).costMonth)}/mes</span></a>`).join('')}</div></section>
<section class="section container"><div class="card pad-lg"><h2>Supuesto base editable</h2><p>Usamos ${appliance.watts} W y ${num(appliance.hoursPerDay, 1)} horas diarias como punto de partida (${num(appliance.benchmarkKwhMonth, 1)} kWh al mes). Es una referencia, no una medición universal: eficiencia, tamaño, edad, temperatura ambiente y hábitos cambian el resultado.</p><p>Todas las páginas permiten cambiar los tres supuestos y mantienen visible la tarifa utilizada.</p></div></section>`;
  return layout({ origin, path: `/consumo-electrico/${appliance.slug}/`, title: `Cuánto consume un ${appliance.name} por mes en Chile`, description: `Calcula el consumo mensual y costo en pesos de un ${appliance.name} según la tarifa residencial de tu comuna.`, children });
}

export function applianceCommunePage(data, appliance, commune, origin) {
  const tariff = commune.tariffs[0];
  const calc = applianceCalculation({ watts: appliance.watts, hoursPerDay: appliance.hoursPerDay, priceKwh: tariff.marginalKwh });
  const nationalMedian = [...data.communes].sort((a, b) => a.tariffs[0].marginalKwh - b.tariffs[0].marginalKwh)[Math.floor(data.communes.length / 2)].tariffs[0].marginalKwh;
  const diff = tariff.marginalKwh / nationalMedian - 1;
  const children = `${breadcrumbs([{ name: 'Inicio', href: '/' }, { name: 'Consumo eléctrico', href: '/consumo-electrico/' }, { name: appliance.name, href: `/consumo-electrico/${appliance.slug}/` }, { name: commune.name }])}
<section class="page-title container"><span class="eyebrow">${esc(commune.region)} · tarifa ${esc(tariff.tariff)}</span><h1>Consumo de un ${esc(appliance.name)} en ${esc(commune.name)}</h1><p class="lead">Con la tarifa residencial de ${esc(tariff.distributorName)}, el supuesto base cuesta <strong>${clp(calc.costMonth)} al mes</strong> (${num(calc.kwhMonth, 1)} kWh). El precio variable local es ${Math.abs(diff) < 0.01 ? 'casi igual a' : diff > 0 ? `${num(diff * 100, 0)}% mayor que` : `${num(Math.abs(diff) * 100, 0)}% menor que`} la mediana comunal.</p>${applianceSelector(data, commune, appliance)}${communeSelector(data, commune, `/consumo-electrico/${appliance.slug}/{comuna}/`)}</section>
<div class="container">${dataStrip(commune, tariff)}${applianceCalculator({ appliance, commune, tariff })}</div>
<section class="section container content-grid"><div class="prose"><h2>Qué significa este resultado en ${esc(commune.name)}</h2><p>El cálculo usa <strong>${clp(tariff.marginalKwh, 2)} por cada kWh adicional</strong> con IVA. Ese valor suma energía, compras de potencia por energía, distribución, transmisión cuando corresponde y cargo por servicio público; excluye el cargo fijo mensual de ${clp(tariff.fixedMonthly)} porque no cambia por encender este aparato.</p><p>El consumo de referencia equivale a <strong>${num(calc.share250 * 100, 1)}%</strong> de una boleta de 250 kWh. Si ya consumes cerca de 350 kWh mensuales, revisa si tu boleta incluye recargos o beneficios distintos.</p><h2>Radiación y clima local</h2><p>El clima no solo afecta el aire acondicionado: refrigeradores y ventiladores también trabajan más en ambientes calurosos. En ${esc(commune.name)}, la temperatura media de verano es ${num(commune.calc.climate.summerTempC, 1)}°C y la radiación anual ${num(commune.calc.climate.ghi, 2)} kWh/m²/día.</p>${monthlyChart(commune)}<h2>Desglose tarifario</h2><p>La distribuidora de referencia es ${esc(tariff.distributorName)}. Si tu dirección está en un borde comunal o en una zona eléctrica especial, compara la alternativa disponible y confirma en tu boleta.</p>${tariffTable(commune)}<div class="callout"><strong>Consejo práctico:</strong> ${esc(appliance.tip)}</div></div><aside class="sidebar">${communeFacts(commune, tariff)}<div class="card"><h3>Otras comunas de la región</h3>${relatedCommunes(data, commune, `/consumo-electrico/${appliance.slug}/{comuna}/`)}</div><div class="card"><h3>Herramientas para ${esc(commune.name)}</h3><div class="link-list"><a href="/btu/${commune.slug}/"><span>Calculadora BTU</span><small>${nf.format(commune.calc.coolingBaseBtuhM2)} BTU/m² base</small></a><a href="/paneles-solares/${commune.slug}/"><span>Paneles solares</span><small>${num(commune.calc.solarKwhKwpYear)} kWh/kWp/año</small></a></div></div></aside></section>
<section class="section container"><div class="section-head"><div><h2>Otros aparatos en ${esc(commune.name)}</h2></div></div><div class="pill-row">${data.appliances.filter(a => a.slug !== appliance.slug).map(a => `<a class="pill" href="/consumo-electrico/${a.slug}/${commune.slug}/">${esc(a.name)}</a>`).join('')}</div></section>`;
  const faq = {
    '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: `¿Cuánto cuesta usar un ${appliance.name} en ${commune.name}?`, acceptedAnswer: { '@type': 'Answer', text: `Con el supuesto base de ${appliance.watts} W durante ${appliance.hoursPerDay} horas diarias, el costo estimado es ${clp(calc.costMonth)} al mes usando ${clp(tariff.marginalKwh, 2)}/kWh.` } },
      { '@type': 'Question', name: '¿El cálculo incluye el cargo fijo?', acceptedAnswer: { '@type': 'Answer', text: 'No. El cargo fijo se muestra por separado porque se paga independiente del consumo adicional del aparato.' } }
    ]
  };
  return layout({
    origin,
    path: `/consumo-electrico/${appliance.slug}/${commune.slug}/`,
    title: `Consumo de ${appliance.name} en ${commune.name}: costo mensual en CLP`,
    description: `Calcula cuánto consume un ${appliance.name} en ${commune.name}. Tarifa ${tariff.tariff} de ${tariff.distributorName}, precio real por kWh y calculadora editable.`,
    children,
    jsonLd: [faq]
  });
}

export function btuHubPage(data, origin) {
  const examples = ['arica', 'iquique', 'santiago', 'independencia', 'concepcion', 'temuco', 'puerto-montt', 'punta-arenas'].map(slug => data.communes.find(c => c.slug === slug)).filter(Boolean);
  const children = `${breadcrumbs([{ name: 'Inicio', href: '/' }, { name: 'Calculadora BTU' }])}
<section class="page-title container"><h1>Calculadora BTU por m² y clima de tu comuna</h1><p class="lead">Dimensiona un aire acondicionado o bomba de calor con datos locales de temperatura y radiación. Una comuna del desierto no exige lo mismo que una del sur lluvioso.</p>${communeSelector(data, null, '/btu/{comuna}/')}</section>
<section class="section container"><div class="grid-4">${examples.map(c => `<a class="card" href="/btu/${c.slug}/" style="text-decoration:none;color:inherit"><span class="tag blue">${num(c.calc.climate.summerTempC, 1)}°C verano</span><h3 style="margin-top:12px">${esc(c.name)}</h3><p class="muted small">${nf.format(c.calc.coolingBaseBtuhM2)} BTU/h por m² base en frío · ${nf.format(c.calc.heatingBaseBtuhM2)} en calefacción</p></a>`).join('')}</div></section>
<section class="section container"><div class="card pad-lg"><h2>BTU no es consumo eléctrico</h2><p>BTU/h mide capacidad térmica: cuánto calor puede remover o entregar el equipo. La potencia eléctrica depende de la eficiencia. Como referencia usamos 1,09 kW de entrada para un split inverter residencial de 12.000 BTU; modelos premium pueden consumir menos parcializados.</p></div></section>`;
  return layout({ origin, path: '/btu/', title: 'Calculadora BTU por m² y comuna de Chile | Energía Chile', description: 'Calcula cuántos BTU necesita una habitación o vivienda según superficie, orientación, aislación y clima de tu comuna.', children });
}

export function btuCommunePage(data, commune, origin) {
  const tariff = commune.tariffs[0];
  const children = `${breadcrumbs([{ name: 'Inicio', href: '/' }, { name: 'BTU', href: '/btu/' }, { name: commune.name }])}
<section class="page-title container"><span class="eyebrow">clima NASA POWER · ${esc(commune.name)}</span><h1>Calculadora BTU en ${esc(commune.name)}</h1><p class="lead">La carga base estimada es <strong>${nf.format(commune.calc.coolingBaseBtuhM2)} BTU/h por m²</strong> para frío y <strong>${nf.format(commune.calc.heatingBaseBtuhM2)} BTU/h por m²</strong> para calefacción. Ajusta superficie, ventanas, orientación y aislación.</p>${communeSelector(data, commune, '/btu/{comuna}/')}</section>
<div class="container">${dataStrip(commune, tariff)}${btuCalculator({ commune, tariff })}</div>
<section class="section container content-grid"><div class="prose"><h2>Clima usado en el dimensionamiento</h2><p>En ${esc(commune.name)}, la temperatura media de verano es ${num(commune.calc.climate.summerTempC, 1)}°C y la temperatura media de invierno ${num(commune.calc.climate.winterTempC, 1)}°C. La radiación anual de ${num(commune.calc.climate.ghi, 2)} kWh/m²/día aumenta la carga en espacios con ventanales, especialmente orientados al norte o poniente.</p>${monthlyChart(commune)}<h2>Cómo interpretar la recomendación</h2><p>El resultado redondea a capacidades comerciales habituales: 9.000, 12.000, 18.000, 24.000 BTU y superiores. Si quedas justo entre dos tamaños, un inverter correctamente instalado suele ser preferible a sobredimensionar en exceso, porque modular mejor evita ciclos cortos.</p><ul><li><strong>Buena aislación:</strong> doble vidrio, cielo aislado y sellos pueden reducir cerca de 18% la carga estimada.</li><li><strong>Poniente:</strong> recibe sol fuerte al final de la tarde; el modelo agrega 25% a la carga de ventanas.</li><li><strong>Calefacción:</strong> usa el invierno local; en zonas frías la capacidad necesaria puede superar la de refrigeración.</li></ul><h2>Costo eléctrico de referencia</h2><p>Un equipo de 12.000 BTU se modela con 1,09 kW de entrada. A 30 horas mensuales y tarifa variable de ${clp(tariff.marginalKwh, 2)}/kWh, representa cerca de ${clp(1.09 * 30 * tariff.marginalKwh)} al mes en ${esc(commune.name)}. El costo real depende de temperatura objetivo, horas y eficiencia.</p>${tariffTable(commune)}</div><aside class="sidebar">${communeFacts(commune, tariff)}<div class="card"><h3>Otras comunas cercanas</h3>${relatedCommunes(data, commune, '/btu/{comuna}/')}</div><div class="card"><h3>Continuar el cálculo</h3><div class="link-list"><a href="/consumo-electrico/aire-acondicionado/${commune.slug}/"><span>Costo del aire acondicionado</span><small>editable</small></a><a href="/paneles-solares/${commune.slug}/"><span>Paneles solares</span><small>${num(commune.calc.solarKwhKwpYear)} kWh/kWp/año</small></a></div></div></aside></section>`;
  return layout({ origin, path: `/btu/${commune.slug}/`, title: `Calculadora BTU en ${commune.name}: frío y calefacción por m²`, description: `Dimensiona BTU de aire acondicionado o bomba de calor en ${commune.name} con clima local, superficie, orientación y tarifa eléctrica real.`, children });
}

export function solarHubPage(data, origin) {
  const ranked = [...data.communes].sort((a, b) => b.calc.solarKwhKwpYear - a.calc.solarKwhKwpYear);
  const examples = ranked.slice(0, 4).concat(ranked.slice(-4));
  const children = `${breadcrumbs([{ name: 'Inicio', href: '/' }, { name: 'Paneles solares' }])}
<section class="page-title container"><h1>Calculadora de paneles solares por comuna de Chile</h1><p class="lead">Estima cuántos paneles necesitas, cuánto generarían al año y en cuánto tiempo se recuperaría la inversión bajo netbilling residencial.</p>${communeSelector(data, null, '/paneles-solares/{comuna}/')}</section>
<section class="section container"><div class="section-head"><div><h2>Comunas extremas de radiación</h2><p>La radiación cambia fuertemente entre el norte y el sur austral.</p></div></div><div class="commune-grid">${examples.map(c => `<a href="/paneles-solares/${c.slug}/"><strong>${esc(c.name)}</strong><span>${num(c.calc.climate.ghi, 2)} kWh/m²/día · ${num(c.calc.solarKwhKwpYear)} kWh/kWp/año</span></a>`).join('')}</div></section>
<section class="section container"><div class="card pad-lg"><h2>Qué es netbilling en una casa</h2><p>Un sistema de generación distribuida primero abastece tus consumos instantáneos. Los excedentes se inyectan a la red y se descuentan en la boleta según las reglas de la Ley 20.571. Por eso el ahorro no valora todo a la tarifa completa: la energía autoconsumida vale más que la inyectada.</p></div></section>`;
  return layout({ origin, path: '/paneles-solares/', title: 'Calculadora de paneles solares en Chile por comuna | Energía Chile', description: 'Estima paneles solares, kWp, inversión, generación anual y payback netbilling con radiación solar y tarifas de tu comuna.', children });
}

export function solarCommunePage(data, commune, origin) {
  const tariff = commune.tariffs[0];
  const calc = solarCalculation({ monthlyKwh: 250, ghiDay: commune.calc.climate.ghi, priceKwh: tariff.marginalKwh, injectionKwh: tariff.energyKwh });
  const children = `${breadcrumbs([{ name: 'Inicio', href: '/' }, { name: 'Paneles solares', href: '/paneles-solares/' }, { name: commune.name }])}
<section class="page-title container"><span class="eyebrow">${num(commune.calc.climate.ghi, 2)} kWh/m²/día · ${esc(commune.region)}</span><h1>Paneles solares en ${esc(commune.name)}</h1><p class="lead">Para una boleta de 250 kWh mensuales y 80% de cobertura, el sistema de referencia es <strong>${num(calc.installedKwp, 2)} kWp</strong> con ${nf.format(calc.panels)} paneles de 550 W. La generación local esperada es ${num(commune.calc.solarKwhKwpYear)} kWh por kWp instalado al año.</p>${communeSelector(data, commune, '/paneles-solares/{comuna}/')}</section>
<div class="container">${dataStrip(commune, tariff)}${solarCalculator({ commune, tariff })}</div>
<section class="section container content-grid"><div class="prose"><h2>Potencial solar mensual</h2><p>NASA POWER reporta un promedio anual de ${num(commune.calc.climate.ghi, 2)} kWh/m²/día para el centroide aproximado de ${esc(commune.name)}. El rendimiento usa un performance ratio de 0,78 por pérdidas de temperatura, cableado, suciedad, inversor e inclinación no ideal.</p>${monthlyChart(commune)}<h2>Economía del sistema de referencia</h2><div class="table-wrap"><table><tbody><tr><td>Inversión equipos e instalación</td><td class="num"><strong>${clp(calc.equipmentCost)}</strong></td></tr><tr><td>Conexión SEC estimada</td><td class="num"><strong>${clp(calc.connectionCost)}</strong></td></tr><tr><td>Generación primer año</td><td class="num"><strong>${nf.format(Math.round(calc.generationYear))} kWh</strong></td></tr><tr><td>Ahorro mensual de referencia</td><td class="num"><strong>${clp(calc.savingsMonth)}</strong></td></tr><tr><td>Payback simple</td><td class="num"><strong>${num(calc.paybackYears, 1)} años</strong></td></tr></tbody></table></div><p>El ahorro supone 72% de autoconsumo instantáneo y 28% de inyección. La parte autoconsumida evita comprar a ${clp(tariff.marginalKwh, 2)}/kWh; la inyectada se valora a ${clp(tariff.energyKwh, 2)}/kWh, aproximado al cargo por energía del pliego. Tu proporción real depende de consumos diurnos, termo eléctrico, vehículo eléctrico o batería.</p><h2>Antes de pedir cotizaciones</h2><ul><li>Revisa sombras de árboles, chimeneas, edificios y cerros; la radiación comunal no ve obstrucciones de tu techo.</li><li>Confirma orientación e inclinación. En Chile la orientación norte suele maximizar energía anual.</li><li>Pide el diseño con producción mensual estimada y compárala con esta referencia.</li><li>Consulta a tu distribuidora por potencia máxima, medidor bidireccional y declaración SEC antes de comprar.</li></ul>${tariffTable(commune)}</div><aside class="sidebar">${communeFacts(commune, tariff)}<div class="card"><h3>Otras comunas cercanas</h3>${relatedCommunes(data, commune, '/paneles-solares/{comuna}/')}</div><div class="card"><h3>Complementar el análisis</h3><div class="link-list"><a href="/consumo-electrico/aire-acondicionado/${commune.slug}/"><span>Costo del aire acondicionado</span><small>editable</small></a><a href="/btu/${commune.slug}/"><span>Calculadora BTU</span><small>${nf.format(commune.calc.coolingBaseBtuhM2)} BTU/m²</small></a></div></div></aside></section>`;
  const faq = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [{ '@type': 'Question', name: `¿Cuántos paneles solares necesita una casa en ${commune.name}?`, acceptedAnswer: { '@type': 'Answer', text: `Para cubrir 80% de 250 kWh mensuales, la referencia es ${nf.format(calc.panels)} paneles de 550 W (${num(calc.installedKwp, 2)} kWp). El resultado cambia con tu consumo, sombras y orientación.` } }] };
  return layout({ origin, path: `/paneles-solares/${commune.slug}/`, title: `Paneles solares en ${commune.name}: costo, generación y payback`, description: `Calcula paneles solares en ${commune.name}: radiación local, kWp necesarios, inversión estimada, ahorro mensual y payback netbilling.`, children, jsonLd: [faq] });
}

export function comunasPage(data, origin) {
  const byRegion = new Map();
  for (const c of data.communes) {
    if (!byRegion.has(c.region)) byRegion.set(c.region, []);
    byRegion.get(c.region).push(c);
  }
  const children = `${breadcrumbs([{ name: 'Inicio', href: '/' }, { name: 'Comunas' }])}<section class="page-title container"><h1>Índice de comunas con datos eléctricos</h1><p class="lead">${nf.format(data.communes.length)} comunas tienen al menos un pliego residencial procesado. Cada ficha enlaza consumo, BTU y potencial solar local.</p></section><section class="section container">${[...byRegion.entries()].map(([region, rows]) => `<div class="region-title"><span class="tag">${rows.length}</span><h3><a href="/region/${slugify(region)}/">${esc(region)}</a></h3></div><div class="alphabet" style="margin:12px 0 22px">${rows.map(c => `<a class="pill" href="/paneles-solares/${c.slug}/">${esc(c.name)}</a>`).join('')}</div>`).join('')}</section>`;
  return layout({ origin, path: '/comunas/', title: 'Comunas de Chile con tarifas eléctricas y datos solares | Energía Chile', description: 'Índice de comunas chilenas con precio por kWh, cargo fijo, consumo de aparatos, BTU y potencial solar local.', children });
}

export function regionPage(data, regionSlug, origin) {
  const rows = data.communes.filter(c => c.regionSlug === regionSlug);
  if (!rows.length) return null;
  const region = rows[0].region;
  const avgTariff = rows.reduce((s, c) => s + c.tariffs[0].marginalKwh, 0) / rows.length;
  const avgGhi = rows.reduce((s, c) => s + c.calc.climate.ghi, 0) / rows.length;
  const children = `${breadcrumbs([{ name: 'Inicio', href: '/' }, { name: 'Comunas', href: '/comunas/' }, { name: region }])}<section class="page-title container"><h1>Electricidad y energía solar en ${esc(region)}</h1><p class="lead">${rows.length} comunas procesadas. Promedio simple: ${clp(avgTariff, 2)}/kWh variable y ${num(avgGhi, 2)} kWh/m²/día de radiación anual.</p></section><section class="section container"><div class="commune-grid">${rows.map(c => `<a href="/paneles-solares/${c.slug}/"><strong>${esc(c.name)}</strong><span>${clp(c.tariffs[0].marginalKwh, 2)}/kWh · ${num(c.calc.climate.ghi, 1)} kWh/m²/día</span></a>`).join('')}</div></section>`;
  return layout({ origin, path: `/region/${regionSlug}/`, title: `Electricidad y paneles solares en ${region} | Energía Chile`, description: `Comunas de ${region} con precio variable por kWh, tarifas residenciales y potencial solar local.`, children });
}

export function tarifasPage(data, origin) {
  const rows = [...data.communes].sort((a, b) => a.tariffs[0].marginalKwh - b.tariffs[0].marginalKwh);
  const children = `${breadcrumbs([{ name: 'Inicio', href: '/' }, { name: 'Tarifas' }])}<section class="page-title container"><h1>Tarifas eléctricas residenciales por comuna</h1><p class="lead">Comparación del costo variable BT1/BT1A con IVA vigente al 01-11-2026. La tabla ordena por la distribuidora de referencia de cada comuna; en límites comunales puede haber alternativas.</p></section><section class="section container"><div class="table-wrap"><table><thead><tr><th>Comuna</th><th>Región</th><th>Distribuidora</th><th class="num">Variable $/kWh</th><th class="num">Cargo fijo</th><th class="num">Boleta 250 kWh</th></tr></thead><tbody>${rows.map(c => `<tr><td><a href="/consumo-electrico/refrigerador/${c.slug}/">${esc(c.name)}</a></td><td>${esc(c.region)}</td><td>${esc(c.tariffs[0].distributorName)}</td><td class="num mono">${clp(c.tariffs[0].marginalKwh, 2)}</td><td class="num mono">${clp(c.tariffs[0].fixedMonthly)}</td><td class="num mono">${clp(c.tariffs[0].bill250)}</td></tr>`).join('')}</tbody></table></div></section>`;
  return layout({ origin, path: '/tarifas/', title: 'Tarifas eléctricas residenciales por comuna de Chile | Energía Chile', description: 'Tabla de costo variable por kWh, cargo fijo y boleta de 250 kWh para comunas chilenas según pliegos BT1 vigentes.', children });
}

export function guiasPage(data, origin) {
  const children = `${breadcrumbs([{ name: 'Inicio', href: '/' }, { name: 'Guías' }])}<section class="page-title container"><h1>Guías de energía para hogares chilenos</h1><p class="lead">Explicaciones prácticas para interpretar consumo, BTU, tarifas y netbilling sin depender de una sola cifra.</p></section><section class="section container"><div class="grid-3">${guideCards(data).join('')}</div></section>`;
  return layout({ origin, path: '/guias/', title: 'Guías de consumo eléctrico, BTU y energía solar | Energía Chile', description: 'Guías prácticas para hogares chilenos sobre consumo eléctrico, eficiencia, aire acondicionado, BTU y paneles solares netbilling.', children });
}

export function guidePage(guide, origin) {
  const children = `${breadcrumbs([{ name: 'Inicio', href: '/' }, { name: 'Guías', href: '/guias/' }, { name: guide.title }])}<article class="page-title container"><span class="eyebrow">guía práctica</span><h1>${esc(guide.title)}</h1><p class="lead">${esc(guide.excerpt)}</p></article><article class="section container content-grid"><div class="prose">${guide.body}</div><aside class="sidebar"><div class="card"><h3>En esta guía</h3><div class="toc">${guide.toc.map(item => `<a href="#${esc(item.id)}">${esc(item.label)}</a>`).join('')}</div></div><div class="card"><h3>Herramientas relacionadas</h3><div class="link-list"><a href="/consumo-electrico/"><span>Consumo por aparato</span><small>CLP</small></a><a href="/btu/"><span>Calculadora BTU</span><small>clima local</small></a><a href="/paneles-solares/"><span>Paneles solares</span><small>netbilling</small></a></div></div></aside></article>`;
  return layout({ origin, path: guide.path, title: `${guide.title} | Energía Chile`, description: guide.excerpt, children });
}

export function simplePage(kind, origin) {
  const pages = {
    metodologia: {
      title: 'Metodología de cálculo', description: 'Fórmulas, supuestos y límites de las calculadoras de Energía Chile.', body: `<p>Energía Chile separa <strong>datos observados</strong>, <strong>supuestos editables</strong> y <strong>resultados estimados</strong>. Las cifras no son cotizaciones ni promesas de ahorro.</p><h2>Consumo de aparatos</h2><p>Consumo mensual = potencia (W) ÷ 1000 × horas diarias × días al mes. El costo multiplica ese consumo por el precio variable local con IVA. El cargo fijo se muestra aparte porque no cambia con un aparato adicional.</p><h2>BTU</h2><p>La carga térmica combina superficie, altura, ocupantes, ventanas, orientación, aislación y clima comunal. Es un dimensionamiento orientativo residencial, no un cálculo de ingeniería térmica.</p><h2>Paneles solares</h2><p>Generación anual = kWp instalado × radiación diaria × 365 × performance ratio 0,78. El ahorro valora autoconsumo a la tarifa variable evitada e inyecciones al cargo por energía. Costos referenciales por tamaño se basan en rangos de mercado residencial publicados en Chile y no incluyen baterías.</p><h2>Limitaciones</h2><ul><li>El centroide comunal puede no representar microclimas, sombras o altura de una vivienda específica.</li><li>Algunas comunas tienen más de una distribuidora o sectores no eléctricos.</li><li>Los pliegos pueden cambiar por indexación, estacionalidad o nuevas resoluciones.</li><li>No se calculan pérdidas específicas de inversor, orientación real, batería ni financiamiento.</li></ul>`
    },
    fuentes: {
      title: 'Fuentes y trazabilidad', description: 'Fuentes oficiales y datasets usados por Energía Chile.', body: `<h2>Fuentes principales</h2><ul class="source-list"><li>Pliegos tarifarios oficiales de distribuidoras eléctricas, vigencia 01-11-2026. Cada página comunal enlaza el pliego usado.</li><li>NASA POWER climatology 2001-2025: radiación solar, temperatura media, máxima y mínima mensual por coordenada comunal.</li><li>Listado territorial comunal publicado por tgb.cl/comunas: nombre, CUT, provincia, superficie y coordenadas aproximadas.</li><li>SEC: guía de Generación Distribuida para Autoconsumo y procedimiento de conexión.</li><li>Ley 20.571 y Ley 21.505 sobre generación distribuida y tarifas eléctricas.</li><li>Ministerio de Energía: materiales de eficiencia energética y etiquetado de electrodomésticos.</li></ul><p>La lectura estructurada de pliegos fue verificada contra el agregador público mapache.ai cuando estuvo disponible. Las cifras se procesan como hechos tarifarios; el diseño, metodología y textos del sitio son propios.</p>`
    },
    privacidad: {
      title: 'Política de privacidad', description: 'Política de privacidad de Energía Chile.', body: `<p>Energía Chile es un sitio informativo. Las calculadoras procesan los valores ingresados en tu navegador; no exigimos crear cuenta ni entregar datos personales para calcular.</p><h2>Datos que podemos registrar</h2><p>Como la mayoría de los sitios web, el proveedor de alojamiento puede registrar registros técnicos como dirección IP, navegador, fecha, ruta solicitada y errores para seguridad y operación.</p><h2>Cookies y publicidad</h2><p>Si el sitio incorpora Google AdSense u otros proveedores publicitarios, ellos podrán usar cookies o tecnologías similares para mostrar anuncios, medir rendimiento y prevenir fraude. Google puede usar cookies de publicidad conforme a su política. Puedes revisar y administrar la personalización en la configuración de anuncios de Google.</p><h2>Contacto</h2><p>Si escribes por correo, usaremos los datos enviados solo para responder la solicitud. No vendemos bases de datos ni compartimos información personal con terceros fuera de los proveedores necesarios para operar el sitio.</p><h2>Cambios</h2><p>Esta política puede actualizarse cuando cambien las herramientas o servicios del sitio. La versión vigente estará publicada en esta página.</p>`
    },
    contacto: {
      title: 'Contacto', description: 'Canal de contacto de Energía Chile.', body: `<p>Para correcciones de datos, fuentes tarifarias actualizadas o errores en una calculadora, abre un issue público en <a href="https://github.com/falopass/energia-chile/issues" rel="noopener" target="_blank">github.com/falopass/energia-chile/issues</a>.</p><p>Incluye comuna, distribuidora, enlace de la página y captura o pliego si reportas una tarifa. No respondemos cotizaciones comerciales ni instalaciones; el sitio no vende equipos.</p><div class="callout">Usamos un canal público mientras el sitio opera sin dominio propio ni servicios pagos de correo. Las fuentes y la metodología también están publicadas para verificación.</div>`
    },
    sobre: {
      title: 'Sobre nosotros', description: 'Qué es Energía Chile y cómo se financia.', body: `<p>Energía Chile es un proyecto editorial y de datos independiente para hacer más comprensible la electricidad residencial en Chile. No pertenece a distribuidoras, instaladoras ni retailers.</p><p>El sitio combina pliegos tarifarios públicos, climatología NASA POWER y supuestos transparentes. La financiación prevista es publicidad contextual, lo que no altera la fórmula ni el orden de los resultados.</p><p>Nuestro criterio editorial es mostrar supuestos, fecha de vigencia, límites y fuentes antes que entregar una cifra única sin contexto.</p>`
    },
    terminos: {
      title: 'Términos de uso', description: 'Condiciones de uso de Energía Chile.', body: `<p>El contenido es referencial e informativo. No constituye asesoría eléctrica, financiera, tributaria ni de ingeniería. Antes de instalar equipos, modificar una red eléctrica o firmar un contrato, consulta a profesionales habilitados, la SEC y tu distribuidora.</p><p>Aunque se revisan las fuentes, pueden existir errores, cambios tarifarios posteriores o casos especiales. El uso de las calculadoras es bajo tu propia responsabilidad.</p><p>Puedes enlazar las páginas públicas. No está permitido copiar masivamente el sitio, interferir su operación ni presentar los resultados como cotizaciones comerciales.</p>`
    },
    faq: {
      title: 'Preguntas frecuentes', description: 'Preguntas frecuentes sobre tarifas, consumo, BTU y paneles solares en Chile.', body: `<div class="faq"><details open><summary>¿Por qué el precio por kWh cambia tanto entre comunas?</summary><p>Porque la cuenta incluye componentes de generación, transmisión, distribución y cargos públicos. La distribución y pérdidas difieren por territorio, densidad y sistema eléctrico.</p></details><details><summary>¿La boleta de 250 kWh es mi consumo esperado?</summary><p>No. Es una referencia comparable usada para visualizar tarifas. Revisa tu medidor y boleta histórica para conocer tu consumo real.</p></details><details><summary>¿Más BTU siempre es mejor?</summary><p>No. Sobredimensionar puede generar ciclos cortos, peor confort y mayor costo inicial. En inverter, elegir la capacidad cercana a la carga real suele ser más eficiente.</p></details><details><summary>¿Los paneles solares eliminan el cargo fijo?</summary><p>No necesariamente. Mientras la casa siga conectada a la red, el cargo fijo y ciertos cargos no evitables pueden permanecer en la boleta.</p></details><details><summary>¿Puedo usar estos resultados para cotizar?</summary><p>Sí como referencia inicial, pero una cotización real exige revisar techo, sombras, consumos horarios, tablero, orientación y regulación vigente.</p></details></div>`
    }
  };
  const p = pages[kind];
  const paths = { metodologia: '/metodologia/', fuentes: '/fuentes/', privacidad: '/privacidad/', contacto: '/contacto/', sobre: '/sobre-nosotros/', terminos: '/terminos/', faq: '/preguntas-frecuentes/' };
  const children = `${breadcrumbs([{ name: 'Inicio', href: '/' }, { name: p.title }])}<section class="page-title container"><h1>${esc(p.title)}</h1></section><section class="section container"><div class="prose card pad-lg">${p.body}</div></section>`;
  return layout({ origin, path: paths[kind], title: `${p.title} | Energía Chile`, description: p.description, children });
}

export function notFoundPage(origin) {
  return layout({ origin, path: '/404/', title: 'Página no encontrada | Energía Chile', description: 'La página solicitada no existe.', children: `<section class="page-title container"><h1>Página no encontrada</h1><p class="lead">La ruta no existe o la comuna no tiene datos tarifarios procesados.</p><div class="hero-actions"><a class="btn" href="/">Volver al inicio</a><a class="btn secondary" href="/comunas/">Ver comunas</a></div></section>` });
}

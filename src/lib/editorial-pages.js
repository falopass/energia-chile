import { heatingComparison } from './market.js';

export const CONTENT_UPDATED = '2026-11-27';
export const CONTENT_UPDATED_LABEL = '27-11-2026';

export const REGIONAL_VARIATIONS_2027 = [
  { region: 'Arica y Parinacota', slug: 'arica-y-parinacota', change: -9.9 },
  { region: 'Tarapacá', slug: 'tarapaca', change: -7.3 },
  { region: 'Antofagasta', slug: 'antofagasta', change: -11 },
  { region: 'Atacama', slug: 'atacama', change: -10.2 },
  { region: 'Coquimbo', slug: 'coquimbo', change: -8.4 },
  { region: 'Valparaíso', slug: 'valparaiso', change: -8.5 },
  { region: 'Metropolitana de Santiago', slug: 'metropolitana-de-santiago', change: -4 },
  { region: "Libertador General Bernardo O'Higgins", slug: 'libertador-general-bernardo-ohiggins', change: -2.7 },
  { region: 'Maule', slug: 'maule', change: -3.5 },
  { region: 'Ñuble', slug: 'nuble', change: -4.6 },
  { region: 'Biobío', slug: 'biobio', change: -4 },
  { region: 'La Araucanía', slug: 'la-araucania', change: -4.4 },
  { region: 'Los Ríos', slug: 'los-rios', change: 6 },
  { region: 'Los Lagos', slug: 'los-lagos', change: 4.7 },
  { region: 'Aysén del General Carlos Ibáñez del Campo', slug: 'aysen-del-general-carlos-ibanez-del-campo', change: -3.1 },
  { region: 'Magallanes y de la Antártica Chilena', slug: 'magallanes-y-de-la-antartica-chilena', change: 2.4 }
];

const SOURCE = {
  itd: ['CNE, Informe Técnico Definitivo PNP enero 2027', 'https://www.cne.cl/wp-content/uploads/2026/11/150_ITD-Precio-Nudo-Promedio-enero-2027-1.pdf'],
  resolucion650: ['CNE, Resolución Exenta 650/2026', 'https://www.cne.cl/wp-content/uploads/2026/11/Resolucion-Exenta-650-2026.pdf'],
  baja2027: ['Ministerio de Energía, baja de cuentas para 13 regiones, 17-11-2026', 'https://energia.gob.cl/noticias/nacional/ministra-rincon-confirma-baja-en-las-cuentas-de-electricidad-para-13-regiones-del-pais'],
  subsidioConvocatoria: ['Ministerio de Energía, sexta convocatoria del Subsidio Eléctrico, 23-11-2026', 'https://energia.gob.cl/noticias/la-araucania/prepara-tus-datos-el-subsidio-electrico-abre-el-7-de-diciembre'],
  subsidioQuinto: ['Ministerio de Energía, resultados del quinto proceso, 11-08-2026', 'https://energia.gob.cl/noticias/nacional/quinto-proceso-de-entrega-del-subsidio-electrico-llega-cifra-mas-alta-de-beneficiarios-desde-su-creacion'],
  ley21833: ['Ley 21.833, protección tarifaria y subsidio durante 2027', 'https://www.leychile.cl/leychile/navegar?idNorma=1226550'],
  portalSubsidio: ['Portal oficial Subsidio Eléctrico', 'https://www.subsidioelectrico.cl/'],
  recambioNoticia: ['MMA, recambio de calefactores en seis regiones, 19-11-2026', 'https://mma.gob.cl/ministra-toledo-sobre-las-postulaciones-que-el-programa-recambio-de-calefactores-mantiene-abiertas-en-seis-regiones-del-pais-esta-es-una-gran-oportunidad-para-las-familias/'],
  recambioPortal: ['Portal oficial Recambio de Calefactores', 'https://calefactores.mma.gob.cl/'],
  aireChile: ['MMA, Aire Chile y episodios críticos', 'https://airechile.mma.gob.cl/'],
  leyLena: ['Ley 21.499 sobre biocombustibles sólidos', 'https://www.bcn.cl/leychile/navegar?idNorma=1183783'],
  estadoLena: ['Cámara de Diputadas y Diputados, estado del reglamento de la Ley de Leña, 12-06-2026', 'https://www.camara.cl/verDoc.aspx?prmID=174759&prmNUMERO=900&prmRTE=0&prmTIPO=OFICIOFISCALIZACIONRESPUESTA'],
  registroLena: ['MMA, Registro Leña y reporte mensual', 'https://registrolena.mma.gob.cl/reporte_mensual'],
  indicesCalefaccion: ['Ministerio de Energía, índices de precios de calefacción', 'https://indicesdeprecios.energia.gob.cl/calefaccion.html'],
  etiquetaAire: ['SEC, Protocolo PE 1/26/2:2020 de acondicionadores de aire', 'https://www.sec.cl/sitio-web/wp-content/uploads/2020/04/PE-1-26-2-EE-Acondicionadores-de-Aire_Eficiencia_2020.pdf'],
  etiquetaRefrigerador: ['SEC, Protocolo PE 1/17/2:2022 de refrigeradores', 'https://wlhttp.sec.cl/PublicacionProductos/adjunto?ac=verDocProt&id=429'],
  secCertificacion: ['SEC, sistema de certificación de productos', 'https://www.sec.cl/sistema-de-certificacion-de-productos-sec/']
};

const pct = value => `${value > 0 ? '+' : ''}${String(value).replace('.', ',')}%`;
const table = (caption, head, rows) => `<table class="stackable"><caption>${caption}</caption><thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map((cell, i) => `<td data-label="${head[i]}">${cell}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
const page = config => ({ updated: CONTENT_UPDATED, updatedLabel: CONTENT_UPDATED_LABEL, ...config });

const regionalTable = table('Variación promedio de cuentas residenciales por región, primer semestre 2027', ['Región', 'Variación', 'Lectura'], REGIONAL_VARIATIONS_2027.map(r => [
  `<a href="/region/${r.slug}/">${r.region}</a>`, pct(r.change), r.change < 0 ? 'Baja promedio informada' : 'Alza promedio informada'
]));

export const cuentasLuz2027Page = page({
  path: '/2027/cuentas-luz/',
  title: 'Cuentas de luz 2027: cuánto bajan o suben en tu región',
  description: 'Variación regional confirmada para las cuentas residenciales desde enero de 2027, con tabla por región, causas y límites del cálculo.',
  answer: 'Según el Informe Técnico Definitivo del Precio Nudo Promedio publicado en noviembre de 2026, la cuenta residencial promedio bajaría 4,4% a nivel nacional desde enero de 2027. La rebaja llega a 13 regiones; Los Ríos, Los Lagos y Magallanes registrarían alzas. El efecto final depende de tu distribuidora y consumo.',
  sections: [
    ['tabla', 'La tabla regional completa', `<p>El promedio nacional es una referencia, no una rebaja automática e idéntica en cada boleta. El porcentaje regional proviene del Precio Nudo Promedio y la aplicación final depende de los pliegos de cada distribuidora.</p>${regionalTable}<p>Las alzas de Los Ríos y Los Lagos se explican por congestión de transmisión asociada al retraso de obras, en particular Cautín-Ciruelos. Magallanes usa sistemas medianos y variables distintas al Sistema Eléctrico Nacional.</p>`],
    ['por-que-baja', 'Por qué baja el promedio nacional', '<p>El Ministerio de Energía atribuye la baja al término de contratos de suministro suscritos en 2008 y 2010, con precios cercanos a US$100/MWh, y su reemplazo por contratos adjudicados en 2022, 2023 y 2025 con promedio cercano a US$67/MWh. También incide un saldo a favor por tipo de cambio.</p><p>La cifra definitiva de -4,4% corrige levemente el -4,3% del informe preliminar. Revisa la tabla anterior antes de generalizar: en tres regiones la cuenta sube.</p>'],
    ['boleta', 'Qué hacer con esta cifra', '<p>No multipliques tu boleta total por el porcentaje regional como si fuera un descuento final. Primero identifica consumo en kWh, distribuidora y tarifa. Después compara el pliego vigente cuando se publique para enero de 2027.</p><p>Si tu hogar puede postular al Subsidio Eléctrico, prepara Registro Social de Hogares, ClaveÚnica y número de cliente antes del 7 de diciembre.</p><p><a href="/tarifas/">Ver tarifas BT1 vigentes</a> · <a href="/subsidio-electrico/">Revisar Subsidio Eléctrico</a> · <a href="/guias/como-leer-tu-boleta-de-luz/">Aprender a leer la boleta</a></p>']
  ],
  faqs: [
    ['¿Cuánto bajará la cuenta de la luz en 2027?', 'El promedio nacional bajaría 4,4% desde enero de 2027. La rebaja alcanza 13 regiones y las mayores bajas informadas son Antofagasta 11%, Atacama 10,2% y Arica y Parinacota 9,9%.'],
    ['¿En qué regiones subirá la cuenta?', 'Los Ríos subiría 6%, Los Lagos 4,7% y Magallanes 2,4% en promedio, de acuerdo con la información difundida junto al informe definitivo.'],
    ['¿La rebaja se aplica igual a todas las distribuidoras?', 'No. El Precio Nudo Promedio es un insumo de la tarifa, pero el cargo final depende del pliego de cada distribuidora, del consumo y de otros cargos de la boleta.']
  ],
  sources: [SOURCE.itd, SOURCE.resolucion650, SOURCE.baja2027],
  dataset: true
});

export const subsidioElectricoPage = page({
  path: '/subsidio-electrico/',
  title: 'Subsidio Eléctrico 2027: requisitos, montos y cómo postular',
  description: 'Sexta convocatoria del Subsidio Eléctrico desde el 07-12-2026: requisitos, canales, montos de referencia y pasos para postular.',
  answer: 'La sexta convocatoria abre el 7 de diciembre de 2026 y financia descuentos en la boleta durante el primer semestre de 2027. Se postula con ClaveÚnica en subsidioelectrico.cl, en ChileAtiende o por la Ventanilla Única Social. No es dinero en efectivo: se refleja como rebaja en seis cuotas.',
  steps: [
    'Revisa que tu hogar esté en el tramo 0-40% del Registro Social de Hogares o que una persona electrodependiente esté inscrita en el registro oficial.',
    'Ten a mano ClaveÚnica, número de cliente y la cuenta de electricidad al día o con convenio de pago vigente.',
    'Postula desde el 7 de diciembre de 2026 en subsidioelectrico.cl, ChileAtiende o la Ventanilla Única Social.',
    'Revisa la boleta del primer semestre de 2027: el beneficio aparece como descuento y no como transferencia de dinero.'
  ],
  sections: [
    ['convocatoria', 'Sexta convocatoria', '<p>La apertura confirmada es el <strong>7 de diciembre de 2026</strong>. Cubre descuentos durante el primer semestre de 2027. La Ley 21.833 extendió el subsidio durante todo 2027 y fortaleció la protección de clientes electrodependientes.</p><p>La postulación anterior alcanzó 1.926.830 hogares beneficiados, con 232.993 nuevos hogares. Esa cifra corresponde al quinto proceso y no garantiza cupo ni adjudicación automática en la nueva convocatoria.</p>'],
    ['requisitos', 'Requisitos principales', '<ul><li>Ser mayor de 18 años y cliente residencial, propietario o arrendatario.</li><li>Estar al día con la cuenta o tener un convenio de pago.</li><li>Integrar un hogar dentro del 40% más vulnerable del Registro Social de Hogares o contar con una persona electrodependiente inscrita en el registro oficial.</li><li>Usar el mismo número de cliente de la cuenta donde se aplicará el descuento.</li></ul><p>En convocatorias anteriores se priorizó hogares con personas sujetas de cuidado, niños, niñas y adolescentes, cuidadores y personas mayores.</p>'],
    ['montos', 'Montos conocidos y límite de la cifra', table('Montos del quinto proceso, segundo semestre 2026; sirven como referencia hasta que se publiquen montos 2027', ['Integrantes', 'Semestral', 'Mensual'], [['1', '$17.346', '$2.891'], ['2 a 3', '$22.548', '$3.758'], ['4 o más', '$31.224', '$5.204']]) + '<p><strong>Los montos 2027 aún no están confirmados en la fuente oficial consultada.</strong> No uses los valores de 2026 como promesa para 2027; esta página se actualizará cuando el Ministerio publique la nueva tabla.</p>'],
    ['cuanto-vale', 'Cuánto representa en kWh', '<p>El descuento mensual compra distinta energía según tu comuna. Por ejemplo, $3.758 equivalen a unos 14 kWh al mes con la tarifa media nacional de $268,22/kWh, pero a 27 kWh si tu precio variable es $137/kWh y solo 12 kWh si es $303/kWh. Por eso conviene revisar la tarifa local antes de estimar el beneficio.</p><p><a href="/tarifas/">Comparar tarifas por comuna</a> · <a href="/guias/como-leer-tu-boleta-de-luz/">Encontrar el número de cliente y la tarifa en la boleta</a></p>']
  ],
  faqs: [
    ['¿Cuándo se postula al Subsidio Eléctrico 2027?', 'La sexta convocatoria abre el 7 de diciembre de 2026. Los descuentos se aplican durante el primer semestre de 2027 en seis cuotas reflejadas en la boleta.'],
    ['¿Quién puede recibir el Subsidio Eléctrico?', 'Personas mayores de 18 años, clientes residenciales al día o con convenio, cuyo hogar esté en el 40% más vulnerable del Registro Social de Hogares o incluya una persona electrodependiente inscrita.'],
    ['¿El subsidio es un pago en efectivo?', 'No. Es un descuento aplicado directamente a la cuenta de electricidad. No se deposita dinero ni se puede transferir a otra cuenta.']
  ],
  sources: [SOURCE.subsidioConvocatoria, SOURCE.subsidioQuinto, SOURCE.ley21833, SOURCE.portalSubsidio],
  governmentService: true
});

export const calefaccionPage = page({
  path: '/calefaccion/',
  title: 'Qué calefacción conviene en tu comuna',
  description: 'Comparación de leña, pellet, parafina, gas licuado, resistencia eléctrica y bomba de calor por costo de calor útil y restricciones locales.',
  answer: 'Depende de la comuna, la vivienda y el combustible. Como referencia Ministerio de Energía 2025, leña y pellet suelen ser más baratos por kWh útil en zonas centro-sur, mientras una bomba de calor inverter puede costar varias veces menos que una estufa eléctrica de resistencia para el mismo calor.',
  sections: [
    ['comparacion', 'Costo de calor útil', `<p>La unidad comparable no es el saco, el litro ni el cilindro: es el costo por kWh de calor que efectivamente queda en la vivienda.</p>${table('Comparación con precios y supuestos de noviembre de 2026; febrero de 2025 en el índice ministerial cuando se indica', ['Sistema', 'Unidad', 'Precio usado', 'Calor útil', '$/kWh útil'], heatingComparison.map(h => [h.name, h.unit, h.price, h.energy, `$${String(h.useful).replace('.', ',')}`]))}<p>El índice del Ministerio de Energía de febrero de 2025 informó rangos de 31-46 $/kWh para leña, 50-52 para pellet, 112-122 para parafina, 120-151 para gas y 190-235 para electricidad. Son valores de referencia temporal, no precios vigentes universales.</p>`],
    ['restricciones', 'Antes de elegir leña', '<p>En ciudades con Plan de Descontaminación Atmosférica la decisión no es solo económica. Durante alertas, preemergencias y emergencias puede prohibirse el uso de calefactores, la emisión de humos visibles o el funcionamiento de artefactos según zona y tipo de equipo.</p><p><a href="/pda/">Revisar restricciones PDA por ciudad</a> · <a href="/recambio-calefactores/">Ver recambio de calefactores</a> · <a href="/lena-pellet/">Qué exige la Ley de Leña</a></p>'],
    ['electrica', 'Bomba de calor o resistencia', '<p>Una estufa de resistencia convierte 1 kWh eléctrico en cerca de 1 kWh térmico. Una bomba de calor puede entregar 2,5 a 4 kWh térmicos por kWh consumido en condiciones favorables, aunque el rendimiento baja con frío extremo, mala instalación o sobredimensionamiento.</p><p><a href="/btu/">Calcular BTU en mi comuna</a> · <a href="/guias/calefaccion-mas-barata-region/">Leer la guía completa por región</a></p>']
  ],
  faqs: [
    ['¿Qué calefacción es más barata en Chile?', 'En zonas centro-sur con leña certificada barata suele ganar la leña por kWh útil. Donde hay restricciones o no hay espacio, pellet y bomba de calor compiten según tarifa eléctrica y rendimiento real.'],
    ['¿Es mejor bomba de calor o estufa eléctrica?', 'Para uso prolongado, la bomba de calor suele costar menos porque mueve calor en vez de generarlo por resistencia. La estufa eléctrica es simple, pero cada kWh eléctrico entrega solo cerca de 1 kWh térmico.']
  ],
  sources: [SOURCE.indicesCalefaccion, SOURCE.registroLena, SOURCE.aireChile]
});

const pdaCities = [
  {
    slug: 'temuco-padre-las-casas', name: 'Temuco y Padre Las Casas', region: 'La Araucanía', decree: 'DS 08/2023', period: '1 de abril al 15 de septiembre', population: '358.541 personas',
    url: 'https://ppda.mma.gob.cl/araucania/pda-para-las-comunas-de-temuco-y-padre-las-casas/',
    zone: 'Temuco y Padre Las Casas mantienen zonas territoriales ampliadas desde 2025; el informe final 2026 registra 20 alertas y 13 preemergencias declaradas.',
    restrictions: 'Las medidas se activan por Alerta, Preemergencia o Emergencia y pueden restringir humos visibles, artefactos a leña y fuentes industriales según la zona declarada.',
    recambio: 'La línea de aire acondicionado inverter de 18.000 BTU sin copago para Temuco y Padre Las Casas cerró el 19-11-2026. No queda abierta al 27-11-2026; revisa nuevos llamados.',
    links: [['BTU en Temuco', '/btu/temuco/'], ['BTU en Padre Las Casas', '/btu/padre-las-casas/']]
  },
  {
    slug: 'osorno', name: 'Osorno', region: 'Los Lagos', decree: 'DS 47/2015', period: 'temporada GEC 2026 según plan operacional', population: '161.460 personas',
    url: 'https://ppda.mma.gob.cl/los-lagos/pda-para-la-comuna-de-osorno/',
    zone: 'La resolución 01684/2026 define polígonos territoriales de gestión; las medidas se aplican según polígono y nivel de episodio.',
    restrictions: 'El plan operacional contempla prohibición de quemas, control de humos visibles y restricciones de artefactos a leña en viviendas según alerta, preemergencia y emergencia.',
    recambio: 'Hay 402 equipos a pellet disponibles con copago de $130.000. Postulaciones abiertas del 09-11 al 09-12-2026.',
    links: [['BTU en Osorno', '/btu/osorno/'], ['Recambio en Osorno', '/recambio-calefactores/osorno/']]
  },
  {
    slug: 'valdivia', name: 'Valdivia', region: 'Los Ríos', decree: 'DS 25/2016', period: '1 de abril al 30 de septiembre', population: 'zona saturada comunal',
    url: 'https://ppda.mma.gob.cl/los-rios/pda-para-la-comuna-valdivia/',
    zone: 'La zona saturada se subdivide en zonas territoriales; la resolución anual define qué medidas aplican en cada una.',
    restrictions: 'Durante episodios críticos se aplican medidas de prevención y mitigación sobre combustión residencial, humos visibles y fuentes reguladas, según la zona territorial.',
    recambio: 'No hay un llamado de Valdivia abierto en la revisión del 27-11-2026. El portal nacional mantiene el histórico y futuros llamados.',
    links: [['BTU en Valdivia', '/btu/valdivia/']]
  },
  {
    slug: 'los-angeles', name: 'Los Ángeles', region: 'Biobío', decree: 'DS 04/2017', period: '1 de abril al 30 de septiembre', population: 'zona urbana de Los Ángeles',
    url: 'https://ppda.mma.gob.cl/biobio/plan-para-la-comuna-de-los-angeles/',
    zone: 'La resolución 1172/2026 determina la zona territorial de gestión dentro del área urbana de la comuna.',
    restrictions: 'Las medidas de episodio incluyen control de humos visibles y restricciones a calefacción y fuentes según alerta, preemergencia o emergencia.',
    recambio: 'No hay un llamado abierto específico de Los Ángeles al 27-11-2026. En Biobío el llamado de aire acondicionado cubrió otras comunas y cerró el 23-11-2026.',
    links: [['BTU en Los Ángeles', '/btu/los-angeles/']]
  },
  {
    slug: 'talca-maule', name: 'Talca y Maule', region: 'Maule', decree: 'DS 49/2016', period: '1 de abril al 30 de septiembre', population: 'radio urbano de Talca y radio urbano norte de Maule',
    url: 'https://ppda.mma.gob.cl/maule/pda-para-las-comunas-de-talca-y-maule/',
    zone: 'El polígono de gestión cubre el radio urbano de Talca y el radio urbano norte de Maule, incluido Culenar Chacarillas.',
    restrictions: 'Los episodios contemplan restricciones a humos visibles desde viviendas y al funcionamiento de calderas y hornos a leña o carbón en el polígono.',
    recambio: 'El llamado regional de aire acondicionado 2026 para Curicó, Teno, Rauco, Romeral, Sagrada Familia y Molina tenía copago de $110.000 y cierre el 25-11-2026. No aplica como abierto para Talca al 27-11-2026.',
    links: [['BTU en Talca', '/btu/talca/'], ['BTU en Maule', '/btu/maule/']]
  },
  {
    slug: 'chillan', name: 'Chillán y Chillán Viejo', region: 'Ñuble', decree: 'DS 48/2015', period: '1 de abril al 30 de septiembre', population: 'intercomuna Chillán y Chillán Viejo',
    url: 'https://ppda.mma.gob.cl/nuble/ppda-para-las-comunas-chillan-y-chillan-viejo/',
    zone: 'El plan operacional 2026 fue aprobado por Resolución Exenta 1120/2026 para ambas comunas.',
    restrictions: 'El período GEC activa medidas de prevención y mitigación por MP10 y MP2,5 según el episodio declarado, dentro de la zona saturada.',
    recambio: 'Hay 290 equipos a pellet disponibles con copago de $120.000. Postulaciones abiertas del 16-11 al 15-12-2026.',
    links: [['BTU en Chillán', '/btu/chillan/'], ['BTU en Chillán Viejo', '/btu/chillan-viejo/'], ['Recambio en Ñuble', '/recambio-calefactores/nuble/']]
  },
  {
    slug: 'valle-central-ohiggins', name: 'Valle Central de O’Higgins', region: 'O’Higgins', decree: 'DS 01/2021', period: '1 de mayo al 31 de agosto en 2026', population: '705.576 personas',
    url: 'https://ppda.mma.gob.cl/ohiggins/pda-para-el-valle-central-de-la-region-de-ohiggins/',
    zone: 'La zona saturada se divide en Zona A y Zona B; la operación 2026 cubre el valle central conforme al DS 1/2021.',
    restrictions: 'Desde el 29-03-2025 rigen prohibiciones permanentes: en Zona A no se pueden usar calefactores o cocinas a leña, carbón o derivados; en áreas urbanas de Zona B quedaron prohibidas salamandras, hechizos y cocinas a leña. En episodios se suman restricciones transitorias.',
    recambio: 'No hay un llamado abierto del valle central de O’Higgins en la revisión del 27-11-2026. El programa regional se canaliza por el portal nacional cuando abre.',
    links: [['BTU en Rancagua', '/btu/rancagua/'], ['BTU en San Fernando', '/btu/san-fernando/']]
  }
];

const pdaPage = p => page({
  path: `/pda/${p.slug}/`,
  title: `Calefacción y restricciones en ${p.name}: qué dice el PDA`,
  description: `Plan de Descontaminación Atmosférica de ${p.name}: período de episodios críticos, restricciones de leña, recambio de calefactores y fuentes oficiales.`,
  answer: `En ${p.name} las restricciones dependen del Plan de Descontaminación Atmosférica y del episodio declarado por la autoridad. Antes de usar leña en invierno revisa el pronóstico diario, tu zona territorial y el nivel de Alerta, Preemergencia o Emergencia.`,
  sections: [
    ['plan', 'Plan vigente y territorio', `<p>El plan aplicable es el <strong>${p.decree}</strong> del Ministerio del Medio Ambiente. Beneficia o cubre a ${p.population}. El período de gestión informado es <strong>${p.period}</strong>.</p><p>${p.zone}</p>`],
    ['episodios', 'Qué se restringe durante un episodio', `<p>${p.restrictions}</p><p>La declaración la emite la autoridad con base en el pronóstico. No depende solo de cómo se vea el aire: revisa Aire Chile o los canales regionales del MMA antes de encender un artefacto regulado.</p>`],
    ['recambio', 'Recambio de calefactores', `<p>${p.recambio}</p><p>El recambio exige entregar el artefacto antiguo para destrucción, cumplir las bases del llamado y aceptar evaluación técnica de la vivienda.</p>`],
    ['decision', 'Qué conviene hacer ahora', `<ul><li>Verifica tu zona y el episodio del día antes de usar leña.</li><li>Prefiere combustible certificado y artefactos eficientes cuando estén permitidos.</li><li>Compara el costo de bomba de calor, pellet y electricidad antes del próximo invierno.</li></ul><p>${p.links.map(([label, href]) => `<a href="${href}">${label}</a>`).join(' · ')} · <a href="/calefaccion/">Comparar calefacción</a></p>`]
  ],
  faqs: [
    [`¿Puedo usar leña en ${p.name}?`, `Depende de tu zona territorial y del episodio declarado. En Alerta, Preemergencia o Emergencia pueden aplicar prohibiciones o restricciones específicas; revisa el pronóstico oficial antes de encender el calefactor.`],
    [`¿Hay recambio de calefactores en ${p.name}?`, p.recambio]
  ],
  sources: [[`PPDA oficial de ${p.name}`, p.url], SOURCE.aireChile, SOURCE.recambioPortal]
});

export const pdaPages = pdaCities.map(pdaPage);

export const pdaHubPage = page({
  path: '/pda/',
  title: 'Planes de Descontaminación Atmosférica por ciudad',
  description: 'Restricciones de leña, episodios críticos, recambio de calefactores y enlaces oficiales para ciudades con PDA en centro y sur de Chile.',
  answer: 'Las restricciones para usar calefactores a leña dependen del Plan de Descontaminación Atmosférica, la zona territorial y el episodio declarado cada día. En varias ciudades del centro-sur pueden prohibirse humos visibles, más de un artefacto o todo uso de leña durante alerta, preemergencia o emergencia.',
  sections: [
    ['ciudades', 'Ciudades y planes revisados', table('PDA priorizados y estado de recambio al 27-11-2026', ['Ciudad', 'Plan', 'Período GEC', 'Recambio'], pdaCities.map(p => [`<a href="/pda/${p.slug}/">${p.name}</a>`, p.decree, p.period, p.recambio.includes('abiertas') || p.recambio.includes('Postulaciones abiertas') ? 'Abierto' : 'Sin llamado abierto']))],
    ['como-leer', 'Cómo leer una alerta', '<p>La autoridad publica el pronóstico y declara Alerta, Preemergencia o Emergencia. Cada nivel activa medidas distintas para viviendas, calderas, industrias y quemas. La misma comuna puede tener zonas con obligaciones diferentes.</p><p>Si tu ciudad no aparece aquí, revisa igualmente la plataforma oficial de planes y episodios del MMA. Esta página prioriza los planes señalados en la investigación, no reemplaza la normativa.</p>'],
    ['invierno', 'Prepararse antes del invierno', '<p>Comprar leña seca certificada, mantener el ducto, mejorar sellos y evaluar una bomba de calor puede reducir consumo y exposición a multas. En comunas con prohibiciones permanentes, como parte del Valle Central de O’Higgins, cambiar de tecnología no es solo una mejora de eficiencia.</p><p><a href="/calefaccion/">Comparar calefacción</a> · <a href="/recambio-calefactores/">Ver recambios</a> · <a href="/lena-pellet/">Ley de leña y pellet</a></p>']
  ],
  faqs: [
    ['¿Dónde hay restricciones para usar calefactores a leña?', 'Depende del PDA y del episodio. Temuco, Padre Las Casas, Osorno, Valdivia, Los Ángeles, Talca, Maule, Chillán, Chillán Viejo y el Valle Central de O’Higgins tienen planes o zonas con medidas relevantes.'],
    ['¿La restricción dura todo el año?', 'No siempre. Algunas medidas son permanentes y otras se activan solo en el período de gestión de episodios críticos o cuando se declara alerta, preemergencia o emergencia.']
  ],
  sources: [SOURCE.aireChile, SOURCE.recambioPortal]
});

export const lenaPelletPage = page({
  path: '/lena-pellet/',
  title: 'Ley de leña 21.499: qué cambia al comprar leña o pellet',
  description: 'Qué exige la Ley 21.499 de biocombustibles sólidos, qué estaba pendiente del reglamento en 2026 y cómo comprar leña o pellet con mejor información.',
  answer: 'La Ley 21.499 exige que leña, pellet, briquetas y otros biocombustibles comercializados cumplan especificaciones mínimas de calidad y procedan de centros certificados o comercializadores inscritos. El reglamento seguía en revisión durante 2026, así que su implementación efectiva debe verificarse antes de afirmar exigencias vigentes.',
  sections: [
    ['ley', 'Qué regula la ley', '<p>La norma ordena al Ministerio de Energía mantener especificaciones de calidad para biocombustibles sólidos y a la SEC fiscalizar productos regulados. Comprende leña, astillas, pellet, briquetas y otros combustibles derivados de biomasa.</p><p>Para leña, la humedad de referencia usada por la norma chilena NCh2907 es 25% base seca. Un saco húmedo rinde menos, contamina más y puede dañar el ducto.</p>'],
    ['estado', 'Estado del reglamento al 27-11-2026', '<p>El reglamento fue reingresado a la Contraloría el 07-04-2026 y retirado el 19-05-2026 para adecuaciones, según respuesta oficial del 12-06-2026. Por eso no corresponde afirmar que todos los componentes sancionatorios ya operan como si el reglamento estuviera finalizado.</p>'],
    ['compra', 'Qué exigir al comprar', '<ul><li>Precio por unidad clara: metro cúbico, saco, kilo o bolsa.</li><li>Especie, humedad declarada, fecha de secado y procedencia.</li><li>Comprobante y datos del comercializador.</li><li>En pellet, composición, poder calórico declarado y bolsa cerrada sin exceso de aserrín.</li></ul><p><a href="/calefaccion/">Comparar costo de calor útil</a> · <a href="/pda/">Revisar restricciones PDA</a></p>']
  ],
  faqs: [
    ['¿Qué dice la Ley de la Leña?', 'Exige calidad mínima y trazabilidad para biocombustibles sólidos comercializados en Chile. Su implementación reglamentaria seguía en adecuación durante 2026, por lo que conviene verificar el estado vigente antes de exigir una obligación específica.'],
    ['¿Qué humedad debe tener la leña?', 'La referencia técnica chilena es 25% base seca. Menos humedad suele mejorar rendimiento, pero debe verificarse con medidor o información del proveedor.']
  ],
  sources: [SOURCE.leyLena, SOURCE.estadoLena, SOURCE.registroLena, SOURCE.secCertificacion]
});

const recambioBase = [
  ['Ser mayor de 18 años y residir en la comuna o polígono del llamado.', 'Requisito general'],
  ['Ser propietario de un artefacto a leña instalado en la vivienda, aunque no esté funcionando.', 'Requisito general'],
  ['Mantener el equipo antiguo instalado durante el proceso y entregarlo con ductos para destrucción.', 'Requisito general'],
  ['No haber recibido antes el beneficio ni tener un beneficiario dentro del grupo familiar.', 'Requisito general'],
  ['Aceptar evaluación técnica de la vivienda; en departamentos solo aplica la línea de aire acondicionado cuando esté disponible.', 'Requisito general']
];

export const recambioHubPage = page({
  path: '/recambio-calefactores/',
  title: 'Recambio de calefactores 2026-2027: comunas, copagos y fechas',
  description: 'Llamados abiertos del programa Recambio de Calefactores: pellet en Ñuble y Osorno, requisitos, copagos, equipos y fechas de cierre.',
  answer: 'Al 27-11-2026 hay 1.590 equipos disponibles en seis regiones. Siguen abiertos los llamados a pellet de Chillán y Chillán Viejo hasta el 15 de diciembre, con copago de $120.000, y de Osorno hasta el 9 de diciembre, con copago de $130.000. Los llamados de aire acondicionado de noviembre ya cerraron.',
  sections: [
    ['abiertos', 'Llamados abiertos al 27-11-2026', table('Convocatorias activas verificadas en el portal del MMA', ['Zona', 'Equipo', 'Cupos', 'Copago', 'Cierre'], [['<a href="/recambio-calefactores/nuble/">Chillán y Chillán Viejo</a>', 'Pellet Bosca Mila 6,1 kW, eficiencia sobre 85%', '290', '$120.000', '15-12-2026'], ['<a href="/recambio-calefactores/osorno/">Osorno</a>', 'Pellet 6,1 kW, eficiencia sobre 85%', '402', '$130.000', '09-12-2026']])],
    ['cerrados', 'Líneas de aire acondicionado que ya cerraron', '<p>El programa informó 898 aires acondicionados inverter de 18.000 BTU en cuatro regiones: 41 sin copago en Temuco y Padre Las Casas, 330 con copago de $110.000 en comunas de Biobío, 504 con copago de $110.000 en comunas del Maule y 23 sin copago en la provincia de Aysén. Las fechas de cierre eran entre el 19 y el 25 de noviembre de 2026.</p><p>Esos equipos sirven para calefaccionar en invierno y enfriar en verano, pero requieren evaluación técnica. No prometan cupos futuros: cada llamado publica sus propias bases.</p>'],
    ['requisitos', 'Requisitos transversales', table('Requisitos resumidos; las bases del llamado mandan sobre cualquier resumen', ['Condición', 'Tipo'], recambioBase)],
    ['decision', 'Conviene o no conviene', '<p>Un recambio a pellet ordena combustible y emisiones, pero exige comprar pellet y mantener el equipo. Un aire acondicionado inverter puede costar menos por kWh útil que resistencia eléctrica y sirve en verano, aunque depende de la tarifa y de un buen dimensionamiento.</p><p><a href="/calefaccion/">Comparar costo de calor útil</a> · <a href="/pda/">Ver restricciones PDA</a> · <a href="/btu/">Calcular BTU por comuna</a></p>']
  ],
  faqs: [
    ['¿Dónde postulo al recambio de calefactores?', 'En el portal oficial calefactores.mma.gob.cl o por los canales presenciales habilitados por la Seremi del Medio Ambiente correspondiente.'],
    ['¿Tengo que entregar mi estufa antigua?', 'Sí. El artefacto reemplazado debe permanecer instalado durante el proceso y entregarse junto con sus ductos para destrucción cuando se realice el recambio.']
  ],
  sources: [SOURCE.recambioNoticia, SOURCE.recambioPortal]
});

const recambioCity = ({ slug, name, region, units, copago, close, start, install, communeLinks, extra }) => page({
  path: `/recambio-calefactores/${slug}/`,
  title: `Recambio de calefactores en ${name}: pellet, copago y fechas`,
  description: `Llamado abierto de recambio a pellet en ${name}: ${units} equipos, copago de ${copago}, requisitos y cierre ${close}.`,
  answer: `En ${name} hay ${units} equipos a pellet disponibles con copago de ${copago}. La postulación abrió el ${start} y cierra el ${close}. El equipo antiguo a leña debe estar instalado y se entrega para destrucción.`,
  sections: [
    ['llamado', 'Datos del llamado', table(`Llamado vigente verificado al 27-11-2026 para ${name}`, ['Campo', 'Detalle'], [['Comunas', name], ['Región', region], ['Equipos', `${units} calefactores a pellet`], ['Equipo de referencia', 'Bosca Mila 6,1 kW, eficiencia superior a 85%'], ['Copago', copago], ['Postulación', `${start} a ${close}`], ['Instalación estimada', install]])],
    ['requisitos', 'Requisitos principales', table('Resumen informativo; revisa las bases antes de postular', ['Condición', 'Detalle'], recambioBase)],
    ['zona', 'Restricciones locales y decisión', `<p>${extra}</p><p>${communeLinks.map(([label, href]) => `<a href="${href}">${label}</a>`).join(' · ')} · <a href="/pda/${slug === 'nuble' ? 'chillan' : 'osorno'}/">Ver PDA local</a></p>`]
  ],
  faqs: [
    [`¿Cuál es el copago en ${name}?`, `El copago informado para la línea pellet es ${copago}. El resto del equipo e instalación es parte del beneficio según las bases del llamado.`],
    [`¿Hasta cuándo se puede postular en ${name}?`, `La postulación cierra el ${close}. Después del cierre debes esperar un nuevo llamado o revisar si el portal publica otro ciclo.`]
  ],
  sources: [SOURCE.recambioNoticia, SOURCE.recambioPortal]
});

export const recambioCityPages = [
  recambioCity({
    slug: 'nuble', name: 'Chillán y Chillán Viejo', region: 'Ñuble', units: '290', copago: '$120.000', close: '15-12-2026', start: '16-11-2026', install: 'febrero y marzo de 2027',
    communeLinks: [['BTU en Chillán', '/btu/chillan/'], ['BTU en Chillán Viejo', '/btu/chillan-viejo/']],
    extra: 'El llamado forma parte de las medidas del Plan de Prevención y Descontaminación Atmosférica vigente para la intercomuna. Si vives en el polígono, revisa también el pronóstico GEC antes de usar el artefacto actual.'
  }),
  recambioCity({
    slug: 'osorno', name: 'Osorno', region: 'Los Lagos', units: '402', copago: '$130.000', close: '09-12-2026', start: '09-11-2026', install: 'según evaluación técnica y calendario del instalador',
    communeLinks: [['BTU en Osorno', '/btu/osorno/']],
    extra: 'En Osorno el registro del calefactor y las reglas del PDA pueden incidir en futuros beneficios. Las personas en departamentos solo pueden optar a aire acondicionado cuando esa línea esté abierta.'
  })
];

export const veranoHubPage = page({
  path: '/verano/',
  title: 'Energía en verano: aire acondicionado, ventilador y refrigerador',
  description: 'Guías de verano para Chile: cuánto cuesta enfriar una casa, cuándo basta un ventilador y cómo cambia el consumo del refrigerador.',
  answer: 'En verano el mayor salto de consumo suele venir del aire acondicionado, no del ventilador ni del refrigerador. Un split de 12.000 BTU usado tres horas diarias consume unos 32,7 kWh al mes; un ventilador de pie usado seis horas diarias consume cerca de 10,8 kWh.',
  sections: [
    ['decidir', 'Qué revisar primero', '<p>Calcula la carga térmica antes de comprar. Una pieza de 15 m² no necesita el mismo equipo que un living abierto con ventanas al poniente. Sobredimensionar sube el precio de compra y puede producir ciclos cortos.</p><p><a href="/verano/aire-acondicionado/">Costo de aire acondicionado</a> · <a href="/verano/ventilador-o-aire-acondicionado/">Ventilador o split</a> · <a href="/verano/refrigerador/">Refrigerador en verano</a></p>'],
    ['ola-de-calor', 'Durante una ola de calor', '<p>Cierra cortinas en horas de sol directo, ventila cuando la temperatura exterior baje y usa el ventilador para mover aire sobre las personas. Si usas split, una consigna de 23-25 °C y filtros limpios evita consumo innecesario.</p>'],
    ['black-friday', 'Compras de fin de año', '<p>El Black Friday oficial de la CCS en 2026 se realiza del 27 al 30 de noviembre. Antes de mirar el descuento, compara consumo declarado, eficiencia, instalación, garantía y costo anual en tu comuna.</p><p><a href="/precios/">Precios observados el 27-11-2026</a> · <a href="/btu/">Calcular BTU por comuna</a></p>']
  ],
  faqs: [
    ['¿Qué consume más en verano, ventilador o aire acondicionado?', 'El aire acondicionado consume mucho más porque enfría el aire. Un ventilador no baja la temperatura, pero mejora la sensación térmica con una fracción del consumo.']
  ],
  sources: [SOURCE.etiquetaAire]
});

export const veranoAirePage = page({
  path: '/verano/aire-acondicionado/',
  title: 'Cuánto cuesta enfriar tu casa este verano',
  description: 'Costo mensual de un split inverter por horas de uso, ejemplo de 12.000 BTU, instalación y criterios para comprar antes del verano.',
  answer: 'Como referencia, un split de 12.000 BTU que consume en promedio 1 kW y se usa seis horas diarias durante 30 días gasta 180 kWh. A $268,22/kWh serían unos $48.280 mensuales. Un inverter eficiente o menos horas puede bajar bastante ese valor.',
  sections: [
    ['escenarios', 'Escenarios de consumo', table('Consumo estimado con tarifa media nacional $268,22/kWh; calcula el valor exacto con tu comuna', ['Uso', 'Potencia media', 'kWh/mes', 'Costo medio'], [['3 h/día, split 12.000 BTU', '1,09 kW', '32,7', '$8.771'], ['6 h/día, split 12.000 BTU', '1,0 kW', '180', '$48.280'], ['6 h/día, ventilador 60 W', '0,06 kW', '10,8', '$2.897']])],
    ['btu', 'No compres solo por precio', '<p>La capacidad correcta depende de superficie, altura, orientación, ventanas, aislación y temperatura comunal. En norte y verano extremo la carga sube; una pieza bien aislada puede necesitar menos.</p><p><a href="/btu/">Calcular BTU en mi comuna</a></p>'],
    ['compra', 'Qué mirar en una oferta', '<ul><li>Etiqueta de eficiencia y protocolo SEC aplicable.</li><li>Potencia frío/calor y tecnología inverter.</li><li>Si la instalación incluye cañería, soporte, cableado y tablero.</li><li>Garantía, repuestos y servicio técnico en tu ciudad.</li></ul><p>En Sodimac se observó un split Samsung Essential inverter de 9.000 BTU a $289.990 el 27-11-2026 y una categoría de 9.000 BTU entre $279.990 y $369.990. Son observaciones de retail, no ofertas permanentes.</p>']
  ],
  faqs: [
    ['¿Cuánto gasta un aire acondicionado de 12.000 BTU?', 'Con 1 kW promedio y seis horas diarias durante 30 días consume 180 kWh. Con tarifa media nacional serían unos $48.280 al mes, pero con tres horas diarias y modulación inverter el consumo puede ser mucho menor.'],
    ['¿Cuándo conviene comprar aire acondicionado?', 'Conviene cuando la carga térmica lo justifica, hay varias horas diarias de calor incómodo y el costo de compra más instalación se compensa con uso real. En uso ocasional, ventilación y ventilador pueden bastar.']
  ],
  sources: [SOURCE.etiquetaAire, SOURCE.secCertificacion]
});

export const veranoVentiladorPage = page({
  path: '/verano/ventilador-o-aire-acondicionado/',
  title: 'Ventilador o aire acondicionado: cuánto gasta cada uno',
  description: 'Comparación de consumo, costo mensual y confort entre ventilador de pie y split inverter para decidir en verano.',
  answer: 'Un ventilador de 60 W usado seis horas diarias consume 10,8 kWh al mes, cerca de $2.897 con tarifa media nacional. Un split de 12.000 BTU usado tres horas diarias puede consumir 32,7 kWh, cerca de $8.771. El ventilador no enfría el aire, pero cuesta mucho menos.',
  sections: [
    ['tabla', 'Comparación directa', table('Supuestos de uso doméstico; tarifa media nacional $268,22/kWh', ['Equipo', 'Uso', 'kWh/mes', 'Costo medio', 'Qué hace'], [['Ventilador de pie 60 W', '6 h/día', '10,8', '$2.897', 'Mueve aire y mejora sensación térmica'], ['Split inverter 12.000 BTU', '3 h/día', '32,7', '$8.771', 'Enfría y deshumidifica el ambiente'], ['Split usado intenso', '6 h/día a 1 kW', '180', '$48.280', 'Enfría por más horas']])],
    ['decidir', 'Cuándo basta el ventilador', '<p>Basta cuando el problema es sensación de calor moderada, hay circulación de aire y puedes ventilar al bajar la temperatura exterior. No basta cuando la humedad o la temperatura interior sostenida afecta descanso, salud o trabajo.</p>'],
    ['combinar', 'Combinar antes que sobredimensionar', '<p>Usar ventilador junto al split permite una consigna más alta y repartir el aire. También reduce la tentación de comprar un equipo más grande del necesario.</p><p><a href="/consumo-electrico/ventilador/">Consumo del ventilador por comuna</a> · <a href="/consumo-electrico/aire-acondicionado/">Consumo del aire por comuna</a></p>']
  ],
  faqs: [
    ['¿El ventilador enfría la pieza?', 'No. Mueve aire y ayuda a evaporar sudor, pero no reduce la temperatura del ambiente. Apágalo si no hay personas presentes.'],
    ['¿Cuánto más barato es un ventilador?', 'Con los supuestos de esta página, cerca de tres veces menos que un split usado tres horas diarias y más de dieciséis veces menos que un uso intenso de seis horas a 1 kW.']
  ],
  sources: [SOURCE.etiquetaAire]
});

export const veranoRefrigeradorPage = page({
  path: '/verano/refrigerador/',
  title: 'Refrigerador en verano: cuánto sube el consumo y cómo leer kWh/mes',
  description: 'Consumo de refrigerador en verano, nueva etiqueta E2.0 con kWh/mes y costo anual según tarifa comunal.',
  answer: 'Un refrigerador doméstico suele consumir entre 25 y 60 kWh mensuales según tamaño, antigüedad y eficiencia. Desde la nueva etiqueta E2.0, el consumo aparece directamente en kWh/mes. Multiplica esa cifra por el precio variable de tu comuna para estimar el costo mensual real.',
  sections: [
    ['etiqueta', 'La etiqueta E2.0 cambia la comparación', '<p>El protocolo PE 1/17/2:2022 actualiza certificación y etiquetado de refrigeradores con metodología IEC 62552. La lectura útil para comprar es kWh/mes, no solo la letra de eficiencia.</p><p>Ejemplo observado en retail: un Midea Bottom Freezer de 310 litros publicado por Falabella declaraba 16 kWh/mes y costaba $359.990 el 27-11-2026. Con tarifa media nacional, 16 kWh cuestan unos $4.292 al mes y 192 kWh al año unos $51.498.</p>'],
    ['verano', 'Por qué sube en verano', '<p>El calor ambiente obliga al compresor a trabajar más. También sube el consumo si la puerta se abre seguido, se guarda comida caliente, el sello está dañado o la parte trasera no ventila.</p>'],
    ['costo', 'Costo en tu comuna', '<p>El mismo refrigerador no cuesta igual en todo Chile. Multiplica kWh/mes de la etiqueta por la tarifa variable local. Con 16 kWh/mes, una comuna de $137/kWh gasta cerca de $2.192 mensuales y una de $303/kWh cerca de $4.848.</p><p><a href="/consumo-electrico/refrigerador/">Calcular refrigerador en mi comuna</a> · <a href="/guias/etiqueta-eficiencia/">Leer la etiqueta de eficiencia</a></p>']
  ],
  faqs: [
    ['¿Cuánto consume un refrigerador al mes en Chile?', 'La referencia práctica es 25 a 60 kWh mensuales según tamaño y antigüedad. La etiqueta E2.0 informa el kWh/mes del modelo, que es el mejor dato para comparar antes de comprar.'],
    ['¿Conviene cambiar un refrigerador antiguo?', 'Depende del consumo medido o declarado, precio del nuevo modelo y tarifa local. Compara el ahorro eléctrico anual contra el precio total, no solo contra el descuento de retail.']
  ],
  sources: [SOURCE.etiquetaRefrigerador, SOURCE.secCertificacion]
});

export const EDITORIAL_PAGES = [
  cuentasLuz2027Page,
  subsidioElectricoPage,
  calefaccionPage,
  pdaHubPage,
  ...pdaPages,
  recambioHubPage,
  ...recambioCityPages,
  lenaPelletPage,
  veranoHubPage,
  veranoAirePage,
  veranoVentiladorPage,
  veranoRefrigeradorPage
];

export const variation2027Json = {
  name: 'Variación promedio de cuentas residenciales por región, primer semestre 2027',
  updated: CONTENT_UPDATED,
  unit: 'percent',
  nationalAverage: -4.4,
  license: 'Resumen editorial de cifras públicas oficiales; cite la fuente primaria y la fecha.',
  methodology: 'Variación promedio regional informada con el Informe Técnico Definitivo del Precio Nudo Promedio enero 2027. No es la variación final de un pliego comunal específico.',
  sources: [SOURCE.itd, SOURCE.resolucion650, SOURCE.baja2027].map(([name, url]) => ({ name, url })),
  regions: REGIONAL_VARIATIONS_2027.map(({ region, slug, change }) => ({ region, slug, changePercent: change }))
};

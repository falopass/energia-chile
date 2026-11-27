export const CONSULTED_AT = '27-11-2026';

export const appliancePrices = [
  {
    slug: 'refrigerador', name: 'Refrigerador', range: '$149.990–$709.990', retailer: 'Falabella',
    source: 'https://www.falabella.com/falabella-cl/category/cat3205/Refrigeradores',
    note: 'Bottom freezer de 174 a 513 litros; el modelo Midea de 310 litros declara 16 kWh/mes.',
    kwhMonth: 39.6, consumption: '39,6 kWh/mes · 110 W promedio por ciclos'
  },
  {
    slug: 'lavadora', name: 'Lavadora', range: '$309.990–$499.990', retailer: 'Paris',
    source: 'https://www.paris.cl/linea-blanca/lavado-secado/lavadoras-carga-frontal/',
    note: 'Carga frontal de 9 a 12 kg; las lavadoras-semiautomáticas pueden costar menos.',
    kwhMonth: 7.2, consumption: '7,2 kWh/mes · 12 ciclos con agua fría'
  },
  {
    slug: 'microondas', name: 'Microondas', range: '$39.990–$124.990', retailer: 'Lider',
    source: 'https://super.lider.cl/v/microondas-oferta',
    note: 'Equipos de 16 a 30 litros y 650 a 900 W.',
    kwhMonth: 14.4, consumption: '14,4 kWh/mes · 24 minutos diarios'
  },
  {
    slug: 'freidora-de-aire', name: 'Freidora de aire', range: '$29.990–$179.990', retailer: 'Ripley',
    source: 'https://simple.ripley.cl/electro/electrodomesticos/freidoras',
    note: 'Modelos de 3,5 a 10 litros; Philips 4,2 litros apareció a $54.990.',
    kwhMonth: 21, consumption: '21 kWh/mes · 30 minutos diarios'
  },
  {
    slug: 'ventilador', name: 'Ventilador de pie', range: '$32.990–$74.990', retailer: 'Sodimac',
    source: 'https://www.sodimac.cl/sodimac-cl/lista/cat3254/Ventiladores',
    note: 'Pedestal o 3 en 1 de 16 a 18 pulgadas, normalmente 45–75 W.',
    kwhMonth: 10.8, consumption: '10,8 kWh/mes · 6 horas diarias'
  },
  {
    slug: 'television', name: 'TV LED 50 pulgadas', range: '$229.990–$349.990', retailer: 'Falabella',
    source: 'https://www.falabella.com/falabella-cl/category/cat7190148/Smart-TV?f.derived.product.Tamano_de_la_pantalla=50',
    note: 'Smart TV LED/QLED de entrada de 50 pulgadas.',
    kwhMonth: 12, consumption: '12 kWh/mes · 4 horas diarias'
  },
  {
    slug: 'aire-acondicionado', name: 'Split inverter 9.000–24.000 BTU', range: '$269.990–$949.990', retailer: 'Sodimac',
    source: 'https://www.sodimac.cl/sodimac-cl/lista/cat7830014/Split',
    note: '9.000 BTU desde $269.990; 24.000 BTU entre $449.990 y $949.990 según marca.',
    kwhMonth: 32.7, consumption: '32,7 kWh/mes · 12.000 BTU, 3 h/día'
  },
  {
    slug: 'estufa-electrica', name: 'Estufa eléctrica o convector', range: '$39.990–$193.990', retailer: 'Sodimac',
    source: 'https://www.sodimac.cl/sodimac-cl/lista/cat9910006/Estufas-Electricas',
    note: 'Paneles y convectores de 1.000 a 2.000 W.',
    kwhMonth: 180, consumption: '180 kWh/mes · 2.000 W, 3 h/día'
  }
];

export const heatingComparison = [
  {
    name: 'Bomba de calor / split inverter', unit: '1 kWh eléctrico', price: 'tarifa media comunal', energy: 'COP 3 referencial', useful: 89.4,
    source: 'Cálculo propio con tarifa media BT1 $268,22/kWh y COP 3; el rendimiento real depende del frío exterior.'
  },
  {
    name: 'Leña certificada', unit: 'm³ trozado', price: '$41.000', energy: '1.560 kWh/m³ × 60%', useful: 43.8,
    source: 'Seremi de Energía / SERNAC La Araucanía, sondeo 03–05-11-2026; poder energético y rendimiento del estudio de calefacción del Ministerio de Energía.'
  },
  {
    name: 'Pellet', unit: 'bolsa 15 kg', price: '$3.990–$5.700', energy: '4,8 kWh/kg × 85%', useful: 65.2, usefulHigh: 93.1,
    source: 'Sodimac Talca $3.990 y Registro Leña Valdivia hasta $5.700, noviembre 2026; MMA informa hasta 4,9 kWh/kg.'
  },
  {
    name: 'Parafina', unit: 'litro', price: '$1.391 promedio', energy: '9,6 kWh/l × 95%', useful: 152.5,
    source: 'Precio promedio informado por estaciones a CNE/Bencina en Línea, 26-11-2026; ENAP no fija precio final.'
  },
  {
    name: 'Gas licuado', unit: 'balón 15 kg', price: '$34.500 mediana', energy: '12,8 kWh/kg × 95%', useful: 189.1,
    source: 'Mediana de 744 precios informados en Gas en Línea (Ministerio de Energía/SEC), 11–19-11-2026.'
  },
  {
    name: 'Estufa eléctrica de resistencia', unit: '1 kWh eléctrico', price: 'tarifa media comunal', energy: '100%', useful: 268.2,
    source: 'Tarifa media simple BT1 de las 328 comunas procesadas, vigencia 01-11-2026.'
  }
];

export const solarKits = [
  { kwp: 1, tecnosolar: 1060000, feedsolar: 3402804 },
  { kwp: 2, tecnosolar: 1540000, feedsolar: 3583685 },
  { kwp: 3, tecnosolar: 2170000, feedsolar: 4047190 },
  { kwp: 5, tecnosolar: 3090000, feedsolar: 5709025 }
];

export const marketSources = [
  ['Falabella Chile, refrigeradores y Smart TV', 'https://www.falabella.com/falabella-cl/category/cat3205/Refrigeradores'],
  ['Paris, lavadoras de carga frontal', 'https://www.paris.cl/linea-blanca/lavado-secado/lavadoras-carga-frontal/'],
  ['Lider, microondas', 'https://super.lider.cl/v/microondas-oferta'],
  ['Ripley, freidoras de aire', 'https://simple.ripley.cl/electro/electrodomesticos/freidoras'],
  ['Sodimac, ventiladores, estufas y splits inverter', 'https://www.sodimac.cl/sodimac-cl/lista/cat7830014/Split'],
  ['Tecnosolar, kits on-grid 1–5 kW', 'https://tecno-solar.cl/kit-solares-on-grid/'],
  ['Feedsolar, kits on-grid 1–5 kWp', 'https://feedsolar.cl/categoria-producto/kit-paneles/kits-on-grid/'],
  ['SEC, Conociendo la Generación Distribuida', 'https://www.sec.cl/sitio-web/wp-content/uploads/2024/09/Conociendo-la-Generacion-distribuida.pdf'],
  ['Ministerio de Energía, preguntas de Generación Distribuida', 'https://generaciondistribuida.minenergia.cl/preguntas-frecuentes'],
  ['Biblioteca del Congreso Nacional, Ley 20.571 y reglamento DS 57', 'https://www.bcn.cl/leychile/navegar?idNorma=1038211'],
  ['CNE, Bencina en Línea', 'https://www.bencinaenlinea.cl/'],
  ['Gas en Línea, Ministerio de Energía y SEC', 'https://www.gasenlinea.gob.cl/'],
  ['MMA, Registro Leña y reportes mensuales', 'https://registrolena.mma.gob.cl/reporte_mensual_historico/134'],
  ['Ministerio de Energía, índices de calefacción residencial', 'https://indicesdeprecios.energia.gob.cl/calefaccion.html'],
  ['CNE, tarificación eléctrica y Decreto 10T/2024', 'https://www.cne.cl/tarificacion/electrica/'],
  ['BCN, Descongelamiento y alza de tarifas eléctricas', 'https://obtienearchivo.bcn.cl/obtienearchivo?id=repositorio%2F10221%2F36131%2F1%2FBCN___Descongelamiento_y_alza_tarifas_electricas.pdf']
];

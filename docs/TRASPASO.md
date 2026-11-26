# Traspaso — Energía Chile

## Estado actual

El sitio **ya está construido y desplegado** en Cloudflare Workers:

- URL pública: <https://energia-chile.ddiegosebastianbb.workers.dev/>
- Worker: `energia-chile`
- Cuenta Cloudflare: `ddiegosebastianbb@gmail.com`
- Subdominio workers.dev: `ddiegosebastianbb`
- Observabilidad de Cloudflare activada: logs, invocation logs y traces.

Verificación hecha el 26-11-2026:

- `/` responde 200.
- `/consumo-electrico/refrigerador/independencia/` responde 200.
- `/paneles-solares/temuco/` responde 200.
- `/sitemap.xml` contiene **3.000 URLs indexables**.
- El test local confirma 3.000 URLs únicas, sitemap, robots, ads.txt y páginas clave.

## Qué contiene

### URLs programáticas

Total: **3.000 URLs indexables**.

- 2.952 URLs programáticas:
  - 2.296 páginas de consumo por aparato/comuna: 7 aparatos × 328 comunas.
  - 328 páginas BTU por comuna.
  - 328 páginas de paneles solares por comuna.
- 48 páginas de apoyo:
  - home, hubs de herramientas, índice de comunas, tarifas, guías, páginas regionales, metodología, fuentes, privacidad, contacto, sobre nosotros, términos y preguntas frecuentes.

Las páginas programáticas comparten estructura porque calculan lo mismo, pero **no son texto spinneado**: cada comuna tiene distribuidora, tarifa, precio variable, cargo fijo, boleta de referencia, radiación mensual, temperatura estacional y enlaces de fuente propios.

### Herramientas implementadas

1. **Consumo eléctrico por aparato**
   - Refrigerador, aire acondicionado, lavadora, microondas, freidora de aire, ventilador y televisión LED.
   - Inputs editables: watts, horas/día, días/mes y precio por kWh.
   - Output: kWh mensual/anual, costo mensual/anual, costo por hora y porcentaje de una boleta de 250 kWh.

2. **Calculadora BTU**
   - Inputs editables: m², altura, ocupantes, ventanas, orientación, aislación y modo frío/calefacción.
   - Usa temperatura media estival/invernal y radiación local.
   - Output: BTU/h estimados, tamaño comercial sugerido, capacidad térmica, potencia eléctrica de referencia y costo por 30 horas/mes.

3. **Paneles solares / netbilling**
   - Inputs editables: consumo mensual, cobertura objetivo, radiación, tamaño de panel, autoconsumo y tarifa.
   - Output: kWp, número de paneles, m² de techo, generación anual, ahorro mensual, inversión estimada y payback simple.

## Datos usados

### Comunas

- Fuente territorial: listado publicado en `tgb.cl/comunas`.
- 346 comunas oficiales identificadas con CUT, provincia, superficie y coordenadas aproximadas.
- 328 tienen tarifa residencial procesada; 18 quedaron fuera porque no apareció pliego BT1 usable en la extracción.

### Tarifas eléctricas

- Carpeta local: `data/raw/mapache/`.
- Vigencia usada: **01-11-2026**.
- La extracción usa los JSON públicos estructurados de `mapache.ai` y guarda el enlace al pliego oficial de cada distribuidora.
- Para cada comuna se conservan:
  - distribuidora o distribuidoras disponibles;
  - tarifa BT1/BT1A;
  - costo variable por kWh con IVA;
  - cargo fijo mensual con IVA;
  - boleta tipo de 250 kWh;
  - desglose de cargos;
  - URL del pliego oficial.

Prioridad cuando hay más de una distribuidora: primero distribuidoras locales/especializadas y al final CGE como fallback amplio. La página muestra todas las alternativas disponibles para que el usuario compare.

**Limitación importante:** en límites comunales o zonas eléctricas especiales, la dirección exacta define la empresa. El usuario debe verificar su boleta.

### Clima y radiación solar

- Fuente: NASA POWER climatology 2001–2025.
- Archivo cacheado: `data/raw/nasa-power-cache.json`.
- Para cada comuna se usa el centroide aproximado.
- Radiación usada: `ALLSKY_SFC_SW_DWN`, convertida de W/m² promedio a kWh/m²/día multiplicando por 24/1000.
- Las calculadoras usan temperatura media estival/invernal y radiación.
- **No usar `T2M_MAX`/`T2M_MIN` como máximas/mínimas promedio**: en climatology representan extremos del periodo y producen valores engañosos. Ya se corrigió la interfaz para mostrar temperatura media de verano, no “máxima media”.

### Supuestos solares

En `scripts/build-data.mjs` y `src/lib/calc.js`:

- performance ratio: `0.78`;
- autoconsumo por defecto: 72%;
- costo de conexión SEC estimado: `$115.877`;
- costo por Wp según tamaño:
  - hasta 2,5 kWp: `$1.700/Wp`;
  - hasta 4,5 kWp: `$1.450/Wp`;
  - hasta 7 kWp: `$1.250/Wp`;
  - sobre 7 kWp: `$1.080/Wp`;
- panel por defecto: 550 W.

Son referencias, no cotizaciones. La página lo declara.

## Estructura técnica

```text
energia-chile/
├─ src/
│  ├─ worker.js                 # router principal del Worker
│  ├─ data/generated.json       # dataset generado y embebido
│  ├─ lib/calc.js               # fórmulas y formatos
│  ├─ lib/render.js             # HTML SSR de páginas
│  ├─ lib/guides.js             # contenido editorial de guías
│  └─ public/
│     ├─ styles.css             # sistema visual responsive
│     └─ app.js                 # interactividad cliente
├─ scripts/
│  ├─ build-data.mjs            # extrae/une tarifas, comunas y NASA POWER
│  ├─ build.mjs                 # bundle esbuild del Worker
│  └─ test.mjs                  # valida 3.000 URLs y páginas clave
├─ data/raw/                    # snapshots de datos fuente
├─ dist/worker.js               # bundle generado (no commitear si se ignora dist)
├─ wrangler.jsonc               # configuración Cloudflare Workers
└─ package.json
```

No usa framework. Es un Worker SSR con HTML string rendering, CSS propio y JavaScript pequeño del lado cliente. Esto mantiene el bundle simple y rápido.

## Cómo correrlo localmente

Requisitos: Node.js 20+ recomendado.

```bash
cd energia-chile
npm install
npm run build:data   # opcional si ya existe src/data/generated.json
npm test             # construye y valida 3.000 URLs
npm run dev          # arranca wrangler dev, normalmente en localhost:8787
```

Comandos útiles:

```bash
npm run build        # genera dist/worker.js
npm run deploy       # build + wrangler deploy, si wrangler está autenticado
```

## Cómo subirlo al repo cuando exista

El repo `falopass/energia-chile` todavía no existía al momento del traspaso. Cuando lo crees:

```bash
cd energia-chile
# si trabajas desde el zip, descomprímelo primero y entra a la carpeta

git init -b main
git add .
git commit -m "Initial energy calculators site"
git remote add origin git@github.com:falopass/energia-chile.git
git push -u origin main
```

Si prefieres HTTPS:

```bash
git remote add origin https://github.com/falopass/energia-chile.git
```

Luego puedes abrir PR manualmente o trabajar directo en `main` si es un proyecto personal. Recomendado:

```bash
git checkout -b devin/energia-chile-inicial
git push -u origin devin/energia-chile-inicial
```

y abrir PR en GitHub.

## Cómo redeployar en Cloudflare

### Opción normal con Wrangler

```bash
npm install
npx wrangler login
npm run deploy
```

`wrangler.jsonc` ya define:

- `name: energia-chile`
- `main: dist/worker.js`
- `workers_dev: true`
- observability activada
- compatibility date `2025-12-02`

### Opción API ya usada en este traspaso

El despliegue actual se hizo con la API de Cloudflare subiendo `dist/worker.js` como módulo principal. No hace falta repetirlo mientras el contenido no cambie.

Si cambias código o datos:

```bash
npm test
npm run deploy
```

## IndexNow, sitemap, robots y ads.txt

Ya implementados:

- `/sitemap.xml` genera dinámicamente las 3.000 URLs.
- `/robots.txt` permite el sitio y enlaza el sitemap.
- `/ads.txt` existe, pero contiene un placeholder porque falta el publisher ID real de AdSense.
- `/ec9f4a7c2e8b4d7aa5f6d1c3b9e02741.txt` contiene la key de IndexNow.
- `/indexnow/` explica la key y endpoint.

Para enviar URLs a IndexNow cuando el sitio esté en dominio definitivo, hacer POST a `https://api.indexnow.org/indexnow` con JSON parecido a:

```json
{
  "host": "energia-chile.ddiegosebastianbb.workers.dev",
  "key": "ec9f4a7c2e8b4d7aa5f6d1c3b9e02741",
  "keyLocation": "https://energia-chile.ddiegosebastianbb.workers.dev/ec9f4a7c2e8b4d7aa5f6d1c3b9e02741.txt",
  "urlList": ["https://energia-chile.ddiegosebastianbb.workers.dev/"]
}
```

No conviene enviar las 3.000 URLs de una vez sin revisar límites. Empieza por home, hubs y las páginas principales.

## Qué falta para postular a AdSense

1. **Crear/verificar la cuenta AdSense** y obtener el publisher ID real.
2. Editar `/ads.txt` y reemplazar el placeholder por la línea real:
   ```text
   google.com, pub-TU-ID-REAL, DIRECT, f08c47fec0942fa0
   ```
3. Agregar el script de AdSense solo cuando el ID real exista.
4. Idealmente conectar un dominio propio antes de postular. No es obligatorio comprar dominio para probar, pero workers.dev puede verse menos confiable que un dominio propio.
5. Revisar contacto. Actualmente `/contacto/` usa GitHub Issues porque no hay dominio ni correo propio configurado. Es funcional, pero para AdSense sería mejor un correo real tipo `contacto@tudominio.cl`.
6. Esperar indexación y revisar en Search Console/Bing Webmaster.

## Cosas conscientemente no hechas por falta de cuota

- No se agregó script real de AdSense: no existe publisher ID en el traspaso.
- No se compró ni configuró dominio.
- No se implementó formulario de contacto con backend/email.
- No se hizo envío masivo a IndexNow.
- No se hizo integración con Search Console.
- No se abrió PR porque el repo `falopass/energia-chile` aún no existía.
- No se construyeron los otros países.

## Riesgos y límites que debes conocer

1. **Vigencia tarifaria.** Los precios están vigentes al 01-11-2026. Si los pliegos cambian, hay que actualizar `data/raw/mapache/` y correr `npm run build:data`.
2. **Distribuidora por dirección.** Una comuna puede tener más de una distribuidora; la página muestra la de referencia y alternativas, pero el usuario debe confirmar con su boleta.
3. **Centroide comunal.** NASA POWER usa coordenadas aproximadas del centroide; no ve sombras, cerros ni microclimas.
4. **BTU es orientativo.** No reemplaza cálculo térmico profesional para espacios comerciales, doble altura o mala aislación extrema.
5. **Solar no es cotización.** Payback simple no incluye financiamiento, degradación anual, mantención, cambios tarifarios ni restricciones reales de red.
6. **Corrección aplicada.** `T2M_MAX`/`T2M_MIN` de NASA climatology son extremos del periodo, no promedios. No deben usarse para mostrar “máxima media”. La interfaz ya usa temperatura media.
7. **Contenido programático.** La estructura se repite, pero los datos cambian por URL. Para reducir riesgo de scaled content abuse, mantén visibles las tablas, supuestos y fuentes; no conviertas estas páginas en texto genérico.

## Cómo replicar la arquitectura para otro país

No copies solo el texto. Replica el pipeline:

1. Definir nicho y entidades reales del país.
2. Construir dataset canónico territorial con coordenadas.
3. Conseguir datos oficiales/verificables con fecha de vigencia.
4. Crear una tabla de supuestos explícitos.
5. Definir combinaciones programáticas donde cada URL tenga datos distintos.
6. Implementar 2–4 herramientas con salida útil, no artículos inflados.
7. Agregar metodología, fuentes, privacidad, contacto, sobre nosotros, sitemap, robots y ads.txt.
8. Validar conteo de URLs únicas y ausencia de `undefined`/`NaN`.
9. Deploy, screenshots, IndexNow gradual y Search Console.

La parte reutilizable está en:

- `scripts/build-data.mjs` para patrón de pipeline;
- `src/worker.js` para router/sitemap;
- `src/lib/render.js` para layout SSR;
- `src/lib/calc.js` para calculadoras;
- `scripts/test.mjs` para validación de escala.

Los datos Chile y fórmulas energéticas no necesariamente aplican a otros países.

## Evidencia rápida

- URL pública: <https://energia-chile.ddiegosebastianbb.workers.dev/>
- Ejemplo consumo: <https://energia-chile.ddiegosebastianbb.workers.dev/consumo-electrico/refrigerador/independencia/>
- Ejemplo BTU: <https://energia-chile.ddiegosebastianbb.workers.dev/btu/puente-alto/>
- Ejemplo solar: <https://energia-chile.ddiegosebastianbb.workers.dev/paneles-solares/temuco/>
- Sitemap: <https://energia-chile.ddiegosebastianbb.workers.dev/sitemap.xml>


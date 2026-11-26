# Análisis integral — `energia-chile`

- **Repositorio analizado (solo lectura):** `D:/pruebas/frontend-6/energia-chile`
- **URL en vivo auditada:** `https://energia-chile.ddiegosebastianbb.workers.dev`
- **Idioma / mercado:** Español de Chile (`es-CL`) · Moneda `CLP` (pesos chilenos con IVA 19%) · Tarifas BT1 / BT1A · Netbilling Ley 20.571 / 21.118
- **Fecha de auditoría:** 2026-11-26
- **Evidencia visual generada (12 capturas):** `D:/pruebas/frontend-6/analisis/energia-chile/capturas/`
- **Mandato rector («Diagnóstico de Diego»):** **Rehacer el frontend completo desde cero (sin retoques).** El sitio actual repite la misma plantilla estándar y la misma UI/UX defectuosa que los otros 5 sitios hermanos del portafolio.

---

## A · Producto, contenido y usuario

### 1. Qué resuelve y para quién
Resuelve tres preguntas prácticas de bolsillo para hogares, arrendatarios y propietarios en Chile antes de comprar un equipo, usarlo a diario o cotizar energía solar:
1. **Consumo eléctrico por aparato (`CLP/mes` y `CLP/año`):** cuánto suma a la boleta un refrigerador, aire acondicionado, lavadora, microondas, freidora de aire, ventilador o televisor LED usando el precio variable real (`$/kWh` con IVA) de la distribuidora de su comuna.
2. **Calculadora BTU (frío verano y calefacción con bomba de calor):** qué capacidad comercial (`9.000`–`48.000 BTU`) requiere un recinto según m², altura, personas, ventanas, orientación, aislación y temperaturas estacionales reales de la comuna.
3. **Paneles solares residenciales (Netbilling):** potencia sugerida (`kWp`), número de paneles (`550 W`), m² de techo útil, inversión estimada (con costo de conexión SEC `$115.877`), generación anual, ahorro mensual (distinguiendo **72% autoconsumo** valorado a tarifa variable vs. **28% inyección** valorada al cargo por energía) y payback simple.

### 2. Datos reales y fuentes verificadas
El motor embebe `src/data/generated.json` (**1.065 KB** en disco) generado desde fuentes oficiales y públicas (`README.md`, `docs/TRASPASO.md`, `src/lib/calc.js`):
- **328 comunas** cubiertas (de las 346 comunas de Chile; 18 quedan fuera por ausencia de pliego BT1 procesado) en las **16 regiones** del país.
- **15 distribuidoras eléctricas reales:** `CGE`, `Chilquinta`, `Cooprel`, `EDECSA`, `EEPA`, `Edelaysén`, `Edelmag`, `Enel`, `Enel Colina`, `Frontel`, `Litoral`, `Luz Linares`, `Luz Osorno`, `Luz Parral` y `Saesa`.
- **Tarifas BT1/BT1A vigentes al `01-11-2026`** con enlace al pliego oficial por distribuidora. Dispersión real del precio marginal por kWh con IVA: desde **`$136,75/kWh`** (`Mejillones`) hasta **`$303,35/kWh`** (`El Carmen`, **2,22×** más caro; promedio nacional simple `$268,22/kWh`). Cargo fijo mensual desde `$735` (`Enel`) hasta `$1.946+` (`EEPA`).
- **Clima y radiación NASA POWER** por centroide comunal: radiación solar media anual (`ghi`) desde **`2,74 kWh/m²/día`** (`Porvenir`, Magallanes) hasta **`7,22 kWh/m²/día`** (`Calama`, Antofagasta — gradiente norte-sur de **2,64×**), además de perfiles mensuales de 12 meses y temperaturas medias de verano e invierno.

### 3. Inventario de páginas (`src/worker.js:58-71`, verificado en `/sitemap.xml`)
Exactamente **3.000 URLs indexables** en `/sitemap.xml`:
- **Portada (1):** `/`
- **Hubs principales (6):** `/consumo-electrico/`, `/btu/`, `/paneles-solares/`, `/tarifas/`, `/comunas/`, `/guias/`
- **Páginas institucionales/soporte (7):** `/metodologia/`, `/fuentes/`, `/preguntas-frecuentes/`, `/sobre-nosotros/`, `/contacto/`, `/privacidad/`, `/terminos/`
- **Hubs por aparato (7):** `/consumo-electrico/{aparato}/` (`refrigerador`, `aire-acondicionado`, `lavadora`, `microondas`, `freidora-de-aire`, `ventilador`, `television-led`)
- **Guías editoriales (11):** `/guias/{slug}/` (`src/lib/guides.js`)
- **Hubs regionales (16):** `/comunas/{region}/`
- **Programáticas comunales (2.952):** `2.296` aparato × comuna (`7 × 328`) + `328` BTU (`/btu/{comuna}/`) + `328` paneles solares (`/paneles-solares/{comuna}/`).

### 4. Flujos clave y fricciones detectadas
- **Selector de portada secuestrado por paneles solares (`src/lib/render.js:233`):** elegir una comuna en el buscador del hero de `/` redirige siempre a `/paneles-solares/{comuna}/`, incluso cuando el CTA principal del hero es *«Calcular consumo»* y la persona buscaba su tarifa o un aparato.
- **Doble control redundante para elegir comuna (`home-1440-fold.png`, `render.js:88`):** conviven un campo de texto (`Buscar entre 328 comunas`) y un `<select>` con las 328 `<option>` embebidas en el HTML de casi todas las páginas (inflando ~20 KB el DOM en cada vista).
- **Bug gramatical masivo en ~984 páginas (`src/lib/render.js:275,278,287,293,301`):** el código antepone literalmente `"un "` antes de `appliance.name`, generando títulos y preguntas rotas como *«Consumo de **un lavadora**»*, *«¿Cuánto consume **un freidora de aire**?»* y *«**un televisión LED**»*.
- **Inconsistencia numérica dentro de la misma tarjeta de resultados (`src/lib/render.js:126` vs. `128`, verificada en `localidad-consumo-independencia-1440.png`):** en Independencia, el bloque KPI dice **`15,8%`** *"de una boleta de 250 kWh"* (`kWh / 250`) y 20 px más abajo la barra dice **`15,7%`** *"Aparato / boleta tipo"* (`CLP / boleta 250 kWh con cargo fijo`). Dos porcentajes distintos para el mismo aparato sin explicar la diferencia.
- **Error de concordancia en vivo (`src/public/app.js:152`):** al filtrar `"Temuco"` en el buscador comunal, el mensaje de estado muestra **`"1 comunas disponibles"`** (verificado en Playwright).
- **Gráfico de radiación solar fuera de contexto y sin escala numérica (`localidad-consumo-independencia-1440.png`):** las páginas de *refrigerador* muestran un gráfico grande de barras *«Radiación mensual · NASA POWER»* sin eje Y ni valores numéricos sobre las barras (solo iniciales `E F M A M J J A S O N D`), imposible de leer cuantitativamente.
- **Tabla de `/tarifas/` sin filtro (`src/lib/render.js:368`):** vuelca las 328 comunas en una única tabla HTML sin búsqueda ni agrupación por región o distribuidora.
- **Copy defensivo de SEO expuesto al usuario final (`home-1440.png`):** el panel del hero presume *«OBSERVATORIO RESIDENCIAL · 3.000 URLS»* y una tarjeta de portada se titula *«Datos trazables, no texto inflado»* — jerga interna de auditoría SEO que no habla el idioma de una familia chilena.

### 5. Oportunidades de producto no explotadas
- **Geografía vertical Norte→Sur (4.300 km):** ninguna página visualiza el contraste radical del país (`Calama 7,22` vs. `Porvenir 2,74 kWh/m²/día`; `Mejillones $137` vs. `El Carmen $303/kWh`), que es la razón misma de existir del dataset comunal.
- **Contexto real chileno del bolsillo:** impacto de las alzas tarifarias post-estabilización (PEC), referencia al **Subsidio Eléctrico**, lectura directa de la **Etiqueta de Eficiencia Energética E2.0** (donde aparece el `kWh/mes` real del refrigerador o TV) y aclaración del trámite **TE4 / Sello SEC** para Netbilling.
- **Comparador directo entre comunas o distribuidoras vecinas** (p. ej. Temuco con `Frontel $303,34` vs. `CGE $277,36`, o Puente Alto con `EEPA $265,65` vs. `CGE $244,08`).

---

## B · Auditoría del frontend actual (código y en vivo)

### 1. Stack y arquitectura de entrega
- **Runtime:** Cloudflare Worker (`src/worker.js`, `wrangler.jsonc`) que renderiza HTML SSR puro en memoria a partir de `src/data/generated.json` (`1,065 MB`) y sirve dos activos estáticos inlineados en el bundle (`/assets/styles.css?v=andean-2` y `/assets/app.js?v=andean-2`) más un PNG de 121 bytes en base64 para `/favicon.png` y `/favicon.ico` (`src/worker.js:34,156-166`).
- **Dependencias:** cero dependencias runtime (`package.json`), cero webfonts, cero imágenes editoriales, cero SVGs.
- **Pruebas actuales (`scripts/test.mjs`):** valida generación de las 3.000 rutas, cálculos y **prohíbe explícitamente cualquier `<svg>` o `.svg` en todo el proyecto (`scripts/test.mjs:59-74`)** — restricción artificial que debe eliminarse al rehacer el frontend.

### 2. Revisión visual en vivo (12 capturas a 1440 px y 390 px)
Capturas inspeccionadas en `D:/pruebas/frontend-6/analisis/energia-chile/capturas/`:
- `home-1440-fold.png`, `home-1440.png`, `home-390-fold.png`, `home-390.png`
- `calculadora-solar-temuco-1440.png`, `calculadora-solar-temuco-390.png`
- `localidad-consumo-independencia-1440.png`, `localidad-consumo-independencia-390.png`
- `calculadora-btu-puente-alto-1440.png`, `calculadora-btu-puente-alto-390.png`
- `contenido-guia-netbilling-1440.png`, `contenido-guia-netbilling-390.png`

**Problemas visuales inmediatos observados en las capturas:**
1. **Gráfico decorativo falso en el hero (`R012`, `home-1440-fold.png`, `src/lib/render.js:236`, `src/public/styles.css:38-40`):** `.energy-profile` pinta 12 barras verticales en cobre/azul/amarillo con alturas CSS hardcodeadas (`38%`, `62%`, `82%`, `94%`) que no corresponden a ningún dato ni mes del año.
2. **Etiquetas mono numeradas y códigos de estudio cliché (`R061`/`R062`):** `CL / 01` en `.studio-heading` (`home-1440-fold.png`), `01 Consumo eléctrico | 02 BTU y climatización | 03 Paneles solares` en `.tool-switch` (`render.js:15`) y cejas `Consolas` `11,2px` uppercase `letter-spacing: 0.12em` repetidas en cada página.
3. **Header sobredimensionado y navegación duplicada:** en móvil (`390px`) el header ocupa **125 px** con 6 enlaces apretados y oculta el botón `Calcular` (`home-390-fold.png`), mientras debajo vuelve a aparecer la barra `.tool-switch` en TODAS las páginas — incluso en guías editoriales (`contenido-guia-netbilling-1440.png`, donde ninguna pestaña está activa) y en `/404/`. En 390 px, *«BTU y climatización»* rompe en dos líneas dentro del tab (`home-390.png`).
4. **Muros de tarjetas idénticas y flechas `→` repetidas (`R038`/`R116`, `home-1440.png`):** 3 `.tool-card` con borde superior `3px` + 8 tarjetas comunales idénticas + 2 tarjetas de metodología + 3 tarjetas de guías con el mismo borde superior `3px` y enlaces `→` repetidos.
5. **Recorte horizontal silencioso de tablas en móvil 390 px (`localidad-consumo-independencia-390.png`, `calculadora-solar-temuco-390.png`, `calculadora-btu-puente-alto-390.png`):** `.table-wrap` mide `558px` dentro de `360px` (`overflows: true`), cortando el título (*«Tarifas residenciales de Independencia · valores con IV»*) y escondiendo las columnas `BOLETA 250 KWH` y `FUENTE` sin ningún indicador visual de scroll.
6. **Tipografía del sistema sin personalidad (`R013`):** `"Segoe UI", Arial, system-ui, sans-serif` + `Consolas` (`styles.css:6,9`; `fontsLoadedUnique: []`), que da aspecto de intranet administrativa.
7. **Vacío lateral prolongado en escritorio (`contenido-guia-netbilling-1440.png`, `calculadora-solar-temuco-1440.png`):** la columna derecha termina a mitad de la página dejando grandes bloques en blanco `#F2F4F8`.

### 3. Plantilla compartida entre los 6 sitios (qué eliminar al rehacer desde cero)
Al cruzar el código fuente de los 6 repositorios de `D:/pruebas/frontend-6/` (todos rediseñados el 26-11-2026 con el mismo molde de `factory-droid[bot]`), se verifica que **comparten exactamente la misma arquitectura visual y los mismos vicios de UI/UX** bajo skins de color superficiales:

| Dimensión compartida | `energia-btu-br` | `consumo-cfe-mexico` | `energia-chile` | `solar-rebates-australia` | `canada-frost-calendar` | `nz-home-garden` | Veredicto al rehacer |
|---|---|---|---|---|---|---|---|
| **Esqueleto de portada** | Header sticky → hero 2 col (copy + caja calc) → 4 KPIs → tarjetas borde acento → footer oscuro | Header sticky → hero 2 col (copy + caja calc) → 3 cards → rejilla 32 cards → footer oscuro | Header sticky → hero 2 col (copy + panel KPI) → 3 `tool-card` → rejilla 8 cards → footer oscuro | `.site-header` → `.hero-grid` (copy + `.hero-metrics` + `.hero-card`) → `.calculator-shell` → `.grid-3` cards (`static-pages.js:18-53`) | `.site-header` → `.hero-grid` (`build-site.mjs:332`) → `.finder-card` → `.season-panel` → cards | `.site-header` → `.page-head` → `.panel` split form/result → rejilla de tarjetas (`sitegen.py:207-247`) | **Eliminar 100%** el molde «header + hero 2-col + strip + rejilla de cards + footer oscuro». |
| **Sistema de cards** | Cajas `1px` + borde lateral `3–4px` + 10 `.btu-card` iguales | Cajas `1px` + borde superior `3px` + 32/570 cards con `→` | `.card` `12px` + `border-top: 3px` + 8 cards + `→` repetida | `.card.card-link` `20px` + shadow + `data-reveal` | `.finder-card` / `.card` `18–24px` + shadow + `data-reveal` | `.panel` `6px` + bordes `1px` repetidos | **Prohibir** muros de tarjetas homogéneas (`R038`). |
| **Tipografía** | `Space Grotesk` + `Plus Jakarta Sans` + mono (2 fuentes reflejo `R053`) | `Georgia` + `Arial` (sistema, sin webfonts) | `"Segoe UI", Arial` + `Consolas` (sistema, sin webfonts) | `Iowan Old Style/Georgia` + `system-ui` (sistema) | `Newsreader` + `Plus Jakarta Sans` (fuente reflejo `R053`, `site.css:44-45`) | `Hanken Grotesk` + `system-ui` (`site.css:18`) | **Asignar pareja webfont autoalojada única por sitio**, fuera de las 11 fuentes reflejo (`R053`) y sin `serif + mono` (`R052`). |
| **Paleta** | `#F6F7F4` + `#0B6B4F` + `#1D4ED8` + `#D97706` + grilla 48px | `#F9F8F4` + `#006B4E` + `#1E4E79` + `#D97706` (clon directo de BR) | `#0E1F38` (grilla 80px) + `#F2F4F8` + `#B85D3B` + `#0284C7` + `#C68A0A` | `#FAF6F0` + `#C84B2A` + `#D98A12` + `#0D6E6E` | `#F4F7FA` + `#1D5B8F` + `#C05621` + `#276749` | `#101413` + `#18201E` + `#D1945A` + `#6BA587` | **Erradicar paletas genéricas y fondos de papel milimetrado**; cada país parte de un concepto cromático irrepetible (`R022`). |
| **Logo (`.brand-mark`)** | 3 `<span>` CSS sin SVG | Letra `"C"` en Georgia dentro de `<span>` | Sigla `"EC"` en `Consolas` dentro de caja `45×45` (`styles.css:19`) | `<span class="brand-mark">` vacío (`layout.js:78`) | Letra `"F"` en `.brand-mark` (`build-site.mjs:100`) | `<span class="brand-mark"><i></i></span>` (`sitegen.py:45`) | **Crear logotipo SVG propio** con isotipo reconocible por país. |
| **Prohibición dogmática de SVG** | 0 `<svg>`; PNG 142 B base64 | `test-build.mjs:14,41` prohíbe `<svg>` y `.svg` | `scripts/test.mjs:59-74` prohíbe `<svg>` y `.svg` | Commit `fe3b0fa`: *«zero SVGs/emojis»*; `png.js` | `validate-site.mjs:32-50` prohíbe `<svg>` y `.svg` | `validate_site.py:47` prohíbe `<svg>` y `.svg` | **Levantar la prohibición**: restaurar SVG para logos, favicons, mapas territoriales y gráficos cuantitativos reales. |
| **Etiquetas y micro-animación** | `01 / COBERTURA`, `01 / DADOS` + `fade-up` + rAF | `01 / BÁSICO` + `fade-up` + barras CSS | `CL / 01`, `01/02/03` tabs + barras falsas + rAF | `eyebrow-tag` + `data-reveal` + barras CSS | `data-reveal` + `data-animate-bars` CSS | `data-energy-fill` CSS + sin escena memorable | **Eliminar etiquetas `01 /` (`R061`/`R062`)** y construir una escena interactiva propia del producto (`R104`). |

### 4. Calidad técnica, rendimiento, accesibilidad y SEO (medición en vivo)

#### Rendimiento y Web Vitals (Playwright 1440 px; **Lighthouse móvil: No verificado / `UNSCORED`**, CLI no instalado)
| Ruta auditada | HTTP | Transfer / Decoded | Reqs | TTFB | FCP | LCP | CLS | Overflow 1440 / 390 / 320 | Altura 390 px |
|---|---:|---:|---:|---:|---:|---:|---:|---|---:|
| `/` | 200 (`zstd`) | 17,3 KB / 64,0 KB | 4 | 406 ms | 744 ms | 744 ms | 0 | 0 / 0 / 0 px | 6.637 px (7,86 pantallas) |
| `/paneles-solares/temuco/` | 200 (`zstd`) | 9,5 KB / 68,2 KB | 4 | 189 ms | 312 ms | 312 ms | 0 | 0 / 0 / 0 px (tabla interna 558>360) | 6.446 px (7,64 pantallas) |
| `/consumo-electrico/refrigerador/independencia/` | 200 (`zstd`) | 9,6 KB / 73,9 KB | 4 | 136 ms | 312 ms | 312 ms | 0 | 0 / 0 / 0 px (tabla interna 558>360) | 6.449 px (7,64 pantallas) |
| `/btu/puente-alto/` | 200 (`zstd`) | 9,1 KB / 63,9 KB | 4 | 131 ms | 248 ms | 248 ms | 0 | 0 / 0 / 0 px (tabla interna 558>360) | 6.250 px (7,41 pantallas) |
| `/guias/paneles-solares-netbilling/` | 200 (`zstd`) | 2,7 KB / 33,4 KB | 4 | 162 ms | 244 ms | 244 ms | 0 | 0 / 0 / 0 px | 3.152 px (3,73 pantallas) |

- **Errores de consola / red:** `0` errores JS y `0` recursos fallidos en las 5 vistas. Sin embargo, el sitio pesa `64–74 KB` decodificados de HTML por página comunal en gran parte por incrustar las 328 `<option>` repetidas.
- **Accesibilidad (fallos verificados):**
  - **Sin `aria-live` en resultados de las 3 calculadoras (`src/lib/render.js:111-188`):** solo existe un `<span role="status">` en `.search-status`; al editar watts, m² o kWh no se anuncia ningún cambio a lectores de pantalla (`R134`).
  - **Contraste insuficiente en acentos (`styles.css:3-4`):** `--sun` `#C68A0A` sobre `#FFFFFF` da **`2,98:1`** (falla AA); `--blue` `#0284C7` sobre `#FFFFFF` da **`4,10:1`** (falla AA en texto normal); `--brand` `#B85D3B` sobre `#F2F4F8` da **`4,09:1`** (falla AA).
  - **Áreas táctiles insuficientes (`R126`/`R127`):** en móvil `390px` se detectan **22–41** controles `<44px` y **14–15** controles `<24px` (breadcrumbs de `17px` de alto, links de tarjetas de `21px`, enlaces del footer de `22px`).
  - **Falta `@media print` (`R183`):** no hay estilo de impresión limpio para llevar la estimación solar o BTU a un instalador.
- **SEO y endpoints técnicos (verificados en vivo):**
  - `/robots.txt` (`200`, 115 B), `/sitemap.xml` (`200`, 434 KB, **3.000 `<loc>`**), `/ads.txt` (`200`, 59 B), IndexNow `/ec9f4a7c2e8b4d7aa5f6d1c3b9e02741.txt` (`200`, 32 B) y 404 real (`404` en `/ruta-inexistente-404/`).
  - **Fallos SEO graves:**
    - `twitter:card="summary_large_image"` declarado en todas las páginas **sin ningún `og:image` ni `twitter:image`** (`src/lib/render.js:32-33`).
    - **Cero JSON-LD** en las 328 páginas BTU (`/btu/puente-alto/`: `jsonLdTypes: []`) y en las 11 guías (`/guias/paneles-solares-netbilling/`: `jsonLdTypes: []`). Falta `BreadcrumbList`, `WebApplication`, `Article` y `Dataset` en todo el sitio.
    - `/llms.txt` devuelve **404** (sí implementado en BR y MX, ausente aquí).
    - `/favicon.ico` entrega bytes `image/png` de 121 B con MIME `image/png` en lugar de ICO multi-tamaño (`src/worker.js:158`).
    - `Cache-Control` en HTML `max-age=3600, s-maxage=86400`; `X-Content-Type-Options: nosniff` presente, pero faltan `Referrer-Policy` y `Permissions-Policy`.

### 5. Qué se conserva y qué se elimina por completo (rehacer desde cero)
- **Se conserva únicamente el núcleo de datos, cálculo y rutas (sin UI):**
  - `src/data/generated.json` (328 comunas, 15 distribuidoras, NASA POWER) y su pipeline de ingestión.
  - `src/lib/calc.js` (corrigiendo la discrepancia `share250` vs. `billShare` y exponiendo el desglose mensual real de generación solar).
  - Textos base de `src/lib/guides.js` (revisando copy de portada para quitar jerga SEO) y el enrutador HTTP / `sitemap.xml` / `robots.txt` / `ads.txt` / IndexNow de `src/worker.js` (agregando `/llms.txt` y JSON-LD completo).
  - Pruebas de cálculo y rutas de `scripts/test.mjs` (**eliminando la regla anti-SVG de las líneas 59–74**).
- **Se elimina el 100% del frontend actual (rehacer desde cero, sin retoques):**
  - `src/public/styles.css` completo (paleta navy+copper, grilla 80px, `Segoe UI`/`Consolas`, cards, barras falsas).
  - Todas las plantillas HTML de `src/lib/render.js` (hero con panel falso, `.tool-switch` con `01/02/03`, doble selector con 328 `<option>` inline, muros de tarjetas, bug `"un "` + aparato, gráfico mensual sin eje Y).
  - La capa de presentación/DOM de `src/public/app.js` (rAF en números, plural `"1 comunas disponibles"`, buscador acoplado a `<select>` gigante).

### 6. Qué assets faltan
- **Identidad / Logo SVG real:** isotipo + wordmark nítido a 16 px y 240 px (reemplazando la caja `"EC"` en `Consolas`).
- **Favicons completos:** `favicon.ico` (16/32/48), `favicon.svg`, `favicon-32x32.png`, `favicon-96x96.png`, `apple-touch-icon.png` (180×180). Hoy `/favicon.svg`, `/apple-touch-icon.png` y `/manifest.webmanifest` devuelven **404**.
- **PWA / Manifest:** `manifest.webmanifest`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` y `<meta name="theme-color">` alineado a la nueva paleta.
- **Open Graph (`1200×630`):** hoy inexistente (aunque `twitter:card="summary_large_image"` lo promete). Se requieren plantillas por arquetipo: portada, consumo por aparato, BTU, solar/Netbilling y guías.
- **Cartografía y gráficos SVG reales:** silueta/perfil latitudinal SVG de Chile (16 regiones, Norte→Sur), diagrama real de radiación mensual con eje y valores en `kWh/m²/día`, y pictogramas técnicos propios para los 7 aparatos y los 3 modos.

---

## C · Mercado, competencia y referencias

### 1. Competidores reales en Google Chile (`es-CL`)
1. **Explorador Solar (`solar.minenergia.cl`, Ministerio de Energía + Universidad de Chile):**
   - *Bien:* referencia científica indiscutida en Chile; radiación horaria y evaluación fotovoltaica detallada por coordenada exacta.
   - *Mal:* herramienta GIS de escritorio lenta y compleja para el ciudadano común; abruma en móvil y no integra tarifas BT1 actuales en CLP ni consumo de electrodomésticos ni BTU.
2. **Calculadoras de distribuidoras (`gruposaesa.cl`, `chilquinta.cl`, `enel.cl`, `cge.cl`):**
   - *Bien:* confianza institucional y datos tarifarios directos de su propia zona de concesión.
   - *Mal:* fragmentadas (solo sirven para su territorio), visuales corporativos anticuados o embebidos en iframes torpes, no comparan entre distribuidoras (p. ej. Frontel vs. CGE en Temuco) ni calculan Netbilling real con payback.
3. **Calculadoras BTU de retail y marcas HVAC en Chile (`sodimac.cl`, `falabella.com`, `mideastore.cl`, `anwo.cl`, `clark.cl`):**
   - *Bien:* posicionamiento SEO muy alto y flujo rápido por m² para compradores de aire acondicionado.
   - *Mal:* usan reglas fijas (`600 BTU/m²`) ignorando la diferencia térmica entre Arica, Santiago y Temuco/Valdivia; no calculan calefacción por bomba de calor ni costo mensual en la boleta BT1; existen para empujar compra de equipos propios.
4. **Calculadoras de instaladores solares (`solarpro.cl`, `msolar.cl`, `innvolt.cl`, `ciudadluz.cl`, `solarawakening.cl`):**
   - *Bien:* estética más moderna que las distribuidoras, hablan directamente de Netbilling Ley 20.571 y ahorro en boleta.
   - *Mal:* embudos comerciales de generación de leads (piden teléfono/email/dirección para entregar detalle), supuestos optimistas de autoconsumo sin mostrar la penalización de inyección al cargo por energía y cero transparencia de fórmula.
5. **Prensa y portales informativos (`chocale.cl`, `biobiochile.cl`, `cne.cl`, `sec.cl`):**
   - *Bien:* capturan búsquedas de alzas de luz, subsidio eléctrico y normativa SEC/E2.0.
   - *Mal:* artículos estáticos con publicidad pesada y sin calculadoras interactivas comunales.

**Brecha competitiva clara:** en Chile no existe ningún instrumento público, independiente y veloz que una **tarifas BT1 reales de las 15 distribuidoras + radiación NASA POWER de Norte a Sur + consumo/BTU/Netbilling** sin pedir correo ni vender paneles, y con un diseño de precisión a la altura de la cultura gráfica y científica chilena.

### 2. Estética local y referencias del rubro en Chile
- **Geografía vertical Norte→Sur (4.300 km, `18°S` a `55°S`):** es la forma visual más reconocible de Chile en todo el planeta y coincide con el eje físico de los datos del sitio (radiación solar extrema en Atacama → clima templado central → invierno lluvioso austral y calefacción).
- **Etiqueta de Eficiencia Energética E2.0 (Ministerio de Energía) y Sello SEC con QR:** presente en cada refrigerador, lavadora y aire acondicionado en tiendas chilenas; combina rigor de ficha técnica, jerarquía numérica inmediata (`kWh/mes`) y claridad de certificación pública.
- **Metro de Santiago y Red Movilidad:** sistema de señalética cívica limpio, códigos de línea funcionales, tipografía legible a distancia y orden espacial sin adornos.
- **Observatorios astronómicos de Atacama (ALMA / Paranal / ESO) y arquitectura contemporánea chilena (hormigón visto, madera austral, luz seca de altura):** sobriedad material, precisión instrumental y contraste nítido sin sobrecarga cromática.

### 3. Fichas DESIGN.md elegidas (`ESTILOS-POR-RUBRO.md`, todas `generico_final = false` y 100% distintas a BR y MX)
1. **`heart-aerospace-bf523387` (`Heart Aerospace`)** — *Tecnología / ingeniería limpia · distintivo 90 · `generico_final = false`* (`D:/orquesta/design-sources/corpus/designs-md-diego/raw/refero-styles/heart-aerospace-bf523387.md`):
   - *Qué tomamos:* lienzo atmosférico ultra-limpio de aire/hielo (`#f4f6f9` / blanco), contraste severo con un único azul eléctrico-atmosférico de alta precisión, cifras de ingeniería sin ruido de sombras ni cajas repetidas y composición editorial de alto respiro. Ideal para romper por completo el hero azul marino oscuro actual.
2. **`figureai-2997507c` (`FigureAI`)** — *Tecnología / hardware de precisión · distintivo 90 · `generico_final = false`* (`D:/orquesta/design-sources/corpus/designs-md-diego/raw/refero-styles/figureai-2997507c.md`):
   - *Qué tomamos:* disciplina extrema de dossier técnico `0px` (sin border-radius inflados), tablas y rieles de especificaciones alineados a la derecha, jerarquía tipográfica quirúrgica entre titular y cifra tabular, y alternancia deliberada entre capítulos claros de laboratorio y capítulos oscuros de instrumento.
3. **`lightship-fdcd4cbb` (`Lightship`)** — *Energía solar / movilidad eléctrica · distintivo 90 · `generico_final = false`* (`D:/orquesta/design-sources/corpus/designs-md-diego/raw/refero-styles/lightship-fdcd4cbb.md`):
   - *Qué tomamos:* estética solar contemporánea que evita el cliché «verde eco + sol amarillo»: combina alabastro limpio, negro basalto sólido, un único acento bermellón solar vibrante (ajustado a AA) y selectores tipo píldora directos para cambiar entre configuraciones de energía sin menús duplicados.

### 4. Piezas del catálogo de 94 elegidas (`CATALOGO-94-PIEZAS.md`, código leído, 100% distintas a BR y MX)
1. **`PAG-101-cordal-guia`** (`app/v/PAG-101-cordal-guia/page.tsx`): lectura estructurada con guía lateral continua ligada al desplazamiento. Perfecta para transformar `/comunas/`, `/tarifas/` y las guías Netbilling en un recorrido limpio de Norte a Sur (16 regiones) en lugar de muros de tarjetas o tablas interminables.
2. **`PAG-202-tiralinea-bitacora`** (`app/v/PAG-202-tiralinea-bitacora/page.tsx`): composición de bitácora técnica de obra (incluso con toponimia chilena real en el catálogo: *Lircay, Maule, Itata, Teno*) que resuelve densidad de especificaciones, FAQ limpias y fichas de producto sin apilar cajas cuadradas ni sombras.
3. **`PIE-045-atlas-cortezas`** (`app/v/PIE-045-atlas-cortezas/Component.tsx`): atlas interactivo de zonas con transición fluida de variables ambientales — molde directo para el **Perfil Latitudinal interactivo de Chile (`18°S → 53°S`)** que cruza radiación solar, temperatura de verano/invierno y tarifa BT1 en un único artefacto vivo.
4. **`PIE-005-boya-cero`** (`app/v/PIE-005-boya-cero/Component.tsx`): medidor radial SVG animado con `stroke-dashoffset` y respeto total a `prefers-reduced-motion` (adaptado a paleta propia sin `Inter` ni glow neón). Ideal para mostrar visualmente el reparto **Autoconsumo (72%) vs. Inyección Netbilling (28%)** o el peso del aparato en la boleta de 250 kWh.

### 5. Dos direcciones de concepto visual (radicalmente distintas entre sí, y de Brasil, México y los otros 3 sitios)

#### Dirección CL-1 · «Meridiano 4.300 km (Atlas Latitudinal Solar & Eléctrico)»
- **Concepto:** convierte la geografía vertical de Chile en la interfaz misma. Sin hero azul marino ni tarjetas repetidas: la portada abre a plena luz sobre un lienzo blanco glaciar con un **perfil latitudinal interactivo de Chile (`18°S Arica → 53°S Punta Arenas`)** en el margen derecho o columna central. Al seleccionar o arrastrar a cualquier comuna (o escribir en un buscador instantáneo único con autocompletado ligero en JSON bajo demanda), la página entera sitúa tu comuna sobre el gradiente real del país — radiación NASA POWER (`2,74–7,22 kWh/m²/día`), temperatura verano/invierno y tarifa BT1 (`$137–$303/kWh`) — y te deja saltar directamente a **Consumo**, **BTU** o **Solar** con esa comuna ya cargada.
- **Paleta (hex — WCAG AA verificado, radicalmente distinta a BR-1/2 y MX-1/2):**
  - Fondo glaciar: `#F4F6F9` · Superficie limpia: `#FFFFFF` · Filetes técnicos: `#CFD7E3`
  - Tinta grafito andino: `#111820` (`16,50:1` sobre `#F4F6F9`) · Tinta secundaria: `#4B5768` (`6,78:1`)
  - **Azul Atacama (identidad principal, CTA y foco):** `#1B36B8` (`8,56:1` sobre glaciar; `9,27:1` con `#FFFFFF`)
  - Acentos semánticos estrictos (solo señalización de herramienta y datos):
    - Consumo eléctrico (cobre mineral oxidado): `#9C3A16` (`6,93:1` sobre `#FFFFFF`)
    - Ahorro / tarifa baja (verde austral): `#136B42` (`6,54:1` sobre `#FFFFFF`)
    - Radiación solar / GHI (ocre solar calibrado): `#8F5B00` (`5,73:1` sobre `#FFFFFF`; relleno gráfico `#D99316`)
- **Pareja tipográfica (autoalojada WOFF2, fuera de las 11 fuentes reflejo, sin `serif + mono`, glifos `á é í ó ú ñ ¿ ¡ °`):**
  - Display: **Epilogue** (pesos `700/800`, tracking `-0.035em`, `line-height: 0.94`, relación `H1/body >= 4×`)
  - Cuerpo y cifras tabulares: **IBM Plex Sans** (pesos `400/500/600/700`, `font-variant-numeric: tabular-nums`, excelente claridad para `$303,35/kWh` y tablas BT1)
- **Forma y ritmo:** layout asimétrico editorial-cartográfico inspirado en `Heart Aerospace` + `PAG-101-cordal-guia`. Cero tarjetas cuadradas apiladas: las 3 calculadoras viven como **modos integrados de un único laboratorio comunal** (sin `.tool-switch` redundante en guías ni `01/02/03`), el gráfico de radiación mensual es un **SVG cuantitativo real con valores visibles mes a mes** (solo en páginas solares y BTU, nunca en refrigeradores), y `/tarifas/` se convierte en un índice filtrable por región/distribuidora con tabla responsive apilable en móvil (cero recorte horizontal).
- **Movimiento memorable:** **«Barrido Latitudinal Norte→Sur»** (`PIE-045` + `PIE-005`): al mover el cursor o elegir otra comuna sobre la columna vertical de Chile, una línea de latitud recorre el meridiano, el perfil mensual SVG de radiación interpola suavemente sus 12 meses y el anillo Netbilling recalibra la proporción de autoconsumo vs. inyección (inmediato bajo `prefers-reduced-motion: reduce`).
- **Idea de logo:** isotipo geométrico minimalista de **meridiano vertical partido por un rayo solar oblicuo a 33°S** (un trazo vertical delgado + segmento diagonal en `#1B36B8` y `#9C3A16`), legible a 16 px en favicon + wordmark **Energía Chile** en Epilogue 800.
- **Idea de OG image (`1200×630`):** composición clara sobre `#F4F6F9` con el perfil latitudinal vertical de Chile a la derecha marcado en la comuna (p. ej. *Temuco · 38,7°S*), curva mensual real de radiación y dos cifras protagonistas (`$303,34/kWh · 4,57 kWh/m²/día`), banda inferior con `Energía Chile · BT1 2026 · NASA POWER`.

#### Dirección CL-2 · «Observatorio Atacama / Sello E2.0 (Dossier Fotovoltaico de Precisión)»
- **Concepto:** reimagina el sitio como un **dossier técnico de certificación energética y astronomía aplicada** — mitad **Etiqueta E2.0 / Sello SEC** de electrodomésticos chilenos, mitad ficha de telemetría de los observatorios del norte (`FigureAI` + `Lightship`). Rompe con el blanco continuo mediante **ritmo alternado de capítulos en alabastro óptico `#F7F6F2` y un único bloque de instrumento en basalto volcánico puro `#101215`** (no azul marino) donde vive el resultado en vivo de la calculadora.
- **Paleta (hex — WCAG AA verificado, sin repetir colores de CL-1, BR ni MX):**
  - Alabastro técnico: `#F7F6F2` · Blanco laboratorio: `#FFFFFF` · Basalto volcánico (solo capítulo de instrumento y footer): `#101215`
  - Tinta principal claro: `#101215` (`17,35:1` sobre `#F7F6F2`) · Secundario claro: `#4D5158` (`7,37:1`)
  - Tinta sobre basalto: `#FFFFFF` (`18,76:1`) · Secundario sobre basalto: `#A7ADB5` (`8,30:1`)
  - **Bermellón fotovoltaico (acción primaria y marcador activo):** `#BA3410` (`5,86:1` con `#FFFFFF` y sobre `#FFFFFF`)
  - **Cian andino (BTU / climatización):** `#005885` (`7,68:1` sobre `#FFFFFF`)
  - **Dorado radiación (solo sobre basalto `#101215`):** `#F4B942` (`10,60:1` sobre basalto)
- **Pareja tipográfica (autoalojada WOFF2, fuera de las 11 fuentes reflejo, distinta de CL-1, BR y MX):**
  - Display: **Outfit** (pesos `700/800`, geométrica de precisión de ficha de hardware, `line-height: 0.92`)
  - Cuerpo y datos: **Atkinson Hyperlegible Next** (pesos `400/600/700`, máxima diferenciación entre `0/O`, `1/I/l` y cifras en CLP/kWh en pantallas móviles)
- **Forma y ritmo:** retícula estricta de cantos `0px` y hairlines `1px` (`FigureAI` + `PAG-202-tiralinea-bitacora`), cero sombras difusas, selector unificado en píldora plana (`Consumo · BTU · Solar`, inspiración `Lightship`) justo encima del instrumento. El resultado en vivo vive en un **rielo derecho de especificaciones de alta densidad sobre basalto `#101215`** con el rango tarifario nacional (`$137–$303/kWh`) como regla calibrada horizontal y el desglose SEC/Netbilling sin redondeos ambiguos.
- **Movimiento memorable:** **«Anillo Calibrado de Boleta & Sello E2.0»** (`PIE-005-boya-cero`): un instrumento radial SVG sobre el panel de basalto muestra en tiempo real qué fracción de tu boleta de 250 kWh se lleva el aparato (resolviendo la contradicción `15,8%` vs. `15,7%`) o cómo se reparte tu generación solar entre autoconsumo e inyección, mientras una regla de tarifas desplaza el marcador de tu comuna frente al promedio chileno.
- **Idea de logo:** monograma técnico tipo **sello de certificación hexagonal/cuadrado abierto** inspirado en el Sello SEC con un ángulo fotovoltaico interno en `#BA3410` sobre `#101215`, nítido a 16 px + wordmark **ENERGÍA CHILE** en Outfit 700.
- **Idea de OG image (`1200×630`):** tarjeta partida al medio (`55%` alabastro `#F7F6F2` con titular y comuna / `45%` basalto `#101215` con el anillo radial SVG del resultado destacado en `#F4B942` y `#BA3410`, p. ej. `2,20 kWp · Payback 5,2 años · Temuco`).

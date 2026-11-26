# FRONTEND.md · Energía Chile

> Definición del frontend completo, escrita por Claude a partir de `D:\pruebas\frontend-6\analisis\energia-chile\ANALISIS.md` (26-11-2026).
> **Es obligatoria.** Quien implemente usa la skill `frontend-base` (`.factory/skills/frontend-base/`) y lee primero `CRITERIO-DIEGO.md`.

## 0. Mandato
El sitio actual repite la plantilla compartida y además suma vicios propios:
- hero azul marino con cuadrícula de 80 px;
- 12 barras **falsas** en el hero (`.energy-profile`);
- `CL / 01` y pestañas `01/02/03` en todas las páginas;
- Segoe UI + Consolas;
- el logo `"EC"` en una caja;
- jerga SEO a la vista del usuario («OBSERVATORIO RESIDENCIAL · 3.000 URLS», «Datos trazables, no texto inflado»).

**Se rehace desde cero. No se retoca.**

| Se conserva (lógica) | Se elimina al 100 % |
|---|---|
| `src/data/generated.json`, `src/lib/calc.js` y los textos base de `src/lib/guides.js` | `src/public/styles.css` |
| el router de `src/worker.js`, las 3.000 URLs, el sitemap, robots, ads.txt e IndexNow | `src/lib/render.js` (las plantillas) |
| los tests numéricos de `scripts/test.mjs` | la capa DOM de `src/public/app.js` |
| | la regla anti-SVG de `scripts/test.mjs:59-74`, la prueba que exige un PNG en `/favicon.ico` (`scripts/test.mjs:51-56`) y la que exige el selector antiguo en todas las rutas (`scripts/test.mjs:60-66`). Se migran a aserciones del frontend nuevo: ICO real, buscador único y ningún selector en las guías |

Se prohíben las clases, los tokens y la estructura anteriores: `.tool-card`, `.tool-switch`, `.energy-profile` y `.brand-mark`.

## 1. Concepto · «Meridiano»
Chile es la forma más reconocible del mundo: **4.300 km de norte a sur**. Esa línea vertical coincide con el eje de los datos del sitio. Arriba está la radiación extrema de Atacama, en el centro el clima templado y abajo el invierno austral y la calefacción.

**La interfaz es el meridiano.** El país vertical vive como un instrumento a la derecha (arriba en móvil). Tu comuna se ubica en su latitud real, y desde ahí todo se recalcula: tarifa BT1, radiación y BTU para enfriar o calefaccionar.

- **Tono:** chileno, sobrio y directo, sin modismos forzados: «¿Cuánto te sale la luz en tu comuna?». Cero jerga SEO.
- **Energía:** luz seca de altura. Un lienzo glaciar luminoso, un azul Atacama profundo y el **cobre** como golpe de calor, el material de Chile.
- **Firma propia en el portafolio:** el perfil latitudinal como navegación y como gráfico.

Referencias de la skill:
- **Fichas DESIGN.md:**
  - `heart-aerospace-bf523387`: lienzo atmosférico y un único azul de precisión.
  - `lightship-fdcd4cbb`: solar sin el cliché verde y amarillo, con un único acento cálido.
  - `figureai-2997507c`: rieles de especificaciones alineados y una jerarquía quirúrgica, usado solo en las tablas.
- **Piezas del catálogo:**
  - `PIE-045-atlas-cortezas`: atlas de zonas con transición de variables, como base del meridiano.
  - `PAG-101-cordal-guia`: guía lateral ligada al scroll, para recorrer las 16 regiones.
  - `PIE-005-boya-cero`: medidor radial, para Netbilling y para el peso de un aparato en la boleta.
  - `PAG-202-tiralinea-bitacora`: fichas técnicas y FAQ sin cajas.

## 2. Tokens
```css
:root{
  --glaciar:#F4F6F9;  /* fondo */
  --blanco:#FFFFFF;
  --filete:#CFD7E3;
  --grafito:#111820;  /* texto 16.5:1 */
  --grafito-2:#4B5768;/* secundario 6.78:1 */
  --atacama:#1B36B8;  /* identidad, CTA, foco (8.56:1) */
  --cobre:#9C3A16;    /* consumo eléctrico, calor (6.93:1) */
  --austral:#136B42;  /* ahorro, tarifa baja (6.54:1) */
  --ocre:#8F5B00;     /* radiación como texto (5.73:1) */
  --ocre-fill:#D99316;/* radiación, solo como relleno gráfico */
  --hielo:#5B8DEF;    /* frío y calefacción, solo como relleno gráfico */
}
```
- **Gradiente latitudinal** (solo en el meridiano y en gráficos): de `#D99316` (18°S), pasando por `#C8A04A`, `#7FA7C9` y `#3D6FB8`, hasta `#1B36B8` (53°S).
- **Radios:** `0` en la estructura y las tablas, y `999px` solo en el selector de modo (Consumo · BTU · Solar) y en los chips de región. El meridiano es una forma orgánica, el contorno real del país, que rompe la retícula.
- **Sombras:** ninguna. Las capas se separan con filetes de 1 px y con el blanco sobre glaciar.

## 3. Tipografía
- **Display:** **Epilogue** 700/800, `line-height:.94`, `letter-spacing:-.035em`.
- **Texto, UI y cifras:** **IBM Plex Sans** 400/500/600/700, con `tabular-nums` en $, kWh, °S y kWh/m².
- Autoalojadas en WOFF2, subset latin+ext (`á é í ó ú ñ ¿ ¡ °`), con `swap` y fallback métrico.
- **Escala:**
  - H1: `clamp(42px, 8vw, 108px)`.
  - Cifra protagonista: `clamp(52px, 11vw, 136px)`.
  - Latitud (`38,7°S`) como dato tipográfico grande, en Epilogue 800.
  - Cuerpo: 17px/1.6.
- **Prohibido:** Segoe UI, Consolas, cualquier mono, `CL / 01` y las cejas tracked.

## 4. Arquitectura de páginas
Se mantienen las 3.000 URLs.

### 4.1 Home `/`
1. **Header** (56 px): logo, «Consumo», «Aire y calefacción», «Paneles solares», «Tarifas» y «Guías».
2. **Primera pantalla · el Meridiano.**
   - **Columna principal:** H1 «¿Cuánto te cuesta la energía en tu comuna?», el **buscador único de comuna** (no hay un `<select>` con 328 opciones) y el **selector de modo** en píldora: Consumo · Aire/Calefacción · Solar. **Flujo:** elegir una comuna **no navega de inmediato**. Primero actualiza en la portada la fila «Tres datos de tu comuna» y el cursor del meridiano, y muestra un botón principal según el modo activo:
     - en **Aire/Calefacción**, «Ver BTU en {comuna}», que lleva a `/btu/{comuna}/`;
     - en **Solar**, «Ver paneles en {comuna}», que lleva a `/paneles-solares/{comuna}/`;
     - en **Consumo**, aparece primero un selector de aparato con los 7 del sitio y su pictograma, y el botón «Ver consumo» lleva a `/consumo-electrico/{aparato}/{comuna}/`.
     Ya no salta siempre a paneles solares.
   - **Columna derecha (escritorio), arriba compacto (móvil):** el **perfil SVG de Chile** con las 16 regiones, que se recorre con el puntero, el teclado o el arrastre.
     - El cursor de latitud muestra la región, la tarifa BT1 media y la radiación media.
     - En móvil, el meridiano se acuesta y pasa a ser una barra horizontal norte→sur, con 64 px de alto como máximo.
3. **«Tres datos de tu comuna»:** al elegir una comuna, una fila tipográfica muestra tarifa `$/kWh`, radiación `kWh/m²/día` y temperatura de verano e invierno, con sus enlaces a los 3 modos. Antes de elegir, muestra la media nacional y el rango (`$137–$303/kWh`).
4. **«De Arica a Punta Arenas»:** un gráfico cuantitativo real, la tarifa BT1 por región en barras horizontales ordenadas por latitud, con sus valores visibles. Reemplaza las barras falsas.
5. **Guías:** se listan 3 como enlaces editoriales (título, una línea y tiempo de lectura), no como cards.
6. **Footer claro:** las fuentes (CNE/SEC BT1 con la fecha `01-11-2026` y NASA POWER), los legales y el contacto.

### 4.2 Consumo por aparato `/consumo-electrico/{aparato}/{comuna}/`
- **H1 correcto en género:** «¿Cuánto consume **una** lavadora en Temuco?». Se corrige el bug del «un» en unas 984 URLs (ver §9).
- **La respuesta:** el costo mensual en CLP en escala grande y los kWh del mes.
- **El anillo `PIE-005`:** el porcentaje que el aparato pesa en una boleta típica de 250 kWh. Es **una sola cifra y una sola definición**, para eliminar la contradicción entre 15,8 % y 15,7 %.
- **Supuestos editables:** W, horas y días.
- **Comparativa:** la misma comuna con otros aparatos, en una lista con barras.
- **La comuna en el meridiano,** en un mini mapa, y la tarifa de su distribuidora.
- **Sin el gráfico de radiación,** que no tiene relación con este tema.

### 4.3 BTU `/btu/{comuna}/` · «Enfriar o calefaccionar»
- El H1 incluye la comuna y el resultado.
- Calculadora por m², aislación, orientación y personas, con **dos lecturas**: enfriamiento en verano y calefacción con bomba de calor en invierno, que en el sur pesa más.
- La temperatura de verano e invierno de la comuna aparece en un gráfico mensual SVG con valores.
- El costo mensual en la tarifa BT1 de esa comuna.

### 4.4 Paneles solares `/paneles-solares/{comuna}/`
- **H1 y respuesta:** kWp sugerido, payback en años y ahorro anual.
- **El gráfico de radiación mensual de NASA POWER** se hace bien: un SVG con eje, valores por mes y la media marcada.
- **Anillo Netbilling:** autoconsumo contra inyección, con la explicación de que la inyección se paga a otro precio (Ley 20.571).
- **Supuestos editables:** consumo, superficie y costo por kWp.

### 4.5 Hubs
- **`/comunas/` y `/comunas/{region}/`:** un recorrido norte→sur con `PAG-101`, con una guía lateral de las 16 regiones ligada al scroll. Cada región muestra una lista densa de comunas (nombre, tarifa y radiación), sin cards.
- **`/tarifas/`:** un índice filtrable por región y por distribuidora (las 15). En 390 px la tabla se apila como filas etiqueta→valor y **nunca se recorta**.
- **`/guias/` y `/guias/{slug}/`:** editoriales a 68 ch, con nota al margen en escritorio. **Sin selector de herramientas.**

### 4.6 Institucionales y 404
- **Institucionales:** formato editorial, con cada fuente fechada.
- **404:** el meridiano con el cursor perdido, el mensaje «Esta comuna no está en el mapa» y el buscador.

> **Tarifa media de región:** es el promedio simple de la primera tarifa marginal BT1 de todas las comunas de la región, calculado desde `src/data/generated.json`. Por ejemplo, La Araucanía da $293,08/kWh; los $303,35 son el máximo, no la media. La UI siempre rotula «media» o «máx.».

## 5. Componentes
- **`Meridiano`:** el SVG del contorno de Chile, simplificado a menos de 35 KB, con 16 `<path>` de región.
  - Funciona como `role="slider"` vertical (horizontal en móvil), con flechas, PageUp/PageDown y Home/End.
  - Cada región lleva `aria-label`.
  - El resumen va en `aria-live`: «Región de La Araucanía, 38,7°S, tarifa media $293/kWh».
- **`BuscadorComuna`:** combobox accesible que carga el índice de 328 comunas bajo demanda (al enfocar). Corrige la concordancia: «1 comuna disponible».
- **`SelectorModo`:** una píldora de 3 opciones, un único control. No hay pestañas duplicadas.
- **`AnilloBoleta`:** se adapta de `PIE-005`, sin glow y con la paleta propia.
- **`GraficoMensual`:** barras o línea SVG con eje y valores, para radiación y temperatura.
- **`ReglaTarifa`:** la tarifa de la comuna frente al rango nacional.
- **`TablaApilable`.**

## 6. Movimiento
- **El memorable, «Barrido latitudinal»:** al mover el cursor por el meridiano o al elegir otra comuna:
  - una línea de latitud recorre el país (420 ms con easing);
  - los 12 meses del gráfico se interpolan;
  - el anillo se recalibra;
  - la latitud grande (`38,7°S`) rota sus dígitos.
- **El resto:** transiciones de 150–200 ms. Sin fade-up ni contenido oculto sin JS.
- **`prefers-reduced-motion`:** los cambios son instantáneos.

## 7. Accesibilidad y móvil
- **Contraste:** se corrigen los contrastes bajos de hoy (`#C68A0A` 2,98:1, `#0284C7` 4,10:1 y `#B85D3B` 4,09:1). Todos los tokens de §2 pasan AA.
- **Objetivos táctiles de 44 px o más.** Hoy hay entre 22 y 41 por debajo de ese tamaño.
- **Header:** 56 px como máximo en 390 px (hoy mide 125 px).
- **Otros:** skip link, `aria-current`, `scroll-margin-top`, `forced-colors` y `@media print` para la ficha de comuna.
- **`aria-live`** en las 3 calculadoras, con una frase resumen.

## 8. Rendimiento y SEO
- **Peso del HTML:** se quitan las 328 `<option>` de cada página, lo que ahorra unos 20 KB por página. El HTML de una página comunal debe pesar menos de 35 KB decodificado.
- **Assets:** llevan hash en el nombre. El meridiano y los gráficos van como SVG inline, con lazy-load de los que quedan bajo el pliegue.
- **Lighthouse móvil:** 95 o más en rendimiento, y 100 en accesibilidad y en SEO.
- **JSON-LD en las 328 páginas BTU y en las 11 guías,** que hoy tienen 0:
  - `WebApplication` en las calculadoras;
  - `Dataset` en `/tarifas/`;
  - `FAQPage` y `BreadcrumbList`;
  - `Place` con `geo` en las comunas.
- **Archivos técnicos:** `/llms.txt`, que hoy da 404. `/favicon.ico` debe ser un ICO real, y el sitemap lleva `lastmod`.
- **`og:image`** en todas las páginas (ver §10). Hoy hay `summary_large_image` sin imagen.
- **AdSense:** espacios con altura reservada, solo después de la respuesta principal.

## 9. Correcciones incluidas
1. **Género gramatical:** se agrega a los datos de aparatos el campo `article: "un" | "una"` (lavadora, freidora de aire, televisión LED y ventilador → «un»/«una» según corresponda) y se usa en el título, el H1, el FAQ y el JSON-LD.
2. **Un solo porcentaje** del aparato en la boleta, con su definición explícita.
3. «1 comuna disponible»: plural correcto.
4. El buscador de la home respeta el modo elegido.
5. El gráfico de radiación aparece solo en solar y en BTU, y siempre con valores.
6. Se elimina el copy SEO visible.

## 10. Assets de marca (GPT-6.2 Sol, en `brand/`)
- **Logo:**
  - **Isotipo:** un trazo vertical fino, el meridiano, cortado por un rayo oblicuo a la altura de 33°S (Santiago), en `--atacama` con el rayo en `--cobre`.
  - **Wordmark:** «Energía Chile» en Epilogue 800, convertido a trazos.
  - **Versiones:** horizontal, isotipo, monocromo grafito, monocromo blanco y una de 16 px.
  - **Formato:** SVG escrito a mano.
- **Silueta de Chile:** SVG simplificado con las 16 regiones, archivo `chile-regiones.svg` con `id` por región. Lo usan el componente `Meridiano` y las OG.
- **Favicons y PWA:**
  - `favicon.svg`, `favicon.ico` (16/32/48), `favicon-96x96.png` y `apple-touch-icon.png`;
  - `icon-192`, `icon-512` e `icon-maskable-512`;
  - `manifest.webmanifest` con `theme #1B36B8` y `bg #F4F6F9`.
- **OG images** (1200×630, menos de 150 KB):
  1. `og-home`: el meridiano vertical a la derecha con el gradiente latitudinal y el texto «¿Cuánto te cuesta la energía en tu comuna?», junto a «328 comunas · BT1 2026 · NASA POWER».
  2. `og-consumo-template.svg`: el aparato, la comuna, `$X/mes` y la comuna marcada en el meridiano, con 3 ejemplos.
  3. `og-btu-template.svg`: la comuna con sus BTU para enfriar y para calefaccionar, con 3 ejemplos (Arica, Santiago y Punta Arenas).
  4. `og-solar-template.svg`: la comuna, los kWp, el payback y la curva mensual de radiación, con 3 ejemplos (Calama, Santiago y Temuco).
  5. `og-tarifas`: barras de tarifa BT1 por región ordenadas de norte a sur.
  6. `og-guias`: una plantilla de título.

## 11. Criterios de aceptación
- [ ] No queda nada de la plantilla anterior: `grep` de `CL / 0`, `tool-card`, `energy-profile`, `Consolas` y `Segoe UI` da 0 resultados.
- [ ] Ninguna página dice «un lavadora», «un freidora» ni «un televisión». Hay un test que lo comprueba en las 3.000 páginas.
- [ ] Pasa la prueba de intercambio con los otros 5 sitios.
- [ ] Capturas a 1440 y 390 px de la home, Independencia/refrigerador, Puente Alto/BTU, Temuco/solar, `/tarifas/` y una guía, comparadas lado a lado con las piezas citadas.
- [ ] R001–R186 en verde y Lighthouse según §8. Las 3.000 URLs responden 200 con su canonical.

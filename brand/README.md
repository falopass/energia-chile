# Energía Chile

El isotipo de 16 px se generó aparte con un meridiano más grueso y un rayo cobre simplificado para conservar el contraste al tamaño real.

Identidad Meridiano. Logos, pictogramas y bases se generaron con ImageGen y se exportaron con sharp. La línea orientativa vertical con gradiente se integra a la identidad. La silueta regional y las capas con datos se incorporan en implementación a partir de fuentes reales.

Publicar iconos y manifest en la raíz. El icono maskable usa la zona segura circular del 80 %. Los tres pictogramas de consumo se entregan a 512 × 512 px en PNG y WebP con transparencia.

## Open Graph

Los orígenes se miden desde la esquina superior izquierda. Para valores largos, ajustar el tamaño hasta que la tinta ocupe como máximo 675 px. Epilogue ExtraBold en titulares y resultado. IBM Plex Sans Medium en rótulos.

| Base | Variable o rótulo | x | y | Tamaño px | Color |
|---|---|---:|---:|---:|---|
| Consumo | Consumo eléctrico · {LATITUD} | 72 | 70 | 31 | #1B36B8 |
| Consumo | {COMUNA} | 70 | 131 | 66 | #111820 |
| Consumo | {APARATO} | 72 | 235 | 42 | #4B5768 |
| Consumo | ${COSTO}/mes | 70 | 338 | 85 | #9C3A16 |
| Consumo | {KWH_MES} kWh/mes · estimación con tarifa BT1 | 72 | 470 | 30 | #4B5768 |
| Consumo | Pictograma de {APARATO} | 780 | 210 | Caja de 200 | Pictograma PNG |
| BTU | Climatización · {LATITUD} | 72 | 70 | 31 | #1B36B8 |
| BTU | {COMUNA} | 70 | 135 | 67 | #111820 |
| BTU | {BTU_FRÍO} BTU/h | 70 | 264 | 53 | #1B36B8 |
| BTU | Para enfriar | 72 | 332 | 28 | #4B5768 |
| BTU | {BTU_CALOR} BTU/h | 70 | 398 | 53 | #9C3A16 |
| BTU | Para calefaccionar · ambiente de {ÁREA} m² | 72 | 473 | 28 | #4B5768 |
| Solar | Energía solar · {LATITUD} | 72 | 70 | 31 | #8F5B00 |
| Solar | {COMUNA} | 70 | 135 | 69 | #111820 |
| Solar | {KWP} kWp | 70 | 250 | 84 | #1B36B8 |
| Solar | Retorno estimado · {AÑOS} años | 72 | 381 | 40 | #4B5768 |
| Solar | Referencia · {KWH_MES} kWh/mes | 72 | 482 | 28 | #4B5768 |
| Guías | {TÍTULO}, hasta tres líneas de 82 px | 70 | 125 | 68 | #111820 |
| Guías | Energía Chile, rótulo opcional | 72 | 450 | 30 | #1B36B8 |

En `og-solar-base.png`, el hueco para radiación mensual es x=744 a 1090, y=175 a 490. En `og-tarifas`, el panel de barras BT1 comienza en x=750. El meridiano geográfico y el marcador posicionado por latitud son capas de implementación. Los ejemplos contienen la latitud real como texto.

Consumo usa los aparatos y la primera tarifa BT1 de cada comuna según `src/data/generated.json` y `src/lib/calc.js`. BTU usa 15 m² y el tamaño comercial recomendado en ambos modos. Solar usa la simulación del sitio para 250 kWh/mes, cobertura objetivo 80 % y paneles de 550 W.

Epilogue e IBM Plex Sans se descargaron del [directorio Epilogue de Google Fonts](https://github.com/google/fonts/tree/main/ofl/epilogue) y [directorio IBM Plex Sans de Google Fonts](https://github.com/google/fonts/tree/main/ofl/ibmplexsans). Ambos usan SIL Open Font License 1.1. Copias en `_tools/Epilogue-OFL.txt` y `_tools/IBMPlexSans-OFL.txt`.

## Archivos

- logo/16.png
- logo/apilado.png
- logo/horizontal.png
- logo/isotipo.png
- logo/mono-blanco.png
- logo/mono-grafito.png
- icons/apple-touch-icon.png
- icons/favicon-96x96.png
- icons/favicon.ico
- icons/icon-192.png
- icons/icon-512.png
- icons/icon-maskable-512.png
- icons/manifest.webmanifest
- og/og-btu-arica.png — 124422 bytes
- og/og-btu-base.png — 110557 bytes
- og/og-btu-punta-arenas.png — 124881 bytes
- og/og-btu-santiago.png — 124714 bytes
- og/og-consumo-arica-aire-acondicionado.png — 104297 bytes
- og/og-consumo-base.png — 88054 bytes
- og/og-consumo-independencia-refrigerador.png — 111584 bytes
- og/og-consumo-santiago-lavadora.png — 118913 bytes
- og/og-guias-base.png — 146029 bytes
- og/og-home.webp — 30948 bytes
- og/og-solar-base.png — 143209 bytes
- og/og-solar-calama.webp — 20260 bytes
- og/og-solar-santiago.webp — 21018 bytes
- og/og-solar-temuco.webp — 20444 bytes
- og/og-tarifas.webp — 20542 bytes
- pictos/aire-acondicionado.png
- pictos/aire-acondicionado.webp
- pictos/lavadora.png
- pictos/lavadora.webp
- pictos/refrigerador.png
- pictos/refrigerador.webp
- _lamina.png
- PROMPTS.md

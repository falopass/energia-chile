# energia-chile

Sitio programático de consumo eléctrico, BTU y paneles solares por comuna de Chile.

**Producción:** https://energia-chile.ddiegosebastianbb.workers.dev/

- 3.353 URLs indexables validadas en `scripts/test.mjs`.
- 328 comunas con tarifas residenciales procesadas.
- 7 aparatos, calculadora BTU y estimador solar/netbilling.
- Documento completo de operación y pendientes: [`docs/TRASPASO.md`](docs/TRASPASO.md).

## Comandos

```bash
npm install
npm test
npm run dev
npm run deploy
```

`npm test` construye el Worker y valida las 3.353 URLs, sitemap, robots, ads.txt y páginas clave.

## Frontend Meridiano

Identidad Meridiano: lienzo glaciar, azul Atacama y cobre, con el perfil latitudinal de Chile como navegación e instrumento.
Sin imágenes vectoriales ni emojis. Navegación local entre herramientas, buscador de las 328 comunas,
contadores animados, radiación NASA POWER en 12 barras CSS y comparaciones de tarifas con fuentes intactas.
Las animaciones respetan `prefers-reduced-motion`; el contenido permanece visible sin JavaScript.

`npm test` recorre las 3.353 páginas y audita fuentes y bundle. Para probar interacción real:

```bash
npm run dev -- --port 8795
npm run test:ui
```

El test UI usa `agent-browser`. Tras desplegar y verificar producción:

```bash
npm run submit:indexnow -- --dry-run
npm run submit:indexnow
```

El envío valida sitemap y clave pública y manda las 3.353 URLs en lotes de 500 (`--batch=N` lo cambia),
porque la API responde 403 a un único envío de todas. Un envío aceptado no garantiza indexación.
`ads.txt` usa el editor `pub-4950005977906560`; la aprobación de AdSense y Search Console son pasos externos.

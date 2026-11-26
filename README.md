# energia-chile

Sitio programático de consumo eléctrico, BTU y paneles solares por comuna de Chile.

**Producción:** https://energia-chile.ddiegosebastianbb.workers.dev/

- 3.000 URLs indexables validadas en `scripts/test.mjs`.
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

`npm test` construye el Worker y valida las 3.000 URLs, sitemap, robots, ads.txt y páginas clave.

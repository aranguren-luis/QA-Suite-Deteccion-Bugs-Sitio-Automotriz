<h1 align="center">QA Suite — Detección de Bugs en Sitio Automotriz</h1>
<p align="center">Suite de automatización Playwright (caja negra) que reproduce 20 bugs reales, ya confirmados manualmente, contra el sitio público de un concesionario de vehículos construido en Next.js — sin login ni backend propio bajo prueba.</p>

<p align="center">
  <img alt="Playwright" src="https://img.shields.io/badge/Playwright-45ba4b?style=flat-square&logo=playwright&logoColor=white">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white">
  <img alt="Bun" src="https://img.shields.io/badge/Bun-000000?style=flat-square&logo=bun&logoColor=white">
</p>

## Tech Stack QA

| Tecnología | Uso en la suite |
|---|---|
| Playwright (`@playwright/test`) | Automatización de navegador real (Chromium + Firefox) contra el sitio público bajo prueba (`BASE_URL`), sin acceso a su backend |
| TypeScript | Tipado estricto en specs y helpers |
| Bun | Runtime, gestor de paquetes y carga de `.env` |
| `node:zlib` (sin dependencias extra) | Decodificador PNG propio (`tests/png-decode.ts`) para muestrear píxeles reales de un screenshot y medir contraste — BUG-07 |

## Técnicas de QA Aplicadas

| Técnica | Ejemplo en la suite |
|---|---|
| Caja negra sobre un sitio de terceros | Las 20 specs reproducen bugs ya confirmados manualmente, sin acceso al código ni al backend del sitio |
| Accesibilidad (a11y) | Más de un `<h1>` por página (BUG-12), input de búsqueda sin label accesible ni foco visible (BUG-13), contraste de texto/fondo medido por decodificación de PNG real (BUG-07) |
| SEO técnico | `robots.txt`/`sitemap.xml`/canonical/Open Graph/JSON-LD apuntando a `localhost` en QA (BUG-14), Open Graph genérico sin parametrizar por página (BUG-15) |
| Seguridad superficial (headers) | CSP sin `unsafe-eval` provocando crash en Firefox (BUG-01), `frame-src` bloqueando un iframe legítimo (BUG-05), `style-src-attr` con `unsafe-inline` sin nonce (BUG-16) |
| Contenido y consistencia | Texto de relleno "Lorem Ipsum" publicado como noticia real (BUG-06), pluralización incorrecta "1 cuotas" (BUG-10), tres nombres distintos para la misma categoría (BUG-08) |
| Recursos e imágenes | Imagen duplicada entre dos vehículos (BUG-03), imagen rota con respuesta 400 (BUG-09), imagen servida dos veces — optimizada y sin optimizar (BUG-17), archivo mal ubicado entre carpetas (BUG-18) |
| Performance ligero (Core Web Vitals) | LCP/CLS/TTFB medidos con `PerformanceObserver` inyectado vía `page.addInitScript`, sin generar carga sostenida (BUG-17) |
| Contraste QA vs. producción | Verificación cruzada del mismo defecto en el ambiente de QA y en producción, vía `browser.newContext({ baseURL: PROD_URL })` (BUG-14, BUG-19, BUG-20) |

## Project Structure

```
.
├── tests/
│   ├── bug-01-....spec.ts  ...  bug-20-....spec.ts   # un archivo por bug confirmado
│   ├── helpers.ts                                     # luminancia relativa WCAG + contraste (BUG-07)
│   └── png-decode.ts                                  # decodificador PNG mínimo (node:zlib, sin deps extra)
├── playwright.config.ts   # BASE_URL por defecto, proyectos chromium + firefox-bug01
├── report/
│   ├── plan-de-pruebas.md             # Test Plan de la ronda de QA
│   └── hallazgos-sitio-automotriz.md  # Informe de hallazgos — 20 bugs con severidad y pasos de reproducción
└── .env.example
```

Se usan selectores directos (texto visible, `alt`, `href`, clases CSS observadas) en vez de un Page Object Model formal: es un solo sitio externo sin `data-testid` propios, y cada bug es un escenario aislado de una sola página — un POM añadiría indirección sin aportar valor real aquí.

## Key Files

```
tests/bug-07-repuestos-contraste-insuficiente.spec.ts   # Contraste WCAG medido sobre un screenshot real decodificado a mano
tests/bug-14-seo-localhost-3000.spec.ts                 # Fuga de localhost en metadatos SEO + contraste contra PROD_URL
tests/bug-19-cotizador-datos-mock-consultar.spec.ts      # Cotizador con datos mock, verificado en QA y producción
tests/helpers.ts                                        # Luminancia relativa WCAG y cálculo de ratio de contraste
tests/png-decode.ts                                     # Decodificador PNG propio (IHDR/IDAT, filtros de scanline, inflate)
playwright.config.ts                                     # baseURL, proyectos chromium/firefox, reporters
report/hallazgos-sitio-automotriz.md                     # Informe de hallazgos completo (20 bugs, severidad, evidencia)
```

## Test Coverage

| Spec | Bug detectado | Severidad |
|---|---|:---:|
| bug-01-firefox-csp-eval-crash.spec.ts | CSP sin `unsafe-eval` crashea Firefox de forma intermitente | High |
| bug-02-catalogo-vehiculos-sin-foto.spec.ts | 3 vehículos del catálogo sin foto real | Medium |
| bug-03-catalogo-foto-duplicada.spec.ts | Dos vehículos distintos comparten la misma foto | Medium |
| bug-04-categoria-garantia-sin-tilde.spec.ts | "CATEGORIA"/"GARANTIA" sin tilde en etiquetas cortas | Medium |
| bug-05-mapa-google-bloqueado-csp.spec.ts | Mapa de Google bloqueado por CSP (`frame-src`) | Medium |
| bug-06-noticias-lorem-ipsum.spec.ts | Artículo de noticias con texto de relleno "Lorem Ipsum" | Medium |
| bug-07-repuestos-contraste-insuficiente.spec.ts | Contraste de texto/fondo insuficiente (ratio ≈1.32, AA exige 4.5) | Medium |
| bug-08-catalogo-pickups-tres-nombres.spec.ts | Tres nombres distintos para la misma categoría | Low |
| bug-09-noticias-imagen-rota-400.spec.ts | Imagen del artículo destacado responde 400 | Low |
| bug-10-cotizacion-un-cuotas-pluralizacion.spec.ts | "1 cuotas" — pluralización incorrecta | Low |
| bug-11-noticias-fuera-del-menu.spec.ts | "Noticias" solo existe en el footer, no en el menú principal | Low |
| bug-12-mas-de-un-h1-por-pagina.spec.ts | Más de un `<h1>` en 7 de 9 páginas revisadas | Low |
| bug-13-catalogo-buscador-sin-label-sin-foco.spec.ts | Buscador sin label accesible ni foco visible por teclado | Medium |
| bug-14-seo-localhost-3000.spec.ts | Metadatos SEO apuntan a `localhost:3000` (solo en QA) | Medium |
| bug-15-open-graph-generico.spec.ts | Open Graph y JSON-LD genéricos, no varían por página | Medium |
| bug-16-csp-style-src-attr-unsafe-inline.spec.ts | `style-src-attr` con `unsafe-inline` sin nonce | Low |
| bug-17-home-carousel-imagen-duplicada.spec.ts | Imagen del carrusel cargada dos veces (142 KB + 4 MB) | Medium |
| bug-18-noticias-banner-imagen-carpeta-autos.spec.ts | Banner de evento guardado en la carpeta de fotos de vehículos | Low |
| bug-19-cotizador-datos-mock-consultar.spec.ts | Cotizador con montos/cuotas erróneos (datos mock) | High |
| bug-20-redes-sociales-footer-sin-cuenta-oficial.spec.ts | Íconos de redes sociales sin apuntar a la cuenta oficial | Low |

**20 specs, 34 tests** (incluye casos de contraste QA-vs-producción en BUG-14/19/20 y el best-effort de 12 recargas en BUG-01) — los 34 pasan hoy, confirmando que los 20 bugs siguen presentes. Ver el detalle completo, causa raíz y pasos de reproducción manual en [`report/hallazgos-sitio-automotriz.md`](report/hallazgos-sitio-automotriz.md).

## How to Run

```bash
bun install
bunx playwright install chromium firefox
cp .env.example .env   # configurar BASE_URL (y opcionalmente PROD_URL)
bun run test           # suite completa (chromium + firefox)
```

```bash
bun run test:chromium   # solo chromium (19 bugs — todos menos BUG-01)
bun run test:firefox    # solo firefox (BUG-01, depende del motor de Firefox)
bunx playwright test tests/bug-07-repuestos-contraste-insuficiente.spec.ts   # un bug puntual
bun run report          # reporte HTML de la última corrida
```

### Contra producción

Los bugs que el informe original contrasta explícitamente contra producción (BUG-14, BUG-19,
BUG-20) requieren la variable `PROD_URL` — si no está definida, esos 3 tests de contraste
lanzan un error explícito en vez de apuntar a un dominio real por defecto.

### Variables de Entorno

| Variable | Requerida | Descripción |
|---|:---:|---|
| `BASE_URL` | **Sí** | URL del ambiente de QA/demo bajo prueba |
| `PROD_URL` | No | URL de producción, solo usada por los 3 tests de contraste QA-vs-producción (BUG-14, BUG-19, BUG-20) |

Todos los valores de ejemplo en `.env.example` son sintéticos — nunca credenciales ni dominios reales.

## Documentación

| Reporte | Contenido |
|---|---|
| [Plan de Pruebas](report/plan-de-pruebas.md) | Alcance, estrategia de 10 tipos de prueba, riesgos y criterios de salida de la ronda de QA |
| [Hallazgos — Sitio Automotriz](report/hallazgos-sitio-automotriz.md) | Los 20 bugs confirmados: severidad, causa raíz y pasos de reproducción manual |

Esta copia pública no incluye capturas de pantalla ni otro material gráfico de evidencia.

## Notas Técnicas

Esta suite aplica una semántica de TDD invertida, propia de QA de caja negra sobre software ya construido por un tercero: **un test en VERDE (pasa) confirma que el bug sigue presente** — es el resultado correcto y esperado hoy, porque los 20 defectos ya fueron confirmados en vivo antes de automatizarlos. Un test en ROJO (falla) es la posible buena noticia de que el sitio corrigió ese defecto puntual: la señal para volver a auditar manualmente ese punto y actualizar `report/hallazgos-sitio-automotriz.md`, no para "arreglar" el test. No hay TDD clásico (RED → GREEN → REFACTOR) porque no hay código de producción propio que implementar: la "producción" bajo prueba es el sitio de un tercero, ya desplegado. Cada spec (`tests/bug-NN-*.spec.ts`) tiene un comentario de una línea al inicio recordando esta misma semántica.

- **BUG-01**: el error de consola por CSP (`script-src` sin `unsafe-eval`) es 100% reproducible y es la aserción dura. El crash intermitente ("App Error") es best-effort: se reintenta 12 veces y se loggea el ratio observado, sin un `expect` duro sobre que debe ocurrir al menos una vez.
- **BUG-07** (contraste insuficiente): se toma un screenshot real de cada tarjeta, se decodifica el PNG a mano (`tests/png-decode.ts`, solo `node:zlib` para el `inflate` de los chunks `IDAT`), y se busca el píxel de fondo más brillante dentro del bounding box del título que no sea parte del glyph blanco. Ese es el punto donde el texto blanco es menos distinguible del fondo. Contraste WCAG estándar (`tests/helpers.ts`) entre ese punto y el color del texto (vía `getComputedStyle`).
- **BUG-17**: se usa `page.waitForResponse()` para las dos URLs esperadas (versión optimizada vía `_next/image` y versión directa sin optimizar) en vez de sondear `performance.getEntriesByType('resource')` tras un tiempo fijo — más confiable, porque el Resource Timing Buffer del navegador no siempre conserva/expone la entrada esperada de forma determinística bajo polling.
- **BUG-14/19/20**: cada uno incluye su propio test de contraste contra `PROD_URL` (vía `browser.newContext({ baseURL: ... })`) para confirmar si el defecto es específico del ambiente de QA o también existe en producción.
- Todo dato de contacto (números de WhatsApp) mostrado en los specs es sintético — reemplazado respecto al original para esta copia pública.
- Nunca se completa el envío de un formulario real ni se hace click en links de WhatsApp — solo se lee el atributo `href`. No hay fuzzing, intrusión activa, ni carga sostenida.

<p align="center"><strong>QA Engineering · Playwright · Black-Box Testing · Accessibility · SEO · TypeScript</strong></p>

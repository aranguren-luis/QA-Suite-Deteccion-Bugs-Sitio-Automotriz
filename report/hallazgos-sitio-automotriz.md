# Hallazgos — Sitio Automotriz (QA)

Ambiente: ambiente de QA bajo prueba (ver `BASE_URL` en el `.env.example` de la suite de automatización). Cuando se indica contraste con producción, ver `PROD_URL`.

Estructura por hallazgo: Severidad / Dónde / Causa / Pasos para reproducir.

## Resumen

| # | Título | Severidad | Dónde |
|---|---|---|---|
| BUG-01 | Crash intermitente en Firefox por bloqueo de CSP (`eval`) | **High** | `/tipos-de-compra` (y el resto del sitio en Firefox) |
| BUG-02 | 3 vehículos del catálogo sin foto real | Medium | `/catalogo` |
| BUG-03 | Dos vehículos distintos usan la misma foto | Medium | `/catalogo` |
| BUG-04 | "CATEGORIA"/"GARANTIA" sin tilde en etiquetas cortas | Medium | Footer, cotizador, `/garantia` |
| BUG-05 | Mapa de Google no carga (bloqueado por CSP) | Medium | `/sobre-nosotros` |
| BUG-06 | Artículo de Noticias con texto de relleno ("Lorem Ipsum") | Medium | `/noticias` |
| BUG-07 | Contraste insuficiente en tarjetas de `/repuestos` | Medium | `/repuestos` |
| BUG-08 | Tres nombres distintos para la categoría "Pickups" | Low | `/catalogo`, menú/footer |
| BUG-09 | Imagen rota en artículo de Noticias (error 400) | Low | `/noticias` |
| BUG-10 | "1 cuotas" — pluralización incorrecta | Low | `/cotizacion` (modalidad Contado) |
| BUG-11 | "Noticias" no está en el menú principal | Low | Header de todas las páginas |
| BUG-12 | Más de un `<h1>` por página en 7 de 9 páginas revisadas | Low | Casi todo el sitio |
| BUG-13 | Campo de búsqueda del catálogo sin label y sin foco visible al navegar por teclado | Medium | `/catalogo` |
| BUG-14 | `robots.txt`, `sitemap.xml`, canonical, Open Graph y JSON-LD apuntan a `localhost:3000` (solo en QA) | Medium | Todo el sitio, ambiente QA |
| BUG-15 | Open Graph y datos estructurados son genéricos — no reflejan el contenido de cada página | Medium | Todo el sitio |
| BUG-16 | CSP permite `style-src-attr 'unsafe-inline'` (sin nonce, a diferencia del resto de las directivas de estilo) | Low | Todo el sitio |
| BUG-17 | Home carga la imagen del carrusel dos veces — una optimizada (142 KB) y una sin optimizar (4 MB) | Medium | Home |
| BUG-18 | Banner de evento en Noticias usa una imagen guardada en la carpeta de fotos de vehículos (`vehicle-photo-misplaced.png`), pendiente de renombrar/reubicar | Low | `/noticias` |
| BUG-19 | Cotizador con montos y cuotas erróneos — causa real: datos mock/placeholder, mitigado ocultando el monto (no corregido de fondo) | **High** | `/cotizacion` (QA y producción) |
| BUG-20 | Íconos de redes sociales del footer (Instagram/Facebook/TikTok) no llevan a la cuenta oficial, solo a la homepage genérica de cada plataforma | Low | Footer de todas las páginas |

---

### BUG-01 — Crash intermitente en Firefox por bloqueo de CSP (`eval`)

| Field | Detail |
|---|---|
| Severity | **High** |
| Dónde | `/tipos-de-compra` (el error de CSP aparece en todas las páginas; el crash se observó puntualmente acá) |
| Cause | La Content-Security-Policy del sitio no incluye `'unsafe-eval'` en `script-src`. Algún script (`_next/static/chunks/2iiar_8bwmnfc.js`) ejecuta `eval()`/`new Function()` en tiempo de ejecución — Firefox lo bloquea y, de forma intermitente (aprox. 1 de cada 9 cargas en esta verificación), la excepción resultante no se maneja y tumba toda la página con un error de aplicación. Chromium no muestra este error. |

**Pasos para reproducir:**
1. Abrir **Firefox** (no reproduce en Chrome/Edge).
2. Ir a `BASE_URL/tipos-de-compra`.
3. Abrir la consola (F12) — aparece el error de CSP en cada carga (ver evidencia abajo).
4. Recargar la página varias veces seguidas (en esta verificación, 9 veces). En alguna de las recargas, en vez del contenido normal aparece un error de aplicación ("App Error") y la página no se usa.

**Evidencia** (sin captura — el fallo es de consola y aparece de forma intermitente, no hay un momento fijo que fotografiar):
```
Content-Security-Policy: The page's settings blocked a JavaScript eval (script-src)
from being executed because it violates the following directive: "script-src 'self'
'nonce-...' 'strict-dynamic' https://www.google.com https://www.gstatic.com
https://www.recaptcha.net" (Missing 'unsafe-eval')
```

---

### BUG-02 — 3 vehículos del catálogo sin foto real

| Field | Detail |
|---|---|
| Severity | Medium |
| Dónde | `/catalogo` |
| Cause | El campo de imagen de estos 3 vehículos apunta a un placeholder (`/images/not-found/sin-foto-v2.png`) en vez de a una foto real del modelo. |

**Pasos para reproducir:**
1. Ir a `BASE_URL/catalogo`.
2. Buscar las tarjetas: **LA VENEZOLANA 4X2 DIÉSEL 2.8L**, **T5 LA VENEZOLANA 4X2 DIÉSEL 2.8L**, **AVENTURA 4X4 AUTOMÁTICA**.
3. Las 3 muestran un gráfico de "cinta de precaución — NO HAY FOTO DISPONIBLE" en vez de una foto del vehículo.

---

### BUG-03 — Dos vehículos distintos usan la misma foto

| Field | Detail |
|---|---|
| Severity | Medium |
| Dónde | `/catalogo` |
| Cause | Ambas tarjetas referencian el mismo archivo de imagen (`/images/autos/venezolana-pro.png`) en el campo de foto del vehículo. |

**Pasos para reproducir:**
1. Ir a `BASE_URL/catalogo`, categoría **Pickups**.
2. Comparar las tarjetas **LA VENEZOLANA PRO 4X4** y **PICKUP LIMITED AUTOMÁTICA**: ambas muestran exactamente la misma fotografía (mismo ángulo, mismo color de camioneta azul).
3. Confirmar en DevTools → Network/Elements que ambos `<img>` cargan la misma URL (`venezolana-pro.png`).

---

### BUG-04 — "CATEGORIA"/"GARANTIA" sin tilde en etiquetas cortas

| Field | Detail |
|---|---|
| Severity | Medium |
| Dónde | Footer (todas las páginas), widget del cotizador (toda ficha de vehículo), `/garantia` |
| Cause | Patrón sistemático: las etiquetas cortas tipo "overline" (encabezados de sección pequeños, en mayúsculas) no llevan tilde, mientras los títulos completos de las mismas palabras sí la llevan ("CATEGORÍA A-E", "GARANTÍA DE FÁBRICA", "GARANTÍA OFICIAL" sí están bien escritos). |

**Pasos para reproducir:**
1. Ir a `BASE_URL/` (o cualquier página) y bajar hasta el footer.
2. La primera columna del footer dice "CATEGORIA" — falta la tilde (debería ser "CATEGORÍA").
3. Para el mismo patrón con "GARANTIA": ir a cualquier ficha de vehículo → "Cotizar Aquí" → en el panel de detalle aparece la etiqueta "GARANTIA" sin tilde antes del texto "Años de Tranquilidad Absoluta". También se repite en `BASE_URL/garantia`, justo antes de la misma frase.

---

### BUG-05 — Mapa de Google no carga (bloqueado por CSP)

| Field | Detail |
|---|---|
| Severity | Medium |
| Dónde | `/sobre-nosotros` |
| Cause | La Content-Security-Policy del sitio no incluye el dominio exacto que usa el iframe del mapa en su directiva `frame-src` — el navegador bloquea el iframe y nunca se renderiza. |

**Pasos para reproducir:**
1. Ir a `BASE_URL/sobre-nosotros` y bajar hasta la sección de ubicaciones (pestañas Cagua/Barcelona/Valle La Pascua).
2. El área del mapa queda en blanco con el ícono de "recurso roto" en el centro, en vez de mostrar el mapa de Google.
3. Confirmar en consola: *"Framing 'https://maps.google.com/' violates the following Content Security Policy directive: frame-src 'self' https://www.google.com https://www.google.com/maps https://www.recaptcha.net. The request has been blocked."*

---

### BUG-06 — Artículo de Noticias con texto de relleno ("Lorem Ipsum")

| Field | Detail |
|---|---|
| Severity | Medium |
| Dónde | `/noticias` |
| Cause | Contenido de prueba (placeholder) que nunca se reemplazó por una noticia real antes de publicar la sección. |

**Pasos para reproducir:**
1. Ir a `BASE_URL/noticias`.
2. Bajar hasta la sección "Otras Noticias".
3. El primer artículo (14 de abril, 2026) tiene como título **"LOREM IPSUM DOLOR SIT AMET, CONSECTETUR"** y como cuerpo el párrafo de relleno estándar de Lorem Ipsum.

---

### BUG-07 — Contraste insuficiente en tarjetas de `/repuestos`

| Field | Detail |
|---|---|
| Severity | Medium |
| Dónde | `/repuestos` |
| Cause | El degradado oscuro aplicado sobre la foto de cada tarjeta (para que el título en blanco resalte) tiene una opacidad fija — no es suficiente cuando la foto de fondo es clara. |

**Pasos para reproducir:**
1. Ir a `BASE_URL/repuestos`.
2. Ver la tarjeta **"MOTOR Y TRANSMISIÓN"**: el título ya se lee con contraste reducido.
3. Ver las tarjetas **"CARROCERÍA E ILUMINACIÓN"** y **"ACCESORIOS Y CONFORT"** (fotos de faros, fondo claro): el título queda casi invisible.

---

### BUG-08 — Tres nombres distintos para la categoría "Pickups"

| Field | Detail |
|---|---|
| Severity | Low |
| Dónde | `/catalogo` (filtro y encabezado de sección), menú/footer |
| Cause | Inconsistencia de copy — el botón de filtro, el encabezado de la sección que ese mismo filtro despliega, y el menú/footer, usan tres textos distintos para la misma categoría. |

**Pasos para reproducir:**
1. Ir a `BASE_URL/catalogo` — el botón de filtro dice **"PICKUP'S"** (con apóstrofe, plural mal formado en español).
2. Hacer clic en ese botón — la sección que aparece tiene como encabezado **"PICK UP"** (dos palabras, sin la "S"), un texto distinto al del botón que se acaba de clickear.
3. Ir al menú o footer de cualquier página — ahí dice **"PICKUPS"** (sin apóstrofe), una tercera variante.

---

### BUG-09 — Imagen rota en artículo de Noticias (error 400)

| Field | Detail |
|---|---|
| Severity | Low |
| Dónde | `/noticias` |
| Cause | La imagen principal del artículo "Experience Fest" apunta a `elite.png` (`alt="Experience Fest"`) — una foto del vehículo ELITE J7, no del evento. El optimizador de imágenes de Next.js responde 400 para ese archivo. |

**Pasos para reproducir:**
1. Ir a `BASE_URL/noticias`.
2. El artículo destacado **"EXPERIENCE FEST: ADRENALINA PURA EN EL CIRCUITO DE SAN CARLOS"** no muestra su imagen — queda un fondo gris con el ícono de imagen rota.
3. Confirmar en consola/Network: `GET .../_next/image?url=%2Fimages%2Fautos%2Felite.png&w=3840&q=75` responde **400 (Bad Request)**.

---

### BUG-10 — "1 cuotas" — pluralización incorrecta

| Field | Detail |
|---|---|
| Severity | Low |
| Dónde | `/cotizacion`, modalidad "Contado" |
| Cause | Template de texto tipo `` `${cantidad} cuotas` `` sin lógica de singular/plural — se rompe únicamente cuando `cantidad = 1`. |

**Pasos para reproducir:**
1. Ir a cualquier ficha de vehículo, p. ej. `BASE_URL/catalogo/1`.
2. Clic en **"Cotizar Aquí"**.
3. En el panel de detalle (modalidad "Contado", seleccionada por defecto), el campo "CUOTAS" dice **"1 cuotas"** en vez de "1 cuota". Nótese que el panel resumen a la izquierda, en la misma pantalla, sí dice correctamente "1 Cuota" — confirma que es una inconsistencia entre dos componentes, no falta de datos.

---

### BUG-11 — "Noticias" no está en el menú principal

| Field | Detail |
|---|---|
| Severity | Low |
| Dónde | Header de todas las páginas |
| Cause | El link a `/noticias` solo se agregó al footer, no al componente de navegación principal. |

**Pasos para reproducir:**
1. Ir a `BASE_URL/` y mirar el menú superior: Home, Nosotros, Catálogo, Servicios, Repuestos — no hay "Noticias".
2. La única forma de llegar es bajar hasta el footer y hacer clic en "NOTICIAS", o escribir la URL `/noticias` directamente.

---

### BUG-12 — Más de un `<h1>` por página

| Field | Detail |
|---|---|
| Severity | Low |
| Dónde | `/sobre-nosotros`, `/catalogo`, `/servicios`, `/repuestos` (3), `/noticias`, `/garantia`, `/tipos-de-compra` (3) |
| Cause | No confirmada a nivel de código. Cada sección de la página parece usar su propio `<h1>` en vez de reservarlo para el título principal y usar `<h2>`/`<h3>` para el resto — rompe la jerarquía semántica que un lector de pantalla usa para navegar por encabezados. |

**Pasos para reproducir:**
1. Ir a cualquiera de las páginas listadas arriba.
2. Contar los `<h1>` en el DOM (DevTools → `document.querySelectorAll('h1').length`).
3. Confirmar que hay 2 o más (3 en `/repuestos` y `/tipos-de-compra`) — solo Home y la ficha de vehículo individual tienen exactamente 1.

**Evidencia:** sin captura (es un conteo de DOM, no un defecto visual).

---

### BUG-13 — Campo de búsqueda del catálogo sin label y sin foco visible

| Field | Detail |
|---|---|
| Severity | Medium |
| Dónde | `/catalogo` |
| Cause | El `<input placeholder="Buscar modelo...">` no tiene `id`, `aria-label` ni `<label>` asociado — el placeholder no es un sustituto accesible de un label. Además, su clase incluye `focus:outline-none focus:ring-0` sin ningún estilo alternativo de foco, confirmado por computed style (`outline-style: none`, `box-shadow` con offset 0 en todas las capas). |

**Pasos para reproducir:**
1. Ir a `BASE_URL/catalogo`.
2. Enfocar el campo "Buscar modelo..." con el teclado (Tab) o con `el.focus()` desde DevTools.
3. No hay ningún indicador visual de que el campo tiene el foco (sin borde, sin contorno, sin sombra).
4. Confirmar en DevTools → Accessibility que el campo no tiene nombre accesible (solo `placeholder`).

**Evidencia:** sin captura (el punto es precisamente la ausencia de un cambio visual) — confirmado por computed style:
```
outline-style: none
box-shadow: rgba(0,0,0,0) 0px 0px 0px 0px (todas las capas, sin offset)
```

---

### BUG-14 — `robots.txt`, `sitemap.xml`, canonical, Open Graph y JSON-LD apuntan a `localhost:3000`

| Field | Detail |
|---|---|
| Severity | Medium |
| Dónde | Todo el sitio, ambiente QA únicamente |
| Cause | La URL base del sitio para metadatos SEO quedó configurada (o cayó por defecto) a `https://localhost:3000` en vez del dominio real — se filtra en `robots.txt`, `sitemap.xml`, la etiqueta `canonical`, Open Graph (`og:image`) y el JSON-LD. **Confirmado que en producción (`PROD_URL`) estos mismos campos sí apuntan correctamente a su propio dominio** — el problema es específico de la configuración del ambiente de QA, sin impacto en el SEO real del sitio en producción hoy. Queda como riesgo de configuración (si la misma variable de entorno llegara a fallar en un deploy de producción) más que como un problema activo. |

**Nota aparte, dentro del mismo `robots.txt` de QA:** la directiva dice `Allow: /` (permite indexar todo el ambiente de QA) — si la intención es que un ambiente de QA no le importe a buscadores, lo consistente sería `Disallow: /`, no dejarlo abierto con un sitemap roto adentro.

**Pasos para reproducir:**
1. Ir a `BASE_URL/robots.txt` — la línea `Sitemap:` dice `https://localhost:3000/sitemap.xml` (URL inalcanzable para cualquier crawler real).
2. Ir a `BASE_URL/sitemap.xml` — el único `<url>` listado es `https://localhost:3000` (ni el dominio correcto, ni el resto de las páginas del sitio — catálogo, vehículos individuales, servicios, etc. no aparecen).
3. En cualquier página, inspeccionar `<link rel="canonical">` en el `<head>` — dice `https://localhost:3000/es` en las 9 páginas revisadas (siempre el mismo valor, nunca la URL real de la página).
4. Inspeccionar `<meta property="og:image">` — apunta a `https://localhost:3000/es/opengraph-image?...`.
5. Inspeccionar el `<script type="application/ld+json">` — su campo `"url"` también es `https://localhost:3000`.
6. Para contraste, repetir los pasos 1-5 en `PROD_URL` (producción) — ahí sí apunta correctamente a su propio dominio.

**Evidencia:**
```
robots.txt:
User-Agent: *
Allow: /
Disallow: /api/
Sitemap: https://localhost:3000/sitemap.xml

sitemap.xml:
<url><loc>https://localhost:3000</loc>...</url>   (único elemento, en las 2 corridas)

canonical (igual en las 9 páginas revisadas): https://localhost:3000/es
```

---

### BUG-15 — Open Graph y datos estructurados son genéricos

| Field | Detail |
|---|---|
| Severity | Medium |
| Dónde | Todo el sitio |
| Cause | `og:title`, `og:description`, `og:image` y el JSON-LD (`AutoDealer`) son idénticos en las 9 páginas revisadas — no se parametrizan con el contenido específico de cada página (vehículo, artículo, etc.), a diferencia de `<title>` y `meta description`, que sí están bien personalizados por página. |

**Pasos para reproducir:**
1. Ir a `/catalogo/1` (ARENA SPORT MANUAL) — el `<title>` y `meta description` sí mencionan el vehículo correctamente.
2. Inspeccionar `og:title`/`og:description`/`og:image` — dicen genéricamente "EL CONCESIONARIO" / "Descubre la experiencia de conducción..." / la misma imagen genérica, sin mencionar el vehículo.
3. Repetir en cualquier otra página (`/noticias`, `/servicios`, etc.) — mismo resultado: Open Graph siempre idéntico.
4. Consecuencia práctica: compartir el link de un vehículo específico por WhatsApp/Facebook muestra una vista previa genérica del sitio, no del vehículo.

**Evidencia:** `og:title`/`og:description`/`og:image` idénticos capturados en las 9 páginas revisadas (ver tabla de metadatos de la verificación), mientras `<title>` sí varía correctamente por página.

---

### BUG-16 — CSP permite `style-src-attr 'unsafe-inline'` (expone a inyección/exfiltración vía CSS)

| Field | Detail |
|---|---|
| Severity | Low |
| Dónde | Todo el sitio |
| Cause | La política CSP usa nonce correctamente en `script-src`, `style-src` y `style-src-elem`, pero `style-src-attr` está configurado como `'self' 'unsafe-inline'` — permite que cualquier atributo `style="..."` se aplique sin necesidad de nonce. |

**Pasos para reproducir:**
1. Pedir cualquier página y revisar el header `Content-Security-Policy` de la respuesta.
2. Confirmar que `style-src-attr` es `'self' 'unsafe-inline'`, sin nonce — a diferencia de `style-src`/`style-src-elem`, que sí usan `'nonce-...'`.

**Evidencia:**
```
style-src-attr 'self' 'unsafe-inline';
```
(dentro del header `Content-Security-Policy` completo, igual en Home y en `/catalogo/1`)

**Referencias (evidencia de por qué es un riesgo real, no solo teórico):**
- PortSwigger Research — ["Inline Style Exfiltration: leaking data with chained CSS conditionals"](https://portswigger.net/research/inline-style-exfiltration) — la técnica que depende exactamente de este vector (atributos `style` inline).
- PortSwigger Research — ["Blind CSS Exfiltration: exfiltrate unknown web pages"](https://portswigger.net/research/blind-css-exfiltration) — recomienda explícitamente no usar `unsafe-inline` en `style-src` como mitigación.

---

### BUG-17 — Home carga la imagen del carrusel dos veces (optimizada + sin optimizar)

| Field | Detail |
|---|---|
| Severity | Medium |
| Dónde | Home |
| Cause | La imagen del carrusel se carga dos veces: una vez optimizada vía Next.js Image (142 KB, la que realmente se ve como `<img>`) y otra vez sin optimizar como `background-image` CSS de un `<div>` absolutamente posicionado detrás (`/images/carousel/image.png`, **4 MB**, PNG sin comprimir). Ese segundo recurso representa el 88% del peso total de la página (4.59 MB de 5.2 MB aprox.). |

**Impacto medido:** Home es la página más pesada del sitio por un margen amplio (4.59 MB vs. 0.4-1.05 MB en el resto) y su LCP (Largest Contentful Paint) quedó en 2.4-2.9 segundos — en el límite entre "Good" (≤2.5s) y "Needs Improvement", mientras el resto de las páginas revisadas (Catálogo, ficha de vehículo, Repuestos, Noticias) sí quedaron cómodamente por debajo de 2.5s.

**Pasos para reproducir:**
1. Ir a `BASE_URL/` con DevTools → Network abierto, filtrando por "Img".
2. Buscar `/images/carousel/image.png` — aparece una vez vía `_next/image?url=...&w=1920&q=75` (aprox. 142 KB) y otra vez como `/images/carousel/image.png` directo, sin pasar por el optimizador (aprox. 4 MB).
3. En DevTools → Elements, inspeccionar el `<div class="absolute inset-0 bg-cover bg-center">` — su `background-image` computado apunta al archivo sin optimizar.
4. Confirmar con Performance/Lighthouse que este recurso es el elemento de LCP de la página (a través de la versión optimizada) y el principal contribuyente al peso total.

**Evidencia:**
```
Recurso 1 (optimizado, visible):  /_next/image?url=%2Fimages%2Fcarousel%2Fimage.png&w=1920&q=75   aprox. 142 KB
Recurso 2 (sin optimizar, CSS):   /images/carousel/image.png                                        aprox. 4047 KB
initiatorType del recurso 2: "css" (background-image de un <div>, no un <img>)
```

**Core Web Vitals medidos (referencia, todas las páginas):**

| Página | LCP | CLS | TTFB | Peso | Requests |
|---|---|---|---|---|---|
| Home | 2.4–2.9 s | 0.001 | aprox. 1278 ms | 4.59 MB | 54 |
| Catálogo | 2.06 s | 0.001 | aprox. 926 ms | 1.05 MB | 52 |
| Ficha de vehículo | 2.25 s | 0.035 | aprox. 963 ms | 0.42 MB | 53 |
| Repuestos | 2.0 s | 0.001 | aprox. 913 ms | 0.84 MB | 39 |
| Noticias | 2.5 s | 0.012 | aprox. 906 ms | 0.80 MB | 45 |

CLS excelente en todas las páginas (sin problemas de layout shift) — el único punto débil de Core Web Vitals es el LCP de Home, explicado por este hallazgo.

**Instrumento de medición:** LCP y CLS capturados con `PerformanceObserver` inyectado en cada página vía Playwright (`page.addInitScript`), escuchando las entradas `largest-contentful-paint` y `layout-shift` nativas del navegador; TTFB, peso total y conteo de requests desde `performance.getEntriesByType('resource')` (más el timing de navegación). El tamaño y `initiatorType` de cada recurso individual (lo que reveló la carga duplicada de la imagen del carrusel) también salió de `performance.getEntriesByType('resource')`, cruzado con `getComputedStyle(el).backgroundImage` para ubicar el elemento exacto.

---

### BUG-18 — Banner de evento en Noticias usa una imagen guardada en la carpeta de fotos de vehículos (`vehicle-photo-misplaced.png`)

| Field | Detail |
|---|---|
| Severity | Low |
| Dónde | `/noticias` — tarjeta/banner del artículo "EL EXPERIENCE FEST YA ESTÁ AQUÍ." |
| Cause | La imagen del banner (`alt="EL EXPERIENCE FEST YA ESTÁ AQUÍ."`) se sirve desde `/images/autos/vehicle-photo-misplaced.png` — la carpeta `autos/` se usa en todo el sitio para fotos de vehículos (`vehiculo-k7.png`, `js2-pro.png`, `venezolana-pro.png`, `elite.png`, etc.), pero esta imagen es un banner promocional de un evento, no la foto de un vehículo. `veneka` tampoco corresponde a ningún modelo de la gama del concesionario ni se reconoce como nombre del evento — parece un archivo mal nombrado y guardado en la carpeta equivocada. |

**Pasos para reproducir:**
1. Ir a `BASE_URL/noticias`.
2. Ubicar la tarjeta **"EL EXPERIENCE FEST YA ESTÁ AQUÍ."** (distinta del artículo destacado roto de BUG-09).
3. En DevTools → Network, confirmar que su imagen carga desde `/_next/image?url=%2Fimages%2Fautos%2Fvehicle-photo-misplaced.png&w=1080&q=75` (200 OK) — dentro de la carpeta de fotos de vehículos.

_Evidencia visual omitida en esta copia pública (capturas de pantalla no incluidas)._

---

### BUG-19 — Cotizador con montos y cuotas erróneos (causa real: datos mock/placeholder)

| Field | Detail |
|---|---|
| Severity | High |
| Dónde | `/cotizacion` — modalidad "Financiamiento Auto Club 24". Confirmado tanto en QA (`BASE_URL`) como en producción (`PROD_URL`). |
| Cause | Usa datos mock/placeholder erróneos para calcular montos y cuotas, en vez de la data real de financiamiento. Como mitigante temporal, se agregó un botón de contacto que redirige a un chat de WhatsApp para que el usuario consulte la cotización manualmente. |

**Pasos para reproducir:**
1. Ir a `/cotizacion` (QA o producción) y seleccionar cualquier vehículo.
2. Click en la modalidad **"Financiamiento Auto Club 24"**.
3. **Estado actual (mitigado):** el campo de precio/mensualidad muestra "Consultar" con un botón que redirige a WhatsApp — ya no se ve el monto incorrecto en pantalla.
4. **Comportamiento confirmado antes del mitigante** (ej. ELITE J7 2026, precio $31,000.00): la pestaña mostraba "24 cuotas de $775.00" — pero `24 × $775.00 = $18,600.00`, no cuadra con el precio. `$31,000.00 ÷ 40 = $775.00` exacto, señal de que el monto se calculó para un plazo de 40 cuotas con datos mock desalineados del contador mostrado en pantalla (24). La pestaña hermana "Financiamiento Banca Nacional", mismo vehículo, sí cuadraba (`24 × $1,291.66 ≈ $31,000.00`), confirmando que el problema era específico de este plan y no un bug general del cotizador.

_Evidencia visual omitida en esta copia pública (capturas de pantalla no incluidas)._

---

### BUG-20 — Íconos de redes sociales del footer no llevan a la cuenta oficial

| Field | Detail |
|---|---|
| Severity | Low |
| Dónde | Footer de todas las páginas. Confirmado tanto en QA (`BASE_URL`) como en producción (`PROD_URL`). |
| Cause | Los íconos de Instagram, Facebook y TikTok del footer apuntan a la homepage genérica de cada plataforma (`https://instagram.com/`, `https://facebook.com/`, `https://tiktok.com/`), no a la cuenta/perfil oficial del concesionario. Solo el ícono de WhatsApp está bien configurado (usa el número real de contacto). |

**Pasos para reproducir:**
1. Ir a cualquier página y bajar hasta el footer, sección "REDES SOCIALES".
2. Inspeccionar el `href` de los íconos Instagram/Facebook/TikTok (DevTools → Elements, o clic derecho → copiar enlace).
3. Confirmar que los tres apuntan a la homepage genérica de la plataforma (`instagram.com/`, `facebook.com/`, `tiktok.com/`), no a un perfil específico del concesionario.

_Evidencia visual omitida en esta copia pública (capturas de pantalla no incluidas)._


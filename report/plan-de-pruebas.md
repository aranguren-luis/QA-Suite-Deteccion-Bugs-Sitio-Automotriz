# Sitio Automotriz
Plan de Pruebas — Ambiente de QA

## 1. Introducción y objetivo

Ejecutar una ronda de pruebas multi-técnica sobre el sitio de QA del concesionario bajo prueba (`BASE_URL`, ver `.env.example` de la suite de automatización), maximizando la detección de bugs e imperfecciones mediante varios tipos de prueba complementarios.

## 2. Alcance

**Dentro de alcance** — `BASE_URL` completo:

- Home, Sobre Nosotros, Catálogo (listado + fichas individuales de cada vehículo), Servicios, Repuestos, Noticias, Tipos de Compra, Garantía/Términos/Condiciones.
- Flujo de cotización por vehículo y sus 3 modalidades de financiamiento.
- Enlaces de WhatsApp (botón flotante + "Consultar"/"Cotizar Aquí") — solo validación del link y mensaje prellenado, sin completar el envío.
- Enlaces a redes sociales — solo verificar que resuelven, sin interactuar con la red social.

**Fuera de alcance:**

- Pruebas de intrusión activa (payloads reales de SQLi/XSS, fuzzing agresivo, escaneo de vulnerabilidades automatizado tipo ZAP/Burp activo).
- Pruebas de carga sostenida (k6 u otra herramienta).
- Enviar formularios/leads reales que lleguen a un vendedor humano, o completar el envío de un mensaje dentro de WhatsApp.

## 3. Estrategia — tipos de prueba a aplicar

| # | Tipo de prueba | Qué busca | Herramienta |
|---|---|---|---|
| 1 | **Regresión dirigida** | Re-verificar los hallazgos previos en este mismo ambiente (¿cambió algo desde el 2026-10-08?), más cualquier hallazgo nuevo que surja durante la ronda | Playwright + revisión manual |
| 2 | **Funcional / caja negra** | Flujos núcleo: navegación completa, catálogo, ficha de vehículo, cotizador y sus 3 modalidades, planes de compra, filtros de categoría | Playwright |
| 3 | **Contenido y consistencia** | Ortografía, tildes, cifras que no cuadran, nombres de categoría inconsistentes, contenido de relleno, textos duplicados/placeholder | Revisión manual |
| 4 | **UI responsive / cross-viewport** | Layout roto en mobile/tablet/desktop, elementos solapados, imágenes que no escalan | Playwright (viewports múltiples) |
| 5 | **Cross-browser** | Diferencias de render/comportamiento entre navegadores | Playwright (Chromium / Firefox) |
| 6 | **Accesibilidad** | Roles ARIA, alt text en imágenes, contraste, navegación por teclado, foco visible | Playwright (snapshot de accesibilidad) |
| 7 | **Enlaces y recursos** | Links rotos (404), errores de consola, errores de red, recursos bloqueados por CSP | Playwright (consola y red) |
| 8 | **SEO técnico** | Metadatos (title/description), `robots.txt`, sitemap, datos estructurados, encabezados jerárquicos | Revisión técnica |
| 9 | **Seguridad superficial, no intrusiva** | Headers de seguridad HTTP (CSP, HSTS, X-Frame-Options), exposición de info sensible en errores, mixed content | Inspección de headers |
| 10 | **Performance ligero** | Core Web Vitals (LCP/CLS/INP), tiempo de carga — sin generar carga sostenida real | Lighthouse/PageSpeed; k6 solo con autorización previa |

## 4. Riesgos y mitigaciones

| ID | Riesgo | Impacto | Mitigación |
|---|---|---|---|
| R1 | Enviar un formulario/WhatsApp real genera un lead falso a un vendedor humano (el número es real aunque el sitio sea de QA) | Impacto reputacional/operativo real para el negocio | Nunca completar el envío; solo validar `href`/texto prellenado |

## 5. Criterios de entrada y salida

**Entrada:** sitio accesible públicamente, plan validado.

**Salida — umbrales medibles:**
- **100%** de los hallazgos previos re-verificados (igual / mitigado / resuelto / nueva variante).
- **10/10** tipos de prueba de la tabla §3 con al menos un pase ejecutado.
- **100%** de los hallazgos (20 en total al cierre de esta ronda) con severidad asignada y evidencia adjunta.

## 6. Entregables

- Este plan de pruebas.
- Informe de hallazgos de la ronda en QA, con severidad y evidencia por bug (`hallazgos-sitio-automotriz.md`).
- Evidencia (capturas, request/response, hrefs) junto al informe — omitida en esta copia pública.
- Notas de bug actualizadas por cada hallazgo confirmado.
- Trazabilidad de los 20 hallazgos confirmados en un gestor de tickets (fuera del alcance de esta copia pública).

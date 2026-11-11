# Backlog y plan de entregables de Radar

El avance se lleva por **sesiones de trabajo** (~3 h cada una), no por fechas de calendario.
Apetito: ~3 sesiones por entregable. Si no cabe, se recorta alcance, no se agregan sesiones.
Después de cada entregable: usarlo al menos 3 veces antes de dar por cerrado el siguiente.

## Plan

| Entregable | Contenido | Sesiones | Estado |
|---|---|---|---|
| E1 | Esqueleto + Mis gráficas, publicado en GitHub Pages | 3 (S1 a S3) | En curso · S1 y S2 hechas, sigue S3 |
| E2 | Plazos fijos (con `Api.gs` leyendo Sheets) | 3 | Pendiente |
| E3 | Datos automáticos con Apps Script + PWA | 3 | Pendiente |
| Revisión | ¿Se usa? ¿Sigue el ritmo? ¿Qué sigue? | 1, al terminar E3 | — |
| Fundamentales | Tabla propia con P/E, P/E forward y otras métricas (Apps Script + API + Sheets) | 3 | Tentativo · después de E3; su número y su orden frente a E4 se fijan en la revisión |
| E4 | Mis reglas | 3 | Tentativo |
| E5 | Tipo de cambio | 3 | Tentativo |
| E6 | Calculadoras | 3 | Tentativo |
| E7 | Metas de ahorro | — | Tentativo |
| E8 | Flujo de efectivo (Plantilla 1) | — | Tentativo |

## Detalle por entregable

### E1 · Esqueleto + Mis gráficas (en GitHub Pages)

| Sesión | Qué se construye | Qué queda funcionando | Estado |
|---|---|---|---|
| S1 | Repositorio `tgphector/radar-finanzas` con Pages activo. Esqueleto: menú lateral (laptop) y barra inferior (celular), router, design system, pie con aviso, `memoria.js`, `ui.js`, `simbolos.json`. 6 tarjetas de favoritos con mini gráfico | Enlace público con menú, #/graficas con los 6 favoritos, #/plazos con "Próximamente", aviso en el pie | **Hecha (10 nov 2026).** Revisada en la página publicada en laptop y celular. Quedó para S2: probar los otros 39 símbolos |
| S2 | **Primero:** probar los 39 símbolos restantes en TradingView y corregir `simbolos.json`. Luego: tabla por pestañas (Populares, ETFs, Otros, Referencias), chips de símbolos, botón "Editar" con interruptor por símbolo guardado en el navegador, carga diferida | Activar y desactivar símbolos y que se recuerde al volver; solo cargan los activos y visibles | **Hecha (11 nov 2026).** Los 45 símbolos cargan (QBTS corregido a NASDAQ). El clic en un chip abre un gráfico simple de 1 año. Revisada en la página publicada |
| S3 | Gráfico grande con selector 1d / 5d / 1m / 1a / 5a (reemplaza al gráfico simple que hoy abre el chip), fuente y hora en cada bloque, pruebas (sin conexión, localStorage bloqueado, celular) | E1 terminado según la definición de terminado | Siguiente |

- **Lista de símbolos y diseño de la vista:** sección 11 de `docs/arquitectura.md`.
- **Buscador de símbolos (S3, condicional):** si el widget que se elija para el gráfico grande trae buscador propio, se activa en la S3 para ver cualquier símbolo, no solo los de `simbolos.json`. El gráfico avanzado de TradingView tiene la opción `allow_symbol_change` (aparece en su script; falta verla funcionando). Si el widget elegido no trae buscador, no se construye uno propio en E1. Límite conocido: la página no puede leer qué símbolo buscó el usuario dentro del widget, así que el título y los chips de Radar no cambian con la búsqueda.
- **Recortable si no cabe:** edición de favoritos desde la interfaz (se dejan fijos por defecto).
- **Riesgo:** algún símbolo no disponible en los widgets gratuitos de TradingView.

### E2 · Plazos fijos
- Ranking por TREA a 1 año, con selector soles / dólares, fuente y fecha SBS.
- Simulador: monto, plazo, moneda y tipo de entidad (opciones según SBS). Al simular, el nuevo ranking reemplaza al de arriba.
- Etiqueta "Cubierto por el FSD" con el monto vigente de la fuente oficial.
- Resultados marcados como "estimado" cuando la SBS no publica la tasa exacta.
- Crear el archivo **"Radar · Base de datos"** en Google Sheets con las hojas `tasas_pf`, `fsd`, `fuentes` y `log`; llenar `tasas_pf` a mano (con ayuda de Claude) en esta etapa.
- **`Api.gs` con `doGet`** publicado como app web: entrega `tasas` y `fsd` en JSON con caché. `datos.js` y `config.js` en la página leen esa app web. Una sola copia de los datos: la hoja.
- **Primer paso:** revisar qué tablas publica la SBS (plazos, montos, monedas) y definir las columnas de `tasas_pf`.
- **Recortable:** filtro por tipo de entidad.
- **Plan B:** si la página no logra leer la app web, las tasas van en un archivo JSON del repositorio hasta E3.

### E3 · Datos automáticos (Apps Script) + PWA
- **Apps Script:** `ActualizarTasas.gs` lee la SBS con `UrlFetchApp` y escribe en `tasas_pf` y `historial_tasas`; activador diario a las 8:00; errores a la hoja `log`.
- Copia del código `.gs` en `/apps-script` del repositorio.
- Radar instalable como app (PWA), contador de visitas sin cookies y correo de alerta si la actualización falla dos días seguidos.
- **Recortable:** PWA, contador y correo pasan a E4 si no caben.
- **Riesgo:** si la SBS no se puede leer con un script, la hoja se llena a mano una vez por semana y se documenta.

### E4 · Mis reglas
- El usuario registra posiciones y objetivos (en su navegador): "salir con +10%", "revisar cada mes".
- **Precios para las reglas:** `ActualizarPrecios.gs` trae precios de cierre desde una API gratuita (clave en `PropertiesService`) y escribe en la hoja `precios`. Elegir la API y revisar sus límites y términos al iniciar E4.
- Alerta visual cuando una posición llega a su objetivo o a su fecha de revisión (con precios de cierre del día anterior, no en tiempo real).
- Botón "Exportar / Importar" de la configuración personal.
- Depende de las reglas que salgan del Laboratorio de Estrategia.

### Fundamentales (tentativo, después de E3)
Idea de Héctor (11 nov 2026). Nada decidido todavía: se detalla en la revisión posterior a E3.

- **Qué es:** una tabla propia de Radar (no un widget) con métricas por símbolo. El widget de cotizaciones de TradingView no permite columnas propias.
- **Flujo, igual al del resto:** `ActualizarFundamentales.gs` (activador) → API con clave en `PropertiesService` → hoja `fundamentales` en Sheets → `Api.gs` (`?recurso=fundamentales`) → página. Si una actualización falla, queda el último dato con su fecha.
- **Métricas propuestas para acciones:** P/E (últimos 12 meses), P/E forward, capitalización de mercado, utilidad por acción (EPS), rendimiento por dividendo, rango de 52 semanas.
- **Métricas propuestas para ETFs:** los ETFs normalmente no tienen P/E propio. En su lugar: comisión anual (expense ratio), rendimiento por dividendo, activos administrados y rango de 52 semanas. Donde una métrica no aplica se muestra "—" con una ayuda "?" que lo explica, nunca un cero.
- **Reglas de producto que aplican:** solo datos, sin calificar si algo está "caro" o "barato"; ayuda "?" en cada término (P/E, forward, EPS); fuente y fecha en la tabla; verde y rojo no se usan para estas métricas.
- **Tamaño del pedido:** 45 símbolos, de los cuales unas 29 son acciones (el resto son ETFs y el tipo de cambio). Los fundamentales cambian poco: basta actualizar una vez por semana, y se puede repartir en varios días si el límite diario es bajo.
- **APIs por evaluar (sin decidir).** Los límites son los que se recuerdan de sus planes gratuitos y **hay que confirmarlos en la página de cada una al iniciar el entregable**, junto con sus términos de uso (si permiten mostrar los datos en una página pública):

| Opción | Qué ofrece | Límite gratuito (por confirmar) | Dudas |
|---|---|---|---|
| Función `GOOGLEFINANCE` de Sheets | P/E, EPS, capitalización, máximo y mínimo de 52 semanas, sin clave ni Apps Script de por medio | Sin cuota publicada | No trae P/E forward ni datos de ETFs (comisión); confirmar que Apps Script puede leer esos valores y que cubre todos los símbolos |
| Alpha Vantage | Ficha por empresa con P/E, P/E forward, EPS, dividendo, capitalización; ficha de ETF | ~25 pedidos al día | Con 29 acciones no alcanza un día: repartir en dos o actualizar por semana |
| Financial Modeling Prep | Ratios y métricas por empresa; datos de ETFs | ~250 pedidos al día | Qué datos quedan fuera del plan gratuito (P/E forward, ETFs) |
| Finnhub | Métricas básicas por empresa (P/E, EPS, 52 semanas, dividendo) | ~60 pedidos por minuto | Si trae P/E forward y datos de ETFs en el plan gratuito |
| Twelve Data | Estadísticas por empresa | ~800 créditos al día | Los fundamentales parecen ser de plan pago |
| Yahoo Finance (no oficial) | Casi todo, sin clave | Sin API oficial | Se descartaría: puede dejar de funcionar sin aviso y sus términos no lo permiten con claridad |

- **Relación con E4 (Mis reglas):** E4 también necesita una API para precios de cierre. Conviene evaluar las dos necesidades juntas y, si se puede, usar una sola API y una sola clave.
- **Recortable:** métricas de ETFs (se deja solo acciones); rango de 52 semanas.
- **Riesgo:** que ninguna API gratuita entregue P/E forward. Plan B: mostrar solo P/E y dejar el forward fuera.

### E5 a E8
Se detallan en la revisión posterior a E3.

## Ideas sin compromiso (no entran a un entregable sin decidirlo en una revisión)
- **Agregar el símbolo buscado a mi lista** (idea de Héctor, 11 nov 2026; funcionalidad aparte del buscador de la S3). La lista personal viviría en el navegador con `memoria.js`, no en `simbolos.json`. Dificultad: Radar no puede leer lo que se busca dentro de un widget, así que necesita un campo propio donde escribir el símbolo con su bolsa, y no puede comprobar por código que el símbolo exista en TradingView.
- Sincronizar favoritos y reglas entre laptop y celular (requiere login; evaluar en la revisión: costo, privacidad y si el exportar/importar alcanza).
- Gráfico de evolución de tasas con la hoja `historial_tasas`.
- Glosario justo a tiempo (transversal, se suma poco a poco).
- Préstamos (TCEA).
- Fondos mutuos (datos SMV a verificar).
- Factoring.
- Tema claro.

## Descartado
- Consejos personalizados, cuentas de usuario, conexión con el broker, funciones sociales.

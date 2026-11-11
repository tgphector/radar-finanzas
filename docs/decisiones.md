# Registro de decisiones de Radar

Una línea por decisión. Lo más nuevo arriba.

| Fecha | Decisión | Motivo |
|---|---|---|
| 11 nov 2026 | Repositorio `tgphector/radar-finanzas` borrado y creado de nuevo con un único commit limpio; GitHub Pages reactivado sobre `main`, carpeta raíz | El force push no garantiza que GitHub elimine los commits anteriores; recrearlo sí |
| 11 nov 2026 | El repositorio no guarda datos personales, laborales, académicos ni financieros de Héctor. La pestaña de ETFs se llama "ETFs", sin subgrupos. Historial de Git reescrito en un solo commit limpio | El repositorio y la página son públicos |
| 10 nov 2026 | Se sigue construyendo en Claude Code. Los documentos viven en el repositorio (`docs/arquitectura.md`, `docs/backlog.md`, `docs/decisiones.md`, `docs/investigacion.md`) y las instrucciones en `CLAUDE.md`. En el cierre de cada sesión Claude actualiza esos archivos y los sube | Una sola copia de los documentos, junto al código; ya no se copian textos a mano |
| 10 nov 2026 | Los iframes de los widgets llevan `color-scheme: normal` | La página se declara oscura y el widget no; sin esto el navegador pinta un fondo blanco detrás del widget transparente |
| 10 nov 2026 | El código de la página usa módulos de JavaScript (`import` / `export`), un archivo por pieza | Coincide con la estructura de carpetas de la arquitectura; funciona en Pages sin instalar nada |
| 10 nov 2026 | Widgets de TradingView en formato iframe (script con la configuración en JSON), mini gráfico a 1 año con línea en cian. Confirmado en la página publicada | Formato documentado y estable; verde y rojo quedan solo para subidas y bajadas |
| 10 nov 2026 | `Api.gs` con `doGet` se adelanta a E2: la página lee la hoja de Sheets llenada a mano | Una sola copia de los datos; E3 solo agrega la lectura automática de la SBS |
| 10 nov 2026 | Radar público con `noindex`; el enlace se comparte solo con amigos; repositorio `tgphector/radar-finanzas` | GitHub Pages gratis exige repositorio público; sin nada personal en el código |
| 10 nov 2026 | El proyecto se lleva por sesiones de trabajo (~3 h), no por fechas. Reemplaza las fechas del backlog y la decisión "Ritmo: 3 h al día" | Preferencia de Héctor |
| 10 nov 2026 | Orden de autoridad de los documentos: decisiones y arquitectura mandan; backlog manda en alcance; el documento de investigación es contexto histórico | Evitar que el borrador de investigación contradiga lo ya decidido |
| 10 nov 2026 | Tabla de Mis gráficas: un widget de cotizaciones por pestaña (solo símbolos activos) + chips propios para abrir el gráfico grande + botón "Editar" con interruptores | El clic dentro de un widget lleva a tradingview.com y no se puede capturar; un widget por pestaña mantiene la página rápida |
| 10 nov 2026 | Pestañas de Mis gráficas: Populares, ETFs, Otros y **Referencias** (SPYM, IAU, USD/PEN). Reemplaza a Índices, Oro y bonos y Macro | Tres pestañas habían quedado con un solo símbolo |
| 10 nov 2026 | Claude sube los cambios al repositorio, rama `main`, un commit por parte terminada | Ver cada cambio publicado en ~1 min sin subir archivos a mano |
| 10 nov 2026 | **Radar vive en GitHub Pages desde E1.** Reemplaza a "Etapa A en artifact" y a "Artifact de E1-E2 se comparte con amigos". E3 queda solo con Apps Script, PWA y contador | Los artifacts de Claude bloquean los widgets de TradingView y las llamadas a Apps Script. Los amigos abren el enlace sin cuenta de Claude |
| 10 nov 2026 | Se quitan QQQ, DIA, SHY, IEF, TLT y HERE de Mis gráficas (ningún grupo). Quedan 45 símbolos | Decisión de Héctor al iniciar E1; cierra los pendientes de disponibilidad y de "HERE" |
| 10 nov 2026 | **Stack C** (reemplaza a B): GitHub Pages para la página + Google Sheets como base de datos + Apps Script para actualizar datos y servirlos en JSON | Trabajar sobre lo conocido (Apps Script y Sheets); Sheets sirve de panel para revisar y corregir datos; costo S/ 0 |
| 10 nov 2026 | Datos personales solo en el navegador, con exportar/importar; `memoria.js` como interfaz para sincronizar en el futuro sin tocar módulos | Sincronizar exige login y datos en servidor; se evalúa en la revisión |
| 10 nov 2026 | Precios para "Mis reglas" vía API con clave en `PropertiesService` de Apps Script, actualizados a diario | Los widgets no entregan precios al código; la clave no puede ir en la página |
| 10 nov 2026 | ~~Artifact de E1-E2 se comparte con amigos para probar~~ (reemplazada: enlace de GitHub Pages) | Feedback temprano |
| 10 nov 2026 | PWA (instalable) y contador de visitas sin cookies en E3 | "Como una app" y medir si los amigos vuelven |
| 10 nov 2026 | Orden de módulos: Gráficas, Plazos fijos, Mis reglas, Tipo de cambio, Calculadoras, Metas, Flujo de efectivo | Primero lo de uso propio y semanal |
| 10 nov 2026 | ~~Ritmo: 3 h al día; plan calculado con ~2 h efectivas~~ (reemplazada: sesiones de trabajo) | Margen para imprevistos |
| 10 nov 2026 | Nombre provisional: Radar; repositorio `radar-finanzas` | Muestra y compara, no dirige |
| 10 nov 2026 | Etiqueta "Cubierto por el FSD" en plazos fijos | Seguridad del depósito, clave para amigos que comparan cajas |
| 10 nov 2026 | Simulador: monto, plazo, moneda, tipo de entidad, con opciones de la SBS | No inventar opciones que la fuente no tiene |
| 10 nov 2026 | Plazos fijos: ranking TREA 1 año arriba, simulador debajo; al simular, el ranking se reemplaza | Ver el panorama primero y luego personalizar |
| 10 nov 2026 | Plazos fijos en soles y dólares | Uso real de Héctor y amigos |
| 10 nov 2026 | Favoritos por defecto: IVV, IVW, NVDA, EPU, IEMG, BAP | Elección de Héctor |
| 10 nov 2026 | Filtro de visibilidad + carga diferida en gráficas | 45 símbolos: evitar que la página sea lenta |
| 10 nov 2026 | Vista de gráficas: favoritos arriba, tabla por grupos, gráfico grande al hacer clic | Basado en la lista de seguimiento que Héctor ya usa |
| 10 nov 2026 | SPLG se registra como SPYM | Cambio de símbolo desde el 31 oct 2025 |
| 10 nov 2026 | Paleta oscura aprobada con acento cian (#22C5D6) | Referentes: Opera GX, app de mercados, fondo cian sobre negro |
| 10 nov 2026 | Diseño laptop-first; en celular, una columna | Uso principal en laptop |
| 10 nov 2026 | Usuarios: Héctor y amigos | Sin cuentas; personalización en cada navegador |
| 10 nov 2026 | ~~Etapa A en artifact (un HTML), etapa B en GitHub Pages desde E3~~ (reemplazada: GitHub Pages desde E1) | Iterar rápido primero, automatizar después |
| 10 nov 2026 | Sin consejos de inversión; solo datos y cálculos | Regulación SMV y foco del proyecto |
| 10 nov 2026 | Construcción por entregables sobre un esqueleto mínimo | Práctica validada (walking skeleton, Shape Up) |

## Pendientes
- Confirmar con Héctor el nombre de la pestaña "ETFs" (S2).
- Decidir si BAP sigue en favoritos: el widget muestra el nombre real de la empresa (S2).
- Verificar en la S2 los 39 símbolos que aún no se han visto en TradingView (más riesgo: PRYMY, USD/PEN, IBIT, INGM, ITA).
- Verificar en la S2 si el widget de cotizaciones trae el rango del día.
- Confirmar si la SBS permite leer las tasas con un script (E2/E3).

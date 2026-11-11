# Arquitectura de Radar (v4, 10 nov 2026 · cierre de la S1 de E1)

Cambios de v4: Radar vive en GitHub Pages desde E1 (ya no hay etapa en artifact), Claude sube los cambios al repositorio, lista de símbolos y pestañas actualizadas, diseño de la tabla de Mis gráficas definido, `Api.gs` adelantado a E2, formato de widget elegido y documentos dentro del repositorio (`docs/`).

## 0. Qué documento manda
1. `docs/decisiones.md` y este documento son la referencia vigente.
2. `docs/backlog.md` manda en alcance y en el orden de las sesiones.
3. `CLAUDE.md` (raíz) tiene las instrucciones de trabajo y el estado actual.
4. `docs/investigacion.md` es contexto histórico (buenas prácticas, fuentes, límites legales). Si contradice a los anteriores, mandan los anteriores. Puntos que ya no aplican de ese documento: etapa en artifact, GitHub Actions, entregables de 2 semanas, mobile-first, lista de símbolos en borrador.

## 1. Principio
Un **esqueleto fijo** (menú, estilos, datos, memoria) y **módulos independientes** que se enchufan a él. Agregar un módulo = agregar sus archivos y registrarlo; nada más cambia.

## 2. Stack elegido: opción C (GitHub Pages + Google)

| Pieza | Herramienta | Para qué |
|---|---|---|
| Página | GitHub Pages (desde E1) | Hosting gratis, enlace público sin login, rápido |
| Código de la página | HTML + CSS + JavaScript sin frameworks, con módulos (`import` / `export`) | Simple, sin instalaciones |
| Publicación | Claude sube cada parte al repositorio (rama `main`); Pages publica solo en ~1 min | Héctor revisa el enlace publicado, no archivos sueltos |
| Base de datos | **Google Sheets** (un archivo exclusivo para Radar) | Tasas, FSD, historial, precios, registro de ejecuciones. Visible y corregible a mano |
| Actualización de datos | **Google Apps Script** con activador diario | Lee la SBS (y luego otras fuentes) con `UrlFetchApp` y escribe en Sheets |
| API de datos | Apps Script publicado como **app web** (`doGet`) | Entrega los datos de Sheets a la página en JSON |
| Datos personales | Navegador del usuario (localStorage) | Favoritos, símbolos activos y, desde E4, reglas y posiciones |
| Secretos | `PropertiesService` de Apps Script | Clave de la API de precios (E4); nunca en la página |
| Gráficos de mercado | Widgets de TradingView (formato iframe) | Gráficos y cotizaciones listos |

**Flujo de datos:** Fuente (SBS, BCRP, API de precios) → Apps Script (activador diario) → Google Sheets → Apps Script `doGet` (JSON) → Página en GitHub Pages.

**Por qué no la página sola:** el navegador no puede leer la SBS ni APIs con clave directamente. Apps Script hace ese trabajo desde los servidores de Google.

**Por qué no un artifact de Claude:** los artifacts bloquean scripts e iframes de otros sitios (TradingView) y las llamadas a otros dominios (Apps Script). Por eso Radar vive en GitHub Pages desde E1.

## 3. Dónde vive y de dónde salen los datos

Un solo lugar desde E1: **GitHub Pages**, repositorio público `tgphector/radar-finanzas`, enlace https://tgphector.github.io/radar-finanzas/ (Pages publica la rama `main`, carpeta raíz).

| Entregable | Datos |
|---|---|
| E1 | Sin datos propios: todo sale de los widgets de TradingView |
| E2 | Archivo "Radar · Base de datos" en Sheets, `tasas_pf` llenada a mano. `Api.gs` con `doGet` entrega la hoja en JSON y la página la lee con `datos.js`. Plan B si la página no logra leer la app web: archivo JSON en el repositorio hasta E3 |
| E3 en adelante | Apps Script actualiza Sheets cada día; la página sigue leyendo el mismo JSON |

## 4. Google Sheets: estructura de la base de datos
Archivo: **"Radar · Base de datos"** (solo para Radar; nada personal adentro).

| Hoja | Contenido | Quién escribe |
|---|---|---|
| `tasas_pf` | Último dato de tasas de plazo fijo: entidad, tipo, moneda, plazo_dias, monto, tea, trea, fsd | Apps Script (o Héctor a mano) |
| `historial_tasas` | Una fila por entidad, plazo y día; se agrega, nunca se borra | Apps Script |
| `fsd` | Monto de cobertura vigente, fecha y fuente | Héctor a mano (cambia pocas veces al año) |
| `fuentes` | Nombre, URL, frecuencia, última actualización y estado de cada fuente | Apps Script |
| `log` | Fecha, función, resultado (ok/error) y mensaje de cada ejecución | Apps Script |
| `precios` (E4) | Precio de cierre por símbolo y fecha | Apps Script |

Reglas:
- La fila 1 de cada hoja es el encabezado, en minúsculas y sin espacios (`plazo_dias`), igual que los campos del JSON.
- Si una actualización falla, no se borra el dato anterior: se registra el error en `log` y en `fuentes`.
- Correcciones manuales: se pueden hacer en la hoja; quedan en el historial de versiones de Sheets.

## 5. Apps Script: estructura del proyecto
Proyecto vinculado al archivo de Sheets.

```
Radar (Apps Script)
├── Api.gs              # (E2) doGet(e): ?recurso=tasas|fsd|precios → JSON con fuente, fecha y estado
├── ActualizarTasas.gs  # (E3) Lee la SBS, interpreta la tabla y escribe tasas_pf + historial_tasas
├── ActualizarPrecios.gs  # (E4) Trae precios de cierre de la API y escribe en precios
├── Utilidades.gs       # Leer/escribir hojas, registrar en log, caché
└── Configuracion.gs    # Crear activadores y guardar la clave de API en PropertiesService
```

- **Activador:** diario a las 8:00 (hora de Lima) para tasas; diario al cierre de mercado para precios (E4).
- **Publicación:** app web con "Ejecutar como: yo" y "Acceso: cualquier persona". Solo entrega datos públicos de Sheets; nunca escribe.
- **Caché:** `CacheService` guarda la respuesta unos minutos para que la página cargue rápido.
- **Respaldo del código:** copia de los archivos `.gs` en la carpeta `/apps-script` del repositorio (manual al terminar cada entregable; más adelante, con `clasp`).
- **Cuotas de una cuenta personal:** 90 min al día de activadores, 20,000 llamadas `UrlFetch` al día y 6 min por ejecución. Radar usa una fracción mínima. Google One no cambia estas cuotas.

## 6. Estructura del repositorio

```
radar-finanzas/
├── CLAUDE.md                  # Instrucciones de trabajo para Claude Code + estado actual
├── README.md
├── index.html                 # Esqueleto: menú lateral, contenido, pie con aviso        (E1 ✔)
├── css/
│   ├── tokens.css             # Design system                                           (E1 ✔)
│   ├── base.css               # Estilos generales y responsive                          (E1 ✔)
│   └── componentes.css        # Tarjeta, cuadrícula, fuente, aviso, ayuda "?"           (E1 ✔; pestañas, interruptor y chips en S2)
├── js/
│   ├── app.js                 # Arranque, router (#/graficas, #/plazos), registro       (E1 ✔)
│   ├── memoria.js             # Capa de almacenamiento personal (sección 9)             (E1 ✔)
│   ├── ui.js                  # Componentes reutilizables                               (E1 ✔)
│   ├── config.js              # URL de la app web de Apps Script                        (E2)
│   └── datos.js               # Pide el JSON, maneja errores y muestra la fecha         (E2)
├── modulos/
│   ├── graficas/
│   │   ├── graficas.js        #                                                         (E1, S1 ✔)
│   │   └── simbolos.json      # Símbolos por pestaña y favoritos por defecto            (E1 ✔)
│   └── plazos/
│       └── plazos.js          #                                                         (E2)
├── docs/
│   ├── arquitectura.md        # Este documento
│   ├── backlog.md
│   ├── decisiones.md
│   └── investigacion.md       # Contexto histórico
├── manifest.json              # Instalar Radar como app (PWA)                           (E3)
├── sw.js                      # Carga rápida y uso básico sin conexión                  (E3)
└── apps-script/               # Copia de respaldo del código .gs                        (E2/E3)
```

Reglas del repositorio:
- Rama única `main`; cada parte terminada es un commit con mensaje en español.
- `index.html` lleva `<meta name="robots" content="noindex">`: el enlace funciona, pero no aparece en buscadores.
- Radar se abre siempre desde el enlace de Pages o con un servidor local (`python3 -m http.server`). Abrir `index.html` con doble clic no funciona: el navegador no deja cargar módulos ni `simbolos.json` desde un archivo local.
- `docs/` y `CLAUDE.md` también quedan públicos: ningún dato personal, laboral, académico ni financiero de Héctor en ningún archivo.

## 7. Contrato de un módulo

```js
{
  id: "plazos",                 // usado en la URL: #/plazos
  nombre: "Plazos fijos",       // texto del menú
  icono: "◎",                   // ícono del menú lateral
  datos: ["tasas", "fsd"],      // recursos que pide a la API de Apps Script
  proximamente: true,           // opcional: aparece en el menú con "Próximamente" y sin render
  render(contenedor, datos) {}  // dibuja el módulo dentro del contenedor
}
```

Reglas:
- Un módulo solo escribe dentro de su `contenedor`. `app.js` le entrega una caja nueva cada vez, así un módulo que aún carga no escribe encima del siguiente.
- Usa componentes de `ui.js`; no crea estilos globales.
- Lee datos públicos solo con `datos.js` y datos personales solo con `memoria.js`.
- Lo nuevo y compartido va a `ui.js` o `componentes.css` y se anota en decisiones.
- Para registrar un módulo: se importa en `app.js` y se suma a la lista `MODULOS`.

## 8. Formato del JSON que entrega Apps Script

```json
{
  "recurso": "tasas",
  "fuente": "SBS",
  "url": "https://www.sbs.gob.pe/...",
  "actualizado": "2026-11-24T08:05:00-05:00",
  "estado": "ok",
  "nota": "Tasas referenciales",
  "datos": [
    { "entidad": "CMAC Arequipa", "tipo": "Caja municipal", "moneda": "PEN", "plazo_dias": 360, "monto": 10000, "tea": 4.5, "trea": 4.5, "fsd": true }
  ]
}
```

- `estado`: `ok` o `error`. Con `error`, `datos` trae el último valor bueno y la página lo muestra con su fecha.
- Si la API no responde, la página muestra un mensaje claro y la última copia guardada en el navegador.

## 9. Datos personales y sincronización
- **Hoy:** todo lo personal vive en el navegador (localStorage), con clave `radar.<modulo>.<dato>`.
- **Respaldo:** botón "Exportar / Importar" con un archivo JSON, para pasar la configuración de la laptop al celular (E4).
- **`memoria.js` es una interfaz:** los módulos solo llaman `memoria.leer()`, `memoria.guardar()` y `memoria.borrar()`. Si se decide sincronizar entre dispositivos, solo cambia `memoria.js`.
- Si el navegador bloquea localStorage, Radar funciona igual con los valores por defecto (`memoria.disponible()` permite avisar que no puede recordar cambios).
- **Sin datos personales en Sheets ni en servidores** mientras no se decida otra cosa en una revisión (Ley de Protección de Datos Personales).

## 10. Design system

| Token | Valor | Uso |
|---|---|---|
| `--fondo` | #0E0F11 | Fondo general |
| `--superficie` | #17191C | Tarjetas |
| `--borde` | #26292E | Bordes finos |
| `--texto` | #EDEDED | Títulos y cifras |
| `--texto-2` | #9AA0A6 | Etiquetas, fechas, fuentes |
| `--acento` | #22C5D6 | Menú activo, botones, enlaces |
| `--sube` | #2EBD85 | Solo variaciones positivas (con ▲ o +) |
| `--baja` | #F0616D | Solo variaciones negativas (con ▼ o −) |

- Tipografía: Inter si está disponible; si no, `system-ui`. Cifras con `tabular-nums`.
- Tarjetas: esquinas de 12 px, borde de 1 px, sin sombras. Espaciado en múltiplos de 8 px. Botones de al menos 44 px. Contraste mínimo 4.5:1.
- Laptop (≥ 900 px): menú lateral de íconos + cuadrícula de tarjetas (3 columnas; 2 bajo 1100 px). Celular (< 900 px): barra inferior; una columna bajo 600 px.
- Dentro de los widgets de TradingView los colores los pone TradingView (tema oscuro); Radar controla solo lo que rodea al widget y el color de la línea (cian).
- La página declara `color-scheme: dark`. Los iframes de los widgets llevan `color-scheme: normal`; sin eso el navegador pinta un fondo blanco detrás del widget transparente.

## 11. Módulo Mis gráficas

### Símbolos (45) y pestañas (4)

| Pestaña | Símbolos |
|---|---|
| Populares (12) | NVDA, AAPL, MSFT, AMZN, GOOGL, META, TSLA, PLTR, AMD, NFLX, AVGO, INTC |
| ETFs (12) | IVV, IVW, IYE, EPU, REET, VWO, IBIT, IEMG, XLI, ITA, XLB, ICLN |
| Otros (18) | BRK-B, SPYG, BAP, SAN, BAC, NU, KO, F, XOM, OXY, DVN, DELL, VRSN, INGM, PRYMY, QUBT, QBTS, RGTI |
| Referencias (3) | SPYM (S&P 500), IAU (oro), USD/PEN (pasa al módulo de tipo de cambio cuando exista) |

- Favoritos por defecto: IVV, IVW, NVDA, EPU, IEMG, BAP.
- Fuera de la lista por decisión: QQQ, DIA, SHY, IEF, TLT, HERE.
- `modulos/graficas/simbolos.json` es la copia que usa el código; esta tabla es la referencia. Cada símbolo lleva su bolsa en formato TradingView (`NASDAQ:NVDA`, `AMEX:IVV`).
- Verificado en la página publicada (10 nov): los 6 favoritos cargan. **Por verificar al inicio de la S2:** los otros 39 (más riesgo: PRYMY, USD/PEN, IBIT, INGM, ITA). El que no se pueda mostrar se corrige de bolsa, se marca "sin datos en TradingView" o sale de la lista, con aviso a Héctor.

### Vista
- **Favoritos (hecho en S1):** 6 tarjetas con mini gráfico arriba (widget "Mini Chart", último año, línea en cian).
- **Tabla por pestaña (S2):** un widget de cotizaciones de TradingView por pestaña, solo con los símbolos activos. Columnas buscadas: símbolo, precio, variación %, rango del día (si el widget no trae el rango, ese dato se ve en el gráfico grande).
- **Chips de símbolos (S2)** debajo de la tabla (elementos propios): clic en un chip abre el gráfico grande. Botón "Editar" muestra un interruptor por símbolo. Motivo: el clic dentro de un widget lleva a tradingview.com y la página no lo puede capturar.
- **Gráfico grande (S3)** con selector 1d / 5d / 1m / 1a / 5a.
- Cada bloque muestra "Fuente: TradingView · cargado <fecha y hora>"; los precios pueden tener retraso según la bolsa.

### Widgets de TradingView
- **Formato:** iframe. Se crea un `div.tradingview-widget-container` con un `<script>` cuyo `src` es el del widget y cuyo contenido es la configuración en JSON.
- Mini Chart: `https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js` con `colorTheme: "dark"`, `isTransparent: true`, `locale: "es"`, `dateRange: "12M"`.
- El texto "Cargando…" se quita cuando el iframe termina de cargar (MutationObserver + evento `load`).
- Fallas cubiertas: sin conexión (reintenta al volver el internet), script bloqueado (mensaje en la tarjeta), `simbolos.json` no disponible (aviso en el módulo).

### Rendimiento
- Ningún widget se carga al abrir la página.
- Un widget se crea solo si el símbolo está **activo** en el filtro **y** aparece en pantalla (IntersectionObserver, con 200 px de anticipación).
- Un widget por pestaña para la tabla, no uno por símbolo.
- Meta: primera pantalla en menos de 2 segundos. La marca TradingView queda visible.

## 12. Operación
- Revisar la hoja `log` una vez por semana durante el primer mes, luego una vez al mes.
- Apps Script puede enviar un correo si una actualización falla dos días seguidos (E3, recortable).
- Contador de visitas sin cookies para medir si los amigos vuelven (E3).
- Entorno: laptop personal. Se construye con Claude Code sobre este repositorio; Apps Script se usa desde el navegador.
- Costo objetivo: S/ 0.

## 13. Privacidad y seguridad
- Repositorio público y página pública: cualquiera con el enlace puede abrirla y ver el código y los documentos. Solo datos públicos; nada personal.
- GitHub Pages gratis exige repositorio público; un plan de pago oculta el código, pero la página sigue siendo pública.
- Claves de API solo en `PropertiesService`.
- El archivo de Sheets se comparte solo con Héctor; la página lee a través de la app web, no del archivo.

## 14. Definición de terminado (aplica a todo entregable)
- [ ] Funciona en laptop y en ancho de celular.
- [ ] Todo dato muestra fuente y fecha.
- [ ] Si los datos fallan, se ve un mensaje claro y el último valor con su fecha.
- [ ] No rompe módulos anteriores.
- [ ] Héctor lo usó al menos 3 veces.
- [ ] `docs/backlog.md`, `docs/decisiones.md` y el "Estado actual" de `CLAUDE.md` actualizados y subidos.

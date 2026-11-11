# Radar · instrucciones para Claude Code

Eres mi socio de desarrollo para construir Radar, una web personal de herramientas financieras para mí (Héctor) y mis amigos. Radar muestra datos y hace cálculos; nunca da consejos de inversión. Tu rol: construir el código, proponer mejoras de diseño y producto, y cuidar que cada entregable salga terminado y simple.

- Página publicada: https://tgphector.github.io/radar-finanzas/ (GitHub Pages publica la rama `main`, carpeta raíz, en ~1 min).
- **El repositorio es público: nunca escribas datos personales, laborales, académicos ni financieros de Héctor (empleador, broker, universidad, posiciones, montos). Si un dato así hace falta para decidir, pregúntalo en la conversación y no lo guardes en archivos.**

## Documentos del proyecto (léelos al iniciar cada sesión)
- `docs/arquitectura.md`: estructura, design system, formato de datos y reglas para agregar módulos. Es la ley técnica.
- `docs/backlog.md`: plan de entregables por sesiones, alcance y criterio de terminado.
- `docs/decisiones.md`: decisiones tomadas. No las contradigas sin preguntarme.
- `docs/investigacion.md`: contexto histórico y buenas prácticas. Si contradice a arquitectura o decisiones, mandan estos.

## Cómo trabajamos
- **Un entregable a la vez.** Solo trabajas en el entregable "En curso" del backlog. Si propongo algo de otro entregable, lo anotas en `docs/backlog.md` y seguimos.
- **Por sesiones, alcance variable.** Cada entregable tiene ~3 sesiones de ~3 h. Si no cabe, propón qué recortar; no agregues sesiones.
- **Consúltame antes de decidir diseño o estructura.** Si algo afecta cómo se ve, cómo se organizan los datos o la arquitectura, pregúntame primero con 2-3 opciones y tu recomendación.
- **Construye sobre lo existente.** Agregar un módulo no puede romper ni modificar los anteriores, salvo los componentes compartidos y con aviso.
- **Código entendible.** Comenta en español qué hace cada bloque. Estoy aprendiendo: cuando uses algo nuevo (IntersectionObserver, localStorage, GitHub Pages), explícalo en 2-3 líneas.
- **Apps Script y Sheets.** La base de datos es Google Sheets y los datos se actualizan con Apps Script. Ya conozco Apps Script: explica solo lo nuevo (app web con doGet, CacheService, PropertiesService, activadores). Respeta las columnas definidas en `docs/arquitectura.md` y nunca borres datos buenos cuando una actualización falle.
- **Verifica antes de entregar.** Revisa en laptop y en ancho de celular, con datos que fallen (sin conexión, archivo vacío) y que todo dato muestre fuente y fecha.

## Cómo se prueba y se publica
- Sin frameworks ni instalaciones: HTML, CSS y JavaScript con módulos (`import` / `export`).
- Prueba local: `python3 -m http.server` en la raíz y abrir `http://localhost:8000`. Con doble clic en `index.html` no funciona (los módulos y `simbolos.json` no cargan desde un archivo local).
- Los widgets de TradingView necesitan internet; si el entorno no llega a TradingView, se revisan en la página publicada.
- Cada parte terminada es un commit con mensaje en español, subido a `main`. Después de subir, revisa la página publicada y muéstrame el enlace.
- Antes del primer commit en un equipo nuevo, revisa `git config user.name` y `git config user.email`: los commits son públicos, así que se usa el correo `noreply` de GitHub y no un correo personal. Si no está configurado, avísame antes de hacer el commit.
- GitHub Pages ya está activo (rama `main`, carpeta raíz). Si la página deja de publicarse, se revisa en Settings → Pages del repositorio.

## Reglas de producto (no negociables)
- Sin consejos ni recomendaciones de compra o venta. Sin portafolios por perfil.
- Cada dato muestra fuente y fecha de actualización. Si un dato no se pudo actualizar, se muestra el último con su fecha, nunca un número sin fecha.
- Aviso fijo en el pie: "Herramienta informativa y educativa. No es asesoría financiera. Tasas referenciales; confirma con cada entidad."
- Nada personal (montos, posiciones, metas) en el código ni en archivos de datos: eso vive solo en el navegador del usuario.
- Verde y rojo solo para subidas y bajadas, siempre con flecha o signo.
- Explicaciones "justo a tiempo": ícono "?" con una línea junto a términos como TREA, FSD, ETF.

## Formato de cada sesión
- **INICIO:** dime qué entregable y sesión están en curso, qué falta para terminarlo y qué propones hacer hoy (cabe en ~3 h).
- **CONSTRUCCIÓN:** avanza por partes pequeñas. Al terminar cada parte, súbela y muéstrame el enlace publicado.
- **CIERRE** (cuando diga "Cerremos la sesión"):
  1. Actualiza tú `docs/backlog.md` y `docs/decisiones.md` (y `docs/arquitectura.md` si cambió algo técnico).
  2. Actualiza la sección "Estado actual" de este archivo.
  3. Guarda todo en el repositorio (commit y subida a `main`).
  4. Dime en pocas líneas qué quedó hecho y qué toca en la próxima sesión. No me des textos para copiar.

## Estilo
Directo, breve, en español. Si mi idea complica el proyecto o choca con una decisión anterior, dímelo claro.

## Estado actual
Actualizado: 11 nov 2026, cierre de la S2 de E1.

**En curso:** E1 · Esqueleto + Mis gráficas. Sesiones 1 y 2 de 3 hechas.

**Hecho**
- Repositorio y GitHub Pages activos. El repositorio se recreó el 11 nov 2026 con un historial limpio.
- Esqueleto: menú lateral (laptop) y barra inferior (celular), router (`#/graficas`, `#/plazos`), design system, pie con aviso, `memoria.js`, `ui.js`.
- Mis gráficas · Favoritos: 6 tarjetas con mini gráfico de TradingView (último año), carga diferida, línea de fuente y hora, ayuda "?" en ETF.
- Mis gráficas · Todos los símbolos: pestañas (Populares, ETFs, Otros, Referencias), tabla de cotizaciones por pestaña con los símbolos activos, chips que abren un gráfico simple de 1 año y botón "Editar" con un interruptor por símbolo, guardado en el navegador.
- Los 45 símbolos de `simbolos.json` probados en TradingView: todos cargan (QBTS corregido a `NASDAQ:QBTS`). Ninguno quedó "sin datos".
- Componentes compartidos nuevos en `ui.js` y `componentes.css`: botón, pestañas, chip, interruptor.
- Plazos fijos aparece en el menú como "Próximamente".
- Revisado en la página publicada (laptop y celular). Fallas probadas: sin conexión, localStorage bloqueado, pestaña con todo apagado, símbolo marcado "sin datos".

**Próxima sesión (S3 de E1, la última del entregable)**
1. Gráfico grande con selector 1d / 5d / 1m / 1a / 5a. Reemplaza al gráfico simple que hoy abre el chip (`pintarGrafico()` en `graficas.js`).
2. Pruebas finales de E1 contra la definición de terminado (sección 14 de `docs/arquitectura.md`): laptop, celular, sin conexión, localStorage bloqueado.
3. Si sobra tiempo (recortable): editar favoritos desde la interfaz.

**Decisiones que debo preguntarle a Héctor al iniciar la S3**
1. Qué widget usar para el gráfico grande: uno liviano con periodos propios o el gráfico avanzado de TradingView. Llevar 2-3 opciones probadas, con su peso y cómo se ven en celular.
2. Dónde se abre el gráfico grande: debajo de los chips (como hoy) o en un panel que tape la pantalla en celular.
3. Si los favoritos también abren el gráfico grande al pulsarlos.

**Notas técnicas para retomar**
- Antes de escribir el gráfico grande, confirma en la documentación de widgets de TradingView el nombre del script y sus opciones (en especial cómo se fija el periodo); no lo des por sabido.
- `cargarWidget()` en `graficas.js` sirve para cualquier widget en formato iframe: recibe el script y la configuración.
- Los iframes de TradingView no se pueden leer desde el código de la página. El widget de cotizaciones omite sin avisar un símbolo inválido: si uno deja de cargar, se marca `"sinDatos": true` en `simbolos.json` y se anota en Pendientes de `docs/decisiones.md`.
- Memoria del módulo: `radar.graficas.apagados`, `radar.graficas.pestana`, `radar.graficas.favoritos`.
- Entorno en la nube de Claude Code: el entorno "radar-finanzas" permite llegar a TradingView y a la página publicada, así que los widgets se pueden probar con un navegador sin interfaz. Las capturas de página completa muestran vacíos los gráficos fuera de pantalla; hay que capturar la zona visible.
- Commits con identidad genérica (`Claude <noreply@anthropic.com>`). Se trabaja en una rama y se pasa a `main` al cerrar la sesión.

**Pendientes abiertos:** ver también la sección "Pendientes" de `docs/decisiones.md`.

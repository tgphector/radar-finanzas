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
Actualizado: 11 nov 2026, cierre de E1.

**En curso:** E2 · Plazos fijos. Ninguna sesión hecha todavía (sigue la S1 de 3).

**Terminado: E1 · Esqueleto + Mis gráficas** (11 nov 2026, definición de terminado completa, revisado en la página publicada)
- Esqueleto: menú lateral (laptop) y barra inferior (celular), router (`#/graficas`, `#/plazos`), design system, pie con aviso, `memoria.js`, `ui.js`.
- Favoritos: 6 tarjetas con mini gráfico de TradingView y botón "Ampliar".
- Todos los símbolos: pestañas, tabla de cotizaciones por pestaña (centrada, 780 px), chips, botón "Editar" con interruptores guardados en el navegador.
- Gráfico grande: widget avanzado de TradingView con periodos y lupa para buscar cualquier símbolo; en celular, panel a pantalla completa.
- Los 45 símbolos de `simbolos.json` cargan en TradingView.
- Plazos fijos aparece en el menú como "Próximamente".

**Próxima sesión (S1 de E2)**
1. Revisar qué tablas de tasas de depósitos a plazo publica la SBS (plazos, montos, monedas, tipos de entidad) y proponer a Héctor las columnas de `tasas_pf`. Punto de partida: sección 4 de `docs/arquitectura.md`.
2. Preparar el archivo "Radar · Base de datos" en Google Sheets con las hojas `tasas_pf`, `fsd`, `fuentes` y `log`, y llenar `tasas_pf` a mano con datos de la SBS.
3. `Api.gs` con `doGet` (`?recurso=tasas|fsd`), publicado como app web, con `CacheService`. Explicar lo nuevo: app web, `doGet`, `CacheService`.
4. `js/config.js` y `js/datos.js`; comprobar primero que la página publicada logra leer la app web (es el mayor riesgo; plan B: JSON en el repositorio).
5. Si queda tiempo: primera versión del ranking por TREA a 1 año en `modulos/plazos/plazos.js`.

**Decisiones que debo preguntarle a Héctor al iniciar E2**
1. Columnas de `tasas_pf` según lo que publique la SBS (2-3 opciones).
2. Cómo se reparte E2 en sus 3 sesiones (propuesta: S1 datos y API; S2 ranking y FSD; S3 simulador y pruebas).
3. Quién crea el archivo de Sheets y pega `Api.gs`: Héctor a mano, o Claude con el conector de Google Sheets si está disponible en la sesión. La publicación de la app web la hace siempre Héctor.

**Notas técnicas para retomar**
- `cargarWidget()` en `graficas.js` sirve para cualquier widget de TradingView en formato iframe.
- Los iframes de TradingView no se pueden leer desde la página. Si un símbolo deja de cargar, se marca `"sinDatos": true` en `simbolos.json` y se anota en Pendientes de `docs/decisiones.md`.
- TradingView cambia el aspecto y los servidores de sus widgets sin aviso. Si un widget sale vacío en las pruebas, revisar primero si el entorno bloquea un sitio nuevo de TradingView.
- Entorno en la nube de Claude Code: el entorno "radar-finanzas" permite llegar a TradingView y a la página publicada. Para E2 hará falta pedir permiso para el sitio de la SBS y para la app web de Apps Script. Las capturas de página completa muestran vacíos los gráficos fuera de pantalla; hay que capturar la zona visible.
- La URL de la app web va en `js/config.js` y es pública: la app solo entrega datos públicos y nunca escribe.
- Commits con identidad genérica (`Claude <noreply@anthropic.com>`). Se trabaja en una rama y se pasa a `main` al cerrar la sesión.

**Pendientes abiertos:** sección "Pendientes" de `docs/decisiones.md` y "Mejoras menores pendientes" de `docs/backlog.md`.

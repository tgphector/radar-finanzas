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
Actualizado: 11 nov 2026, cierre de la S1 de E2.

**En curso:** E2 · Plazos fijos. Sesión 1 de 3 hecha.

**Terminado:** E1 · Esqueleto + Mis gráficas (11 nov 2026).

**Hecho en E2**
- Archivo "Radar · Base de datos" en Google Sheets con las hojas `tasas_pf`, `fsd`, `fuentes` y `log`. Cargadas 33 entidades: Lima, soles, S/ 10 000 a 360 días, al 11 nov 2026.
- `apps-script/Api.gs` y `apps-script/Utilidades.gs` publicados por Héctor como app web (`?recurso=tasas|fsd`, caché de 5 minutos, solo lectura).
- `js/config.js` (dirección de la app web) y `js/datos.js` (pide un recurso; si falla, devuelve la última copia guardada en el navegador).
- Comprobado: la página publicada logra leer la app web. Plan B descartado.
- Plazos fijos sigue en el menú como "Próximamente": todavía no hay `modulos/plazos/plazos.js`.

**Próxima sesión (S2 de E2)**
1. Cargar en `tasas_pf` las 7 tablas que faltan con las capturas que pasará Héctor (soles: S/ 2 500, 5 000 y 20 000; dólares: las cuatro condiciones). Revisar qué montos publica la SBS en dólares.
2. Pedir permiso de red para `fsd.org.pe`, llenar la hoja `fsd` con el monto de cobertura vigente y marcar la columna `fsd` de cada entidad.
3. Proponer a Héctor el diseño del ranking (2-3 opciones) antes de construirlo.
4. `modulos/plazos/plazos.js`: ranking por TREA con selector soles / dólares, fecha de los datos bien visible, etiqueta "Cubierto por el FSD", ayudas "?" en TREA y FSD. Registrar el módulo en `app.js` y quitar "Próximamente".
5. `app.js` debe pedir los datos del módulo con `datos.js` y pasarlos a `render(contenedor, datos)` (contrato de la sección 7 de la arquitectura). Es un cambio en un archivo compartido: avisar.

**Decisiones que debo preguntarle a Héctor al iniciar la S2**
1. Cómo se ve el ranking: tabla propia o tarjetas; qué monto se muestra por defecto; cómo se muestra el tipo de entidad.
2. Dónde y cómo se muestra la fecha de los datos (pidió que se vea claramente) y qué aviso sale cuando tengan más de 15 días.
3. Cómo se muestra una entidad cuya cobertura del FSD no se pudo verificar.

**Notas técnicas para retomar**
- La SBS bloquea a los robots (Incapsula): no se puede leer desde el entorno de Claude ni desde Apps Script. No intentar saltarse la protección. Los datos entran por capturas de Héctor. **E3 está por replanificar** (alternativas en `docs/backlog.md`).
- La SBS solo publica plazo fijo a 360 días, por región, con cuatro montos en soles; registra la TREA mínima aplicable. El simulador no tendrá selector de plazo: monto libre, tasa del tramo más cercano y resultado marcado como "estimado".
- El archivo de Sheets se edita con el conector de Google Sheets (buscarlo en Drive por su título; su identificador no se guarda en el repositorio). Después de cambiar la hoja, la app web tarda hasta 5 minutos en reflejarlo por la caché.
- Si se cambia `Api.gs` o `Utilidades.gs`, Héctor debe pegar el código nuevo y crear una versión nueva de la implementación.
- Entorno "radar-finanzas": permite TradingView, la página publicada, la SBS, `script.google.com` y `script.googleusercontent.com`. El sitio del FSD redirige a `fsd.org.pe`, que falta permitir.
- TradingView cambia sus widgets sin aviso; si uno sale vacío en las pruebas, revisar primero si el entorno bloquea un sitio nuevo. Las capturas de página completa muestran vacíos los gráficos fuera de pantalla.
- Commits con identidad genérica (`Claude <noreply@anthropic.com>`). Se trabaja en una rama y se pasa a `main` al cerrar la sesión.

**Pendientes abiertos:** sección "Pendientes" de `docs/decisiones.md` y "Mejoras menores pendientes" de `docs/backlog.md`.

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
Actualizado: 11 nov 2026, cierre de la S2 de E2.

**En curso:** E2 · Depósitos (plazo fijo y CTS). Sesiones 1 y 2 de 3 hechas.

**Terminado:** E1 · Esqueleto + Mis gráficas (11 nov 2026).

**Hecho en E2**
- Archivo "Radar · Base de datos" en Google Sheets con las hojas `tasas_pf`, `tasas_cts`, `fsd`, `fuentes` y `log`. Datos de la SBS al 11 nov 2026, todos de Lima: plazo fijo en soles (33 entidades), plazo fijo en dólares (32) y CTS (29). Monto del FSD cargado (vigente hasta el 30 nov 2026).
- App web de Apps Script publicada por Héctor (`?recurso=tasas|cts|fsd`, caché de 5 minutos, solo lectura). Copia del código en `apps-script/`.
- `js/config.js`, `js/datos.js` y `app.js` entregando los datos a los módulos.
- Módulo "Depósitos" (`modulos/plazos/plazos.js`, dirección `#/plazos`): selectores Plazo fijo / CTS y Soles / Dólares, ranking por TREA con barra, fecha de los datos visible, nota de cobertura del FSD, ayudas "?" en TREA, CTS y FSD.
- Revisado en la página publicada en laptop y celular. Fallas probadas en local: app web caída con y sin copia, hoja vacía, datos viejos, FSD sin monto.

**Próxima sesión (S3 de E2, la última del entregable)**
1. Simulador: el usuario escribe un monto y elige la moneda; se calcula el interés estimado a 360 días con la TREA publicada para 10 000 y el resultado se marca como "estimado". El monto no se guarda en ningún archivo (es dato personal); como mucho, en el navegador.
2. Pruebas finales de E2 contra la definición de terminado (sección 14 de `docs/arquitectura.md`).
3. Si toca por fecha: carga quincenal de las tres tablas (hacia el 26 nov 2026) y monto nuevo del FSD (desde diciembre).

**Decisiones que debo preguntarle a Héctor al iniciar la S3**
1. Cómo se ve el simulador: una columna más en el ranking ("ganarías aprox.") o un bloque aparte encima de la tabla.
2. Si el simulador aplica también a CTS o solo a plazo fijo.
3. Si el monto escrito se recuerda en el navegador o se borra al salir.
4. Confirmar que la tabla de plazo fijo en dólares es por US$ 10 000.

**Notas técnicas para retomar**
- La SBS bloquea a los robots (Incapsula): no se puede leer desde el entorno de Claude ni desde Apps Script. No intentar saltarse la protección. Los datos entran por PDF o capturas que pasa Héctor en el chat; un PDF impreso desde la página de la SBS se lee bien con `pdftotext -layout`. **E3 está por replanificar** (alternativas en `docs/backlog.md`).
- Radar mantiene solo tres tablas de la SBS (ver arriba). No pedir otros montos ni regiones.
- El archivo de Sheets se edita con el conector de Google Sheets (buscarlo en Drive por su título; su identificador no se guarda en el repositorio). Después de cambiar la hoja, la app web tarda hasta 5 minutos en reflejarlo por la caché.
- Si se cambia `Api.gs` o `Utilidades.gs`, Héctor debe pegar el código nuevo y crear una versión nueva de la misma implementación (así la dirección `/exec` no cambia).
- Esta sesión en la nube no puede controlar la laptop de Héctor ni su navegador.
- Entorno "radar-finanzas": permite TradingView, la página publicada, la SBS, `fsd.org.pe`, `script.google.com` y `script.googleusercontent.com`.
- En las pruebas con navegador automático, simular una parte de la app web y dejar pasar el resto puede hacer fallar un pedido real; conviene simular todo o nada.
- TradingView cambia sus widgets sin aviso; si uno sale vacío en las pruebas, revisar primero si el entorno bloquea un sitio nuevo. Las capturas de página completa muestran vacíos los gráficos fuera de pantalla.
- Commits con identidad genérica (`Claude <noreply@anthropic.com>`). Se trabaja en una rama y se pasa a `main` al cerrar la sesión.

**Pendientes abiertos:** sección "Pendientes" de `docs/decisiones.md` y "Mejoras menores pendientes" de `docs/backlog.md`.

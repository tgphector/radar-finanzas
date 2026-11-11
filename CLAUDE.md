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
Actualizado: 11 nov 2026, E4 y E5 construidos y a la espera de dos pasos de Héctor para publicarlos.

**En curso:** E4 · Mis reglas y E5 · Tipo de cambio. Están construidos y probados en local con datos simulados, **en la rama de trabajo, no en `main`**. Para publicarlos falta que Héctor haga dos pasos (abajo).

**Terminado y publicado**
- E1 · Esqueleto + Mis gráficas.
- E2 · Depósitos: plazo fijo y CTS, con simulador.
- E3 · Carga manual quincenal, `historial_tasas`, aviso de datos viejos y PWA (replanificado; sin contador de visitas).

**Lo que falta para publicar E4 y E5**
1. Héctor: en Apps Script, reemplazar `Api.gs` y `Utilidades.gs` por los de `apps-script/` y crear una versión nueva de la misma implementación. Desde esta versión los recursos se definen en la hoja `fuentes` y no hará falta republicar para sumar otro.
2. Héctor: abrir la hoja `tipo_cambio` del archivo y pulsar "Permitir acceso" (hoy la fórmula del BCRP da #REF!).
3. Claude: comprobar que la app web entrega `precios` y `tc` con datos reales (en especial que Apps Script lee bien los valores de `GOOGLEFINANCE`), probar los dos módulos en local con datos reales, pasar la rama a `main` y verificar en la página publicada. Si la rama y `main` difieren al iniciar la sesión, es por esto.

**Después: E6 · Calculadoras.** Falta que Héctor elija cuáles; la lista propuesta y la recomendación están en `docs/backlog.md`.

**Decisiones abiertas con Héctor**
1. Qué calculadoras entran en E6.
2. Revisar las decisiones del 11 nov 2026 marcadas "Decidido por Claude" en `docs/decisiones.md` (diseño de Mis reglas, precios desde `GOOGLEFINANCE`, tipo de cambio, simulador, PWA).
3. Contador de visitas (opciones en `docs/backlog.md`, E3).

**Notas técnicas para retomar**
- Hoja de Sheets "Radar · Base de datos": `tasas_pf`, `tasas_cts`, `historial_tasas`, `precios` (fórmulas `GOOGLEFINANCE`), `tipo_cambio` (fórmula `IMPORTDATA` del BCRP), `fsd`, `fuentes`, `log`. Se edita con el conector de Google Sheets (buscarla en Drive por su título; su identificador no va en el repositorio). La app web tarda hasta 5 minutos en reflejar un cambio.
- La SBS bloquea a los robots: no se puede leer desde el entorno de Claude ni desde Apps Script. No intentar saltarse la protección. Los datos de depósitos entran por PDF que pasa Héctor; procedimiento en `docs/arquitectura.md`, sección 12. Solo tres tablas, todas de Lima.
- La API de estadísticas del BCRP sí responde sin protección (`estadisticas.bcrp.gob.pe/estadisticas/series/api/<series>/<formato>/<desde>/<hasta>/esp`).
- Fechas pendientes: carga quincenal de la SBS hacia el 26 nov 2026; monto del FSD nuevo desde diciembre.
- Al agregar archivos nuevos a Radar, sumarlos a la lista `BASE` de `sw.js` y cambiar el nombre `CACHE`.
- Esta sesión en la nube no puede controlar la laptop de Héctor ni su navegador.
- Entorno "radar-finanzas": permite TradingView, la página publicada, la SBS, `fsd.org.pe`, `estadisticas.bcrp.gob.pe`, `script.google.com` y `script.googleusercontent.com`.
- En las pruebas con navegador automático, para simular solo algunos recursos de la app web conviene responder los demás con `route.fetch()` y `fulfill`, no con `continue()`.
- TradingView cambia sus widgets sin aviso; si uno sale vacío en las pruebas, revisar primero si el entorno bloquea un sitio nuevo. Las capturas de página completa muestran vacíos los gráficos fuera de pantalla.
- Commits con identidad genérica (`Claude <noreply@anthropic.com>`). Se trabaja en una rama y se pasa a `main` al cerrar la sesión.

**Pendientes abiertos:** sección "Pendientes" de `docs/decisiones.md` y "Mejoras menores pendientes" de `docs/backlog.md`.

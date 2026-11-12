# Backlog y plan de entregables de Radar

El avance se lleva por **sesiones de trabajo** (~3 h cada una), no por fechas de calendario.
Apetito: ~3 sesiones por entregable. Si no cabe, se recorta alcance, no se agregan sesiones.
Después de cada entregable: usarlo al menos 3 veces antes de dar por cerrado el siguiente.

## Plan

| Entregable | Contenido | Sesiones | Estado |
|---|---|---|---|
| E1 | Esqueleto + Mis gráficas, publicado en GitHub Pages | 3 (S1 a S3) | **Terminado (11 nov 2026)** |
| E2 | Depósitos: plazo fijo y CTS (con `Api.gs` leyendo Sheets) | 3 (S1 a S3) | **Terminado (11 nov 2026)** · uso confirmado por Héctor |
| E3 | Datos al día sin lectura automática + PWA (replanificado) | 1 de 3 usadas | **Terminado (11 nov 2026)** · uso confirmado por Héctor; el contador de visitas quedó sin construir |
| Revisión | ¿Se usa? ¿Sigue el ritmo? ¿Qué sigue? | — | **Hecha en conversación (11 nov 2026):** Héctor pidió seguir con E4 y E5 y preguntó por E6 |
| Fundamentales | Tabla propia con P/E, P/E forward y otras métricas (Apps Script + API + Sheets) | 3 | Tentativo · después de E3; su número y su orden frente a E4 se fijan en la revisión |
| E4 | Mis reglas | 1 de 3 usadas | **Publicado (12 nov 2026)** · verificado con datos reales; falta que Héctor lo use |
| E5 | Tipo de cambio | 1 de 3 usadas | **Publicado (12 nov 2026)** · verificado con datos reales; falta que Héctor lo use |
| E6 | Calculadoras | 1 de 3 usadas | **Publicado (12 nov 2026)** · cuatro calculadoras; falta que Héctor las use |
| E7 | Metas de ahorro | — | Tentativo |
| E8 | Flujo de efectivo (Plantilla 1) | — | Tentativo |

## Detalle por entregable

### E1 · Esqueleto + Mis gráficas (en GitHub Pages) · TERMINADO
Cerrado el 11 nov 2026 con la definición de terminado completa (sección 14 de `docs/arquitectura.md`), revisado en la página publicada.

| Sesión | Qué se construye | Qué queda funcionando | Estado |
|---|---|---|---|
| S1 | Repositorio `tgphector/radar-finanzas` con Pages activo. Esqueleto: menú lateral (laptop) y barra inferior (celular), router, design system, pie con aviso, `memoria.js`, `ui.js`, `simbolos.json`. 6 tarjetas de favoritos con mini gráfico | Enlace público con menú, #/graficas con los 6 favoritos, #/plazos con "Próximamente", aviso en el pie | **Hecha (10 nov 2026).** Revisada en la página publicada en laptop y celular. Quedó para S2: probar los otros 39 símbolos |
| S2 | **Primero:** probar los 39 símbolos restantes en TradingView y corregir `simbolos.json`. Luego: tabla por pestañas (Populares, ETFs, Otros, Referencias), chips de símbolos, botón "Editar" con interruptor por símbolo guardado en el navegador, carga diferida | Activar y desactivar símbolos y que se recuerde al volver; solo cargan los activos y visibles | **Hecha (11 nov 2026).** Los 45 símbolos cargan (QBTS corregido a NASDAQ). El clic en un chip abre un gráfico simple de 1 año. Revisada en la página publicada |
| S3 | Gráfico grande con selector 1d / 5d / 1m / 1a / 5a (reemplaza al gráfico simple que hoy abre el chip), fuente y hora en cada bloque, pruebas (sin conexión, localStorage bloqueado, celular) | E1 terminado según la definición de terminado | **Hecha (11 nov 2026).** Gráfico avanzado de TradingView con periodos y buscador; panel a pantalla completa en celular; botón "Ampliar" en favoritos; tabla centrada a 780 px; subtítulo nuevo. Revisada en la página publicada |

- **Lista de símbolos y diseño de la vista:** sección 11 de `docs/arquitectura.md`.
- **Buscador de símbolos (S3, condicional):** si el widget que se elija para el gráfico grande trae buscador propio, se activa en la S3 para ver cualquier símbolo, no solo los de `simbolos.json`. El gráfico avanzado de TradingView tiene la opción `allow_symbol_change` (aparece en su script; falta verla funcionando). Si el widget elegido no trae buscador, no se construye uno propio en E1. Límite conocido: la página no puede leer qué símbolo buscó el usuario dentro del widget, así que el título y los chips de Radar no cambian con la búsqueda.
- **Buscador: hecho en la S3** con la lupa del gráfico avanzado (`allow_symbol_change`).
- **Recortado en la S3:** edición de favoritos desde la interfaz; pasó a "Ideas sin compromiso". Los favoritos quedan fijos por defecto.
- **Riesgo:** algún símbolo no disponible en los widgets gratuitos de TradingView.

### E2 · Depósitos (plazo fijo y CTS)
El módulo se llama "Depósitos" en el menú desde la S2; su dirección sigue siendo `#/plazos`.

| Sesión | Qué se construye | Qué queda funcionando | Estado |
|---|---|---|---|
| S1 | Revisar qué publica la SBS, archivo "Radar · Base de datos" con `tasas_pf`, `fsd`, `fuentes` y `log`, `Api.gs` publicado como app web, `config.js` y `datos.js` | La página publicada logra leer las tasas de la hoja a través de la app web | **Hecha (11 nov 2026).** 33 entidades cargadas (Lima, soles, S/ 10 000 a 360 días). Lectura comprobada desde el origen de la página publicada. Plazos fijos sigue como "Próximamente" |
| S2 | Cargar las tablas de la SBS, llenar el FSD, ranking por TREA con selector de moneda, fecha de los datos bien visible, nota de cobertura del FSD, ayudas "?". CTS se sumó en esta sesión | #/plazos muestra los rankings reales con fuente y fecha | **Hecha (11 nov 2026).** Módulo "Depósitos" con selector Plazo fijo / CTS y Soles / Dólares. Revisada en la página publicada |
| S3 | Simulador y pruebas finales (sin conexión, app web caída, hoja vacía, celular) | E2 terminado según la definición de terminado | **Hecha (11 nov 2026).** Simulador de plazo fijo publicado y probado en la página; pruebas de falla repetidas con el simulador incluido |

- **Qué publica la SBS** (aplicativo "Costo y Rendimiento de Productos Financieros", revisado el 11 nov 2026): por región y producto, una tabla por condición. Plazo fijo: entidad y TREA; en soles hay cuatro condiciones (S/ 2 500, 5 000, 10 000 y 20 000), todas a 360 días. CTS: entidad con TREA mínima y máxima en soles y en dólares. La SBS registra la TREA mínima aplicable. No publica TEA, tipo de entidad ni cobertura del FSD.
- **Datos que mantiene Radar (decisión de Héctor en la S2): solo tres tablas de Lima.** Plazo fijo en soles por S/ 10 000 a 360 días (33 entidades), plazo fijo en dólares por US$ 10 000 a 360 días (32) y CTS (29). Carga manual quincenal a partir de los PDF o capturas que pasa Héctor. Los otros montos y regiones quedan fuera.
- **Ranking (hecho):** tabla propia ordenada por TREA, con barra cian. En CTS se ordena por la TREA mínima y se muestra el rango mínimo – máximo. La fecha de los datos va en una etiqueta arriba y cambia a aviso si tienen más de 15 días.
- **FSD (hecho):** una nota bajo la tabla con el monto vigente; solo se marca la entidad cuya cobertura no esté verificada. El monto cambia cada trimestre: toca actualizar la hoja `fsd` en diciembre, marzo, junio y setiembre.
- **Simulador (hecho en S3):** solo para plazo fijo. El usuario escribe un monto y la tabla suma la columna "Interés estimado" (monto × TREA, a 360 días) con la tasa publicada para 10 000; una nota dice que es un estimado y avisa si el monto en soles supera la cobertura del FSD. El monto se recuerda solo en el navegador y tiene botón "Borrar". No aplica a CTS: ahí el saldo cambia con cada depósito del empleador y un cálculo simple engañaría.
- **Recortable:** filtro por tipo de entidad.
- **Plan B descartado:** la página sí logra leer la app web; no hace falta el archivo JSON en el repositorio.

### E3 · Datos al día sin lectura automática + PWA (replanificado el 11 nov 2026)
El plan original (leer la SBS cada día con Apps Script) no es posible: la SBS protege su sitio contra robots y rechaza a Apps Script, a un pedido simple y a un navegador automático. No se intenta saltar esa protección. E3 se rehízo con lo que sí se puede hacer.

| Parte | Estado |
|---|---|
| Carga manual quincenal de las tres tablas a partir de los PDF que pasa Héctor | **Funciona** desde E2. Procedimiento en `docs/arquitectura.md`, sección 12 |
| Hoja `historial_tasas`: una copia fechada de las tres tablas en cada carga; nunca se borra | **Hecha.** Primera copia: 11 nov 2026 (123 filas) |
| Aviso en la página cuando los datos tienen más de 15 días | **Hecho** en E2 (la etiqueta de fecha cambia a aviso). Reemplaza al correo de alerta, que sin actualización automática no tiene qué vigilar |
| Copia del código `.gs` en `/apps-script` | **Hecha** en E2 |
| Radar instalable como app (PWA) y uso sin conexión con la última copia | **Hecho.** `manifest.json`, `sw.js` e íconos; probado en la página publicada |
| Contador de visitas sin cookies | **Pendiente de decisión** (ver abajo) |

- **Contador de visitas: por decidir en la revisión.** Contar visitas exige escribir en algún lado, y la app web de Radar es de solo lectura a propósito. Opciones: (1) un servicio externo de estadísticas sin cookies, que requiere que Héctor cree una cuenta; (2) una segunda app web de Apps Script que solo sume visitas en una hoja, lo que abre una puerta de escritura pública; (3) no medir y preguntarle a los amigos. Recomendación: (3) por ahora, o (1) si de verdad hace falta el número.
- **Alternativas descartadas para leer la SBS:** GitHub Actions (saldría de servidores, igual que Apps Script, y además se había dejado fuera del stack) y cualquier forma de saltarse la protección.
- **Pendiente de explorar, sin compromiso:** si la SBS publica las mismas tasas en un archivo descargable o en datos abiertos.
- **Para darlo por terminado falta:** que Héctor instale Radar como app y lo use al menos 3 veces, y la decisión del contador.

### E4 · Mis reglas (publicado el 12 nov 2026)
Héctor pidió hacer "lo recomendado"; el diseño lo decidió Claude y queda aquí para revisarlo.

- **Qué hace:** el usuario anota posiciones (símbolo y precio de compra) y las reglas que él mismo se puso: objetivo de subida en %, límite de bajada en % (opcional) y cada cuántos días revisar (opcional). Radar muestra la variación frente a la compra y avisa con una etiqueta: "Objetivo alcanzado", "Límite alcanzado" o "Toca revisar". No recomienda comprar ni vender.
- **Privacidad:** las posiciones viven solo en el navegador (`radar.reglas.posiciones`). No se piden cantidades ni montos invertidos.
- **Precios:** hoja `precios` con fórmulas `GOOGLEFINANCE` para los 45 símbolos (precio con retraso de hasta 20 minutos, cierre anterior, hora y moneda). Sin clave de API ni Apps Script propio: reemplaza a "ActualizarPrecios.gs + API con clave". Se usa el último precio con retraso, no el cierre del día anterior.
- **Respaldo:** botones "Exportar" e "Importar" con un archivo JSON de todo lo personal de Radar (posiciones, favoritos, símbolos apagados, ajustes).
- **Publicado y verificado (12 nov 2026):** Héctor actualizó la app web; Apps Script lee bien los valores de `GOOGLEFINANCE` (45 símbolos con precio). Probado en la página publicada con posiciones de prueba, que se borraron al terminar.
- **Riesgo:** Google no garantiza `GOOGLEFINANCE` ni autoriza redistribuir sus datos con fines profesionales. Radar es personal, sin fines de lucro y con `noindex`; si Google cambia las condiciones, se pasa a una API con clave (candidatas en la sección de Fundamentales).
- **Fuera de alcance:** símbolos que no estén entre los 45, alertas por correo o notificación, y cálculo de ganancia en dinero.

### E5 · Tipo de cambio (publicado el 12 nov 2026)
Fuentes elegidas por Héctor: Google y BCRP. El diseño lo decidió Claude.

- **Dólar hoy:** tres tarjetas. Sistema bancario (SBS) e interbancario, compra y venta, del BCRP (un dato por día hábil, con la variación frente al día anterior), y valor de mercado de Google Finance (con retraso).
- **Conversor:** "Tengo soles" o "Tengo dólares" y un monto; muestra el resultado con cada tipo de cambio (venta para comprar dólares, compra para venderlos). El monto no se guarda.
- **Últimos días:** tabla de los últimos 10 días hábiles del BCRP.
- **Datos:** hoja `tipo_cambio` con una fórmula `IMPORTDATA` sobre la API pública de estadísticas del BCRP (series PD04637PD a PD04640PD), que se actualiza sola; y la fila USD/PEN de la hoja `precios`. Sin Apps Script propio ni activadores.
- **Publicado y verificado (12 nov 2026):** Héctor permitió el acceso de la hoja al BCRP y la fórmula trae 33 días de datos. Probado en la página publicada: tarjetas, conversor y tabla.
- **Fuera de alcance:** otras monedas, tipo de cambio de casas de cambio y gráfico histórico (USD/PEN ya se ve en Mis gráficas, pestaña Referencias).

### E6 · Calculadoras (publicado el 12 nov 2026)
Héctor eligió cuatro. Ninguna necesita datos externos y los montos no se guardan.

| Calculadora | Qué pide | Qué entrega |
|---|---|---|
| Interés compuesto | Monto inicial, aporte mensual, TEA y años | Monto final, total aportado, intereses y tabla año por año |
| Resultado de una operación | Precio de compra y de venta, cantidad, comisiones y tipo de cambio | Costo, lo que se recibe, resultado en dólares y en %, y en soles |
| Préstamo | Monto, TEA y meses | Cuota mensual fija, total pagado, intereses y cronograma (hasta 60 meses a la vista) |
| Tiempo para una meta | Meta, lo que ya se tiene, TEA y aporte o plazo | En cuánto tiempo se llega, o cuánto aportar al mes |

- Todas trabajan con tasa efectiva anual (TEA) convertida a tasa mensual, y dicen sus supuestos: misma tasa todo el plazo, aportes al final de cada mes, sin impuestos, comisiones ni inflación.
- "Resultado de una operación" propone el tipo de cambio de venta SBS del BCRP (se puede cambiar); si no hay dato, el campo queda vacío y no se muestra el resultado en soles.
- "Préstamo" avisa que la cuota real será mayor y remite a la TCEA de cada entidad.
- **No elegidas (quedan como ideas):** depósito a plazo con cualquier plazo, conversor de tasas y rendimiento real.
- **Cruces por decidir:** "Tiempo para una meta" se parece a E7 (Metas de ahorro) y "Préstamo" a la idea de Préstamos (TCEA).

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

## Mejoras menores pendientes (se toman cuando sobre tiempo en una sesión)
- **Que el título del gráfico grande siga al símbolo buscado con la lupa** (pedido de Héctor, 11 nov 2026). Hoy el título muestra el símbolo con el que se abrió. Dificultad: el widget es un iframe de otro sitio y Radar no puede leer qué símbolo se buscó. Antes de prometerlo hay que revisar si el widget avisa el cambio de símbolo a la página; si no lo hace, la salida es quitar el símbolo del título o usar un buscador propio.

## Ideas sin compromiso (no entran a un entregable sin decidirlo en una revisión)
- **Editar favoritos desde la interfaz** (recortado de E1 en la S3). Se guardaría en `radar.graficas.favoritos`, que el código ya lee.
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

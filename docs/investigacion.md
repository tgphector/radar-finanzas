> **Contexto histórico.** Este documento es la investigación inicial del proyecto (10 nov 2026) y no se actualiza. Sirve para buenas prácticas, fuentes de datos y límites legales. Si contradice a `docs/arquitectura.md` o `docs/decisiones.md`, mandan estos. Ya no aplican: la etapa en artifact, GitHub Actions, los entregables de 2 semanas, el enfoque mobile-first y la lista de símbolos en borrador (la vigente está en la sección 11 de `docs/arquitectura.md`).

# Hub Finanzas — Investigación y bases del proyecto

Nov 10, 2026 · @Hector

## Resumen

El Hub Finanzas es una web personal, para Héctor y sus amigos, que reúne herramientas financieras informativas (sin asesoría) en una sola interfaz. Se construye por entregables de 2 semanas sobre un esqueleto mínimo. Este documento es el contexto base para cualquier conversación del proyecto.

**Conclusiones clave**

1. **Construir por entregables es la práctica validada:** un esqueleto que camina y luego incrementos con tiempo fijo y alcance variable (sección 1).
2. **Mobile-first y poco por pantalla:** una columna, 3-4 datos clave y botones de 48 px (sección 2).
3. **La confianza se gana con fecha y fuente en cada dato** y con contexto de comparación (sección 3).
4. **Casi todo ya existe por separado en Perú;** el valor está en reunirlo con tu criterio y tu diseño (sección 4).
5. **La educación financiera larga casi no cambia conductas;** la que funciona es la explicación breve justo al decidir (sección 4).
6. **Los datos clave son gratuitos:** SBS, BCRPData con API y widgets de TradingView; falta confirmar la lectura automática de la SBS (sección 5).
7. **Ruta técnica:** artifact en Claude para los entregables 0-2 y luego GitHub Pages con GitHub Actions (sección 6).
8. **Límite legal:** informar sí, aconsejar no; aviso visible y consultar antes de abrir Radar a más personas (sección 8).

## 1. Cómo llevar el proyecto por entregables

La práctica validada es empezar con un **esqueleto que camina** y crecer por incrementos con tiempo fijo y alcance variable. Diseñar todo antes de construir es lo que más proyectos personales mata.

**Esqueleto que camina (walking skeleton).** Alistair Cockburn lo define como una implementación mínima, de punta a punta, que conecta todos los componentes principales del sistema ([O'Reilly](https://oreilly.com/library/view/97-things-every/9780596800611/ch60.html)). No es un boceto: funciona y se puede usar desde el día uno. Para el Hub: una página con menú, el diseño base, un archivo de datos y una herramienta real.

**Arquitectura que evoluciona.** La recomendación es construir simple, ver qué funciona y luego evolucionar; sobre-diseñar antes de tener claridad te hace lento ([Learn Agile Practices](https://learnagilepractices.substack.com/p/practical-handbook-for-product-developers-ddd)). Las decisiones se separan en reversibles (colores, textos) y difíciles de revertir (estructura de datos, dónde se aloja); solo las segundas se piensan con cuidado al inicio.

**Tiempo fijo, alcance variable (Shape Up, Basecamp).** En lugar de estimar cuánto tardará algo, decides cuánto tiempo vale (el "apetito") y recortas el alcance para que quepa ([Basecamp](https://basecamp.com/shapeup/1.2-chapter-03)). Basecamp usa ciclos de 2 semanas (lote pequeño) o 6 semanas (lote grande).

**Adaptación para ti (una persona, 3-4 h por semana):**

| Práctica | Cómo se aplica en el Hub |
| --- | --- |
| Apetito por entregable | 2 semanas por entregable (\~6-8 h en total) |
| Recorte de alcance | Si a la semana 2 no cabe, se corta una función, no se extiende el plazo |
| Definición de terminado | Funciona en celular y laptop, datos con fecha visible, se usó al menos 3 veces |
| Pausa entre ciclos | 1 semana sin construir: usar, anotar fricciones, decidir lo siguiente |
| Backlog | Lista de ideas sin compromiso; una idea entra a un ciclo solo si se elige en la pausa |
| Registro de decisiones | Una línea por decisión: qué, por qué, fecha |

**Ciclo de cada entregable:** 1) definir el problema y el apetito, 2) bocetar la pantalla en papel o en un mockup, 3) construir con Claude, 4) usar una semana, 5) anotar qué falta y decidir.

## 2. Buenas prácticas de apps y webs

Para un Hub que se usa sobre todo en el celular, lo que más pesa es diseñar primero para pantalla pequeña, mostrar poco a la vez y separar datos de código.

| Área | Práctica | Regla concreta para el Hub |
| --- | --- | --- |
| Diseño | Mobile-first: diseñar una columna y luego expandir a tablet y laptop ([Bricks](https://www.thebricks.com/resources/how-to-make-your-dashboard-mobile-friendly)) | Cada módulo se prueba primero en el celular |
| Toque | Apple pide objetivos de 44 px y Google 48 px como mínimo ([Bricks](https://www.thebricks.com/resources/how-to-make-your-dashboard-mobile-friendly)) | Botones de al menos 48 px de alto |
| Contenido | Divulgación progresiva: lo esencial primero, el detalle a un toque ([Toptal](https://www.toptal.com/designers/dashboard-design/mobile-dashboard-ui)) | Máximo 3-4 datos clave por pantalla |
| Velocidad | Un enlace compartido debe mostrar el primer dato en menos de 2 segundos con datos móviles ([Bricks](https://www.thebricks.com/resources/best-practices-for-mobile-dashboard-design)) | Sin librerías pesadas; imágenes mínimas |
| Arquitectura | Módulos independientes que comparten menú, estilos y formato de datos | Agregar un módulo no modifica los anteriores |
| Design system | Colores, tipografía, espaciado y componentes definidos una vez | Tarjeta, tabla, gráfico y botón reutilizables |
| Datos | Cada módulo lee su propio archivo (JSON), con fecha de actualización | `tasas.json`, `acciones.json`, cada uno con campo `actualizado` |
| Accesibilidad | Contraste mínimo de 4.5:1 en texto (WCAG) y no depender solo del color | Rojo y verde siempre acompañados de signo o flecha |
| Privacidad | Sin cuentas ni datos personales en v0.x | Lo que guarde un usuario queda solo en su navegador |
| Seguridad | Ninguna clave de API en el código visible | Las llamadas con clave se hacen desde GitHub Actions, no desde la página |

**Probar con pocos usuarios funciona.** Una ronda corta con cinco usuarios ya da hallazgos valiosos ([Toptal](https://www.toptal.com/designers/data-visualization/dashboard-design-best-practices)). Para ti: 3-5 amigos, cada uno usa el Hub 10 minutos mientras observas sin ayudar.

## 3. Buenas prácticas de apps de finanzas y dashboards

En finanzas la confianza se gana con transparencia: de dónde sale cada dato, cuándo se actualizó y qué significa.

- **Fecha visible en cada dato.** Los dashboards financieros usan marcas de tiempo como mecanismo de confianza en los datos ([Ramotion](https://www.ramotion.com/blog/fintech-dashboard-design-examples/)). Regla: cada tabla y gráfico muestra "Fuente: SBS · actualizado 10 nov 2026".
- **Contexto antes que números sueltos.** La guía de diseño fintech recomienda presentar los datos con referencias de comparación y no como cifras crudas ([Boundev](https://www.boundev.ai/blog/fintech-ux-design-builds-trust-drives-adoption)). Ejemplo: "5.5% TREA · 2.1 puntos sobre el promedio de bancos".
- **Educación en el lugar.** Las prácticas citadas incluyen educación contextual dentro del producto y microcopy claro ([Ramotion](https://www.ramotion.com/blog/fintech-ux-design/)). Regla: un ícono "?" junto a TREA, TCEA, FSD, etc., con una explicación de una línea.
- **Un mensaje por pantalla.** Cada módulo responde una sola pregunta ("¿dónde rinde más mi plazo fijo?"); esa pregunta va como título.
- **Diseño calmado.** Las guías de dashboards de inversión hablan de reducir carga cognitiva y decisiones por pánico en caídas ([Lollypop](https://lollypop.design/?p=25057)). Regla: sin rojos dominantes ni alertas animadas; el horizonte de largo plazo visible por defecto (1 año o 5 años, no 1 día).
- **Comparar lo comparable.** TREA en ahorros y TCEA en créditos son las medidas a todo costo que publica la SBS para comparar; no se mezclan con TEA.

## 4. Qué ya existe y qué está validado

Casi cada módulo que imaginas ya existe por separado en Perú; lo que no existe es tenerlos juntos, con tu criterio y tu diseño. El valor del Hub está en reunirlos, no en inventarlos.

**Referentes en Perú**

| Herramienta | Qué hace | Qué aprender de ella |
| --- | --- | --- |
| [SBS · tasas pasivas](https://www.sbs.gob.pe/app/pp/EstadisticasSAEEPortal/Paginas/TasaInteresPasivasMenu.aspx) | Tasas por tipo de depósito y entidad (bancos, financieras, cajas) | Es la fuente oficial; las tasas son referenciales |
| [SBS · simulador de plazo fijo](https://www.sbs.gob.pe/download/TipoTasa/files/00152_1_15.htm) | Muestra TEA, intereses, monto final y TREA por entidad para un monto dado | Ya trae el cálculo que quieres; tú le das mejor diseño |
| [Trámites Perú · cuentas de ahorro](https://tramitesperu.com/comparadores/cuentas-ahorro/) | Comparador de ahorro, plazo fijo y CTS con datos de la SBS y simulador | Prueba que se puede automatizar con datos SBS |
| [Trámites Perú · dólar](https://tramitesperu.com/comparadores/dolar/) | Tipo de cambio en vivo de casas online con referencia SBS/SUNAT | Módulo de tipo de cambio para el backlog |
| [Compara Dólar](https://pe.linkedin.com/in/reymundojg) | Ranking en vivo de casas de cambio supervisadas por la SBS, hecho por una persona | Ejemplo de un proyecto individual peruano que funcionó |

**Referentes globales de seguimiento de portafolio:** Getquin, Delta, Snowball Analytics y Sharesight. Getquin, por ejemplo, permite registrar una posición hipotética desde la lista de seguimiento para ver cómo habría cambiado el portafolio ([Freenance](https://freenance.io/products/getquin-review-2026-portfolio-tracker-european-investors-app/)). Las funciones sociales, en cambio, pueden amplificar el FOMO al ver los retornos de otros ([Freenance](https://freenance.io/financial-tools/best-investment-tracker-apps/)).

**Qué funciones ayudan según la evidencia**

| Función | Evidencia | Implicancia para el Hub |
| --- | --- | --- |
| Educación "justo a tiempo" | Un metaanálisis de 201 estudios encontró que la educación financiera explica solo 0.1% de la varianza en conductas, y propone educación atada a la decisión concreta ([Fernandes et al., 2014](https://repub.eur.nl/pub/76416)) | Nada de cursos: explicaciones de una línea junto al dato, en el momento de decidir |
| Metas de ahorro propias | Gargano y Rossi estudian metas autodiseñadas en apps fintech como mecanismos de compromiso suaves ([paper](https://www.bwl.uni-mannheim.de/media/Lehrstuehle/bwl/Area_Finance/Finance_Area_Seminar/FSS_2022/Rossi_Paper.pdf)) | Módulo futuro: meta + barra de progreso |
| Etiquetas y recordatorios | J-PAL revisó 12 evaluaciones y concluye que dispositivos "suaves" como etiquetas de cuenta y recordatorios pueden lograr lo mismo a menor costo ([J-PAL](https://www.povertyactionlab.org/id/node/7799997)) | Recordatorios simples antes que funciones complejas |
| Reglas que se cumplen | Una regla escrita se cumple más que una intención | Módulo de reglas con alerta al llegar al objetivo |

## 5. Fuentes de datos

Para los dos primeros módulos hay fuentes gratuitas y oficiales; lo que falta confirmar es si la SBS se puede leer de forma automática.

| Fuente | Datos | Acceso | Estado |
| --- | --- | --- | --- |
| [SBS · tasas pasivas](https://www.sbs.gob.pe/app/pp/EstadisticasSAEEPortal/Paginas/TasaInteresPasivasMenu.aspx) | Tasas por tipo de depósito y entidad; promedios TIPMN y TIPMEX | Páginas web por fecha; sin API conocida | A verificar si se pueden leer con un script |
| [SBS · simulador de plazo fijo](https://www.sbs.gob.pe/download/TipoTasa/files/00152_1_15.htm) | TEA, intereses, monto final y TREA por entidad | Página HTML con tabla | Candidata para leer con GitHub Actions |
| [BCRPData](https://estadisticas.bcrp.gob.pe/estadisticas/series/documentos/bcrpdataguiadeuso.pdf) | Tipo de cambio, inflación, tasas, PBI | API para desarrolladores con respuesta en JSON y CSV | Disponible |
| [Widgets de TradingView](https://tradingview.com/widget/) | Gráficos, cinta de cotizaciones, mapas de calor, fundamentales | Copiar y pegar código; gratis con la marca TradingView visible | Disponible |
| [Lightweight Charts](https://in.tradingview.com/publishing-tools) | Librería para dibujar tus propios gráficos financieros (35 KB) | Código abierto; tú pones los datos | Para módulos propios |
| APIs de precios (Alpha Vantage, Twelve Data, etc.) | Precios históricos para cálculos propios | Clave gratuita con límites | Límites y términos a verificar antes de usar |
| SMV | Fondos mutuos, valor cuota | Portal web | A verificar |

**Reglas de datos:**

- Cada archivo de datos guarda la fuente y la fecha de actualización.
- Si un dato falla al actualizarse, el Hub muestra el último valor con su fecha, nunca un número sin fecha.
- Las tasas de la SBS son referenciales: el Hub lo dice y enlaza a la entidad.

## 6. Opciones técnicas y con qué trabajaremos

La recomendación es empezar como artifact en Claude y pasar a GitHub Pages cuando haga falta automatizar datos.

| Etapa | Herramienta | Para qué | Límite clave |
| --- | --- | --- | --- |
| Entregables 0-2 | Artifact (página web en Claude) | Construir y ver cambios al instante; enlace privado para compartir | Datos actualizados a mano o con Claude |
| Entregable 3+ | [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits) | Alojar el Hub gratis con tu propia URL | Solo sitios estáticos; 1 GB por sitio y 100 GB de tráfico al mes; no apto para negocios ni transacciones |
| Entregable 3+ | [GitHub Actions](https://docs.github.com/en/actions/reference/usage-limits-billing-and-administration) | Tarea programada que baja datos (SBS, BCRP) y actualiza los JSON | Gratis en repos públicos; se desactiva tras 60 días sin actividad |
| Todas | HTML + CSS + JavaScript en un archivo por módulo | Sin instalaciones; funciona en cualquier navegador | Mantenerlo simple: sin frameworks al inicio |
| Gráficos | Widgets de TradingView + Lightweight Charts | Gráficos de acciones listos y gráficos propios | La marca TradingView debe quedar visible |
| Gestión | Proyecto en Claude "Hub Finanzas" | Instrucciones, arquitectura, backlog y decisiones | Actualizar los documentos al cerrar cada sesión |

**Documentos del proyecto (se preparan después del feedback):**

1. `instrucciones.md`: rol de Claude, reglas de construcción, formato de cada sesión.
2. `arquitectura.md`: estructura de carpetas, design system, formato de datos y regla para agregar módulos.
3. `backlog.md`: entregables con apetito, criterio de terminado y estado.
4. `decisiones.md`: registro de decisiones con fecha.

**Nota sobre el repositorio:** GitHub Pages gratis requiere repositorio público, así que nada personal (montos de tu portafolio) va en el código ni en los datos.

## 7. Ideas de módulos (backlog priorizado)

Propuesta de orden: primero lo que usas tú cada semana, después lo que sirve a tus amigos y al final lo que requiere datos difíciles. El orden es una propuesta para tu feedback.

| Prioridad | Módulo | Pregunta que responde | Referente o evidencia | Esfuerzo |
| --- | --- | --- | --- | --- |
| 1 | Mis gráficas | ¿Cómo van las acciones y ETFs que sigo? | Widgets de TradingView | Bajo |
| 2 | Ahorro y plazos fijos | ¿Dónde rinde más mi dinero y cuánto ganaría? | Simulador SBS, Trámites Perú | Medio |
| 3 | Mis reglas | ¿Alguna posición llegó a mi objetivo o a su revisión? | Recordatorios (J-PAL) | Medio |
| 4 | Tipo de cambio | ¿Dónde cambio dólares hoy? | BCRPData, Compara Dólar | Medio |
| 5 | Calculadoras | Interés compuesto, aporte mensual, tamaño de posición | Laboratorio de estrategia | Bajo |
| 6 | Metas de ahorro | ¿Cuánto me falta y a qué ritmo voy? | Metas autodiseñadas (Gargano y Rossi) | Bajo |
| 7 | Flujo de efectivo | Plantilla 1 en versión web | Tu Excel ya diseñado | Medio |
| 8 | Glosario justo a tiempo | ¿Qué significa TREA, TCEA, ETF, P/E? | Educación justo a tiempo (Fernandes et al.) | Bajo, transversal |
| 9 | Préstamos (TCEA) | ¿Dónde me sale más barato un crédito? | SBS tasas activas | Medio |
| 10 | Fondos mutuos | ¿Qué fondo rinde más a igual riesgo? | SMV (datos a verificar) | Alto |
| 11 | Factoring | ¿Conviene y con qué riesgo? | Cumplo, Prestamype | Alto |

**Descartado por ahora:** consejos personalizados, cuentas de usuario, conexión con el broker y funciones sociales.

## 8. Límites legales y riesgos

Como herramienta informativa para ti y tus amigos, el riesgo es bajo si se respetan estas reglas. No soy abogado: esto es una lectura general, no asesoría legal.

- **Sin asesoría.** En agosto de 2026 la SMV publicó la [Resolución SMV N° 011-2026-SMV/01](https://www.gob.pe/institucion/smv/noticias/1434034-smv-modifica-los-reglamentos-de-agentes-de-intermediacion-de-fondos-mutuos-y-de-fondos-de-inversion), que armoniza el perfil de riesgo, la asesoría de inversiones y la administración de cartera en entidades autorizadas. El Hub muestra datos y cálculos; no dice qué comprar ni arma portafolios por perfil.
- **Aviso visible.** Pie de página: "Herramienta informativa y educativa. No es asesoría financiera. Tasas referenciales; confirma con cada entidad."
- **Términos de terceros.** Los widgets de TradingView son gratuitos con la marca visible; las APIs de precios tienen términos propios que se revisan antes de usar.
- **GitHub Pages.** No está permitido usarlo como hosting gratuito para un negocio o para transacciones comerciales ([GitHub](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)). Si algún día se vuelve negocio, hay que migrar.
- **Antes de abrirlo.** Consultar antes de abrir Radar a más personas.

## 9. Preguntas para definir el esqueleto

Las iremos respondiendo de a 1 o 2 en la conversación. Con estas respuestas se escriben `arquitectura.md` y `backlog.md`.

**Decisiones tomadas (10 nov 2026)**

| Tema | Decisión | Implicancia |
| --- | --- | --- |
| Usuarios | Héctor y sus amigos | Debe entenderse sin explicación; aviso legal visible |
| Dispositivo | Principalmente laptop | Diseño laptop-first con menú lateral y cuadrícula de tarjetas; en celular pasa a una columna con barra inferior |
| Tema | Oscuro | Referentes: navegador Opera GX (negro y grises, minimalista), app de mercados con tarjetas oscuras y selector 1d/5d/1m/1a, fondo de pantalla negro con cian |

**Paleta aprobada (10 nov 2026)**

| Rol | Color | Uso |
| --- | --- | --- |
| Fondo | #0E0F11 | Fondo general |
| Superficie | #17191C | Tarjetas |
| Borde | #26292E | Bordes finos de tarjetas y tablas |
| Texto principal | #EDEDED | Títulos y cifras |
| Texto secundario | #9AA0A6 | Etiquetas, fechas, fuentes |
| Acento | #22C5D6 (cian) | Menú activo, botones, enlaces |
| Sube | #2EBD85 (verde) | Solo variaciones positivas, siempre con flecha o signo |
| Baja | #F0616D (rojo) | Solo variaciones negativas, siempre con flecha o signo |

**Módulo "Mis gráficas": lista inicial por grupos (borrador)**

| Grupo | Símbolos | Nota |
| --- | --- | --- |
| Populares (12) | NVDA, AAPL, MSFT, AMZN, GOOGL, META, TSLA, PLTR, AMD, NFLX, AVGO, INTC | Mezcla de lo más comprado y más poseído por inversionistas minoristas; se revisa cada trimestre |
| ETFs | IVV, IVW, IYE, EPU, REET, VWO, IBIT, IEMG, XLI, ITA, XLB, ICLN | Lista de seguimiento |
| Índices | QQQ (Nasdaq-100), DIA (Dow Jones), SPYM (S&P 500, antes SPLG) | Confirmar disponibilidad |
| Oro y bonos del Tesoro | IAU (oro), SHY (1-3 años), IEF (7-10 años), TLT (20+ años) | Tramos corto, medio y largo de la curva |
| Otros a considerar | BRK-B, SPYG, BAP, SAN, BAC, NU, KO, F, XOM, OXY, DVN, DELL, VRSN, INGM, PRYMY, QUBT, QBTS, RGTI | De la lista de seguimiento de Héctor; HERE pendiente de confirmar |
| Macro | USD/PEN | Pasa al módulo de tipo de cambio cuando exista |

**Vista de "Mis gráficas" (decidida 10 nov 2026)**

| Elemento | Decisión |
| --- | --- |
| Favoritos arriba | Tarjetas con mini gráfico de IVV, IVW, NVDA, EPU, IEMG y BAP por defecto |
| Tabla por grupo | Pestañas por grupo; columnas: símbolo, precio, variación %, rango del día |
| Filtro de visibilidad | El usuario activa o desactiva cada símbolo; solo se cargan los activos |
| Carga diferida | Ningún gráfico se carga hasta que el símbolo está activo y visible en pantalla |
| Gráfico grande | Se abre al hacer clic en un símbolo, con selector 1d / 5d / 1m / 1a / 5a |
| Memoria | La selección de símbolos y favoritos se guarda en el navegador de cada usuario |

**Módulo "Ahorro y plazos fijos" (decidido 10 nov 2026)**

| Elemento | Decisión |
| --- | --- |
| Producto | Solo plazo fijo |
| Moneda | Soles y dólares, con selector |
| Vista inicial | Ranking de entidades por TREA a 1 año, con fuente y fecha de la SBS |
| Simulador | Debajo del ranking; al pulsar "Simular", un nuevo ranking reemplaza al de arriba |
| Precisión | Si la SBS no publica la tasa para el monto o plazo exacto, el resultado se marca como estimado |

**Simulador y nombre (decidido 10 nov 2026)**

| Elemento | Decisión |
| --- | --- |
| Parámetros | Monto, plazo, moneda y tipo de entidad, con las opciones que publique la SBS |
| Cobertura | Etiqueta "Cubierto por el FSD" en cada entidad, con el monto vigente tomado de la fuente oficial |
| Nombre | **Radar** (provisional). El Hub muestra y compara; no dirige. Repositorio: `radar-finanzas` |

**Identidad y uso**

- [ ] Nombre del Hub (provisional o definitivo).
- [ ] Quiénes lo usarán: ¿solo tú al inicio, o 2-3 amigos desde el entregable 2?
- [ ] Dispositivo principal: ¿celular, laptop o ambos por igual?

**Diseño**

- [ ] Tema oscuro, claro o los dos con un botón.
- [ ] Colores y estilo: ¿algún referente visual que te guste (app, web)?
- [ ] Idioma: español con términos técnicos en inglés (ETF, P/E) o todo en español.

**Contenido de los primeros módulos**

- [ ] Mis gráficas: qué acciones y ETFs, y qué vista (gráfico grande, mini gráficos, cinta).
- [ ] Ahorro: ¿soles, dólares o ambos? ¿Ahorro, plazo fijo, CTS?

**Funcionamiento**

- [ ] ¿Qué debe recordar el Hub entre visitas (tu lista de acciones, tus montos)?
- [ ] Ritmo real: horas por semana y días que le dedicarás.
- [ ] Orden del backlog: ¿estás de acuerdo con la sección 7 o cambias prioridades?

## Fuentes

- [Basecamp · Shape Up, cap. 3: tiempo fijo, alcance variable](https://basecamp.com/shapeup/1.2-chapter-03)
- [O'Reilly · Start with a Walking Skeleton](https://oreilly.com/library/view/97-things-every/9780596800611/ch60.html)
- [Learn Agile Practices · Fake it till you make it](https://learnagilepractices.substack.com/p/practical-handbook-for-product-developers-ddd)
- [Bricks · Dashboards mobile-friendly](https://www.thebricks.com/resources/how-to-make-your-dashboard-mobile-friendly)
- [Bricks · Mobile dashboard design](https://www.thebricks.com/resources/best-practices-for-mobile-dashboard-design)
- [Toptal · Mobile dashboard UI](https://www.toptal.com/designers/dashboard-design/mobile-dashboard-ui)
- [Toptal · Dashboard design best practices](https://www.toptal.com/designers/data-visualization/dashboard-design-best-practices)
- [Ramotion · Fintech UX design](https://www.ramotion.com/blog/fintech-ux-design/)
- [Ramotion · Fintech dashboard design](https://www.ramotion.com/blog/fintech-dashboard-design-examples/)
- [Boundev · Fintech UX y confianza](https://www.boundev.ai/blog/fintech-ux-design-builds-trust-drives-adoption)
- [Lollypop · Investment dashboard UX](https://lollypop.design/?p=25057)
- [Fernandes, Lynch y Netemeyer (2014) · Management Science](https://repub.eur.nl/pub/76416)
- [Gargano y Rossi · Goal Setting and Saving in the FinTech Era](https://www.bwl.uni-mannheim.de/media/Lehrstuehle/bwl/Area_Finance/Finance_Area_Seminar/FSS_2022/Rossi_Paper.pdf)
- [J-PAL · Commitment savings products](https://www.povertyactionlab.org/id/node/7799997)
- [SBS · Tasas de interés pasivas](https://www.sbs.gob.pe/app/pp/EstadisticasSAEEPortal/Paginas/TasaInteresPasivasMenu.aspx)
- [SBS · Simulador de plazo fijo](https://www.sbs.gob.pe/download/TipoTasa/files/00152_1_15.htm)
- [BCRPData · Guía de uso](https://estadisticas.bcrp.gob.pe/estadisticas/series/documentos/bcrpdataguiadeuso.pdf)
- [Trámites Perú · Comparador de cuentas de ahorro](https://tramitesperu.com/comparadores/cuentas-ahorro/)
- [Trámites Perú · Comparador de dólar](https://tramitesperu.com/comparadores/dolar/)
- [Compara Dólar · publicación del creador](https://pe.linkedin.com/in/reymundojg)
- [Freenance · Reseña de getquin](https://freenance.io/products/getquin-review-2026-portfolio-tracker-european-investors-app/)
- [Freenance · Apps de seguimiento de inversiones](https://freenance.io/financial-tools/best-investment-tracker-apps/)
- [TradingView · Widgets](https://tradingview.com/widget/)
- [TradingView · Herramientas de publicación](https://in.tradingview.com/publishing-tools)
- [GitHub · Límites de GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)
- [GitHub · Límites de GitHub Actions](https://docs.github.com/en/actions/reference/usage-limits-billing-and-administration)
- [SMV · Resolución N° 011-2026-SMV/01](https://www.gob.pe/institucion/smv/noticias/1434034-smv-modifica-los-reglamentos-de-agentes-de-intermediacion-de-fondos-mutuos-y-de-fondos-de-inversion)

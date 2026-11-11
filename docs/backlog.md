# Backlog y plan de entregables de Radar

El avance se lleva por **sesiones de trabajo** (~3 h cada una), no por fechas de calendario.
Apetito: ~3 sesiones por entregable. Si no cabe, se recorta alcance, no se agregan sesiones.
Después de cada entregable: usarlo al menos 3 veces antes de dar por cerrado el siguiente.

## Plan

| Entregable | Contenido | Sesiones | Estado |
|---|---|---|---|
| E1 | Esqueleto + Mis gráficas, publicado en GitHub Pages | 3 (S1 a S3) | En curso · S1 hecha, sigue S2 |
| E2 | Plazos fijos (con `Api.gs` leyendo Sheets) | 3 | Pendiente |
| E3 | Datos automáticos con Apps Script + PWA | 3 | Pendiente |
| Revisión | ¿Se usa? ¿Sigue el ritmo? ¿Qué sigue? | 1, al terminar E3 | — |
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
| S2 | **Primero:** probar los 39 símbolos restantes en TradingView y corregir `simbolos.json`. Luego: tabla por pestañas (Populares, ETFs, Otros, Referencias), chips de símbolos, botón "Editar" con interruptor por símbolo guardado en el navegador, carga diferida | Activar y desactivar símbolos y que se recuerde al volver; solo cargan los activos y visibles | Siguiente |
| S3 | Gráfico grande con selector 1d / 5d / 1m / 1a / 5a, fuente y hora en cada bloque, pruebas (sin conexión, localStorage bloqueado, celular) | E1 terminado según la definición de terminado | Pendiente |

- **Lista de símbolos y diseño de la vista:** sección 11 de `docs/arquitectura.md`.
- **Recortable si no cabe:** edición de favoritos desde la interfaz (se dejan fijos por defecto); columna "rango del día" si el widget no la trae.
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

### E5 a E8
Se detallan en la revisión posterior a E3.

## Ideas sin compromiso (no entran a un entregable sin decidirlo en una revisión)
- Sincronizar favoritos y reglas entre laptop y celular (requiere login; evaluar en la revisión: costo, privacidad y si el exportar/importar alcanza).
- Gráfico de evolución de tasas con la hoja `historial_tasas`.
- Glosario justo a tiempo (transversal, se suma poco a poco).
- Préstamos (TCEA).
- Fondos mutuos (datos SMV a verificar).
- Factoring.
- Tema claro.

## Descartado
- Consejos personalizados, cuentas de usuario, conexión con el broker, funciones sociales.

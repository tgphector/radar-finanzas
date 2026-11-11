// ============================================================
// graficas.js · Módulo "Mis gráficas"
// Sesión 1: tarjetas de favoritos con mini gráfico.
// Sesión 2: tabla por pestañas, chips y botón "Editar".
// (Sesión 3: gráfico grande con selector de periodo.)
//
// Los gráficos y la tabla son widgets de TradingView: Radar no
// recibe los precios, solo le dice al widget qué símbolos mostrar.
// ============================================================

import { memoria } from "../../js/memoria.js";
import {
  crear, encabezado, seccion, tarjeta, lineaFuente, aviso, ayuda,
  boton, pestanas, chip, interruptor
} from "../../js/ui.js";

// Dirección de simbolos.json, calculada desde la ubicación de este archivo
const URL_SIMBOLOS = new URL("./simbolos.json", import.meta.url);

// Scripts oficiales de los widgets de TradingView (formato iframe)
const SCRIPT_MINI = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
const SCRIPT_TABLA = "https://s3.tradingview.com/external-embedding/embed-widget-market-quotes.js";

// Alto de la tabla de cotizaciones: encabezado + una fila por símbolo
// + la franja con la marca de TradingView (medidas del widget, en px).
const TABLA_ENCABEZADO = 54;
const TABLA_FILA = 36;
const TABLA_MARCA = 40;

// Vigilante de pantalla (ver alVerse). Se guarda aquí para apagar
// el anterior cada vez que el módulo se vuelve a dibujar.
let observador = null;
const pendientes = new Map();   // elemento vigilado → qué hacer cuando se vea

// --- Lee la lista de símbolos del archivo JSON ---
async function leerSimbolos() {
  const respuesta = await fetch(URL_SIMBOLOS);
  if (!respuesta.ok) throw new Error(`simbolos.json respondió ${respuesta.status}`);
  const lista = await respuesta.json();
  if (!Array.isArray(lista.pestanas) || !Array.isArray(lista.favoritos)) {
    throw new Error("simbolos.json no tiene el formato esperado");
  }
  return lista;
}

// --- Busca un símbolo ("NVDA") en todas las pestañas ---
function buscarSimbolo(lista, codigo) {
  for (const pestana of lista.pestanas) {
    const encontrado = pestana.simbolos.find((item) => item.simbolo === codigo);
    if (encontrado) return encontrado;
  }
  return null;
}

// --- Favoritos: los guardados en el navegador o, si no hay, los por defecto ---
function favoritosDelUsuario(lista) {
  const guardados = memoria.leer("graficas", "favoritos", null);
  const codigos = Array.isArray(guardados) && guardados.length ? guardados : lista.favoritos;
  // Se descartan los que ya no existen en la lista (por ejemplo, un símbolo retirado)
  return codigos.map((codigo) => buscarSimbolo(lista, codigo)).filter(Boolean);
}

// --- Texto dentro de la tarjeta mientras no hay widget ---
// titulo y detalle identifican qué se está cargando; mensaje dice qué pasa.
function ponerEspera(caja, { titulo, detalle }, mensaje) {
  let espera = caja.querySelector(".tarjeta__espera");
  if (!espera) {
    espera = crear("div", { clase: "tarjeta__espera" });
    caja.append(espera);
  }
  espera.replaceChildren(
    crear("strong", { texto: titulo }),
    crear("span", { texto: detalle }),
    crear("span", { texto: mensaje })
  );
}

// --- Crea un widget de TradingView dentro de una tarjeta ---
// Sirve para el mini gráfico y para la tabla: solo cambian el script
// y la configuración. "rotulo" es el texto de espera ({ titulo, detalle })
// y "que" la palabra para los mensajes ("el gráfico", "la tabla").
function cargarWidget(caja, { script: src, config, rotulo, que }) {
  // Sin internet no se intenta: se avisa y se reintenta solo al volver la conexión
  if (!navigator.onLine) {
    ponerEspera(caja, rotulo, `Sin conexión. Cargará ${que} cuando vuelva el internet.`);
    window.addEventListener("online", () => {
      if (caja.isConnected) cargarWidget(caja, { script: src, config, rotulo, que });
    }, { once: true });
    return;
  }

  ponerEspera(caja, rotulo, `Cargando ${que}…`);

  // Estructura que pide TradingView: un contenedor, una caja para el
  // widget y un <script> con la configuración escrita adentro en JSON.
  const contenedor = crear("div", { clase: "tradingview-widget-container" });
  contenedor.append(crear("div", { clase: "tradingview-widget-container__widget" }));

  const script = document.createElement("script");
  script.type = "text/javascript";
  script.src = src;
  script.async = true;
  script.textContent = JSON.stringify(config);

  // Si el script de TradingView no llega (bloqueador, caída), mensaje claro
  script.addEventListener("error", () => {
    contenedor.remove();
    ponerEspera(caja, rotulo, `No se pudo cargar ${que} de TradingView. Revisa tu conexión o tu bloqueador y recarga.`);
  });

  // TradingView mete el widget en un <iframe>. Cuando ese iframe termina
  // de cargar, se quita el texto "Cargando…" para que no se vea detrás.
  // MutationObserver avisa cuando se agregan elementos a una caja.
  const vigia = new MutationObserver(() => {
    const marco = contenedor.querySelector("iframe");
    if (!marco) return;
    vigia.disconnect();
    marco.addEventListener("load", () => {
      caja.querySelector(".tarjeta__espera")?.remove();
    }, { once: true });
  });
  vigia.observe(contenedor, { childList: true, subtree: true });

  contenedor.append(script);
  caja.append(contenedor);
}

// --- Mini gráfico de un símbolo (último año, línea en cian) ---
function cargarMini(caja, item) {
  cargarWidget(caja, {
    script: SCRIPT_MINI,
    rotulo: { titulo: item.simbolo, detalle: item.nombre },
    que: "el gráfico",
    config: {
      symbol: item.tv,
      width: "100%",
      height: "100%",
      locale: "es",
      dateRange: "12M",              // Un año: horizonte largo por defecto
      colorTheme: "dark",
      isTransparent: true,           // Deja ver el color de la tarjeta de Radar
      autosize: true,
      largeChartUrl: "",
      chartOnly: false,
      noTimeScale: false,
      // Línea en cian (acento). Verde y rojo quedan solo para subidas y bajadas.
      trendLineColor: "rgba(34, 197, 214, 1)",
      underLineColor: "rgba(34, 197, 214, 0.18)",
      underLineBottomColor: "rgba(34, 197, 214, 0)"
    }
  });
}

// --- Tabla de cotizaciones de una pestaña (widget "Market Quotes") ---
// Un solo widget con todos los símbolos activos de la pestaña.
// Columnas del widget: valor, cambio, cambio %, apertura, máximo, mínimo y anterior.
function cargarTabla(caja, pestana, activos) {
  cargarWidget(caja, {
    script: SCRIPT_TABLA,
    rotulo: { titulo: pestana.nombre, detalle: `${activos.length} símbolos` },
    que: "la tabla",
    config: {
      width: "100%",
      height: "100%",
      symbolsGroups: [{
        name: pestana.nombre,
        symbols: activos.map((item) => ({ name: item.tv, displayName: item.simbolo }))
      }],
      showSymbolLogo: false,
      isTransparent: true,
      colorTheme: "dark",
      locale: "es"
    }
  });
}

// --- Carga diferida ---
// IntersectionObserver es un "vigilante" del navegador: le das elementos
// y te avisa cuando entran a la parte visible de la pantalla. Así un
// widget se crea solo cuando el usuario llega a él, y la página abre
// rápido aunque haya muchos símbolos.

// Apaga el vigilante anterior y prepara uno nuevo (una vez por dibujo del módulo)
function reiniciarVigilante() {
  if (observador) observador.disconnect();
  pendientes.clear();
  observador = null;
  if (!("IntersectionObserver" in window)) return;   // Navegadores muy antiguos

  observador = new IntersectionObserver((entradas) => {
    for (const entrada of entradas) {
      if (!entrada.isIntersecting) continue;
      const accion = pendientes.get(entrada.target);
      observador.unobserve(entrada.target);          // Cada widget se carga una sola vez
      pendientes.delete(entrada.target);
      if (accion) accion();
    }
  }, { rootMargin: "200px" });                       // Empieza a cargar 200 px antes de que se vea
}

// Ejecuta "accion" cuando "elemento" esté por aparecer en pantalla
function alVerse(elemento, accion) {
  if (!observador) { accion(); return; }             // Sin vigilante: se carga de una vez
  pendientes.set(elemento, accion);
  observador.observe(elemento);
}

// --- Sección "Favoritos": tarjetas con mini gráfico ---
function dibujarFavoritos(contenedor, lista) {
  const bloque = seccion("Favoritos");
  const cuadricula = crear("div", { clase: "cuadricula" });

  for (const item of favoritosDelUsuario(lista)) {
    const caja = tarjeta("tarjeta--grafico");
    caja.setAttribute("aria-label", `Gráfico de ${item.simbolo}, ${item.nombre}`);
    ponerEspera(caja, { titulo: item.simbolo, detalle: item.nombre }, "");
    cuadricula.append(caja);
    alVerse(caja, () => cargarMini(caja, item));
  }

  bloque.append(
    cuadricula,
    lineaFuente({
      fuente: "TradingView",
      fecha: new Date(),
      verbo: "cargado",
      nota: "último año · los precios pueden tener retraso"
    })
  );
  contenedor.append(bloque);
}

// --- Sección "Todos los símbolos": pestañas, tabla, chips y Editar ---
function dibujarSeguimiento(contenedor, lista) {
  // Lo que el usuario eligió, leído del navegador:
  // - apagados: símbolos que desactivó (los nuevos nacen activos)
  // - pestana: la última pestaña que abrió
  const guardados = memoria.leer("graficas", "apagados", []);
  const estado = {
    apagados: new Set(Array.isArray(guardados) ? guardados : []),
    pestana: memoria.leer("graficas", "pestana", null),
    editando: false,
    elegido: null,          // símbolo cuyo gráfico está abierto
    sinMemoria: false       // true si el navegador no dejó guardar
  };
  if (!lista.pestanas.some((p) => p.id === estado.pestana)) estado.pestana = lista.pestanas[0].id;

  const pestanaAbierta = () => lista.pestanas.find((p) => p.id === estado.pestana);
  // Activo = con datos en TradingView y no apagado por el usuario
  const activosDe = (pestana) => pestana.simbolos.filter((item) => !item.sinDatos && !estado.apagados.has(item.simbolo));

  // Guarda en el navegador; si no se puede, se recuerda para avisar
  function guardar(dato, valor) {
    if (!memoria.guardar("graficas", dato, valor)) estado.sinMemoria = true;
  }

  // Piezas fijas de la sección; cada función "pintar" rellena la suya
  const bloque = seccion("Todos los símbolos");
  const botonEditar = boton("Editar", () => {
    estado.editando = !estado.editando;
    if (!estado.editando) pintarTabla();   // Al pulsar "Listo" la tabla toma los cambios
    pintarChips();
  });
  const barra = crear("div", { clase: "barra" });
  barra.append(
    pestanas(lista.pestanas, estado.pestana, (id) => {
      estado.pestana = id;
      estado.elegido = null;
      guardar("pestana", id);
      pintarTabla();
      pintarChips();
      pintarGrafico();
    }),
    botonEditar
  );
  const zonaTabla = crear("div");
  const zonaChips = crear("div");
  const zonaGrafico = crear("div");
  bloque.append(barra, zonaTabla, zonaChips, zonaGrafico);
  contenedor.append(bloque);

  // Tabla de la pestaña abierta, solo con los símbolos activos
  function pintarTabla() {
    const pestana = pestanaAbierta();
    const activos = activosDe(pestana);

    if (!activos.length) {
      zonaTabla.replaceChildren(aviso(
        "No hay símbolos activos en esta pestaña.",
        "Pulsa Editar para activar alguno."
      ));
      return;
    }

    const caja = tarjeta("tarjeta--tabla");
    caja.style.height = `${TABLA_ENCABEZADO + TABLA_FILA * activos.length + TABLA_MARCA}px`;
    caja.setAttribute("aria-label", `Tabla de cotizaciones de ${pestana.nombre}`);
    ponerEspera(caja, { titulo: pestana.nombre, detalle: `${activos.length} símbolos` }, "");

    const fuente = crear("div");
    zonaTabla.replaceChildren(caja, fuente);

    // La tabla se crea solo cuando está por verse; la hora es la de esa carga
    alVerse(caja, () => {
      cargarTabla(caja, pestana, activos);
      fuente.replaceChildren(lineaFuente({
        fuente: "TradingView",
        fecha: new Date(),
        verbo: "cargado",
        nota: "los precios pueden tener retraso"
      }));
    });
  }

  // Chips (modo normal) o interruptores (modo Editar) de la pestaña abierta
  function pintarChips() {
    const pestana = pestanaAbierta();
    botonEditar.textContent = estado.editando ? "Listo" : "Editar";
    const fila = crear("div", { clase: "chips" });
    const notas = [];

    for (const item of pestana.simbolos) {
      // Sin datos en TradingView: chip gris, sin clic ni interruptor
      if (item.sinDatos) {
        fila.append(chip(`${item.simbolo} · Sin datos en TradingView`, { titulo: item.nombre, apagado: true }));
        continue;
      }

      if (estado.editando) {
        fila.append(interruptor(item.simbolo, !estado.apagados.has(item.simbolo), (encendido) => {
          if (encendido) estado.apagados.delete(item.simbolo);
          else estado.apagados.add(item.simbolo);
          guardar("apagados", [...estado.apagados]);
          if (estado.sinMemoria) pintarChips();   // Para que aparezca el aviso
        }, item.nombre));
        continue;
      }

      if (estado.apagados.has(item.simbolo)) continue;   // Apagado: no se muestra
      fila.append(chip(item.simbolo, {
        titulo: item.nombre,
        elegido: estado.elegido === item.simbolo,
        alPulsar: () => {
          // Pulsar el chip elegido cierra su gráfico; pulsar otro lo cambia
          estado.elegido = estado.elegido === item.simbolo ? null : item.simbolo;
          pintarChips();
          pintarGrafico();
        }
      }));
    }

    if (estado.editando) {
      notas.push("Apaga los símbolos que no quieres ver en la tabla y pulsa Listo.");
      if (!estado.sinMemoria) notas.push("Se guarda solo en este navegador.");
    } else {
      const ocultos = pestana.simbolos.filter((item) => !item.sinDatos && estado.apagados.has(item.simbolo)).length;
      if (activosDe(pestana).length) notas.push("Pulsa un símbolo para ver su gráfico.");
      if (ocultos) notas.push(`${ocultos} ${ocultos === 1 ? "símbolo apagado" : "símbolos apagados"}: pulsa Editar para verlos.`);
    }
    if (estado.sinMemoria) {
      notas.push("Tu navegador no deja guardar: los cambios duran hasta que cierres o recargues la página.");
    }

    zonaChips.replaceChildren(fila, crear("p", { clase: "nota", texto: notas.join(" ") }));
  }

  // Gráfico del símbolo elegido (simple, 1 año). En la S3 lo reemplaza
  // el gráfico grande con selector de periodo.
  function pintarGrafico() {
    const item = estado.elegido ? buscarSimbolo(lista, estado.elegido) : null;
    if (!item) { zonaGrafico.replaceChildren(); return; }

    const cabecera = crear("div", { clase: "panel__cabecera" });
    const titulo = crear("h3", { clase: "panel__titulo", texto: `${item.simbolo} ` });
    titulo.append(crear("span", { texto: `· ${item.nombre}` }));
    cabecera.append(titulo, boton("Cerrar", () => {
      estado.elegido = null;
      pintarChips();
      pintarGrafico();
    }));

    const caja = tarjeta("tarjeta--grafico tarjeta--grafico-panel");
    caja.setAttribute("aria-label", `Gráfico de ${item.simbolo}, ${item.nombre}`);

    zonaGrafico.replaceChildren(
      cabecera,
      caja,
      lineaFuente({
        fuente: "TradingView",
        fecha: new Date(),
        verbo: "cargado",
        nota: "último año · los precios pueden tener retraso"
      })
    );
    cargarMini(caja, item);   // Se abre por un clic del usuario: se carga de inmediato
  }

  pintarTabla();
  pintarChips();
}

// --- Dibuja el módulo dentro de su contenedor ---
async function render(contenedor) {
  // Título + pregunta que responde el módulo, con ayuda "?" en ETF
  const pregunta = crear("span", { texto: "¿Cómo van las acciones y ETFs" });
  pregunta.append(
    ayuda("un ETF", "ETF: fondo que cotiza en bolsa como una acción y agrupa muchos activos."),
    " que sigo?"
  );
  contenedor.append(encabezado("Mis gráficas", pregunta));

  // Lista de símbolos. Si falla, mensaje claro y se termina aquí.
  let lista;
  try {
    lista = await leerSimbolos();
  } catch (error) {
    console.error(error);
    const bloque = seccion();
    bloque.append(aviso("No se pudo cargar la lista de símbolos.", "Revisa tu conexión y recarga la página."));
    contenedor.append(bloque);
    return;
  }

  reiniciarVigilante();
  dibujarFavoritos(contenedor, lista);
  dibujarSeguimiento(contenedor, lista);
}

// --- Contrato del módulo (docs/arquitectura.md, sección 7) ---
export const graficas = {
  id: "graficas",
  nombre: "Mis gráficas",
  icono: "∿",
  datos: [],        // No pide datos a Apps Script: todo viene de los widgets
  render
};

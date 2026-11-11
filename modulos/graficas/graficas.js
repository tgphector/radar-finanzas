// ============================================================
// graficas.js · Módulo "Mis gráficas"
// Sesión 1: tarjetas de favoritos con mini gráfico.
// (Sesión 2: tabla por pestañas. Sesión 3: gráfico grande.)
//
// Los gráficos son widgets de TradingView: Radar no recibe los
// precios, solo le dice al widget qué símbolo mostrar.
// ============================================================

import { memoria } from "../../js/memoria.js";
import { crear, encabezado, seccion, tarjeta, lineaFuente, aviso, ayuda } from "../../js/ui.js";

// Dirección de simbolos.json, calculada desde la ubicación de este archivo
const URL_SIMBOLOS = new URL("./simbolos.json", import.meta.url);

// Script oficial del widget "Mini Chart" de TradingView
const SCRIPT_MINI = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";

// Vigilante de pantalla (ver cargaDiferida). Se guarda aquí para
// apagar el anterior cada vez que el módulo se vuelve a dibujar.
let observador = null;

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

// --- Texto dentro de la tarjeta mientras no hay gráfico ---
function ponerEspera(caja, item, mensaje) {
  let espera = caja.querySelector(".tarjeta__espera");
  if (!espera) {
    espera = crear("div", { clase: "tarjeta__espera" });
    caja.append(espera);
  }
  espera.replaceChildren(
    crear("strong", { texto: item.simbolo }),
    crear("span", { texto: item.nombre }),
    crear("span", { texto: mensaje })
  );
}

// --- Crea el widget de TradingView dentro de una tarjeta ---
function cargarMini(caja, item) {
  // Sin internet no se intenta: se avisa y se reintenta sola al volver la conexión
  if (!navigator.onLine) {
    ponerEspera(caja, item, "Sin conexión. El gráfico cargará cuando vuelva el internet.");
    window.addEventListener("online", () => {
      if (caja.isConnected) cargarMini(caja, item);
    }, { once: true });
    return;
  }

  ponerEspera(caja, item, "Cargando gráfico…");

  // Estructura que pide TradingView: un contenedor, una caja para el
  // widget y un <script> con la configuración escrita adentro en JSON.
  const contenedor = crear("div", { clase: "tradingview-widget-container" });
  contenedor.append(crear("div", { clase: "tradingview-widget-container__widget" }));

  const script = document.createElement("script");
  script.type = "text/javascript";
  script.src = SCRIPT_MINI;
  script.async = true;
  script.textContent = JSON.stringify({
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
  });

  // Si el script de TradingView no llega (bloqueador, caída), mensaje claro
  script.addEventListener("error", () => {
    contenedor.remove();
    ponerEspera(caja, item, "No se pudo cargar el gráfico de TradingView. Revisa tu conexión o tu bloqueador y recarga.");
  });

  // TradingView mete el gráfico en un <iframe>. Cuando ese iframe termina
  // de cargar, se quita el texto "Cargando…" para que no se vea detrás.
  // NUEVO: MutationObserver avisa cuando se agregan elementos a una caja.
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

// --- Carga diferida ---
// NUEVO: IntersectionObserver
// Es un "vigilante" del navegador: le das elementos y te avisa cuando
// entran a la parte visible de la pantalla. Así un gráfico se crea
// solo cuando el usuario llega a él, y la página abre rápido aunque
// haya muchos símbolos.
function cargaDiferida(tarjetas) {
  if (observador) observador.disconnect();

  // Navegadores muy antiguos sin vigilante: se carga todo de una vez
  if (!("IntersectionObserver" in window)) {
    for (const { caja, item } of tarjetas) cargarMini(caja, item);
    return;
  }

  const pendientes = new Map(tarjetas.map(({ caja, item }) => [caja, item]));

  observador = new IntersectionObserver((entradas) => {
    for (const entrada of entradas) {
      if (!entrada.isIntersecting) continue;
      const caja = entrada.target;
      observador.unobserve(caja);            // Cada gráfico se carga una sola vez
      cargarMini(caja, pendientes.get(caja));
    }
  }, { rootMargin: "200px" });               // Empieza a cargar 200 px antes de que se vea

  for (const caja of pendientes.keys()) observador.observe(caja);
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

  // --- Favoritos ---
  const bloque = seccion("Favoritos");
  const cuadricula = crear("div", { clase: "cuadricula" });
  const tarjetas = [];

  for (const item of favoritosDelUsuario(lista)) {
    const caja = tarjeta("tarjeta--grafico");
    caja.setAttribute("aria-label", `Gráfico de ${item.simbolo}, ${item.nombre}`);
    ponerEspera(caja, item, "");
    cuadricula.append(caja);
    tarjetas.push({ caja, item });
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

  cargaDiferida(tarjetas);
}

// --- Contrato del módulo (2-arquitectura.md, sección 7) ---
export const graficas = {
  id: "graficas",
  nombre: "Mis gráficas",
  icono: "∿",
  datos: [],        // No pide datos a Apps Script: todo viene de los widgets
  render
};

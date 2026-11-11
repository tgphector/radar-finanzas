// ============================================================
// cambio.js · Módulo "Tipo de cambio" (E5)
//
// Muestra el dólar en soles según dos fuentes y convierte montos:
// - BCRP: tipo de cambio del sistema bancario (SBS) e interbancario,
//   un dato por día hábil (recurso "tc").
// - Google Finance: valor de mercado con retraso (recurso "precios",
//   fila USD/PEN).
// Radar solo muestra y calcula; cada banco o casa de cambio usa su
// propio tipo de cambio.
// ============================================================

import {
  crear, encabezado, seccion, lineaFuente, aviso, ayuda,
  pestanas, tabla, tarjeta, fechaDia, fechaCorta, campoMonto, variacion, dato
} from "../../js/ui.js";

const EXPLICA_SBS = "Tipo de cambio del sistema bancario: promedio de lo que cobran y pagan los bancos, publicado por la SBS.";
const EXPLICA_INTER = "Interbancario: tipo de cambio al que los bancos se compran y venden dólares entre ellos.";

// Meses como los escribe el BCRP ("10.Nov.26")
const MESES_BCRP = { ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5, jul: 6, ago: 7, set: 8, sep: 8, oct: 9, nov: 10, dic: 11 };

// --- Utilidades ---

// Acepta número o texto con número ("3.421"); cualquier otra cosa ("n.d.") es null
function numero(valor) {
  if (typeof valor === "number") return Number.isFinite(valor) ? valor : null;
  if (typeof valor === "string" && valor.trim() !== "") {
    const n = Number(valor.trim().replace(",", "."));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

// "10.Nov.26" → Date. También acepta una fecha normal del JSON.
function fechaBcrp(valor) {
  if (!valor) return null;
  const partes = /^(\d{1,2})\.([A-Za-zñ]{3})\.(\d{2})$/.exec(String(valor).trim());
  if (partes) {
    const mes = MESES_BCRP[partes[2].toLowerCase()];
    if (mes === undefined) return null;
    return new Date(2000 + Number(partes[3]), mes, Number(partes[1]));
  }
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

// 3.4214 → "3.421"
function tc(valor) {
  return valor.toFixed(3);
}

// 2923.1 → "2 923.10"
function dinero(valor) {
  const [entero, decimales] = valor.toFixed(2).split(".");
  return `${entero.replace(/\B(?=(\d{3})+(?!\d))/g, " ")}.${decimales}`;
}

// --- Serie del BCRP: filas con fecha y al menos la venta SBS, de la más antigua a la más nueva ---
function serieBcrp(respuesta) {
  if (!respuesta || respuesta.error || !Array.isArray(respuesta.datos)) return [];
  return respuesta.datos
    .map((fila) => ({
      fecha: fechaBcrp(fila.fecha),
      interCompra: numero(fila.interbancario_compra),
      interVenta: numero(fila.interbancario_venta),
      sbsCompra: numero(fila.sbs_compra),
      sbsVenta: numero(fila.sbs_venta)
    }))
    .filter((fila) => fila.fecha && fila.sbsVenta !== null)
    .sort((a, b) => a.fecha - b.fecha);
}

// --- Valor de Google Finance: fila USD/PEN del recurso "precios" ---
function valorGoogle(respuesta) {
  if (!respuesta || respuesta.error || !Array.isArray(respuesta.datos)) return null;
  const fila = respuesta.datos.find((item) => item && item.simbolo === "USD/PEN");
  const valor = fila ? numero(fila.precio) : null;
  if (valor === null) return null;
  const leido = respuesta.leido ? new Date(respuesta.leido) : null;
  return { valor, leido: leido && !Number.isNaN(leido.getTime()) ? leido : null };
}

// Cifra doble "Compra 3.415  Venta 3.421"
function compraVenta(compra, venta) {
  const caja = crear("span");
  const izquierda = crear("span");
  izquierda.append(crear("small", { texto: "Compra" }), compra !== null ? tc(compra) : "—");
  const derecha = crear("span");
  derecha.append(crear("small", { texto: "Venta" }), tc(venta));
  caja.append(izquierda, derecha);
  return caja;
}

// Detalle de una tarjeta: fecha del dato + cuánto cambió la venta frente al día anterior
function detalleDia(hoy, ayer, campo) {
  const linea = crear("span", { texto: `Al ${fechaDia(hoy.fecha)}` });
  if (ayer && ayer[campo] !== null && hoy[campo] !== null) {
    const cambio = hoy[campo] - ayer[campo];
    const signo = cambio > 0 ? "+" : cambio < 0 ? "−" : "";
    linea.append(" · venta ", variacion(cambio, `${signo}${Math.abs(cambio).toFixed(3)}`), " frente al día anterior");
  }
  return linea;
}

// --- Dibuja el módulo ---
function render(contenedor, datos = {}) {
  contenedor.append(encabezado(
    "Tipo de cambio",
    "Mira a cuánto está el dólar según el BCRP y Google, y convierte entre soles y dólares."
  ));

  const serie = serieBcrp(datos.tc);
  const hoy = serie.length ? serie[serie.length - 1] : null;
  const ayer = serie.length > 1 ? serie[serie.length - 2] : null;
  const google = valorGoogle(datos.precios);

  // ---------- Dólar hoy ----------
  const bloqueHoy = seccion("Dólar hoy");
  contenedor.append(bloqueHoy);

  if (!hoy && !google) {
    // Ninguna fuente respondió y no hay copia guardada
    const motivo = (datos.tc && datos.tc.error && datos.tc.error.motivo) || (datos.precios && datos.precios.error && datos.precios.error.motivo);
    bloqueHoy.append(motivo === "sin-conexion"
      ? aviso("No hay conexión a internet.", "Radar todavía no tiene una copia del tipo de cambio en este navegador.")
      : aviso("No se pudo cargar el tipo de cambio.", "Las fuentes de datos no respondieron. Recarga la página en unos minutos."));
    return;
  }

  // Aviso si lo que se ve es una copia guardada en el navegador
  if ((datos.tc && datos.tc.deCopia) || (datos.precios && datos.precios.deCopia)) {
    bloqueHoy.append(aviso(
      "No se pudo conectar con los datos.",
      "Se muestra la última copia guardada en este navegador. Fíjate en las fechas."
    ));
  }

  const cuadricula = crear("div", { clase: "cuadricula" });
  if (hoy) {
    const tituloSbs = crear("span", { texto: "Sistema bancario (SBS)" });
    const tarjetaSbs = dato("", compraVenta(hoy.sbsCompra, hoy.sbsVenta), detalleDia(hoy, ayer, "sbsVenta"));
    tarjetaSbs.querySelector(".dato__titulo").append(tituloSbs, ayuda("el tipo de cambio SBS", EXPLICA_SBS));
    cuadricula.append(tarjetaSbs);

    if (hoy.interVenta !== null) {
      const tarjetaInter = dato("", compraVenta(hoy.interCompra, hoy.interVenta), detalleDia(hoy, ayer, "interVenta"));
      tarjetaInter.querySelector(".dato__titulo").append("Interbancario", ayuda("el tipo de cambio interbancario", EXPLICA_INTER));
      cuadricula.append(tarjetaInter);
    }
  }
  if (google) {
    cuadricula.append(dato(
      "Mercado (Google Finance)",
      tc(google.valor),
      google.leido ? `Leído el ${fechaCorta(google.leido)} · con retraso de hasta 20 min` : "Con retraso de hasta 20 min"
    ));
  }
  bloqueHoy.append(cuadricula);

  if (!hoy) {
    bloqueHoy.append(crear("p", { clase: "nota", texto: "El tipo de cambio del BCRP no está disponible por ahora; se muestra solo el valor de mercado." }));
  }
  if (!google) {
    bloqueHoy.append(crear("p", { clase: "nota", texto: "El valor de mercado de Google Finance no está disponible por ahora." }));
  }

  // Fuente y fecha de cada dato (regla de producto)
  if (hoy) {
    bloqueHoy.append(lineaFuente({
      fuente: datos.tc.fuente || "BCRP",
      url: datos.tc.url || undefined,
      fecha: hoy.fecha,
      verbo: "datos al",
      sinHora: true,
      nota: "soles por dólar; el BCRP publica un dato por día hábil"
    }));
  }
  if (google && google.leido) {
    bloqueHoy.append(lineaFuente({
      fuente: "Google Finance",
      url: datos.precios.url || undefined,
      fecha: google.leido,
      verbo: "leído",
      nota: "valor referencial, no es para operar"
    }));
  }

  // ---------- Conversor ----------
  const bloqueConversor = seccion("Conversor");
  contenedor.append(bloqueConversor);

  const SENTIDOS = [
    { id: "a-usd", nombre: "Tengo soles" },
    { id: "a-pen", nombre: "Tengo dólares" }
  ];
  let sentido = "a-usd";
  let monto = null;     // No se guarda: es un dato personal y aquí no hace falta recordarlo

  const campo = campoMonto("Monto", { prefijo: "S/", ejemplo: "1 000", alCambiar: (valor) => { monto = valor; calcular(); } });
  const formulario = crear("div", { clase: "formulario" });
  const selectores = crear("div", { clase: "barra__grupo" });
  selectores.append(pestanas(SENTIDOS, sentido, (id) => {
    sentido = id;
    campo.ponerPrefijo(id === "a-usd" ? "S/" : "US$");
    calcular();
  }));
  formulario.append(selectores, campo.elemento);
  const zonaResultado = crear("div", { clase: "pila" });
  zonaResultado.style.marginTop = "16px";
  bloqueConversor.append(formulario, zonaResultado);

  // Con soles se compran dólares al precio de VENTA; con dólares se reciben soles al precio de COMPRA
  function calcular() {
    if (monto === null) {
      zonaResultado.replaceChildren(crear("p", { clase: "nota", texto: "Escribe un monto para convertirlo con cada tipo de cambio." }));
      return;
    }
    const aDolares = sentido === "a-usd";
    const opciones = [];
    if (hoy) {
      const sbs = aDolares ? hoy.sbsVenta : hoy.sbsCompra;
      if (sbs !== null) opciones.push({ nombre: `Sistema bancario (SBS), ${aDolares ? "venta" : "compra"}`, cambio: sbs });
      const inter = aDolares ? hoy.interVenta : hoy.interCompra;
      if (inter !== null) opciones.push({ nombre: `Interbancario, ${aDolares ? "venta" : "compra"}`, cambio: inter });
    }
    if (google) opciones.push({ nombre: "Mercado (Google Finance)", cambio: google.valor });

    const piezas = opciones.map((opcion) => {
      const resultado = aDolares ? monto / opcion.cambio : monto * opcion.cambio;
      const linea = crear("p", { clase: "resultado" });
      linea.append(
        crear("strong", { texto: `${aDolares ? "US$" : "S/"} ${dinero(resultado)}` }),
        ` · ${opcion.nombre} a ${tc(opcion.cambio)}`
      );
      const caja = tarjeta();
      caja.append(linea);
      return caja;
    });
    piezas.push(crear("p", {
      clase: "nota",
      texto: "Cálculo referencial. Cada banco o casa de cambio usa su propio tipo de cambio; confirma antes de cambiar."
    }));
    zonaResultado.replaceChildren(...piezas);
  }
  calcular();

  // ---------- Últimos días ----------
  if (serie.length > 1) {
    const bloqueDias = seccion("Últimos días");
    const recientes = serie.slice(-10).reverse();
    const filas = recientes.map((fila) => [
      fechaDia(fila.fecha),
      fila.sbsCompra !== null ? tc(fila.sbsCompra) : "—",
      tc(fila.sbsVenta),
      fila.interVenta !== null ? tc(fila.interVenta) : "—"
    ]);
    const caja = tarjeta("tarjeta--lista");
    caja.style.margin = "0";
    caja.append(tabla(
      [
        { titulo: "Día" },
        { titulo: "SBS compra", clase: "tabla__num" },
        { titulo: "SBS venta", clase: "tabla__num" },
        { titulo: "Interbancario venta", clase: "tabla__num" }
      ],
      filas,
      "Tipo de cambio de los últimos días"
    ));
    bloqueDias.append(caja, lineaFuente({
      fuente: datos.tc.fuente || "BCRP",
      url: datos.tc.url || undefined,
      fecha: hoy.fecha,
      verbo: "datos al",
      sinHora: true
    }));
    contenedor.append(bloqueDias);
  }
}

// --- Contrato del módulo (docs/arquitectura.md, sección 7) ---
export const cambio = {
  id: "cambio",
  nombre: "Tipo de cambio",
  icono: "⇄",
  datos: ["tc", "precios"],
  render
};

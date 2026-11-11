// ============================================================
// plazos.js · Módulo "Depósitos" (dirección #/plazos)
// Sesión 2 de E2: ranking por TREA de plazo fijo y de CTS,
// con los datos que publica la SBS. (Sesión 3: simulador.)
//
// Los datos llegan ya pedidos por app.js (contrato de módulo,
// docs/arquitectura.md, sección 7): datos.tasas, datos.cts y datos.fsd.
// Radar solo ordena y muestra; no recomienda ninguna entidad.
// ============================================================

import { memoria } from "../../js/memoria.js";
import {
  crear, encabezado, seccion, tarjeta, lineaFuente, aviso, ayuda,
  pestanas, etiqueta, tabla, fechaDia
} from "../../js/ui.js";

// Productos que muestra el módulo. "recurso" es lo que se pide a la app web.
const PRODUCTOS = [
  { id: "plazo", nombre: "Plazo fijo", recurso: "tasas" },
  { id: "cts", nombre: "CTS", recurso: "cts" }
];

// Monedas que publica la SBS. "campo" es el sufijo de las columnas de CTS (trea_min_pen…).
const MONEDAS = [
  { id: "PEN", nombre: "Soles", simbolo: "S/", campo: "pen" },
  { id: "USD", nombre: "Dólares", simbolo: "US$", campo: "usd" }
];

// Monto de plazo fijo que se muestra cuando la SBS lo publica
const MONTO_PREFERIDO = 10000;

// Días después de los cuales los datos se consideran viejos
// (la hoja se actualiza a mano cada 15 días)
const DIAS_VIGENCIA = 15;

const EXPLICA_TREA = "TREA: tasa de rendimiento efectivo anual. Lo que rinde el depósito en un año, ya descontados los cargos.";
const EXPLICA_FSD = "FSD: Fondo de Seguro de Depósitos. Devuelve los depósitos, hasta un monto máximo, si una entidad miembro quiebra.";
const EXPLICA_CTS = "CTS: Compensación por Tiempo de Servicios. Depósito que el empleador hace a nombre del trabajador.";

// --- Utilidades de formato ---

// 10000 → "10 000" (espacio como separador de miles, sin depender del idioma del navegador)
function miles(numero) {
  return String(Math.round(numero)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

// 5.5 → "5.50 %"
function porcentaje(numero) {
  return `${numero.toFixed(2)} %`;
}

// Texto de fecha del JSON → Date, o null si no sirve
function aFecha(texto) {
  if (!texto) return null;
  const fecha = new Date(texto);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

// Días completos entre una fecha y hoy
function diasDesde(fecha) {
  return Math.floor((Date.now() - fecha.getTime()) / (24 * 60 * 60 * 1000));
}

// --- Mensaje cuando no hay datos ni copia guardada ---
function avisoDeError(error) {
  const motivo = error && error.motivo;
  if (motivo === "sin-conexion") {
    return aviso("No hay conexión a internet.", "Radar todavía no tiene una copia de estas tasas en este navegador. Vuelve a intentar cuando tengas conexión.");
  }
  if (motivo === "sin-configurar") {
    return aviso("Las tasas todavía no están conectadas.", "Falta la dirección de la fuente de datos.");
  }
  return aviso("No se pudieron cargar las tasas.", "La fuente de datos no respondió. Recarga la página en unos minutos.");
}

// --- Prepara las filas de PLAZO FIJO de una moneda ---
// Devuelve { filas, condicion } con cada fila en un formato común:
// { entidad, tipo, fsd, fecha_sbs, valor (TREA para ordenar), maximo (o null) }
function prepararPlazo(respuesta, moneda) {
  const validas = respuesta.datos.filter((fila) =>
    fila && fila.moneda === moneda.id && fila.entidad && typeof fila.trea === "number"
  );
  if (!validas.length) return { filas: [], condicion: "" };

  // Una sola condición de la SBS a la vez: el monto preferido si existe; si no, el del medio
  const montos = [...new Set(validas.map((fila) => fila.monto))].sort((a, b) => a - b);
  const monto = montos.includes(MONTO_PREFERIDO) ? MONTO_PREFERIDO : montos[Math.floor(montos.length / 2)];
  const filas = validas
    .filter((fila) => fila.monto === monto)
    .map((fila) => ({ ...fila, valor: fila.trea, maximo: null }));

  const primera = filas[0];
  const condicion = `Depósitos a plazo por ${moneda.simbolo} ${miles(monto)} a ${primera.plazo_dias} días` +
    (primera.region ? ` · ${primera.region}` : "");
  return { filas, condicion };
}

// --- Prepara las filas de CTS de una moneda ---
// La SBS publica una TREA mínima y una máxima por entidad y moneda.
// Se ordena por la mínima y se muestra el rango.
function prepararCts(respuesta, moneda) {
  const campoMin = `trea_min_${moneda.campo}`;
  const campoMax = `trea_max_${moneda.campo}`;
  const filas = respuesta.datos
    .filter((fila) => fila && fila.entidad && typeof fila[campoMin] === "number")
    .map((fila) => ({
      ...fila,
      valor: fila[campoMin],
      maximo: typeof fila[campoMax] === "number" ? fila[campoMax] : null
    }));
  const region = filas.length && filas[0].region ? ` · ${filas[0].region}` : "";
  return { filas, condicion: `CTS en ${moneda.nombre.toLowerCase()} · TREA mínima y máxima${region}` };
}

// --- Celda de TREA: barra cian proporcional a la tasa más alta + cifra ---
// Si hay máximo distinto del mínimo (CTS), la cifra es el rango "5.50 % – 6.00 %".
// "conRango" avisa que la columna es de rangos, para alinear todas las filas igual.
function celdaTrea(fila, mayor, conRango) {
  const caja = crear("span", { clase: conRango ? "barra-valor barra-valor--rango" : "barra-valor" });
  const riel = crear("span", { clase: "barra-valor__riel", atributos: { "aria-hidden": "true" } });
  const relleno = crear("span", { clase: "barra-valor__relleno" });
  relleno.style.width = `${mayor > 0 ? Math.max(2, (fila.valor / mayor) * 100) : 0}%`;
  riel.append(relleno);

  let cifra = porcentaje(fila.valor);
  if (fila.maximo !== null && fila.maximo !== fila.valor) cifra += ` – ${porcentaje(fila.maximo)}`;
  caja.append(riel, crear("span", {
    clase: conRango ? "barra-valor__cifra barra-valor__cifra--rango" : "barra-valor__cifra",
    texto: cifra
  }));
  return caja;
}

// --- Celda de entidad: nombre y, debajo, tipo (y aviso si falta la cobertura) ---
function celdaEntidad(fila) {
  const caja = crear("span", { texto: fila.entidad });
  const detalles = [];
  if (fila.tipo) detalles.push(fila.tipo);
  if (fila.fsd !== true) detalles.push("cobertura del FSD sin verificar");
  if (detalles.length) caja.append(crear("span", { clase: "tabla__detalle", texto: detalles.join(" · ") }));
  return caja;
}

// --- Nota del FSD debajo de la tabla ---
function notaFsd(filas, fsd) {
  const linea = crear("p", { clase: "nota" });
  const dato = fsd && !fsd.error && fsd.datos && fsd.datos[0];
  const todas = filas.every((fila) => fila.fsd === true);

  if (dato && typeof dato.monto === "number") {
    const hasta = aFecha(dato.vigente_hasta);
    let texto = todas
      ? "Todas las entidades de esta lista están cubiertas por el FSD"
      : "Las entidades de esta lista están cubiertas por el FSD, salvo las marcadas";
    texto += ` hasta S/ ${miles(dato.monto)} por persona en cada entidad`;
    if (hasta) texto += ` (monto vigente hasta el ${fechaDia(hasta)}; cambia cada trimestre)`;
    linea.append(`${texto}.`, ayuda("el FSD", EXPLICA_FSD));
  } else {
    // Sin el monto no se afirma una cifra: se dice dónde confirmarla
    linea.append(
      todas
        ? "Todas las entidades de esta lista son miembros del FSD. No se pudo cargar el monto de cobertura vigente; confírmalo en fsd.org.pe."
        : "No se pudo cargar el monto de cobertura del FSD; confírmalo en fsd.org.pe.",
      ayuda("el FSD", EXPLICA_FSD)
    );
  }
  return linea;
}

// --- Dibuja el módulo dentro de su contenedor ---
function render(contenedor, datos = {}) {
  // Título + una línea que dice qué se puede hacer, con ayudas "?"
  const descripcion = crear("span", { texto: "Compara la TREA" });
  descripcion.append(
    ayuda("la TREA", EXPLICA_TREA),
    " que publica la SBS para depósitos a plazo fijo y CTS",
    ayuda("la CTS", EXPLICA_CTS),
    "."
  );
  contenedor.append(encabezado("Depósitos", descripcion));

  const bloque = seccion("Ranking por TREA");
  contenedor.append(bloque);

  // Lo que el usuario eligió la última vez (se recuerda en el navegador)
  let producto = memoria.leer("plazos", "producto", "plazo");
  if (!PRODUCTOS.some((opcion) => opcion.id === producto)) producto = "plazo";
  let moneda = memoria.leer("plazos", "moneda", "PEN");
  if (!MONEDAS.some((opcion) => opcion.id === moneda)) moneda = "PEN";

  // Dos selectores: producto y moneda
  const selectores = crear("div", { clase: "barra__grupo" });
  selectores.append(
    pestanas(PRODUCTOS, producto, (id) => {
      producto = id;
      memoria.guardar("plazos", "producto", id);
      pintar();
    }),
    pestanas(MONEDAS, moneda, (id) => {
      moneda = id;
      memoria.guardar("plazos", "moneda", id);
      pintar();
    })
  );
  const barra = crear("div", { clase: "barra" });
  barra.append(selectores);
  const zona = crear("div");
  bloque.append(barra, zona);

  // Dibuja la tabla del producto y la moneda elegidos
  function pintar() {
    const infoProducto = PRODUCTOS.find((opcion) => opcion.id === producto);
    const infoMoneda = MONEDAS.find((opcion) => opcion.id === moneda);
    const respuesta = datos[infoProducto.recurso];

    // Sin datos y sin copia guardada: mensaje claro y nada más
    if (!respuesta || respuesta.error) {
      zona.replaceChildren(avisoDeError(respuesta && respuesta.error));
      return;
    }

    const preparado = producto === "cts" ? prepararCts(respuesta, infoMoneda) : prepararPlazo(respuesta, infoMoneda);
    if (!preparado.filas.length) {
      zona.replaceChildren(aviso(
        `Todavía no hay tasas de ${infoProducto.nombre.toLowerCase() === "cts" ? "CTS" : "plazo fijo"} en ${infoMoneda.nombre.toLowerCase()}.`,
        "Se cargan a mano desde la SBS. Mientras tanto puedes ver las otras opciones."
      ));
      return;
    }

    // De mayor a menor TREA (en CTS, por la mínima; si empatan, por la máxima)
    const filas = preparado.filas.sort((a, b) => (b.valor - a.valor) || ((b.maximo || 0) - (a.maximo || 0)));
    const mayor = Math.max(...filas.map((fila) => Math.max(fila.valor, fila.maximo || 0)));

    // Fecha de los datos: la más reciente que la SBS puso en estas filas
    const fechas = filas.map((fila) => aFecha(fila.fecha_sbs)).filter(Boolean);
    const fecha = fechas.length ? new Date(Math.max(...fechas.map((f) => f.getTime()))) : aFecha(respuesta.actualizado);

    const piezas = [];

    // Aviso si lo que se ve es la última copia guardada en este navegador
    if (respuesta.deCopia) {
      piezas.push(aviso(
        "No se pudo conectar con los datos.",
        "Se muestra la última copia guardada en este navegador. Fíjate en la fecha."
      ));
    }

    // Fecha bien visible + condición de la SBS que se está mostrando
    const cabecera = crear("div", { clase: "barra" });
    if (fecha) {
      const dias = diasDesde(fecha);
      const viejo = dias > DIAS_VIGENCIA;
      cabecera.append(etiqueta(
        viejo ? `Datos de la SBS al ${fechaDia(fecha)} · tienen ${dias} días` : `Datos de la SBS al ${fechaDia(fecha)}`,
        { alerta: viejo }
      ));
    } else {
      cabecera.append(etiqueta("Datos de la SBS sin fecha registrada", { alerta: true }));
    }
    cabecera.append(crear("p", { clase: "nota", texto: `${preparado.condicion} · ${filas.length} entidades` }));
    piezas.push(cabecera);

    // Tabla: puesto, entidad y TREA. Las entidades con la misma TREA comparten puesto.
    let puesto = 0;
    const cuerpo = filas.map((fila, i) => {
      if (i === 0 || fila.valor !== filas[i - 1].valor) puesto = i + 1;
      return [String(puesto), celdaEntidad(fila), celdaTrea(fila, mayor, producto === "cts")];
    });
    const caja = tarjeta("tarjeta--lista");
    caja.append(tabla(
      [
        { titulo: "#", clase: "tabla__puesto" },
        { titulo: "Entidad" },
        { titulo: producto === "cts" ? "TREA mínima – máxima" : "TREA", clase: "tabla__num" }
      ],
      cuerpo,
      `Ranking por TREA de ${infoProducto.nombre} en ${infoMoneda.nombre.toLowerCase()}`
    ));
    piezas.push(caja);

    // Cobertura del FSD (una nota para toda la lista)
    piezas.push(notaFsd(filas, datos.fsd));

    // Fuente y fecha (regla de producto)
    if (fecha) {
      piezas.push(lineaFuente({
        fuente: respuesta.fuente || "SBS",
        url: respuesta.url || undefined,
        fecha,
        verbo: "datos al",
        sinHora: true,
        nota: producto === "cts"
          ? "Ordenado por la TREA mínima; confirma la tasa con cada entidad"
          : "La SBS registra la TREA mínima aplicable; confirma la tasa con cada entidad"
      }));
    }

    zona.replaceChildren(...piezas);
  }

  pintar();
}

// --- Contrato del módulo (docs/arquitectura.md, sección 7) ---
export const plazos = {
  id: "plazos",              // La dirección sigue siendo #/plazos
  nombre: "Depósitos",
  icono: "◎",
  datos: ["tasas", "cts", "fsd"],   // Recursos que app.js pide a la app web de Apps Script
  render
};

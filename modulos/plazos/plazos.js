// ============================================================
// plazos.js · Módulo "Plazos fijos"
// Sesión 2 de E2: ranking por TREA con los datos de la SBS.
// (Sesión 3: simulador.)
//
// Los datos llegan ya pedidos por app.js (contrato de módulo,
// docs/arquitectura.md, sección 7): datos.tasas y datos.fsd.
// Radar solo ordena y muestra; no recomienda ninguna entidad.
// ============================================================

import { memoria } from "../../js/memoria.js";
import {
  crear, encabezado, seccion, tarjeta, lineaFuente, aviso, ayuda,
  pestanas, etiqueta, tabla, fechaDia
} from "../../js/ui.js";

// Monedas que publica la SBS para plazo fijo
const MONEDAS = [
  { id: "PEN", nombre: "Soles", simbolo: "S/" },
  { id: "USD", nombre: "Dólares", simbolo: "US$" }
];

// Monto que se muestra en el ranking cuando la SBS lo publica
const MONTO_PREFERIDO = 10000;

// Días después de los cuales los datos se consideran viejos
// (la hoja se actualiza a mano cada 15 días)
const DIAS_VIGENCIA = 15;

const EXPLICA_TREA = "TREA: tasa de rendimiento efectivo anual. Lo que rinde el depósito en un año, ya descontados los cargos.";
const EXPLICA_FSD = "FSD: Fondo de Seguro de Depósitos. Devuelve los depósitos, hasta un monto máximo, si una entidad miembro quiebra.";

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
    return aviso("No hay conexión a internet.", "Radar todavía no tiene una copia de las tasas en este navegador. Vuelve a intentar cuando tengas conexión.");
  }
  if (motivo === "sin-configurar") {
    return aviso("Las tasas todavía no están conectadas.", "Falta la dirección de la fuente de datos.");
  }
  return aviso("No se pudieron cargar las tasas.", "La fuente de datos no respondió. Recarga la página en unos minutos.");
}

// --- Filas válidas de una moneda: con entidad y TREA numérica ---
function filasDe(tasas, moneda) {
  return tasas.datos.filter((fila) =>
    fila && fila.moneda === moneda && fila.entidad && typeof fila.trea === "number"
  );
}

// --- Monto que se muestra: el preferido si existe; si no, el del medio ---
function elegirMonto(filas) {
  const montos = [...new Set(filas.map((fila) => fila.monto))].sort((a, b) => a - b);
  if (montos.includes(MONTO_PREFERIDO)) return MONTO_PREFERIDO;
  return montos[Math.floor(montos.length / 2)];
}

// --- Celda de TREA: barra cian proporcional a la tasa más alta + cifra ---
function celdaTrea(trea, maxima) {
  const caja = crear("span", { clase: "barra-valor" });
  const riel = crear("span", { clase: "barra-valor__riel", atributos: { "aria-hidden": "true" } });
  const relleno = crear("span", { clase: "barra-valor__relleno" });
  relleno.style.width = `${maxima > 0 ? Math.max(2, (trea / maxima) * 100) : 0}%`;
  riel.append(relleno);
  caja.append(riel, crear("span", { clase: "barra-valor__cifra", texto: porcentaje(trea) }));
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

// --- Nota del FSD sobre la tabla ---
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
function render(contenedor, datos) {
  // Título + una línea que dice qué se puede hacer, con ayuda "?" en TREA
  const descripcion = crear("span", { texto: "Compara la TREA" });
  descripcion.append(ayuda("la TREA", EXPLICA_TREA), " que publica la SBS para depósitos a plazo fijo.");
  contenedor.append(encabezado("Plazos fijos", descripcion));

  const tasas = datos && datos.tasas;
  const bloque = seccion("Ranking por TREA");
  contenedor.append(bloque);

  // Sin datos y sin copia guardada: mensaje claro y nada más
  if (!tasas || tasas.error) {
    bloque.append(avisoDeError(tasas && tasas.error));
    return;
  }

  // Moneda elegida la última vez (se recuerda en el navegador)
  let moneda = memoria.leer("plazos", "moneda", "PEN");
  if (!MONEDAS.some((opcion) => opcion.id === moneda)) moneda = "PEN";

  const zona = crear("div");
  const barra = crear("div", { clase: "barra" });
  barra.append(pestanas(MONEDAS, moneda, (id) => {
    moneda = id;
    memoria.guardar("plazos", "moneda", id);
    pintar();
  }));
  bloque.append(barra, zona);

  // Dibuja la tabla de la moneda elegida
  function pintar() {
    const info = MONEDAS.find((opcion) => opcion.id === moneda);
    const deLaMoneda = filasDe(tasas, moneda);

    if (!deLaMoneda.length) {
      zona.replaceChildren(aviso(
        `Todavía no hay tasas en ${info.nombre.toLowerCase()}.`,
        "Se están cargando desde la SBS. Mientras tanto puedes ver la otra moneda."
      ));
      return;
    }

    // Una sola condición de la SBS a la vez: mismo monto, ordenado de mayor a menor TREA
    const monto = elegirMonto(deLaMoneda);
    const filas = deLaMoneda.filter((fila) => fila.monto === monto).sort((a, b) => b.trea - a.trea);
    const maxima = filas[0].trea;
    const primera = filas[0];

    // Fecha de los datos: la más reciente que la SBS puso en estas filas
    const fechas = filas.map((fila) => aFecha(fila.fecha_sbs)).filter(Boolean);
    const fecha = fechas.length ? new Date(Math.max(...fechas.map((f) => f.getTime()))) : aFecha(tasas.actualizado);

    const piezas = [];

    // Aviso si lo que se ve es la última copia guardada en este navegador
    if (tasas.deCopia) {
      piezas.push(aviso(
        "No se pudo conectar con los datos.",
        "Se muestra la última copia guardada en este navegador. Fíjate en la fecha."
      ));
    }

    // Fecha bien visible + condición de la SBS que se está mostrando
    const cabecera = crear("div", { clase: "barra" });
    const condicion = crear("p", { clase: "nota" });
    condicion.textContent = `Depósitos a plazo por ${info.simbolo} ${miles(monto)} a ${primera.plazo_dias} días` +
      (primera.region ? ` · ${primera.region}` : "") + ` · ${filas.length} entidades`;
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
    cabecera.append(condicion);
    piezas.push(cabecera);

    // Tabla: puesto, entidad y TREA. Las entidades con la misma TREA comparten puesto.
    let puesto = 0;
    const cuerpo = filas.map((fila, i) => {
      if (i === 0 || fila.trea !== filas[i - 1].trea) puesto = i + 1;
      return [String(puesto), celdaEntidad(fila), celdaTrea(fila.trea, maxima)];
    });
    const caja = tarjeta("tarjeta--lista");
    caja.append(tabla(
      [
        { titulo: "#", clase: "tabla__puesto" },
        { titulo: "Entidad" },
        { titulo: "TREA", clase: "tabla__num" }
      ],
      cuerpo,
      `Ranking por TREA en ${info.nombre.toLowerCase()}`
    ));
    piezas.push(caja);

    // Cobertura del FSD (una nota para toda la lista)
    piezas.push(notaFsd(filas, datos.fsd));

    // Fuente y fecha (regla de producto) + la nota que viene con los datos
    if (fecha) {
      piezas.push(lineaFuente({
        fuente: tasas.fuente || "SBS",
        url: tasas.url || undefined,
        fecha,
        verbo: "datos al",
        sinHora: true,
        nota: "La SBS registra la TREA mínima aplicable; confirma la tasa con cada entidad"
      }));
    }

    zona.replaceChildren(...piezas);
  }

  pintar();
}

// --- Contrato del módulo (docs/arquitectura.md, sección 7) ---
export const plazos = {
  id: "plazos",
  nombre: "Plazos fijos",
  icono: "◎",
  datos: ["tasas", "fsd"],   // Recursos que app.js pide a la app web de Apps Script
  render
};

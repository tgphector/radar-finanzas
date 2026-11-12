// ============================================================
// calculadoras.js · Módulo "Calculadoras" (E6)
//
// Cuatro calculadoras que no necesitan datos externos:
//   1. Interés compuesto      3. Préstamo
//   2. Resultado de una operación   4. Tiempo para una meta
// Solo hacen cuentas con lo que el usuario escribe. Los montos NO se
// guardan en ningún lado: se pierden al salir del apartado.
//
// El único dato público que usa es el tipo de cambio del BCRP (recurso
// "tc"), para proponer un valor en "Resultado de una operación".
// ============================================================

import { memoria } from "../../js/memoria.js";
import {
  crear, encabezado, seccion, tarjeta, aviso, ayuda, lineaFuente,
  pestanas, tabla, campoMonto, variacion, dato
} from "../../js/ui.js";

const EXPLICA_TEA = "TEA: tasa efectiva anual. Lo que crece (o cuesta) el dinero en un año, con los intereses ya acumulados.";
const EXPLICA_TCEA = "TCEA: tasa de costo efectivo anual. Es la TEA del préstamo más seguros, comisiones y otros cargos; es la que conviene comparar.";

const CALCULADORAS = [
  { id: "compuesto", nombre: "Interés compuesto" },
  { id: "operacion", nombre: "Resultado de una operación" },
  { id: "prestamo", nombre: "Préstamo" },
  { id: "meta", nombre: "Tiempo para una meta" }
];

// --- Utilidades ---

// 1234.5 → "1 234.50"
function dinero(valor) {
  const [entero, decimales] = Math.abs(valor).toFixed(2).split(".");
  return `${valor < 0 ? "−" : ""}${entero.replace(/\B(?=(\d{3})+(?!\d))/g, " ")}.${decimales}`;
}

// Tasa mensual equivalente a una tasa efectiva anual: (1 + TEA)^(1/12) − 1
function tasaMensual(teaPorcentaje) {
  return Math.pow(1 + teaPorcentaje / 100, 1 / 12) - 1;
}

// 27 → "2 años y 3 meses"
function duracion(meses) {
  const anios = Math.floor(meses / 12);
  const resto = meses % 12;
  const partes = [];
  if (anios) partes.push(`${anios} ${anios === 1 ? "año" : "años"}`);
  if (resto || !anios) partes.push(`${resto} ${resto === 1 ? "mes" : "meses"}`);
  return partes.join(" y ");
}

// Saldo después de n meses con un monto inicial, un aporte al final de cada mes y una tasa mensual
function saldoFuturo(inicial, aporte, tasa, meses) {
  if (tasa === 0) return inicial + aporte * meses;
  const factor = Math.pow(1 + tasa, meses);
  return inicial * factor + aporte * (factor - 1) / tasa;
}

// Arma una calculadora: fila de campos arriba y zona de resultado abajo.
// "campos" es una lista de campoMonto; "calcular(zona)" pinta el resultado.
function armar(campos, calcular, extras = []) {
  const caja = crear("div");
  const formulario = crear("div", { clase: "formulario" });
  formulario.append(...extras, ...campos.map((campo) => campo.elemento));
  const zona = crear("div");
  zona.style.marginTop = "24px";
  caja.append(formulario, zona);
  return { caja, zona };
}

// Tarjeta de tabla alineada a la izquierda (las de resultados no van centradas)
function tarjetaTabla(columnas, filas, descripcion) {
  const caja = tarjeta("tarjeta--lista");
  caja.style.margin = "16px 0 0";
  caja.append(tabla(columnas, filas, descripcion));
  return caja;
}

// ============================================================
// 1. Interés compuesto
// ============================================================
function calculadoraCompuesto() {
  const pintar = () => calcular();
  const inicial = campoMonto("Monto inicial", { ejemplo: "10 000", permiteCero: true, alCambiar: pintar });
  const aporte = campoMonto("Aporte mensual (opcional)", { ejemplo: "500", permiteCero: true, alCambiar: pintar });
  const tasa = campoMonto("Tasa anual (TEA)", { sufijo: "%", ejemplo: "5", maximo: 200, permiteCero: true, alCambiar: pintar });
  const plazo = campoMonto("Plazo", { sufijo: "años", ejemplo: "10", maximo: 60, decimales: 0, alCambiar: pintar });
  const { caja, zona } = armar([inicial, aporte, tasa, plazo]);

  function calcular() {
    const p = inicial.valor() ?? 0;
    const a = aporte.valor() ?? 0;
    const t = tasa.valor();
    const anios = plazo.valor();
    if (t === null || anios === null || (p === 0 && a === 0)) {
      zona.replaceChildren(crear("p", { clase: "nota", texto: "Escribe un monto inicial o un aporte, la tasa anual y el plazo." }));
      return;
    }
    const i = tasaMensual(t);
    const meses = Math.round(anios) * 12;
    const final = saldoFuturo(p, a, i, meses);
    const aportado = p + a * meses;

    const cuadricula = crear("div", { clase: "cuadricula" });
    cuadricula.append(
      dato("Monto final", dinero(final), `En ${duracion(meses)}`),
      dato("Total que pusiste", dinero(aportado), a ? `${dinero(p)} al inicio + ${meses} aportes de ${dinero(a)}` : "Solo el monto inicial"),
      dato("Intereses ganados", dinero(final - aportado), `Con una TEA de ${t} %`)
    );

    // Tabla año por año
    const filas = [];
    for (let anio = 1; anio <= Math.round(anios); anio++) {
      const saldo = saldoFuturo(p, a, i, anio * 12);
      const puesto = p + a * anio * 12;
      filas.push([String(anio), dinero(puesto), dinero(saldo - puesto), dinero(saldo)]);
    }
    zona.replaceChildren(
      cuadricula,
      tarjetaTabla(
        [{ titulo: "Año" }, { titulo: "Aportado", clase: "tabla__num" }, { titulo: "Intereses", clase: "tabla__num" }, { titulo: "Saldo", clase: "tabla__num" }],
        filas,
        "Saldo año por año"
      ),
      crear("p", { clase: "nota", texto: "Cálculo referencial: supone la misma tasa todo el plazo y aportes al final de cada mes. No descuenta impuestos, comisiones ni inflación." })
    );
  }
  calcular();
  return caja;
}

// ============================================================
// 2. Resultado de una operación (compra y venta)
// ============================================================
function calculadoraOperacion(tc) {
  const pintar = () => calcular();
  const compra = campoMonto("Precio de compra", { prefijo: "US$", ejemplo: "150.00", maximo: 10000000, decimales: 4, alCambiar: pintar });
  const venta = campoMonto("Precio de venta", { prefijo: "US$", ejemplo: "165.00", maximo: 10000000, decimales: 4, alCambiar: pintar });
  const cantidad = campoMonto("Cantidad", { ejemplo: "10", maximo: 100000000, decimales: 4, alCambiar: pintar });
  const comisionCompra = campoMonto("Comisión de compra (opcional)", { prefijo: "US$", ejemplo: "5.00", maximo: 1000000, permiteCero: true, alCambiar: pintar });
  const comisionVenta = campoMonto("Comisión de venta (opcional)", { prefijo: "US$", ejemplo: "5.00", maximo: 1000000, permiteCero: true, alCambiar: pintar });
  const cambio = campoMonto("Tipo de cambio (opcional)", { prefijo: "S/", ejemplo: "3.750", maximo: 100, decimales: 3, valor: tc ? Number(tc.valor.toFixed(3)) : null, alCambiar: pintar });
  const { caja, zona } = armar([compra, venta, cantidad, comisionCompra, comisionVenta, cambio]);

  function calcular() {
    const pc = compra.valor();
    const pv = venta.valor();
    const n = cantidad.valor();
    if (pc === null || pv === null || n === null) {
      zona.replaceChildren(crear("p", { clase: "nota", texto: "Escribe el precio de compra, el de venta y la cantidad." }));
      return;
    }
    const costo = pc * n + (comisionCompra.valor() ?? 0);
    const ingreso = pv * n - (comisionVenta.valor() ?? 0);
    const resultado = ingreso - costo;
    const porcentaje = (resultado / costo) * 100;
    const signo = resultado > 0 ? "+" : resultado < 0 ? "−" : "";

    const cuadricula = crear("div", { clase: "cuadricula" });
    cuadricula.append(
      dato("Costo total", `US$ ${dinero(costo)}`, "Compra más su comisión"),
      dato("Recibes al vender", `US$ ${dinero(ingreso)}`, "Venta menos su comisión"),
      // Verde o rojo solo aquí: es una subida o una bajada, con flecha y signo
      dato("Resultado", variacion(resultado, `${signo}US$ ${dinero(Math.abs(resultado))}`), variacion(porcentaje, `${signo}${Math.abs(porcentaje).toFixed(2)} % sobre el costo`))
    );
    const piezas = [cuadricula];

    const cambioValor = cambio.valor();
    if (cambioValor !== null) {
      const enSoles = resultado * cambioValor;
      const linea = crear("p", { clase: "resultado" });
      linea.style.marginTop = "16px";
      linea.append("En soles: ", variacion(enSoles, `${signo}S/ ${dinero(Math.abs(enSoles))}`), ` · con un tipo de cambio de ${cambioValor.toFixed(3)}`);
      piezas.push(linea);
    }
    piezas.push(crear("p", { clase: "nota", texto: "Cálculo referencial. No incluye impuestos ni la diferencia de tipo de cambio entre la compra y la venta." }));
    if (tc) {
      piezas.push(lineaFuente({ fuente: tc.fuente, url: tc.url, fecha: tc.fecha, verbo: "tipo de cambio propuesto: venta SBS al", sinHora: true, nota: "puedes cambiarlo" }));
    }
    zona.replaceChildren(...piezas);
  }
  calcular();
  return caja;
}

// ============================================================
// 3. Préstamo (cuotas iguales)
// ============================================================
function calculadoraPrestamo() {
  const pintar = () => calcular();
  const monto = campoMonto("Monto del préstamo", { ejemplo: "20 000", alCambiar: pintar });
  const tasa = campoMonto("Tasa anual (TEA)", { sufijo: "%", ejemplo: "18", maximo: 500, permiteCero: true, alCambiar: pintar });
  const plazo = campoMonto("Plazo", { sufijo: "meses", ejemplo: "24", maximo: 480, decimales: 0, alCambiar: pintar });
  const { caja, zona } = armar([monto, tasa, plazo]);
  const MAXIMO_FILAS = 60;

  function calcular() {
    const m = monto.valor();
    const t = tasa.valor();
    const n = plazo.valor();
    if (m === null || t === null || n === null) {
      zona.replaceChildren(crear("p", { clase: "nota", texto: "Escribe el monto, la tasa anual y el plazo en meses." }));
      return;
    }
    const meses = Math.round(n);
    const i = tasaMensual(t);
    // Cuota fija (método francés): M · i / (1 − (1 + i)^−n). Sin interés, el monto entre los meses.
    const cuota = i === 0 ? m / meses : (m * i) / (1 - Math.pow(1 + i, -meses));
    const total = cuota * meses;

    const cuadricula = crear("div", { clase: "cuadricula" });
    cuadricula.append(
      dato("Cuota mensual", dinero(cuota), `${meses} cuotas iguales`),
      dato("Total que pagas", dinero(total), `En ${duracion(meses)}`),
      dato("Intereses", dinero(total - m), `${((total / m - 1) * 100).toFixed(1)} % sobre lo prestado`)
    );

    // Cronograma: cuánto de cada cuota es interés y cuánto baja la deuda
    const filas = [];
    let saldo = m;
    for (let mes = 1; mes <= meses && mes <= MAXIMO_FILAS; mes++) {
      const interes = saldo * i;
      const capital = cuota - interes;
      saldo = Math.max(0, saldo - capital);
      filas.push([String(mes), dinero(cuota), dinero(interes), dinero(capital), dinero(saldo)]);
    }
    const nota = crear("p", { clase: "nota" });
    nota.append(
      "Cálculo referencial con cuotas iguales. No incluye seguros, comisiones ni otros cargos: la cuota real será mayor. Para comparar préstamos mira la TCEA",
      ayuda("la TCEA", EXPLICA_TCEA),
      " de cada entidad."
    );
    const piezas = [
      cuadricula,
      tarjetaTabla(
        [{ titulo: "Mes" }, { titulo: "Cuota", clase: "tabla__num" }, { titulo: "Interés", clase: "tabla__num" }, { titulo: "Capital", clase: "tabla__num" }, { titulo: "Saldo", clase: "tabla__num" }],
        filas,
        "Cronograma de pagos"
      )
    ];
    if (meses > MAXIMO_FILAS) piezas.push(crear("p", { clase: "nota", texto: `Se muestran los primeros ${MAXIMO_FILAS} meses de ${meses}.` }));
    piezas.push(nota);
    zona.replaceChildren(...piezas);
  }
  calcular();
  return caja;
}

// ============================================================
// 4. Tiempo para una meta
// ============================================================
function calculadoraMeta() {
  const MODOS = [
    { id: "tiempo", nombre: "¿En cuánto tiempo llego?" },
    { id: "aporte", nombre: "¿Cuánto debo aportar?" }
  ];
  let modo = "tiempo";
  const pintar = () => calcular();
  const meta = campoMonto("Meta", { ejemplo: "50 000", alCambiar: pintar });
  const inicial = campoMonto("Lo que ya tengo (opcional)", { ejemplo: "5 000", permiteCero: true, alCambiar: pintar });
  const aporte = campoMonto("Aporte mensual", { ejemplo: "800", permiteCero: true, alCambiar: pintar });
  const plazo = campoMonto("Plazo", { sufijo: "meses", ejemplo: "36", maximo: 1200, decimales: 0, alCambiar: pintar });
  const tasa = campoMonto("Tasa anual (TEA, opcional)", { sufijo: "%", ejemplo: "4", maximo: 200, permiteCero: true, alCambiar: pintar });

  const selectores = crear("div", { clase: "barra__grupo" });
  selectores.append(pestanas(MODOS, modo, (id) => {
    modo = id;
    // Cada pregunta usa un campo distinto: el aporte o el plazo
    aporte.elemento.hidden = id !== "tiempo";
    plazo.elemento.hidden = id !== "aporte";
    calcular();
  }));
  const { caja, zona } = armar([meta, inicial, aporte, plazo, tasa]);
  caja.prepend(selectores);
  selectores.style.marginBottom = "16px";
  plazo.elemento.hidden = true;

  function calcular() {
    const objetivo = meta.valor();
    const p = inicial.valor() ?? 0;
    const i = tasaMensual(tasa.valor() ?? 0);
    const supuestos = "Cálculo referencial: supone la misma tasa todo el tiempo y aportes al final de cada mes. No descuenta impuestos, comisiones ni inflación.";
    if (objetivo === null) {
      zona.replaceChildren(crear("p", { clase: "nota", texto: "Escribe tu meta y completa los demás campos." }));
      return;
    }
    if (p >= objetivo) {
      zona.replaceChildren(crear("p", { clase: "nota", texto: "Con lo que ya tienes llegas a esa meta." }));
      return;
    }

    if (modo === "tiempo") {
      const a = aporte.valor();
      if (a === null) {
        zona.replaceChildren(crear("p", { clase: "nota", texto: "Escribe cuánto puedes aportar cada mes." }));
        return;
      }
      // Se avanza mes a mes hasta llegar a la meta (tope: 100 años)
      let saldo = p;
      let meses = 0;
      while (saldo < objetivo && meses < 1200) {
        saldo = saldo * (1 + i) + a;
        meses++;
      }
      if (saldo < objetivo) {
        zona.replaceChildren(aviso("Con esos números no se llega a la meta en 100 años.", "Prueba con un aporte mayor o una tasa distinta."));
        return;
      }
      const cuadricula = crear("div", { clase: "cuadricula" });
      cuadricula.append(
        dato("Tiempo para llegar", duracion(meses), `${meses} ${meses === 1 ? "aporte" : "aportes"} de ${dinero(a)}`),
        dato("Total que pones", dinero(p + a * meses), p ? `${dinero(p)} que ya tienes + aportes` : "Solo aportes"),
        dato("Intereses", dinero(saldo - p - a * meses), `Saldo al final: ${dinero(saldo)}`)
      );
      zona.replaceChildren(cuadricula, crear("p", { clase: "nota", texto: supuestos }));
      return;
    }

    // Modo "aporte": cuánto poner cada mes para llegar en el plazo dado
    const n = plazo.valor();
    if (n === null) {
      zona.replaceChildren(crear("p", { clase: "nota", texto: "Escribe en cuántos meses quieres llegar." }));
      return;
    }
    const meses = Math.round(n);
    const factor = Math.pow(1 + i, meses);
    const falta = objetivo - p * factor;       // Lo que no cubre el crecimiento de lo que ya se tiene
    if (falta <= 0) {
      zona.replaceChildren(crear("p", { clase: "nota", texto: `Con lo que ya tienes y esa tasa llegas a la meta en ${duracion(meses)} sin aportar más.` }));
      return;
    }
    const necesario = i === 0 ? falta / meses : (falta * i) / (factor - 1);
    const cuadricula = crear("div", { clase: "cuadricula" });
    cuadricula.append(
      dato("Aporte mensual necesario", dinero(necesario), `Durante ${duracion(meses)}`),
      dato("Total que pones", dinero(p + necesario * meses), p ? `${dinero(p)} que ya tienes + aportes` : "Solo aportes"),
      dato("Intereses", dinero(objetivo - p - necesario * meses), `Meta: ${dinero(objetivo)}`)
    );
    zona.replaceChildren(cuadricula, crear("p", { clase: "nota", texto: supuestos }));
  }
  calcular();
  return caja;
}

// --- Tipo de cambio para proponer en "Resultado de una operación": última venta SBS del BCRP ---
function tipoDeCambio(respuesta) {
  if (!respuesta || respuesta.error || !Array.isArray(respuesta.datos)) return null;
  const MESES = { ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5, jul: 6, ago: 7, set: 8, sep: 8, oct: 9, nov: 10, dic: 11 };
  let mejor = null;
  for (const fila of respuesta.datos) {
    const valor = typeof fila.sbs_venta === "number" ? fila.sbs_venta : Number(fila.sbs_venta);
    const partes = /^(\d{1,2})\.([A-Za-zñ]{3})\.(\d{2})$/.exec(String(fila.fecha || "").trim());
    if (!Number.isFinite(valor) || valor <= 0 || !partes || MESES[partes[2].toLowerCase()] === undefined) continue;
    const fecha = new Date(2000 + Number(partes[3]), MESES[partes[2].toLowerCase()], Number(partes[1]));
    if (!mejor || fecha > mejor.fecha) mejor = { valor, fecha, fuente: respuesta.fuente || "BCRP", url: respuesta.url || undefined };
  }
  return mejor;
}

// --- Dibuja el módulo ---
function render(contenedor, datos = {}) {
  const descripcion = crear("span", { texto: "Haz cuentas rápidas de ahorro, préstamos y operaciones con una tasa anual (TEA)" });
  descripcion.append(ayuda("la TEA", EXPLICA_TEA), ".");
  contenedor.append(encabezado("Calculadoras", descripcion));

  const tc = tipoDeCambio(datos.tc);

  // Última calculadora abierta (se recuerda; los montos no)
  let abierta = memoria.leer("calculadoras", "abierta", CALCULADORAS[0].id);
  if (!CALCULADORAS.some((opcion) => opcion.id === abierta)) abierta = CALCULADORAS[0].id;

  const bloque = seccion();
  const barra = crear("div", { clase: "barra" });
  const zona = crear("div");
  barra.append(pestanas(CALCULADORAS, abierta, (id) => {
    abierta = id;
    memoria.guardar("calculadoras", "abierta", id);
    pintar();
  }));
  bloque.append(barra, zona);
  contenedor.append(bloque);

  function pintar() {
    const titulo = CALCULADORAS.find((opcion) => opcion.id === abierta).nombre;
    let calculadora;
    if (abierta === "operacion") calculadora = calculadoraOperacion(tc);
    else if (abierta === "prestamo") calculadora = calculadoraPrestamo();
    else if (abierta === "meta") calculadora = calculadoraMeta();
    else calculadora = calculadoraCompuesto();
    zona.replaceChildren(
      crear("h2", { clase: "seccion__titulo", texto: titulo }),
      calculadora,
      crear("p", { clase: "nota", texto: "Lo que escribes aquí no se guarda: se borra al salir de la calculadora." })
    );
  }
  pintar();
}

// --- Contrato del módulo (docs/arquitectura.md, sección 7) ---
export const calculadoras = {
  id: "calculadoras",
  nombre: "Calculadoras",
  icono: "∑",
  datos: ["tc"],     // Solo para proponer el tipo de cambio; si falla, las calculadoras funcionan igual
  render
};

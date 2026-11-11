// ============================================================
// reglas.js · Módulo "Mis reglas" (E4)
//
// El usuario anota sus posiciones (símbolo y precio de compra) y las
// reglas que él mismo se puso: objetivo de subida, límite de bajada y
// cada cuántos días revisar. Radar compara el precio con esas reglas
// y avisa cuando se cumplen. No recomienda comprar ni vender.
//
// Todo lo que el usuario escribe es personal: vive solo en su
// navegador (memoria.js). Los precios son públicos y llegan de la
// hoja de Sheets (recurso "precios", Google Finance con retraso).
// ============================================================

import { memoria } from "../../js/memoria.js";
import {
  crear, encabezado, seccion, tarjeta, lineaFuente, aviso,
  boton, etiqueta, campoMonto, selector, variacion, fechaCorta, fechaDia
} from "../../js/ui.js";

const DIA = 24 * 60 * 60 * 1000;

// --- Utilidades ---

// 1234.5 → "1 234.50"
function dinero(valor) {
  const [entero, decimales] = valor.toFixed(2).split(".");
  return `${entero.replace(/\B(?=(\d{3})+(?!\d))/g, " ")}.${decimales}`;
}

// Fecha de hoy como texto "2026-11-11" (así se guarda la última revisión)
function hoyTexto() {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");
  return `${hoy.getFullYear()}-${mes}-${dia}`;
}

// "2026-11-11" → Date a medianoche, hora local
function aFecha(texto) {
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(texto || ""));
  return partes ? new Date(Number(partes[1]), Number(partes[2]) - 1, Number(partes[3])) : null;
}

// --- Precios: { NVDA: 173.73, … } con solo los símbolos que tienen precio en dólares ---
function mapaDePrecios(respuesta) {
  const mapa = new Map();
  if (!respuesta || respuesta.error || !Array.isArray(respuesta.datos)) return mapa;
  for (const fila of respuesta.datos) {
    if (!fila || !fila.simbolo || typeof fila.precio !== "number") continue;
    if (fila.simbolo === "USD/PEN") continue;      // El tipo de cambio tiene su propio módulo
    mapa.set(fila.simbolo, fila.precio);
  }
  return mapa;
}

// --- Posiciones guardadas: se descartan las que no tengan la forma esperada ---
function leerPosiciones() {
  const guardadas = memoria.leer("reglas", "posiciones", []);
  if (!Array.isArray(guardadas)) return [];
  return guardadas.filter((p) =>
    p && typeof p.id === "string" && typeof p.simbolo === "string" &&
    typeof p.compra === "number" && p.compra > 0 && typeof p.objetivo === "number"
  );
}

// --- Qué reglas de una posición se cumplen con el precio de hoy ---
// Devuelve { cambio (% frente a la compra), avisos: [texto…], tocaRevisar }
function evaluar(posicion, precio) {
  const avisos = [];
  let cambio = null;
  if (typeof precio === "number") {
    cambio = (precio / posicion.compra - 1) * 100;
    if (cambio >= posicion.objetivo) avisos.push(`Objetivo alcanzado (+${posicion.objetivo} %)`);
    if (typeof posicion.limite === "number" && cambio <= -posicion.limite) avisos.push(`Límite alcanzado (−${posicion.limite} %)`);
  }
  let tocaRevisar = false;
  let proxima = null;
  if (typeof posicion.cadaDias === "number" && posicion.cadaDias > 0) {
    const ultima = aFecha(posicion.revisado) || new Date();
    proxima = new Date(ultima.getTime() + posicion.cadaDias * DIA);
    if (Date.now() >= proxima.getTime()) {
      tocaRevisar = true;
      avisos.push(`Toca revisar (desde el ${fechaDia(proxima)})`);
    }
  }
  return { cambio, avisos, tocaRevisar, proxima };
}

// --- Dibuja el módulo ---
function render(contenedor, datos = {}) {
  contenedor.append(encabezado(
    "Mis reglas",
    "Anota tus posiciones y las reglas que tú te pusiste; Radar te avisa cuando se cumplen."
  ));

  const respuesta = datos.precios;
  const precios = mapaDePrecios(respuesta);
  const leido = respuesta && !respuesta.error && respuesta.leido ? new Date(respuesta.leido) : null;
  let posiciones = leerPosiciones();
  let sinMemoria = !memoria.disponible();

  function guardar() {
    if (!memoria.guardar("reglas", "posiciones", posiciones)) sinMemoria = true;
  }

  // ---------- Posiciones ----------
  const bloqueLista = seccion("Mis posiciones");
  const zonaLista = crear("div");
  bloqueLista.append(zonaLista);
  contenedor.append(bloqueLista);

  function pintarLista() {
    const piezas = [];

    // Estado de los precios: caídos, copia guardada o al día
    if (!precios.size) {
      const motivo = respuesta && respuesta.error && respuesta.error.motivo;
      piezas.push(motivo === "sin-conexion"
        ? aviso("No hay conexión a internet.", "Tus posiciones están guardadas; los precios se verán cuando vuelva la conexión.")
        : aviso("No se pudieron cargar los precios.", "Tus posiciones están guardadas. Recarga la página en unos minutos."));
    } else if (respuesta.deCopia) {
      piezas.push(aviso("No se pudo conectar con los precios.", "Se usa la última copia guardada en este navegador. Fíjate en la hora."));
    }

    if (!posiciones.length) {
      piezas.push(crear("p", { clase: "nota", texto: "Todavía no has anotado posiciones. Agrega la primera abajo." }));
      zonaLista.replaceChildren(...piezas);
      return;
    }

    // Resumen: cuántas posiciones tienen algo que avisar
    const evaluadas = posiciones.map((posicion) => ({ posicion, estado: evaluar(posicion, precios.get(posicion.simbolo)) }));
    const conAviso = evaluadas.filter((item) => item.estado.avisos.length).length;
    piezas.push(crear("p", {
      clase: "nota",
      texto: conAviso
        ? `${conAviso} de ${posiciones.length} ${posiciones.length === 1 ? "posición tiene" : "posiciones tienen"} una regla cumplida.`
        : `Ninguna de tus ${posiciones.length === 1 ? "posición" : `${posiciones.length} posiciones`} tiene una regla cumplida por ahora.`
    }));

    const pila = crear("div", { clase: "pila" });
    pila.style.marginTop = "16px";
    for (const { posicion, estado } of evaluadas) {
      const precio = precios.get(posicion.simbolo);
      const caja = tarjeta("posicion");

      // Arriba: símbolo y precios a la izquierda, variación a la derecha
      const izquierda = crear("div");
      izquierda.append(
        crear("p", { clase: "posicion__simbolo", texto: posicion.simbolo }),
        crear("p", {
          clase: "posicion__detalle",
          texto: `Compra US$ ${dinero(posicion.compra)} · ` +
            (typeof precio === "number" ? `precio US$ ${dinero(precio)}` : "sin precio disponible")
        })
      );
      caja.append(izquierda);
      if (estado.cambio !== null) {
        const signo = estado.cambio > 0 ? "+" : estado.cambio < 0 ? "−" : "";
        caja.append(variacion(estado.cambio, `${signo}${Math.abs(estado.cambio).toFixed(2)} %`));
      } else {
        caja.append(crear("span", { clase: "variacion", texto: "—" }));
      }

      // Abajo: reglas cumplidas (o "En curso"), las reglas anotadas y los botones
      const avisos = crear("div", { clase: "posicion__avisos" });
      if (estado.avisos.length) {
        for (const texto of estado.avisos) avisos.append(etiqueta(texto));
      } else {
        avisos.append(etiqueta("En curso", { neutra: true }));
      }
      let reglas = `Objetivo +${posicion.objetivo} %`;
      if (typeof posicion.limite === "number") reglas += ` · límite −${posicion.limite} %`;
      if (estado.proxima && !estado.tocaRevisar) reglas += ` · revisar el ${fechaDia(estado.proxima)}`;
      avisos.append(crear("span", { clase: "posicion__detalle", texto: reglas }));

      if (estado.tocaRevisar) {
        const revisado = boton("Revisado hoy", () => {
          posicion.revisado = hoyTexto();     // La próxima revisión se cuenta desde hoy
          guardar();
          pintarLista();
        });
        revisado.classList.add("boton--texto");
        avisos.append(revisado);
      }
      const quitar = boton("Quitar", () => {
        posiciones = posiciones.filter((otra) => otra.id !== posicion.id);
        guardar();
        pintarLista();
      });
      quitar.classList.add("boton--texto");
      quitar.setAttribute("aria-label", `Quitar la posición de ${posicion.simbolo}`);
      avisos.append(quitar);

      caja.append(avisos);
      pila.append(caja);
    }
    piezas.push(pila);

    // Fuente y hora de los precios (regla de producto)
    if (precios.size && leido && !Number.isNaN(leido.getTime())) {
      piezas.push(lineaFuente({
        fuente: respuesta.fuente || "Google Finance",
        url: respuesta.url || undefined,
        fecha: leido,
        verbo: "leído",
        nota: "precios con retraso de hasta 20 min; no son para operar"
      }));
    }
    piezas.push(crear("p", {
      clase: "nota",
      texto: "Radar solo compara el precio con las reglas que tú anotaste. No recomienda comprar ni vender." +
        (sinMemoria ? " Tu navegador no deja guardar: lo que anotes se pierde al cerrar la página." : "")
    }));
    zonaLista.replaceChildren(...piezas);
  }

  // ---------- Nueva posición ----------
  const bloqueNueva = seccion("Agregar posición");
  contenedor.append(bloqueNueva);

  if (!precios.size) {
    bloqueNueva.append(crear("p", { clase: "nota", texto: "Para agregar una posición hacen falta los precios. Vuelve a intentar cuando carguen." }));
  } else {
    const opciones = [...precios.keys()].map((simbolo) => ({ id: simbolo, nombre: simbolo }));
    const campoSimbolo = selector("Símbolo", opciones);
    const campoCompra = campoMonto("Precio de compra", { prefijo: "US$", ejemplo: "150.00", maximo: 1000000 });
    const campoObjetivo = campoMonto("Objetivo de subida", { prefijo: "+", sufijo: "%", ejemplo: "10", maximo: 1000 });
    const campoLimite = campoMonto("Límite de bajada (opcional)", { prefijo: "−", sufijo: "%", ejemplo: "8", maximo: 100 });
    const campoDias = campoMonto("Revisar cada (opcional)", { sufijo: "días", ejemplo: "30", maximo: 3650 });
    const mensaje = crear("p", { clase: "nota", atributos: { role: "status" } });

    const agregar = boton("Agregar", () => {
      const compra = campoCompra.valor();
      const objetivo = campoObjetivo.valor();
      if (compra === null || objetivo === null) {
        mensaje.textContent = "Falta el precio de compra o el objetivo de subida.";
        return;
      }
      const dias = campoDias.valor();
      posiciones.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,   // Identificador único de la posición
        simbolo: campoSimbolo.valor(),
        compra,
        objetivo,
        limite: campoLimite.valor(),
        cadaDias: dias === null ? null : Math.round(dias),
        revisado: hoyTexto()
      });
      guardar();
      for (const campo of [campoCompra, campoObjetivo, campoLimite, campoDias]) campo.ponerValor(null);
      mensaje.textContent = "Posición agregada.";
      pintarLista();
    });

    const formulario = crear("div", { clase: "formulario" });
    formulario.append(campoSimbolo.elemento, campoCompra.elemento, campoObjetivo.elemento, campoLimite.elemento, campoDias.elemento, agregar);
    bloqueNueva.append(
      formulario,
      mensaje,
      crear("p", { clase: "nota", texto: "Lo que anotas se guarda solo en este navegador: no llega a ningún servidor." })
    );
  }

  // ---------- Respaldo: exportar e importar ----------
  const bloqueRespaldo = seccion("Respaldo");
  const mensajeRespaldo = crear("p", { clase: "nota", atributos: { role: "status" } });

  // Exportar: arma un archivo JSON con todo lo personal de Radar y lo descarga.
  // NUEVO: Blob es "un archivo en memoria"; con un enlace temporal el navegador lo descarga.
  const exportar = boton("Exportar", () => {
    const contenido = { app: "radar", version: 1, exportado: new Date().toISOString(), datos: memoria.todo() };
    const archivo = new Blob([JSON.stringify(contenido, null, 2)], { type: "application/json" });
    const enlace = crear("a", { atributos: { href: URL.createObjectURL(archivo), download: `radar-respaldo-${hoyTexto()}.json` } });
    document.body.append(enlace);
    enlace.click();
    enlace.remove();
    URL.revokeObjectURL(enlace.href);
    mensajeRespaldo.textContent = "Respaldo descargado. Guárdalo donde solo tú lo veas: contiene lo que anotaste.";
  });

  // Importar: lee un archivo de respaldo y lo guarda en este navegador
  const entradaArchivo = crear("input", { atributos: { type: "file", accept: "application/json,.json", hidden: "" } });
  entradaArchivo.addEventListener("change", async () => {
    const archivo = entradaArchivo.files && entradaArchivo.files[0];
    entradaArchivo.value = "";
    if (!archivo) return;
    try {
      const contenido = JSON.parse(await archivo.text());
      if (!contenido || contenido.app !== "radar" || typeof contenido.datos !== "object" || contenido.datos === null) {
        throw new Error("formato");
      }
      const guardados = memoria.restaurar(contenido.datos);
      if (guardados < 0) {
        mensajeRespaldo.textContent = "Tu navegador no deja guardar: no se pudo importar.";
        return;
      }
      posiciones = leerPosiciones();
      pintarLista();
      mensajeRespaldo.textContent = `Respaldo importado (${guardados} ${guardados === 1 ? "dato" : "datos"}). Los otros apartados lo verán al abrirlos.`;
    } catch (error) {
      mensajeRespaldo.textContent = "Ese archivo no es un respaldo de Radar.";
    }
  });
  const importar = boton("Importar", () => entradaArchivo.click());

  const filaRespaldo = crear("div", { clase: "formulario" });
  filaRespaldo.append(exportar, importar, entradaArchivo);
  bloqueRespaldo.append(
    crear("p", { clase: "nota", texto: "Pasa tus posiciones, favoritos y ajustes de un equipo a otro con un archivo." }),
    filaRespaldo,
    mensajeRespaldo
  );
  filaRespaldo.style.marginTop = "8px";
  contenedor.append(bloqueRespaldo);

  pintarLista();
}

// --- Contrato del módulo (docs/arquitectura.md, sección 7) ---
export const reglas = {
  id: "reglas",
  nombre: "Mis reglas",
  icono: "✓",
  datos: ["precios"],
  render
};

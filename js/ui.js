// ============================================================
// ui.js · Componentes reutilizables
// Funciones que crean las piezas de componentes.css. Los módulos
// arman su pantalla con ellas para que todo Radar se vea igual.
// ============================================================

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

// Crea un elemento HTML en una línea.
// Ejemplo: crear("p", { clase: "fuente", texto: "Fuente: SBS" })
export function crear(etiqueta, { clase, texto, atributos } = {}) {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto !== undefined) elemento.textContent = texto;
  if (atributos) {
    for (const [nombre, valor] of Object.entries(atributos)) {
      elemento.setAttribute(nombre, valor);
    }
  }
  return elemento;
}

// Fecha en formato corto y en español: "10 nov 2026, 19:45"
export function fechaCorta(fecha = new Date()) {
  const hora = String(fecha.getHours()).padStart(2, "0");
  const minuto = String(fecha.getMinutes()).padStart(2, "0");
  return `${fecha.getDate()} ${MESES[fecha.getMonth()]} ${fecha.getFullYear()}, ${hora}:${minuto}`;
}

// Fecha sin hora: "11 nov 2026". Para datos que tienen día pero no hora.
export function fechaDia(fecha = new Date()) {
  return `${fecha.getDate()} ${MESES[fecha.getMonth()]} ${fecha.getFullYear()}`;
}

// Encabezado de un módulo: título + la pregunta que responde.
// "pregunta" puede ser texto o un elemento ya armado (por ejemplo, con un "?").
export function encabezado(titulo, pregunta) {
  const caja = crear("header");
  caja.append(crear("h1", { clase: "modulo__titulo", texto: titulo }));
  if (pregunta) {
    const linea = crear("p", { clase: "modulo__pregunta" });
    linea.append(pregunta);
    caja.append(linea);
  }
  return caja;
}

// Sección con subtítulo dentro de un módulo.
export function seccion(titulo) {
  const caja = crear("section", { clase: "seccion" });
  if (titulo) caja.append(crear("h2", { clase: "seccion__titulo", texto: titulo }));
  return caja;
}

// Tarjeta vacía (el módulo le pone el contenido).
export function tarjeta(claseExtra = "") {
  return crear("div", { clase: `tarjeta ${claseExtra}`.trim() });
}

// Línea de fuente y fecha. Regla de producto: todo dato la lleva.
// verbo: "actualizado" para datos propios, "cargado" para widgets.
// sinHora: muestra solo el día. url: convierte el nombre de la fuente en enlace.
export function lineaFuente({ fuente, fecha, verbo = "actualizado", nota, sinHora = false, url }) {
  const cuando = sinHora ? fechaDia(fecha) : fechaCorta(fecha);
  const linea = crear("p", { clase: "fuente" });
  if (url) {
    linea.append("Fuente: ", crear("a", { texto: fuente, atributos: { href: url, target: "_blank", rel: "noopener" } }));
  } else {
    linea.append(`Fuente: ${fuente}`);
  }
  linea.append(` · ${verbo} ${cuando}`);
  if (nota) linea.append(` · ${nota}`);
  return linea;
}

// Aviso: mensaje claro cuando algo falla o todavía no existe.
export function aviso(mensaje, detalle) {
  const caja = crear("div", { clase: "aviso", atributos: { role: "status" } });
  caja.append(crear("p", { texto: mensaje }));
  if (detalle) caja.append(crear("p", { texto: detalle }));
  return caja;
}

// Ayuda "?": explicación de una línea junto a un término (TREA, ETF...).
// En laptop aparece al pasar el mouse; en celular, al tocar.
export function ayuda(termino, explicacion) {
  const boton = crear("button", {
    clase: "ayuda",
    texto: "?",
    atributos: {
      type: "button",
      "aria-label": `¿Qué es ${termino}?`,
      "aria-expanded": "false"
    }
  });
  boton.append(crear("span", { clase: "ayuda__texto", texto: explicacion, atributos: { role: "tooltip" } }));

  // Tocar abre o cierra; salir del botón (blur) cierra.
  boton.addEventListener("click", () => {
    const abierto = boton.getAttribute("aria-expanded") === "true";
    boton.setAttribute("aria-expanded", String(!abierto));
  });
  boton.addEventListener("blur", () => boton.setAttribute("aria-expanded", "false"));
  return boton;
}

// ------------------------------------------------------------
// Piezas agregadas en la S2 de E1
// ------------------------------------------------------------

// Botón secundario con texto. "alPulsar" es la función que se ejecuta al hacer clic.
export function boton(texto, alPulsar) {
  const elemento = crear("button", { clase: "boton", texto, atributos: { type: "button" } });
  elemento.addEventListener("click", alPulsar);
  return elemento;
}

// Botón redondo con un solo símbolo (por ejemplo "⤢"). Como el símbolo no
// dice nada a un lector de pantalla, "etiqueta" describe lo que hace.
export function botonIcono(simbolo, etiqueta, alPulsar) {
  const elemento = crear("button", {
    clase: "boton-icono",
    texto: simbolo,
    atributos: { type: "button", "aria-label": etiqueta, title: etiqueta }
  });
  elemento.addEventListener("click", alPulsar);
  return elemento;
}

// Pestañas. opciones: [{ id, nombre }]; "activa" es el id de la pestaña abierta.
// Al pulsar una, se marca y se llama a alCambiar(id).
export function pestanas(opciones, activa, alCambiar) {
  const fila = crear("div", { clase: "pestanas", atributos: { role: "tablist" } });
  for (const opcion of opciones) {
    const pestana = crear("button", {
      clase: "pestana",
      texto: opcion.nombre,
      atributos: { type: "button", role: "tab", "aria-selected": String(opcion.id === activa) }
    });
    pestana.addEventListener("click", () => {
      for (const otra of fila.children) otra.setAttribute("aria-selected", String(otra === pestana));
      alCambiar(opcion.id);
    });
    fila.append(pestana);
  }
  return fila;
}

// Chip: etiqueta redonda que se puede pulsar.
// elegido: se pinta resaltado. apagado: en gris y sin clic (por ejemplo, "sin datos").
export function chip(texto, { titulo, elegido = false, apagado = false, alPulsar } = {}) {
  const elemento = crear("button", { clase: "chip", texto, atributos: { type: "button" } });
  if (titulo) elemento.title = titulo;
  if (apagado) {
    elemento.disabled = true;
    return elemento;
  }
  elemento.setAttribute("aria-pressed", String(elegido));
  if (alPulsar) elemento.addEventListener("click", alPulsar);
  return elemento;
}

// Interruptor de encendido / apagado. Llama a alCambiar(true | false).
// role="switch" le dice al lector de pantalla que es un interruptor.
export function interruptor(etiqueta, encendido, alCambiar, titulo) {
  const elemento = crear("button", {
    clase: "interruptor",
    atributos: { type: "button", role: "switch", "aria-checked": String(encendido) }
  });
  if (titulo) elemento.title = titulo;
  elemento.append(
    crear("span", { clase: "interruptor__riel", atributos: { "aria-hidden": "true" } }),
    crear("span", { texto: etiqueta })
  );
  elemento.addEventListener("click", () => {
    const nuevo = elemento.getAttribute("aria-checked") !== "true";
    elemento.setAttribute("aria-checked", String(nuevo));
    alCambiar(nuevo);
  });
  return elemento;
}

// ------------------------------------------------------------
// Piezas agregadas en E2
// ------------------------------------------------------------

// Etiqueta: dato corto y destacado (por ejemplo, la fecha de los datos).
// alerta: true la pinta como advertencia (datos viejos).
export function etiqueta(texto, { alerta = false } = {}) {
  return crear("span", { clase: alerta ? "etiqueta etiqueta--alerta" : "etiqueta", texto });
}

// Tabla propia de Radar.
// columnas: [{ titulo, clase }]  ·  filas: lista de listas; cada celda es
// un texto o un elemento ya armado. "clase" se aplica a toda la columna
// (por ejemplo "tabla__num" para alinear cifras a la derecha).
export function tabla(columnas, filas, descripcion) {
  const elemento = crear("table", { clase: "tabla" });
  if (descripcion) elemento.append(crear("caption", { texto: descripcion }));

  const cabecera = crear("tr");
  for (const columna of columnas) {
    cabecera.append(crear("th", { clase: columna.clase, texto: columna.titulo, atributos: { scope: "col" } }));
  }
  const thead = crear("thead");
  thead.append(cabecera);

  const tbody = crear("tbody");
  for (const fila of filas) {
    const tr = crear("tr");
    fila.forEach((celda, i) => {
      const td = crear("td", { clase: columnas[i].clase });
      td.append(celda);
      tr.append(td);
    });
    tbody.append(tr);
  }

  elemento.append(thead, tbody);
  return elemento;
}

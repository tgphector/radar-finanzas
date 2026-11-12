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
// neutra: true la pinta apagada (estado normal, sin nada que avisar).
export function etiqueta(texto, { alerta = false, neutra = false } = {}) {
  let clase = "etiqueta";
  if (alerta) clase += " etiqueta--alerta";
  if (neutra) clase += " etiqueta--neutra";
  return crear("span", { clase, texto });
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

// Campo para escribir un monto. "prefijo" es el símbolo de la moneda (S/, US$).
// Llama a alCambiar(numero | null) cada vez que el usuario escribe.
// Devuelve { elemento, ponerPrefijo(texto), ponerValor(numero | null) }.
// inputmode="decimal" hace que el celular muestre el teclado de números.
// "sufijo" va después del número (por ejemplo "%" o "días") y "ejemplo" es el texto gris de muestra.
// "decimales" es cuántos decimales se aceptan y "permiteCero" deja escribir 0 (por ejemplo, un aporte de 0).
export function campoMonto(etiquetaTexto, { valor = null, prefijo = "", sufijo = "", ejemplo = "10 000", maximo = 999999999, decimales = 2, permiteCero = false, alCambiar } = {}) {
  const elemento = crear("label", { clase: "campo" });
  const caja = crear("span", { clase: "campo__caja" });
  const marca = crear("span", { clase: "campo__prefijo", texto: prefijo });
  const entrada = crear("input", {
    clase: "campo__entrada",
    atributos: { type: "text", inputmode: "decimal", autocomplete: "off", placeholder: ejemplo }
  });
  if (valor !== null) entrada.value = String(valor);
  if (sufijo) entrada.classList.add("campo__entrada--corta");

  // Del texto escrito se toma solo el número: "10 000", "10,000" y "10000" valen lo mismo
  const leer = () => {
    const limpio = entrada.value.replace(/[\s,]/g, "");
    if (!new RegExp(`^\\d+(\\.\\d{0,${decimales}})?$`).test(limpio)) return null;
    const numero = Number(limpio);
    const minimoOk = permiteCero ? numero >= 0 : numero > 0;
    return minimoOk && numero <= maximo ? numero : null;
  };

  entrada.addEventListener("input", () => {
    const numero = leer();
    // Si hay texto pero no es un monto válido, se marca el campo
    entrada.setAttribute("aria-invalid", String(entrada.value.trim() !== "" && numero === null));
    if (alCambiar) alCambiar(numero);
  });

  caja.append(marca, entrada);
  if (sufijo) caja.append(crear("span", { clase: "campo__prefijo", texto: sufijo }));
  elemento.append(crear("span", { clase: "campo__etiqueta", texto: etiquetaTexto }), caja);
  return {
    elemento,
    valor: leer,
    ponerPrefijo(texto) { marca.textContent = texto; },
    ponerValor(numero) {
      entrada.value = numero === null ? "" : String(numero);
      entrada.setAttribute("aria-invalid", "false");
    }
  };
}

// ------------------------------------------------------------
// Piezas agregadas en E4 y E5
// ------------------------------------------------------------

// Lista desplegable. opciones: [{ id, nombre }]. Devuelve { elemento, valor() }.
export function selector(etiquetaTexto, opciones, { valor, alCambiar } = {}) {
  const elemento = crear("label", { clase: "campo" });
  const lista = crear("select", { clase: "campo__lista" });
  for (const opcion of opciones) {
    const item = crear("option", { texto: opcion.nombre, atributos: { value: opcion.id } });
    if (opcion.id === valor) item.selected = true;
    lista.append(item);
  }
  if (alCambiar) lista.addEventListener("change", () => alCambiar(lista.value));
  elemento.append(crear("span", { clase: "campo__etiqueta", texto: etiquetaTexto }), lista);
  return { elemento, valor: () => lista.value };
}

// Variación con flecha y signo: "▲ +1.25 %" o "▼ −0.80 %".
// Regla de producto: verde y rojo solo para subidas y bajadas, siempre con flecha o signo.
// texto: lo que se muestra después de la flecha (ya con su signo).
export function variacion(numero, texto) {
  if (numero > 0) return crear("span", { clase: "variacion variacion--sube", texto: `▲ ${texto}` });
  if (numero < 0) return crear("span", { clase: "variacion variacion--baja", texto: `▼ ${texto}` });
  return crear("span", { clase: "variacion", texto: `= ${texto}` });
}

// Tarjeta de un dato: título chico, cifra grande y una línea de detalle debajo.
// "cifra" y "detalle" pueden ser texto o elementos ya armados.
export function dato(titulo, cifra, detalle) {
  const caja = tarjeta("dato");
  caja.append(crear("p", { clase: "dato__titulo", texto: titulo }));
  const grande = crear("p", { clase: "dato__cifra" });
  grande.append(cifra);
  caja.append(grande);
  if (detalle) {
    const linea = crear("p", { clase: "dato__detalle" });
    linea.append(detalle);
    caja.append(linea);
  }
  return caja;
}

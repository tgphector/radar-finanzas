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
export function lineaFuente({ fuente, fecha, verbo = "actualizado", nota }) {
  let texto = `Fuente: ${fuente} · ${verbo} ${fechaCorta(fecha)}`;
  if (nota) texto += ` · ${nota}`;
  return crear("p", { clase: "fuente", texto });
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

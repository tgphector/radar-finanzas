// ============================================================
// Utilidades.gs · Funciones compartidas del proyecto de Apps Script
// (copia de respaldo; el código vivo está en el proyecto vinculado
// al archivo "Radar · Base de datos")
// ============================================================

// Zona horaria con la que se escriben las fechas del JSON
const ZONA = "America/Lima";

// Lee una hoja completa y la devuelve como lista de objetos.
// La fila 1 es el encabezado: sus textos son los nombres de los campos.
// Ejemplo: [{ entidad: "…", plazo_dias: 360, tea: 4.5 }, …]
// Las filas totalmente vacías se saltan. Si la hoja no existe, lanza un error.
function leerHoja(nombre) {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nombre);
  if (!hoja) throw new Error('No existe la hoja "' + nombre + '"');

  const valores = hoja.getDataRange().getValues();
  if (valores.length < 2) return [];

  const campos = valores[0].map(function (texto) { return String(texto).trim(); });
  const filas = [];

  for (let i = 1; i < valores.length; i++) {
    const fila = valores[i];
    const vacia = fila.every(function (celda) { return celda === "" || celda === null; });
    if (vacia) continue;

    const objeto = {};
    campos.forEach(function (campo, columna) {
      if (campo) objeto[campo] = limpiarCelda(fila[columna]);
    });
    filas.push(objeto);
  }
  return filas;
}

// Deja cada celda lista para el JSON: las fechas pasan a texto con
// zona horaria (2026-11-24T08:05:00-05:00) y las celdas vacías a null.
function limpiarCelda(valor) {
  if (Object.prototype.toString.call(valor) === "[object Date]") return fechaTexto(valor);
  if (valor === "") return null;
  // Una fórmula con error (#N/A, #REF!…) se entrega como dato vacío, no como texto
  if (typeof valor === "string" && valor.charAt(0) === "#") return null;
  return valor;
}

// Fecha en el formato del JSON de Radar
function fechaTexto(fecha) {
  return Utilities.formatDate(fecha, ZONA, "yyyy-MM-dd'T'HH:mm:ssXXX");
}

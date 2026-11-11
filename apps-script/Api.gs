// ============================================================
// Api.gs · Entrega los datos de Sheets a la página de Radar en JSON
// (copia de respaldo; el código vivo está en el proyecto vinculado
// al archivo "Radar · Base de datos")
//
// App web con doGet: cada vez que alguien abre la dirección /exec,
// Google ejecuta doGet(e) y devuelve lo que ella retorne.
// "e.parameter" trae lo que viene después del "?" en la dirección:
//   …/exec?recurso=tasas  →  e.parameter.recurso === "tasas"
//
// Qué recursos existen lo dice la hoja "fuentes": cada fila tiene un
// "recurso" (el nombre que pide la página) y una "hoja" (de dónde se
// leen los datos). Para sumar un recurso nuevo basta agregar una fila
// en "fuentes": NO hace falta tocar este código ni volver a publicar.
//
// Esta app solo LEE datos públicos de la hoja. Nunca escribe.
// Formato de la respuesta: docs/arquitectura.md, sección 8.
// ============================================================

// Minutos que se guarda una respuesta en la caché
const MINUTOS_CACHE = 5;

function doGet(e) {
  const recurso = String((e && e.parameter && e.parameter.recurso) || "").toLowerCase();

  // CacheService: memoria temporal de Apps Script. Se guarda la respuesta
  // ya armada (texto) por unos minutos para que la página cargue rápido.
  const cache = CacheService.getScriptCache();
  const clave = "radar." + recurso;
  if (recurso) {
    const guardado = cache.get(clave);
    if (guardado) return textoJson(guardado);
  }

  let respuesta;
  try {
    const fuentes = leerHoja("fuentes");
    const fuente = fuentes.filter(function (fila) {
      return fila.recurso && fila.hoja && String(fila.recurso).toLowerCase() === recurso;
    })[0];

    // Recurso desconocido: se responde con un error claro y la lista de los que sí existen
    if (!fuente) {
      const opciones = fuentes
        .filter(function (fila) { return fila.recurso && fila.hoja; })
        .map(function (fila) { return fila.recurso; });
      return responderJson({
        recurso: recurso,
        estado: "error",
        nota: "Recurso desconocido. Opciones: " + opciones.join(", "),
        datos: []
      });
    }

    respuesta = {
      recurso: recurso,
      fuente: fuente.nombre || null,
      url: fuente.url || null,
      actualizado: fuente.actualizado || null,
      // Momento en que esta app leyó la hoja. Sirve de fecha para los datos
      // que se actualizan solos con fórmulas (precios, tipo de cambio).
      leido: fechaTexto(new Date()),
      // Si la última actualización falló, "datos" sigue trayendo el último valor bueno
      estado: fuente.estado === "error" ? "error" : "ok",
      nota: fuente.nota || null,
      datos: leerHoja(String(fuente.hoja))
    };
  } catch (error) {
    // Si algo falla al leer (hoja borrada, por ejemplo), se avisa en el JSON.
    // No se guarda en caché para que el siguiente pedido lo intente de nuevo.
    return responderJson({
      recurso: recurso,
      estado: "error",
      nota: "No se pudo leer la hoja: " + error.message,
      datos: []
    });
  }

  const texto = JSON.stringify(respuesta);
  try {
    cache.put(clave, texto, MINUTOS_CACHE * 60);   // La caché acepta hasta 100 KB por clave
  } catch (error) {
    // Si no entra en la caché, se responde igual
  }
  return textoJson(texto);
}

// Convierte un objeto en la respuesta JSON de la app web
function responderJson(objeto) {
  return textoJson(JSON.stringify(objeto));
}

// ContentService: hace que la app web responda texto (JSON) en lugar de una página HTML
function textoJson(texto) {
  return ContentService.createTextOutput(texto).setMimeType(ContentService.MimeType.JSON);
}

// Borra la caché a mano. Se ejecuta desde el editor después de corregir
// la hoja, para no esperar los 5 minutos.
function limpiarCache() {
  const claves = leerHoja("fuentes")
    .filter(function (fila) { return fila.recurso; })
    .map(function (fila) { return "radar." + String(fila.recurso).toLowerCase(); });
  CacheService.getScriptCache().removeAll(claves);
}

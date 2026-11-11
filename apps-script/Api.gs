// ============================================================
// Api.gs · Entrega los datos de Sheets a la página de Radar en JSON
// (copia de respaldo; el código vivo está en el proyecto vinculado
// al archivo "Radar · Base de datos")
//
// NUEVO: app web con doGet
// Cuando un proyecto de Apps Script se publica como "app web", Google
// le da una dirección (URL). Cada vez que alguien abre esa dirección,
// Google ejecuta la función doGet(e) y devuelve lo que ella retorne.
// "e.parameter" trae lo que viene después del "?" en la dirección:
//   …/exec?recurso=tasas  →  e.parameter.recurso === "tasas"
//
// Esta app solo LEE datos públicos de la hoja. Nunca escribe.
// Formato de la respuesta: docs/arquitectura.md, sección 8.
// ============================================================

// Qué hoja corresponde a cada recurso que puede pedir la página
const RECURSOS = {
  tasas: "tasas_pf",
  fsd: "fsd"
};

// Minutos que se guarda una respuesta en la caché
const MINUTOS_CACHE = 5;

function doGet(e) {
  const recurso = String((e && e.parameter && e.parameter.recurso) || "").toLowerCase();

  // Recurso desconocido: se responde con un error claro, sin tocar la hoja
  if (!RECURSOS[recurso]) {
    return responderJson({
      recurso: recurso,
      estado: "error",
      nota: "Recurso desconocido. Opciones: " + Object.keys(RECURSOS).join(", "),
      datos: []
    });
  }

  // NUEVO: CacheService
  // Es una memoria temporal de Apps Script. Leer la hoja tarda 1-2 segundos;
  // leer la caché, milésimas. Se guarda la respuesta ya armada (texto) por
  // unos minutos, así la página carga rápido aunque la abran muchas veces.
  const cache = CacheService.getScriptCache();
  const clave = "radar." + recurso;
  const guardado = cache.get(clave);
  if (guardado) return textoJson(guardado);

  let respuesta;
  try {
    respuesta = armarRespuesta(recurso);
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

// Arma el objeto de respuesta: los datos del recurso + su fila en la hoja "fuentes"
// (de dónde salen, cuándo se actualizaron y si la última actualización salió bien).
function armarRespuesta(recurso) {
  const datos = leerHoja(RECURSOS[recurso]);

  const fuentes = leerHoja("fuentes");
  const fuente = fuentes.filter(function (fila) {
    return String(fila.recurso).toLowerCase() === recurso;
  })[0] || {};

  return {
    recurso: recurso,
    fuente: fuente.nombre || null,
    url: fuente.url || null,
    actualizado: fuente.actualizado || null,
    // Si la última actualización falló, "datos" sigue trayendo el último valor bueno
    estado: fuente.estado === "error" ? "error" : "ok",
    nota: fuente.nota || null,
    datos: datos
  };
}

// Convierte un objeto en la respuesta JSON de la app web
function responderJson(objeto) {
  return textoJson(JSON.stringify(objeto));
}

// NUEVO: ContentService
// Sirve para que la app web responda texto (aquí, JSON) en lugar de una página HTML.
function textoJson(texto) {
  return ContentService.createTextOutput(texto).setMimeType(ContentService.MimeType.JSON);
}

// Borra la caché a mano. Se ejecuta desde el editor después de corregir
// la hoja, para no esperar los 5 minutos.
function limpiarCache() {
  CacheService.getScriptCache().removeAll(Object.keys(RECURSOS).map(function (recurso) {
    return "radar." + recurso;
  }));
}

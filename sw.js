// ============================================================
// sw.js · Service worker de Radar
//
// NUEVO: service worker
// Es un archivo que el navegador deja instalado "entre" la página y
// la red. Cada vez que Radar pide uno de sus archivos, el pedido pasa
// por aquí. Sirve para dos cosas: que Radar se pueda instalar como app
// (PWA) y que abra aunque no haya conexión, con la última copia.
//
// Estrategia: primero la red, y si falla, la copia guardada.
// Así Radar siempre muestra la versión más nueva cuando hay internet
// (no se queda pegado en una versión vieja) y sigue abriendo sin él.
//
// Solo guarda archivos propios de Radar. Los widgets de TradingView y
// los datos de la app web no pasan por aquí: los widgets necesitan
// internet y los datos ya guardan su propia copia (js/datos.js).
// ============================================================

// Cambiar este nombre borra las copias anteriores al activar la versión nueva
const CACHE = "radar-v1";

// Archivos que se guardan al instalar, para que la primera visita sin
// conexión ya funcione. Rutas relativas a la carpeta de Radar.
const BASE = [
  "./",
  "index.html",
  "manifest.json",
  "css/tokens.css",
  "css/base.css",
  "css/componentes.css",
  "js/app.js",
  "js/config.js",
  "js/datos.js",
  "js/memoria.js",
  "js/ui.js",
  "modulos/graficas/graficas.js",
  "modulos/graficas/simbolos.json",
  "modulos/plazos/plazos.js",
  "icons/icono-192.png"
];

// Al instalar: guardar los archivos base
self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(BASE)).then(() => self.skipWaiting())
  );
});

// Al activar: borrar copias de versiones anteriores y tomar el control de las pestañas abiertas
self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches.keys()
      .then((nombres) => Promise.all(nombres.filter((nombre) => nombre !== CACHE).map((nombre) => caches.delete(nombre))))
      .then(() => self.clients.claim())
  );
});

// En cada pedido de un archivo propio: red primero, copia si la red falla
self.addEventListener("fetch", (evento) => {
  const pedido = evento.request;
  const direccion = new URL(pedido.url);

  // Solo pedidos de lectura (GET) a archivos de Radar; el resto sigue su camino normal
  if (pedido.method !== "GET" || direccion.origin !== self.location.origin) return;

  evento.respondWith(
    fetch(pedido)
      .then((respuesta) => {
        // Se guarda una copia de cada respuesta buena para usarla sin conexión
        if (respuesta.ok) {
          const copia = respuesta.clone();
          caches.open(CACHE).then((cache) => cache.put(pedido, copia));
        }
        return respuesta;
      })
      .catch(async () => {
        const guardada = await caches.match(pedido, { ignoreSearch: true });
        if (guardada) return guardada;
        // Si se pidió una página y no hay copia exacta, se entrega la página principal
        if (pedido.mode === "navigate") {
          const inicio = await caches.match("index.html");
          if (inicio) return inicio;
        }
        return Response.error();
      })
  );
});

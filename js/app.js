// ============================================================
// app.js · Arranque de Radar
// 1) Registra los módulos. 2) Dibuja el menú. 3) Muestra el
// módulo que indica la dirección (router).
//
// Para agregar un módulo: se importa y se suma a MODULOS.
// Nada más cambia en este archivo.
// ============================================================

import { crear, encabezado, aviso } from "./ui.js";
import { pedir } from "./datos.js";
import { graficas } from "../modulos/graficas/graficas.js";
import { plazos } from "../modulos/plazos/plazos.js";
import { reglas } from "../modulos/reglas/reglas.js";
import { cambio } from "../modulos/cambio/cambio.js";

// --- 1. Registro de módulos (el orden es el del menú) ---
// Cada módulo cumple el contrato de docs/arquitectura.md, sección 7.
// "proximamente: true" = aparece en el menú pero aún no está construido.
const MODULOS = [
  graficas,
  plazos,
  reglas,
  cambio
];

// --- Datos públicos de un módulo ---
// Pide cada recurso que el módulo declara en "datos" (por ejemplo
// ["tasas", "fsd"]) y arma un objeto { tasas: …, fsd: … }.
// Si un recurso falla, en su lugar queda { error } y el módulo decide
// qué mensaje mostrar: un recurso caído no tumba a los demás.
// NUEVO: Promise.all espera varios pedidos a la vez en lugar de uno tras otro.
async function pedirDatos(recursos) {
  const respuestas = await Promise.all(recursos.map(async (recurso) => {
    try {
      return await pedir(recurso);
    } catch (error) {
      return { error };
    }
  }));
  const datos = {};
  recursos.forEach((recurso, i) => { datos[recurso] = respuestas[i]; });
  return datos;
}


const menuLista = document.getElementById("menu-lista");
const contenido = document.getElementById("contenido");

// --- 2. Menú: un enlace por módulo ---
function dibujarMenu() {
  menuLista.replaceChildren();
  for (const modulo of MODULOS) {
    const enlace = crear("a", {
      clase: "menu__enlace",
      atributos: { href: `#/${modulo.id}`, "data-modulo": modulo.id }
    });
    enlace.append(
      crear("span", { clase: "menu__icono", texto: modulo.icono, atributos: { "aria-hidden": "true" } }),
      crear("span", { texto: modulo.nombre })
    );
    const item = crear("li");
    item.append(enlace);
    menuLista.append(item);
  }
}

// --- 3. Router ---
// La parte de la dirección que va después de "#" (el hash) dice qué
// módulo mostrar: .../radar-finanzas/#/plazos → módulo "plazos".
// Cambiar el hash no recarga la página; solo dispara "hashchange".
function moduloDeLaDireccion() {
  const id = location.hash.replace("#/", "");
  return MODULOS.find((modulo) => modulo.id === id) || MODULOS[0];
}

function mostrar() {
  const modulo = moduloDeLaDireccion();

  // Marca en el menú el módulo que se está viendo
  for (const enlace of menuLista.querySelectorAll(".menu__enlace")) {
    if (enlace.dataset.modulo === modulo.id) enlace.setAttribute("aria-current", "page");
    else enlace.removeAttribute("aria-current");
  }

  // Cada vez se crea una caja nueva: así un módulo que todavía está
  // cargando no puede escribir encima del módulo siguiente.
  const caja = crear("div");
  contenido.replaceChildren(caja);
  document.title = `${modulo.nombre} · Radar`;
  window.scrollTo(0, 0);

  if (modulo.proximamente) {
    caja.append(
      encabezado(modulo.nombre),
      crear("div", { clase: "seccion" })
    );
    caja.lastChild.append(aviso("Próximamente.", "Este módulo todavía no está construido."));
    return;
  }

  // Si un módulo falla, se muestra un mensaje y el resto de Radar sigue funcionando
  const fallo = (error) => {
    console.error(error);
    caja.replaceChildren(aviso("Este módulo no se pudo mostrar.", "Recarga la página. Si sigue igual, avísale a Héctor."));
  };

  // Módulo sin datos públicos (Mis gráficas): se dibuja de inmediato
  if (!modulo.datos || !modulo.datos.length) {
    try {
      // Si render devuelve una promesa (función async), también se atrapan sus errores
      Promise.resolve(modulo.render(caja)).catch(fallo);
    } catch (error) {
      fallo(error);
    }
    return;
  }

  // Módulo con datos públicos: se avisa que está cargando, se piden los
  // datos y recién entonces se dibuja. Si mientras tanto el usuario cambió
  // de módulo, la caja ya no está en la página y no se dibuja nada.
  caja.append(encabezado(modulo.nombre), crear("p", { clase: "nota", texto: "Cargando datos…" }));
  pedirDatos(modulo.datos).then((datos) => {
    if (!caja.isConnected) return;
    caja.replaceChildren();
    return modulo.render(caja, datos);
  }).catch(fallo);
}

dibujarMenu();
window.addEventListener("hashchange", mostrar);
mostrar();

// --- 4. Service worker (PWA) ---
// Registra sw.js para que Radar se pueda instalar como app y abra sin
// conexión con la última copia. Si el navegador no lo soporta o falla,
// Radar funciona igual que siempre.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch((error) => console.warn("No se pudo registrar el service worker", error));
  });
}

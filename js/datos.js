// ============================================================
// datos.js · Pide los datos públicos de Radar (tasas, FSD…)
//
// Los módulos no llaman a la app web directamente: usan pedir().
// Así, si mañana los datos vienen de otro lado, solo cambia este archivo.
//
// Reglas (docs/arquitectura.md, sección 8):
// - Cada respuesta trae fuente, fecha ("actualizado") y estado.
// - Si la app web no responde, se devuelve la última copia guardada
//   en este navegador, marcada con "deCopia: true", para que el módulo
//   la muestre con su fecha y un aviso. Nunca un número sin fecha.
// ============================================================

import { URL_API } from "./config.js";
import { memoria } from "./memoria.js";

// Segundos que se espera a la app web antes de darla por caída
const ESPERA = 12;

// Error con un "motivo" corto, para que el módulo elija el mensaje:
// "sin-configurar" (falta la URL), "sin-conexion", "sin-respuesta" o "formato".
export class ErrorDatos extends Error {
  constructor(motivo, mensaje) {
    super(mensaje);
    this.motivo = motivo;
  }
}

// Comprueba que la respuesta tenga la forma acordada
function esValida(respuesta) {
  return Boolean(respuesta) && typeof respuesta === "object" && Array.isArray(respuesta.datos);
}

// Pide un recurso a la app web. No guarda nada.
async function pedirALaRed(recurso) {
  if (!navigator.onLine) throw new ErrorDatos("sin-conexion", "No hay conexión a internet");

  // NUEVO: AbortController
  // fetch no tiene límite de tiempo propio. Con un AbortController se le
  // puede decir "cancela este pedido" pasado cierto tiempo.
  const control = new AbortController();
  const reloj = setTimeout(() => control.abort(), ESPERA * 1000);

  try {
    const direccion = `${URL_API}?recurso=${encodeURIComponent(recurso)}`;
    // Pedido simple, sin encabezados propios: así el navegador no hace una
    // consulta previa (CORS) que la app web de Apps Script no sabe responder.
    const respuesta = await fetch(direccion, { signal: control.signal, redirect: "follow" });
    if (!respuesta.ok) throw new ErrorDatos("sin-respuesta", `La app web respondió ${respuesta.status}`);

    let contenido;
    try {
      contenido = await respuesta.json();
    } catch (error) {
      throw new ErrorDatos("formato", "La app web no respondió en JSON");
    }
    if (!esValida(contenido)) throw new ErrorDatos("formato", "La respuesta no tiene el formato esperado");
    return contenido;
  } catch (error) {
    if (error instanceof ErrorDatos) throw error;
    // Pedido cancelado por tiempo, o error de red
    throw new ErrorDatos("sin-respuesta", "La app web no respondió");
  } finally {
    clearTimeout(reloj);
  }
}

// Pide un recurso ("tasas", "fsd").
// Devuelve la respuesta de la app web con dos campos más:
//   deCopia: true si es la última copia guardada en este navegador
//   motivo:  por qué se usó la copia (solo si deCopia es true)
// Si no hay ni red ni copia, lanza un ErrorDatos.
export async function pedir(recurso) {
  if (!URL_API) throw new ErrorDatos("sin-configurar", "Falta la dirección de la app web en config.js");

  try {
    const respuesta = await pedirALaRed(recurso);
    // Solo se guarda como copia una respuesta con datos: una respuesta
    // vacía o con error no debe pisar la última copia buena.
    if (respuesta.estado !== "error" && respuesta.datos.length) {
      memoria.guardar("datos", recurso, respuesta);
    }
    return { ...respuesta, deCopia: false };
  } catch (error) {
    const copia = memoria.leer("datos", recurso, null);
    if (esValida(copia)) return { ...copia, deCopia: true, motivo: error.motivo || "sin-respuesta" };
    throw error;
  }
}

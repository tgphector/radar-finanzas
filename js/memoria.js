// ============================================================
// memoria.js · Lo personal vive solo en el navegador del usuario
//
// NUEVO: localStorage
// Es un pequeño almacén que cada navegador guarda por sitio web.
// Solo acepta texto, por eso convertimos los datos con JSON.
// Lo que se guarda aquí no sale del dispositivo: no llega a
// GitHub, a Sheets ni a otros usuarios.
//
// Los módulos NUNCA usan localStorage directo: solo llaman a
// memoria.leer() y memoria.guardar(). Así, si algún día se
// sincroniza entre dispositivos, solo cambia este archivo.
// ============================================================

// Arma la clave con el formato de la arquitectura: radar.<modulo>.<dato>
function clave(modulo, dato) {
  return `radar.${modulo}.${dato}`;
}

export const memoria = {

  // Lee un dato. Si no existe, o el navegador bloquea el almacén
  // (modo privado, ajustes estrictos), devuelve el valor por defecto.
  leer(modulo, dato, porDefecto = null) {
    try {
      const texto = localStorage.getItem(clave(modulo, dato));
      return texto === null ? porDefecto : JSON.parse(texto);
    } catch (error) {
      return porDefecto;
    }
  },

  // Guarda un dato. Devuelve true si se guardó y false si no se pudo,
  // para que el módulo pueda avisar "no puedo recordar este cambio".
  guardar(modulo, dato, valor) {
    try {
      localStorage.setItem(clave(modulo, dato), JSON.stringify(valor));
      return true;
    } catch (error) {
      return false;
    }
  },

  // Borra un dato (vuelve al valor por defecto la próxima vez).
  borrar(modulo, dato) {
    try {
      localStorage.removeItem(clave(modulo, dato));
      return true;
    } catch (error) {
      return false;
    }
  },

  // Prueba si el navegador deja guardar. Sirve para mostrar un aviso
  // una sola vez en lugar de fallar en silencio.
  disponible() {
    try {
      localStorage.setItem("radar.prueba", "1");
      localStorage.removeItem("radar.prueba");
      return true;
    } catch (error) {
      return false;
    }
  }
};

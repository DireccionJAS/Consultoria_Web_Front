// Reglas compartidas para no permitir agendar/reagendar citas en el pasado
// (CAS, CON, Simulación, Atención, Asesoría). El backend aplica la misma
// regla en FechaCitaUtil.java; esto solo evita que el usuario llegue a
// guardar y reciba el error.

const pad = (n) => String(n).padStart(2, '0');

// "yyyy-MM-dd" de hoy en hora LOCAL. No usar toISOString(): es UTC y en
// México adelanta el día después de las 6 pm.
export function hoyISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// true si la fecha ya pasó, o si es hoy y la hora (opcional, "H:mm" o
// "HH:mm") ya pasó. Sin hora, hoy se considera válido.
export function fechaCitaYaPaso(fecha, hora) {
  if (!fecha) return false;
  const hoy = hoyISO();
  if (fecha < hoy) return true;
  if (fecha > hoy || !hora) return false;
  const [h, m] = String(hora).split(':').map(Number);
  if (Number.isNaN(h)) return false;
  const ahora = new Date();
  return h * 60 + (m || 0) < ahora.getHours() * 60 + ahora.getMinutes();
}

export const MENSAJE_FECHA_PASADA = 'No puedes agendar una cita en una fecha u hora que ya pasó. Elige una fecha a partir de hoy.';

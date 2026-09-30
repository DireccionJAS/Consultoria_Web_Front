// Única fuente de verdad para el estado de un trámite (TransactProgress.status).
// Antes cada pantalla (Cliente/MisTramites, Cliente/ClienteHome, Cliente/Pagos,
// Admin/AdminTramites, Empresa/EmpresaTramites, tramites/ActualizarTramiteModal...)
// tenía su propia copia de la lista de estados, y ya estaban desincronizadas
// entre sí (unas llegaban a 7, otras a 8, con nombres distintos para el mismo
// código) — de ahí el riesgo de que el estado se viera mal para un cliente real.
// Todo el que necesite mostrar o elegir un estado debe importar de aquí.

// Tono de cada estado — paleta pedida por el usuario:
// azul = en proceso · naranja = acción requerida/pago pendiente ·
// amarillo = pendiente/esperando · verde = completado/aprobado/confirmado ·
// rojo = rechazado/problema · gris = no iniciado/sin actividad (disponible,
// ningún estado del flujo de 9 pasos lo usa hoy).
export const TRAMITE_STATUSES = [
  { code: 1, label: 'En espera de formatos internos', tone: 'amarillo' },
  { code: 2, label: 'Emitiendo formulario de DS-160', tone: 'azul' },
  { code: 3, label: 'En espera de pago de arancel', tone: 'naranja' },
  { code: 4, label: 'En busca de cita', tone: 'azul' },
  { code: 5, label: 'Citas confirmadas', tone: 'verde' },
  { code: 6, label: 'En espera de liquidación de honorarios', tone: 'naranja' },
  { code: 7, label: 'En espera de simulación con asesor', tone: 'amarillo' },
  { code: 8, label: 'Visa aprobada', tone: 'verde' },
  { code: 9, label: 'Visa rechazada', tone: 'rojo' },
];

export const TRAMITE_STATUS_LABELS = Object.fromEntries(
  TRAMITE_STATUSES.map((s) => [s.code, s.label])
);

export const TRAMITE_STATUS_TONES = Object.fromEntries(
  TRAMITE_STATUSES.map((s) => [s.code, s.tone])
);

// Estados finales (ya no requieren seguimiento) vs. los que siguen activos.
export const TRAMITE_STATUS_CERRADO = new Set([8, 9]);
export const TRAMITE_STATUS_ACTIVO = new Set([1, 2, 3, 4, 5, 6, 7]);

// Estado con el que arranca un trámite nuevo (p.ej. justo después de pagar).
export const TRAMITE_STATUS_INICIAL = 1;

export function esTramiteCerrado(status) {
  return TRAMITE_STATUS_CERRADO.has(status);
}

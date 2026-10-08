import Swal from 'sweetalert2';
import logoJas from './../assets/empresas/logo-jas.png';
import logoCmg from './../assets/empresas/logo-cmg.png';

// Utilidades de Formularios (Admin > Formularios y portal del cliente).

const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export const EMPRESA_UI = {
  JAS: { corto: 'C.JAS', logo: logoJas },
  CMG: { corto: 'COR.M', logo: logoCmg },
};

export function formatoMoneda(n) {
  return `$${Number(n || 0).toLocaleString('es-MX', { maximumFractionDigits: 2 })}`;
}

export function formatFechaCorta(fecha) {
  if (!fecha) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(fecha);
  if (!m) return null;
  return `${m[3]} ${MESES_CORTOS[Number(m[2]) - 1]} ${m[1]}`;
}

// Resumen del formulario de un trámite (solo cuentan las personas enviadas).
export function estadoFormulario(t) {
  const enviadas = (t.personas || []).filter((p) => p.enviadoAt);
  const llenadas = enviadas.filter((p) => p.filled).length;
  if (enviadas.length === 0) return { tipo: 'sin', enviadas, llenadas };
  return {
    tipo: llenadas === enviadas.length ? 'llenado' : 'enviado',
    enviadas,
    llenadas,
    formato: enviadas[0].formato,
    fecha: enviadas.map((p) => p.enviadoAt).sort().pop(),
  };
}

// Abre un PDF que viene como Blob (lleva el token, no sirve un <a href>).
// La ventana se abre antes del await para que el navegador no la bloquee.
export async function abrirPdf(obtenerBlob) {
  const ventana = window.open('', '_blank');
  try {
    const blob = await obtenerBlob();
    const url = URL.createObjectURL(blob);
    if (ventana) ventana.location.href = url;
    else window.location.href = url;
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch (error) {
    if (ventana) ventana.close();
    console.error('Error al abrir el PDF:', error);
    Swal.fire({ icon: 'error', title: 'No se pudo abrir el PDF', text: 'Intenta de nuevo en un momento.' });
  }
}

// Solo enlaces web absolutos. No convierte entradas en código ni permite
// javascript:, data:, file:, rutas relativas o credenciales ocultas en la URL.
export function safeWebUrl(value) {
  if (typeof value !== 'string') return '';
  const link = value.trim();
  if (!/^https?:\/\//i.test(link) || /[\u0000-\u001f\u007f\\]/.test(link) || link.length > 1000) return '';
  try {
    const url = new URL(link);
    if (!url.hostname || url.username || url.password) return '';
    return link;
  } catch {
    return '';
  }
}

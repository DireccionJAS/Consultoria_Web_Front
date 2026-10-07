// Redes sociales editables desde Empresa > Página pública > Contacto y que
// muestra la landing (ContactSection + FooterSection). `tipo` solo decide
// ícono y color; `nombre` es lo que se ve (p. ej. "TikTok secundario").

/* eslint-disable react-refresh/only-export-components */

function IconFacebook({ size }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>; }
function IconInstagram({ size }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg>; }
function IconTiktok({ size }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M19 9a5 5 0 0 1-3-1v6.5a5.5 5.5 0 1 1-5.5-5.5V13a2.5 2.5 0 1 0 2.5 2.5V3h2.5a3 3 0 0 0 3.5 3z" /></svg>; }
function IconYoutube({ size }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M23 7.5a3 3 0 0 0-2.1-2.1C19 5 12 5 12 5s-7 0-8.9.4A3 3 0 0 0 1 7.5 31 31 0 0 0 .6 12a31 31 0 0 0 .4 4.5 3 3 0 0 0 2.1 2.1C5 19 12 19 12 19s7 0 8.9-.4a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .4-4.5 31 31 0 0 0-.4-4.5zM9.8 15V9l5.2 3z" /></svg>; }
function IconX({ size }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.3L5.3 21H2.2l7.3-8.3L1.9 3h6.4l4.4 5.8zm-1.1 16.2h1.7L7.4 4.7H5.6z" /></svg>; }
function IconThreads({ size }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M8 12c0-3 1.5-5 4-5s4 1.5 4 4-2 4-4 4-3-1-3-2 1-2 3-2 4 1 4 3" /></svg>; }
function IconLinkedin({ size }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-4v-5.1c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V21h-4z" /></svg>; }
function IconLink({ size }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.5 1.5" /><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.5-1.5" /></svg>; }

// clase: clave de color en los CSS de la landing (fb/ig/tk ya existían).
export const TIPOS_RED = {
  facebook: { label: 'Facebook', clase: 'fb', fondo: '#1877F2', Icon: IconFacebook },
  instagram: { label: 'Instagram', clase: 'ig', fondo: 'linear-gradient(135deg,#F58529,#DD2A7B,#8134AF)', Icon: IconInstagram },
  tiktok: { label: 'TikTok', clase: 'tk', fondo: '#000', Icon: IconTiktok },
  youtube: { label: 'YouTube', clase: 'yt', fondo: '#FF0000', Icon: IconYoutube },
  x: { label: 'X (Twitter)', clase: 'xx', fondo: '#000', Icon: IconX },
  threads: { label: 'Threads', clase: 'th', fondo: '#101010', Icon: IconThreads },
  linkedin: { label: 'LinkedIn', clase: 'li', fondo: '#0A66C2', Icon: IconLinkedin },
  otra: { label: 'Otra', clase: 'ot', fondo: '#5B6B7F', Icon: IconLink },
};

export function tipoRed(tipo) {
  return TIPOS_RED[tipo] || TIPOS_RED.otra;
}

export function IconoRed({ tipo, size = 18 }) {
  const { Icon } = tipoRed(tipo);
  return <Icon size={size} />;
}

// Lo que había fijo en la landing antes de que la lista fuera editable.
const LINKS_ORIGINALES = {
  facebook: { url: 'https://www.facebook.com/share/1C2Aw6H7vq/', usuario: '@ConsultoriaJAS' },
  instagram: { url: 'https://www.instagram.com/somosconsultoriajas', usuario: '@somosconsultoriajas' },
  tiktok: { url: 'https://www.tiktok.com/@consultoriajas', usuario: '@consultoriajas' },
};

// config.redesSociales === null/undefined → la lista nunca se ha guardado:
// se arma con las 3 redes de siempre y los seguidores fb/ig/tt guardados.
export function redesDesdeConfig(config, seguidoresFallback = {}) {
  if (Array.isArray(config?.redesSociales)) return config.redesSociales;
  return [
    { tipo: 'facebook', nombre: 'Facebook', ...LINKS_ORIGINALES.facebook, seguidores: config?.fbSeguidores || seguidoresFallback.fb || '' },
    { tipo: 'instagram', nombre: 'Instagram', ...LINKS_ORIGINALES.instagram, seguidores: config?.igSeguidores || seguidoresFallback.ig || '' },
    { tipo: 'tiktok', nombre: 'TikTok', ...LINKS_ORIGINALES.tiktok, seguidores: config?.ttSeguidores || seguidoresFallback.tt || '' },
  ];
}

// Solo las que tienen link se muestran en la landing.
export function redesVisibles(redes) {
  return (redes || []).filter((r) => r && typeof r.url === 'string' && r.url.trim() !== '');
}

// Acepta "tiktok.com/@x" sin protocolo.
export function urlRed(url) {
  const u = (url || '').trim();
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
}

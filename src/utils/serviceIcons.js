// Compartido entre ModalServicio.jsx (combobox de ícono al crear/editar) y
// ServiciosPage.jsx (catálogo público, deriva la categoría de cada servicio
// del ícono elegido ya que Transact no tiene un campo real de categoría).

export const ICONOS = [
  { id: 'visa', label: 'Visa', svg: '<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>' },
  { id: 'pasaporte', label: 'Pasaporte', svg: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>' },
  { id: 'formulario', label: 'Formulario', svg: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>' },
  { id: 'entrevista', label: 'Entrevista', svg: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>' },
  { id: 'citas', label: 'Citas', svg: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>' },
  { id: 'asesoria', label: 'Asesoría', svg: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"/><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"/><line x1="14.83" y1="9.17" x2="19.07" y2="4.93"/><line x1="4.93" y1="19.07" x2="9.17" y2="14.83"/>' },
];

export function iconSvgMarkup(svgInner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1B2A4A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${svgInner}</svg>`;
}

export function iconDataUri(svgInner) {
  return `data:image/svg+xml,${encodeURIComponent(iconSvgMarkup(svgInner))}`;
}

export function getServiceIcon(service) {
  if (!service?.imageDetail) return null;
  return ICONOS.find((ic) => service.imageDetail === iconDataUri(ic.svg)) || null;
}

// Agrupa el ícono real (6 tipos) en las 5 categorías que muestra el
// catálogo público — "entrevista" se agrupa dentro de "asesoria".
export function getServiceCategory(service) {
  const icon = getServiceIcon(service);
  if (!icon) return null;
  return icon.id === 'entrevista' ? 'asesoria' : icon.id;
}

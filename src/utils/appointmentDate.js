const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export function formatAppointmentDate(value) {
  // new Date(null) is the Unix epoch, not an appointment. In Mexico it
  // displays as December 31, 1969. Only accept an actual nonempty date string.
  if (typeof value !== 'string' || !value.trim()) return null;
  const raw = value.trim();
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(raw) ? `${raw}T00:00:00` : raw.replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return null;
  return {
    fecha: `${date.getDate()} ${MESES[date.getMonth()]}`,
    hora: `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`,
  };
}

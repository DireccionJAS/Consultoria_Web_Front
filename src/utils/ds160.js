const DS160_FORM_BASE = 'https://docs.google.com/forms/d/e/1FAIpQLSfCFS74bA1AYQED6G1DEHKmkB-XL3SwB4G3rKPGzwq4u5ZCXw/viewform';
const DS160_NAME_ENTRY = 'entry.1497830267';

export function buildDs160Link(name) {
  if (!name || !name.trim()) return '';
  const params = new URLSearchParams({ [DS160_NAME_ENTRY]: name.trim() });
  return `${DS160_FORM_BASE}?${params.toString()}`;
}

export async function revokeAndClearSession(storage, revoke) {
  const token = storage.getItem('token');
  if (token) {
    try { await revoke(token); }
    catch (error) { if (error?.response?.status !== 401) throw error; }
  }
  if (storage.getItem('token') !== token) return false;
  storage.removeItem('token');
  return true;
}

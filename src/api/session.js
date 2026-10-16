import apiClient from './apiClient';
import Swal from 'sweetalert2';
import { revokeAndClearSession } from './sessionLifecycle.js';

export async function logoutAndNavigate(navigate) {
  try {
    const closed = await revokeAndClearSession(localStorage, token =>
      apiClient.post('/auth/logout', {}, { headers: { Authorization: `Bearer ${token}` } }));
    if (closed) navigate('/Login');
  } catch {
    await Swal.fire({ icon: 'error', title: 'No se pudo cerrar la sesión',
      text: 'No pudimos confirmar el cierre en el servidor. Revisa tu conexión e intenta de nuevo.' });
  }
}

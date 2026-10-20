export const accountRole = (account) => typeof account?.role === 'string'
  ? account.role : account?.role?.name;

export const clientsOnly = (accounts) => accounts.filter(account => accountRole(account) === 'USER');

export function accountConfirmation(account, action, value) {
  const role = accountRole(account);
  if (!account?.idUser || !account.email || !['USER', 'ADMIN'].includes(role)) {
    throw new Error('Esta cuenta no se puede gestionar desde el listado de clientes o administradores.');
  }
  const verb = action === 'archive' ? (value ? 'Archivar' : 'Desarchivar') : (value ? 'Activar' : 'Suspender');
  const effect = action === 'archive' && role === 'USER'
    ? 'Solo cambia su organización en la lista; no modifica su acceso.'
    : action === 'archive' && value
      ? 'Perderá el acceso y sus clientes quedarán sin encargado. Desarchivar no restaura las asignaciones.'
      : action === 'status' && !value
        ? 'La cuenta perderá el acceso al sistema.'
        : 'Se conservarán los demás datos y estados de la cuenta.';
  return {
    icon: 'warning', title: `¿${verb} esta cuenta?`,
    text: `${account.email} · Rol: ${role} · ID: ${account.idUser}. ${effect}`,
    showCancelButton: true, confirmButtonText: verb, cancelButtonText: 'Cancelar',
    focusCancel: true,
  };
}

export function requireAccountActionSuccess(data) {
  if (data?.success !== true) throw new Error(data?.message || 'No se pudo modificar la cuenta.');
  return data;
}

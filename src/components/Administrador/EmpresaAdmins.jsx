import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import EmpresaSidebar from './EmpresaSidebar.jsx';
import { listarEncargados, actualizarStatusCliente, archivarCliente, clientes as clientesAPI } from './../../api/api.js';
import ModalAdmin from './ModalAdmin.jsx';
import modalStyles from './../../styles/ClienteModal.module.css';
import styles from './../../styles/EmpresaAdmins.module.css';

// Extraído 1:1 de "16-Admins (standalone).html". El botón "Ver clientes"
// abre un modal con reasignar/quitar/agregar cliente, pero no existe
// ninguna relación cliente↔admin en el backend (User no tiene ese campo):
// el modal muestra todos los clientes reales del sistema (no se puede
// filtrar por admin) y reasignar/quitar/agregar son solo visuales, sin
// persistir nada — igual que "Cita externa" en el Calendario.
// El botón "Eliminar" del mockup no tiene endpoint DELETE real; por debajo
// usa "archivar" (PUT /users/{id}/archive), el mismo mecanismo de
// soft-delete que ya usa EmpresaClientes.jsx, pero el texto de la UI
// dice "Eliminar" tal como en el mockup (decisión del usuario).

const ITEMS_POR_PAGINA = 7;

const GRADIENTES = [
  ['#6FAEDB', '#4E6A9C'],
  ['#7ec286', '#2c7a3f'],
  ['#fbd28b', '#e89e3b'],
  ['#c9ccd1', '#9499a1'],
  ['#b89dc8', '#6b3e8c'],
  ['#f5b8d8', '#e879a8'],
];

function getIniciales(name) {
  if (!name) return '?';
  const partes = name.trim().split(/\s+/);
  const primera = partes[0]?.[0] ?? '';
  const segunda = partes[1]?.[0] ?? '';
  return (primera + segunda).toUpperCase();
}

function getGradiente(idUser) {
  const idx = Math.abs(idUser ?? 0) % GRADIENTES.length;
  const [from, to] = GRADIENTES[idx];
  return `linear-gradient(135deg, ${from}, ${to})`;
}

function IconPlus() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"></path></svg>;
}
function IconSearch() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--muted)' }}><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.35-4.35"></path></svg>;
}
function IconEdit() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"></path></svg>;
}
function IconArchive({ size = 15 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="4" rx="1"></rect><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8M10 12h4"></path></svg>;
}
function IconTrash({ size = 15 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
}
function IconChevronLeft() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"></path></svg>;
}
function IconChevronRight() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"></path></svg>;
}
function IconUsersGroup({ size = 22 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="8" r="4"></circle><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2M17 11l2 2 4-4"></path></svg>;
}
function IconClose() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 6l12 12M6 18L18 6"></path></svg>;
}
function IconUnassign() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="17" y1="8" x2="22" y2="13"></line><line x1="22" y1="8" x2="17" y2="13"></line></svg>;
}

export default function EmpresaAdmins() {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [miId, setMiId] = useState(null);

  const [modalAdminAbierto, setModalAdminAbierto] = useState(false);
  const [adminEditando, setAdminEditando] = useState(null);
  const [adminArchivando, setAdminArchivando] = useState(null);

  const [modalClientesAbierto, setModalClientesAbierto] = useState(false);
  const [adminClientesSel, setAdminClientesSel] = useState(null);
  const [todosClientes, setTodosClientes] = useState([]);
  const [clientesVisiblesIds, setClientesVisiblesIds] = useState([]);
  const [addMenuAbierto, setAddMenuAbierto] = useState(false);
  const [busquedaCli, setBusquedaCli] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/'); return; }
    try {
      const decoded = jwtDecode(token);
      if (decoded.role !== 'EMPRESA') { navigate('/'); return; }
      setMiId(decoded.idUser ?? null);
      fetchAdmins();
    } catch (error) {
      console.error('Token inválido', error);
      localStorage.removeItem('token');
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => { setPaginaActual(1); }, [busqueda]);

  const handleNavigate = (key) => { console.log('Navegar a sección de sidebar:', key); };

  const fetchAdmins = async () => {
    try {
      setCargando(true);
      const response = await listarEncargados();
      const lista = response.success && Array.isArray(response.response.users) ? response.response.users : [];
      setAdmins(lista);
    } catch (error) {
      console.error('Error al obtener admins:', error);
      setAdmins([]);
    } finally {
      setCargando(false);
    }
  };

  const handleToggleStatus = async (admin) => {
    try {
      await actualizarStatusCliente(admin.idUser, !admin.status);
      fetchAdmins();
    } catch (error) {
      console.error('Error al actualizar el estado del admin', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo actualizar el estado.' });
    }
  };

  const handleConfirmarArchivar = async () => {
    if (!adminArchivando) return;
    try {
      await archivarCliente(adminArchivando.idUser, true);
      setAdminArchivando(null);
      fetchAdmins();
      Swal.fire({
        toast: true, position: 'top-end', icon: 'success', title: 'Administrador eliminado',
        showConfirmButton: false, timer: 2500, timerProgressBar: true,
      });
    } catch (error) {
      console.error('Error al eliminar el admin', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar el administrador.' });
    }
  };

  const activos = useMemo(() => admins.filter((a) => !a.archived && a.status).length, [admins]);
  const archivados = useMemo(() => admins.filter((a) => a.archived).length, [admins]);
  const noArchivados = useMemo(() => admins.filter((a) => !a.archived), [admins]);

  const abrirVerClientes = async (admin) => {
    setAdminClientesSel(admin);
    setBusquedaCli('');
    setAddMenuAbierto(false);
    setModalClientesAbierto(true);
    try {
      const response = await clientesAPI();
      const lista = response.success && Array.isArray(response.response.users) ? response.response.users : [];
      setTodosClientes(lista);
      setClientesVisiblesIds(lista.map((c) => c.idUser));
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      setTodosClientes([]);
      setClientesVisiblesIds([]);
    }
  };

  const handleQuitarCliente = (idUser) => {
    setClientesVisiblesIds((prev) => prev.filter((id) => id !== idUser));
  };

  const handleAgregarCliente = (idUser) => {
    setClientesVisiblesIds((prev) => (prev.includes(idUser) ? prev : [...prev, idUser]));
    setAddMenuAbierto(false);
  };

  const clientesVisibles = useMemo(() =>
    todosClientes.filter((c) => clientesVisiblesIds.includes(c.idUser) &&
      ((c.name ?? '').toLowerCase().includes(busquedaCli.toLowerCase()) || (c.email ?? '').toLowerCase().includes(busquedaCli.toLowerCase()))
    ), [todosClientes, clientesVisiblesIds, busquedaCli]);

  const clientesSinAsignar = useMemo(() =>
    todosClientes.filter((c) => !clientesVisiblesIds.includes(c.idUser)),
    [todosClientes, clientesVisiblesIds]);

  const otrosAdmins = useMemo(() =>
    noArchivados.filter((a) => a.idUser !== adminClientesSel?.idUser),
    [noArchivados, adminClientesSel]);

  const filtrados = useMemo(() => noArchivados.filter((a) =>
    (a.name ?? '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (a.email ?? '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (a.phone ?? '').includes(busqueda)
  ), [noArchivados, busqueda]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / ITEMS_POR_PAGINA));
  const paginados = filtrados.slice((paginaActual - 1) * ITEMS_POR_PAGINA, paginaActual * ITEMS_POR_PAGINA);
  const cambiarPagina = (n) => { if (n >= 1 && n <= totalPaginas) setPaginaActual(n); };

  return (
    <div className={styles.page}>
      <EmpresaSidebar active="admins" onNavigate={handleNavigate} />

      <main className={styles.main}>
        <header className={styles.topbar}>
          <div>
            <div className={styles.crumb}><span>Gestión</span> <span className={styles.crumbSep}>/</span> <span className={styles.accent}>Administradores</span></div>
            <div className={styles.pageTitle}>Administradores</div>
          </div>
          <div className={styles.topActions}>
            <button className={styles.btnAccent} onClick={() => { setAdminEditando(null); setModalAdminAbierto(true); }}>
              <IconPlus /> Agregar admin
            </button>
          </div>
        </header>

        <div className={styles.content}>
          <div className={styles.statsStrip}>
            <div className={styles.statMini}><div className={styles.lbl}>Administradores</div><div className={styles.val}>{noArchivados.length}</div></div>
            <div className={styles.statMini}><div className={styles.lbl}>Activos</div><div className={styles.val} style={{ color: 'var(--green)' }}>{activos}</div></div>
            <div className={styles.statMini}><div className={styles.lbl}>Archivados</div><div className={styles.val} style={{ color: 'var(--gray)' }}>{archivados}</div></div>
          </div>

          <div className={styles.tableCard}>
            <div className={styles.tableHeadRow}>
              <div>
                <div className={styles.tblTitle}>Equipo administrativo</div>
                <div className={styles.tblSub}>Gestiona quién puede acceder al panel</div>
              </div>
              <div className={styles.searchBar}>
                <IconSearch />
                <input type="text" placeholder="Buscar admin..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
              </div>
            </div>

            {cargando ? (
              <div className={styles.loadingWrap}>
                <div className={styles.spinner}></div>
                <p>Cargando administradores...</p>
              </div>
            ) : paginados.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}><IconArchive size={32} /></div>
                <div className={styles.emptyTitle}>No se encontraron administradores</div>
                <div className={styles.emptySub}>Intenta con otro nombre, correo o teléfono.</div>
              </div>
            ) : (
              <div className={styles.tableScroll}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th style={{ width: 40 }}>#</th>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Teléfono</th>
                      <th>Estado</th>
                      <th style={{ width: 100, textAlign: 'right' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginados.map((admin, index) => {
                      const numero = (paginaActual - 1) * ITEMS_POR_PAGINA + index + 1;
                      const esYo = miId != null && String(admin.idUser) === String(miId);
                      return (
                        <tr key={admin.idUser ?? index}>
                          <td><span className={styles.rowNum}>{String(numero).padStart(2, '0')}</span></td>
                          <td>
                            <div className={styles.admCell}>
                              <div className={styles.admAvatar} style={{ background: getGradiente(admin.idUser) }}>{getIniciales(admin.name)}</div>
                              <div>
                                <div className={styles.admName}>{admin.name} {esYo && <span className={styles.youBadge}>TÚ</span>}</div>
                                <div className={styles.admMeta}>Admin</div>
                              </div>
                            </div>
                          </td>
                          <td><span className={styles.cellMuted}>{admin.email}</span></td>
                          <td><span className={styles.cellMono}>{admin.phone}</span></td>
                          <td>
                            <div className={styles.tgWrap}>
                              <span className={`${styles.tg} ${admin.status ? styles.on : ''}`} onClick={() => handleToggleStatus(admin)}></span>
                              <span className={`${styles.tgLabel} ${admin.status ? styles.on : styles.off}`}>{admin.status ? 'Activo' : 'Inactivo'}</span>
                            </div>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div className={styles.rowActions}>
                              <button title="Ver clientes" onClick={() => abrirVerClientes(admin)}><IconUsersGroup size={15} /></button>
                              <button title="Editar" onClick={() => { setAdminEditando(admin); setModalAdminAbierto(true); }}><IconEdit /></button>
                              <button className={styles.del} title="Eliminar" onClick={() => setAdminArchivando(admin)}><IconTrash /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {!cargando && filtrados.length > 0 && (
            <div className={styles.pagination}>
              <div className={styles.pgInfo}>
                Mostrando <strong>{(paginaActual - 1) * ITEMS_POR_PAGINA + 1}–{Math.min(paginaActual * ITEMS_POR_PAGINA, filtrados.length)}</strong> de <strong>{filtrados.length}</strong> administradores
              </div>
              <div className={styles.pgControls}>
                <button className={styles.pgBtn} onClick={() => cambiarPagina(paginaActual - 1)} disabled={paginaActual === 1}><IconChevronLeft /></button>
                {Array.from({ length: totalPaginas }).map((_, i) => (
                  <button key={i} className={`${styles.pgBtn} ${paginaActual === i + 1 ? styles.active : ''}`} onClick={() => cambiarPagina(i + 1)}>{i + 1}</button>
                ))}
                <button className={styles.pgBtn} onClick={() => cambiarPagina(paginaActual + 1)} disabled={paginaActual === totalPaginas}><IconChevronRight /></button>
              </div>
            </div>
          )}
        </div>
      </main>

      <ModalAdmin
        show={modalAdminAbierto}
        onHide={() => setModalAdminAbierto(false)}
        admin={adminEditando}
        onGuardado={fetchAdmins}
      />

      {/* Modal confirmar eliminar - extraído 1:1 de "16-Admins (standalone).html".
          Por debajo sigue usando archivar (soft-delete reversible) porque no
          existe endpoint DELETE real en el backend. */}
      {adminArchivando && (
        <div className={modalStyles.scrim} onMouseDown={(e) => { if (e.target === e.currentTarget) setAdminArchivando(null); }}>
          <div className={modalStyles.modal} style={{ maxWidth: 400 }}>
            <div className={modalStyles.modalBody} style={{ padding: '32px 24px 20px', textAlign: 'center' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--rose-soft)', color: 'var(--rose)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <IconTrash size={28} />
              </div>
              <div style={{ fontFamily: 'var(--display)', fontWeight: 600, fontSize: 20, letterSpacing: '-0.02em', marginBottom: 8 }}>¿Eliminar administrador?</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>
                Sus clientes asignados quedarán <strong>sin asignar</strong> y deberás reasignarlos. Esta acción no se puede deshacer.
              </div>
            </div>
            <div className={modalStyles.modalFoot}>
              <button className={`${modalStyles.btn} ${modalStyles.btnGhost}`} onClick={() => setAdminArchivando(null)}>Cancelar</button>
              <button className={`${modalStyles.btn} ${modalStyles.btnDanger}`} onClick={handleConfirmarArchivar}>Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal "Ver clientes" - extraído 1:1 del mockup. Sin backend real de
          asignación: muestra todos los clientes del sistema; reasignar/
          quitar/agregar son solo visuales, no persisten nada. */}
      {modalClientesAbierto && adminClientesSel && (
        <div className={modalStyles.scrim} onMouseDown={(e) => { if (e.target === e.currentTarget) setModalClientesAbierto(false); }}>
          <div className={modalStyles.modal} style={{ maxWidth: 760 }}>
            <div className={modalStyles.modalHead}>
              <div className={modalStyles.modalHeadRow}>
                <div className={modalStyles.modalHeadIcon}><IconUsersGroup /></div>
                <div>
                  <div className={modalStyles.modalEyebrow}>Clientes asignados a</div>
                  <div className={modalStyles.modalTitle}>{adminClientesSel.name}</div>
                </div>
              </div>
              <button className={modalStyles.modalClose} onClick={() => setModalClientesAbierto(false)}><IconClose /></button>
            </div>

            <div className={modalStyles.modalBody}>
              <div className={styles.cliSearchRow}>
                <div className={styles.cliSearch}>
                  <IconSearch />
                  <input type="text" placeholder="Buscar cliente asignado..." value={busquedaCli} onChange={(e) => setBusquedaCli(e.target.value)} />
                </div>
                <div className={styles.addCli}>
                  <button className={styles.btnAccent} onClick={() => setAddMenuAbierto((v) => !v)}><IconPlus /> Agregar cliente</button>
                  {addMenuAbierto && (
                    <div className={styles.addCliMenu}>
                      <div className={styles.addCliTitle}>Clientes sin asignar · {clientesSinAsignar.length}</div>
                      {clientesSinAsignar.length === 0 ? (
                        <div style={{ padding: '10px', fontSize: 12, color: 'var(--muted)' }}>No hay clientes sin asignar.</div>
                      ) : clientesSinAsignar.map((c) => (
                        <div key={c.idUser} className={styles.addCliOpt} onClick={() => handleAgregarCliente(c.idUser)}>
                          <div className={styles.miniAv} style={{ background: getGradiente(c.idUser) }}>{getIniciales(c.name)}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12.5, fontWeight: 600 }}>{c.name}</div>
                            <div style={{ fontSize: 10.5, color: 'var(--muted)' }}>{c.email}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {clientesVisibles.length === 0 ? (
                <div className={styles.emptyCli}>
                  <div className={styles.emptyCliIcon}><IconUsersGroup size={30} /></div>
                  <div className={styles.emptyCliTitle}>Este admin no tiene clientes asignados</div>
                  <div className={styles.emptyCliSub}>Usa "Agregar cliente" para asignarle clientes sin administrador.</div>
                </div>
              ) : (
                <table className={styles.cliTable}>
                  <thead>
                    <tr>
                      <th style={{ width: 36 }}>#</th>
                      <th>Cliente</th>
                      <th>Email</th>
                      <th style={{ width: 170 }}>Reasignar</th>
                      <th style={{ width: 60 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientesVisibles.map((c, i) => (
                      <tr key={c.idUser}>
                        <td><span className={styles.rowNum}>{String(i + 1).padStart(2, '0')}</span></td>
                        <td>
                          <div className={styles.admCell}>
                            <div className={styles.miniAv} style={{ background: getGradiente(c.idUser) }}>{getIniciales(c.name)}</div>
                            <div className={styles.admName} style={{ fontSize: 12.5 }}>{c.name}</div>
                          </div>
                        </td>
                        <td><span className={styles.cellMuted}>{c.email}</span></td>
                        <td>
                          <select className={styles.reassign} defaultValue="mantener">
                            <option value="mantener">Mantener · {adminClientesSel.name.split(' ')[0]}</option>
                            {otrosAdmins.map((a) => (
                              <option key={a.idUser} value={a.idUser}>Reasignar a {a.name.split(' ')[0]}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <button className={styles.unassignBtn} title="Quitar asignación" onClick={() => handleQuitarCliente(c.idUser)}><IconUnassign /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className={modalStyles.modalFoot}>
              <button className={`${modalStyles.btn} ${modalStyles.btnGhost}`} onClick={() => setModalClientesAbierto(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

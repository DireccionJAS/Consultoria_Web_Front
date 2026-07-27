import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import AdminSidebar from './AdminSidebar.jsx';
import { clientes, actualizarStatusCliente, archivarCliente } from './../../api/api.js';
import styles from './../../styles/AdminClientes.module.css';
import ClienteModal from '../Administrador/ClienteModal.jsx';

const ITEMS_POR_PAGINA = 7;

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

const GRADIENTES = [
  ['#6FAEDB', '#4E6A9C'],
  ['#e89a7c', '#c25a2e'],
  ['#7ec286', '#2c7a3f'],
  ['#b89dc8', '#6b3e8c'],
  ['#f5b8d8', '#e879a8'],
  ['#fbd28b', '#e89e3b'],
  ['#9db8cc', '#4e6a9c'],
];

function formatClienteDesde(createdAt) {
  if (!createdAt) return null;
  const [datePart] = createdAt.split(' ');
  const [year, month] = (datePart || '').split('-');
  const idx = parseInt(month, 10) - 1;
  if (!year || Number.isNaN(idx) || idx < 0 || idx > 11) return null;
  return `Cliente desde ${MESES[idx]} ${year}`;
}

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

function IconEdit() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"></path>
    </svg>
  );
}

function IconEye() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  );
}

function IconArchive({ size = 15, strokeWidth = 1.8 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
      <rect x="3" y="4" width="18" height="4" rx="1"></rect>
      <path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8M10 12h4"></path>
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="8" r="4"></circle>
      <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"></path>
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--muted)' }}>
      <circle cx="11" cy="11" r="8"></circle>
      <path d="M21 21l-4.35-4.35"></path>
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 5v14M5 12h14"></path>
    </svg>
  );
}

function IconBell() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M13.7 21a2 2 0 0 1-3.4 0"></path>
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M5 12l5 5L20 7"></path>
    </svg>
  );
}

function IconChevronLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 18l-6-6 6-6"></path>
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18l6-6-6-6"></path>
    </svg>
  );
}

function TramitesPill({ resumen, styles }) {
  if (!resumen || resumen.total === 0) {
    return <span className={`${styles.tramitesPill} ${styles.none}`}>Sin trámites</span>;
  }
  if (resumen.activos > 0) {
    return <span className={styles.tramitesPill}>{resumen.activos} activo{resumen.activos !== 1 ? 's' : ''}</span>;
  }
  return <span className={`${styles.tramitesPill} ${styles.done}`}>{resumen.terminados} terminado{resumen.terminados !== 1 ? 's' : ''}</span>;
}

export default function AdminClientes() {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [tabActiva, setTabActiva] = useState('activos');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/'); return; }
    try {
      const decoded = jwtDecode(token);
      if (decoded.role !== 'ADMIN') { navigate('/'); return; }
    } catch (error) {
      console.error('Token inválido', error);
      localStorage.removeItem('token');
      navigate('/');
      return;
    }
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, tabActiva]);

  const fetchServices = async () => {
    try {
      const response = await clientes();
      if (response.success && Array.isArray(response.response.users)) {
        setDatos(response.response.users);
      } else {
        console.error('Formato de respuesta inesperado:', response);
        setDatos([]);
      }
    } catch (error) {
      console.error('Error al obtener los clientes:', error);
      setDatos([]);
    } finally {
      setCargando(false);
    }
  };

  const handleSwitchChange = async (idUser, nuevoEstado) => {
    try {
      await actualizarStatusCliente(idUser, nuevoEstado);
      fetchServices();
    } catch (error) {
      console.error('Error al actualizar el estado del cliente', error);
    }
  };

  const handleArchivar = async (cliente) => {
    try {
      await archivarCliente(cliente.idUser, !cliente.archived);
      fetchServices();
    } catch (error) {
      console.error('Error al archivar el cliente', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el archivado del cliente.',
      });
    }
  };

  const totalClientes = datos.length;
  const totalActivos = datos.filter((d) => !d.archived).length;
  const totalArchivados = datos.filter((d) => d.archived).length;

  const porTab = datos.filter((d) => (tabActiva === 'archivados' ? d.archived : !d.archived));

  const filtrados = porTab.filter((d) =>
    (d.name ?? '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (d.email ?? '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (d.phone ?? '').includes(busqueda)
  );

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / ITEMS_POR_PAGINA));
  const datosPaginados = filtrados.slice(
    (paginaActual - 1) * ITEMS_POR_PAGINA,
    paginaActual * ITEMS_POR_PAGINA
  );

  const cambiarPagina = (numero) => {
    if (numero >= 1 && numero <= totalPaginas) {
      setPaginaActual(numero);
    }
  };

  const handleNavigate = (key) => {
    console.log('Navegar a sección de sidebar:', key);
  };

  return (
    <div className={styles.page}>
      <AdminSidebar active="clientes" clientesCount={totalActivos} onNavigate={handleNavigate} />

      <main className={styles.main}>
        <header className={styles.topbar}>
          <div>
            <div className={styles.crumb}><span>Principal</span> <span className={styles.crumbSep}>/</span> <span className={styles.accent}>Clientes</span></div>
            <div className={styles.pageTitle}>Gestión de clientes</div>
          </div>
          <div className={styles.topActions}>
            <button className={styles.iconBtn} aria-label="Notificaciones">
              <IconBell />
            </button>
            <button className={styles.btnAccent} onClick={() => { setClienteSeleccionado(null); setShowClienteModal(true); }}>
              <IconPlus /> Agregar cliente
            </button>
          </div>
        </header>

        <div className={styles.content}>
          <div className={styles.statsStrip}>
            <div className={styles.statMini}><div className={styles.lbl}>Total clientes</div><div className={styles.val}>{totalClientes}</div></div>
            <div className={styles.statMini}><div className={styles.lbl}>Activos</div><div className={styles.val} style={{ color: 'var(--green)' }}>{totalActivos}</div></div>
            <div className={styles.statMini}><div className={styles.lbl}>Archivados</div><div className={styles.val} style={{ color: 'var(--gray)' }}>{totalArchivados}</div></div>
          </div>

          <div className={styles.tabsRow}>
            <div className={styles.tabs}>
              <button className={`${styles.tab} ${tabActiva === 'activos' ? styles.active : ''}`} onClick={() => setTabActiva('activos')}>
                <IconUsers />
                Clientes activos <span className={styles.cnt}>{totalActivos}</span>
              </button>
              <button className={`${styles.tab} ${tabActiva === 'archivados' ? styles.active : ''}`} onClick={() => setTabActiva('archivados')}>
                <IconArchive size={14} strokeWidth={2} />
                Archivados <span className={styles.cnt}>{totalArchivados}</span>
              </button>
            </div>
            <div className={styles.searchBar}>
              <IconSearch />
              <input
                type="text"
                placeholder="Buscar por nombre, correo o teléfono..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.tableCard}>
            {cargando ? (
              <div className={styles.loadingWrap}>
                <div className={styles.spinner}></div>
                <p>Cargando clientes...</p>
              </div>
            ) : datosPaginados.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}><IconArchive size={32} strokeWidth={1.5} /></div>
                {tabActiva === 'archivados' ? (
                  <>
                    <div className={styles.emptyTitle}>No hay clientes archivados</div>
                    <div className={styles.emptySub}>Los clientes que archives aparecerán aquí. Puedes archivar manualmente cuando todos sus trámites estén terminados.</div>
                  </>
                ) : (
                  <>
                    <div className={styles.emptyTitle}>No se encontraron clientes</div>
                    <div className={styles.emptySub}>Intenta con otro nombre, correo o teléfono.</div>
                  </>
                )}
              </div>
            ) : (
              <div className={styles.tableScroll}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th style={{ width: 40 }}>#</th>
                      <th>Cliente</th>
                      <th>Correo</th>
                      <th>Teléfono</th>
                      <th>Trámites</th>
                      <th>Estado</th>
                      <th style={{ width: 120, textAlign: 'right' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datosPaginados.map((cliente, index) => {
                      const numero = (paginaActual - 1) * ITEMS_POR_PAGINA + index + 1;
                      const desde = formatClienteDesde(cliente.createdAt);
                      const listoParaArchivar =
                        !cliente.archived &&
                        cliente.tramitesSummary &&
                        cliente.tramitesSummary.total > 0 &&
                        cliente.tramitesSummary.activos === 0;

                      return (
                        <tr key={cliente.idUser ?? index}>
                          <td><span className={styles.rowNum}>{String(numero).padStart(2, '0')}</span></td>
                          <td>
                            <div className={styles.clientCell}>
                              <div className={styles.clientAvatar} style={{ background: getGradiente(cliente.idUser) }}>
                                {getIniciales(cliente.name)}
                              </div>
                              <div>
                                <div className={styles.clientName}>{cliente.name}</div>
                                {desde && <div className={styles.clientMeta}>{desde}</div>}
                              </div>
                            </div>
                          </td>
                          <td><span className={styles.cellMuted}>{cliente.email}</span></td>
                          <td><span className={styles.cellMono}>{cliente.phone}</span></td>
                          <td>
                            <TramitesPill resumen={cliente.tramitesSummary} styles={styles} />
                            {listoParaArchivar && (
                              <div className={styles.arcReady}><IconCheck /> Listo para archivar</div>
                            )}
                          </td>
                          <td>
                            <div className={styles.tgWrap}>
                              <span
                                className={`${styles.tg} ${cliente.status ? styles.on : ''}`}
                                onClick={() => handleSwitchChange(cliente.idUser, !cliente.status)}
                              ></span>
                              <span className={`${styles.tgLabel} ${cliente.status ? styles.on : styles.off}`}>
                                {cliente.status ? 'Activo' : 'Inactivo'}
                              </span>
                            </div>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div className={styles.rowActions}>
                              <button
                                title="Editar"
                                onClick={() => {
                                  setClienteSeleccionado(cliente);
                                  setShowClienteModal(true);
                                }}
                              >
                                <IconEdit />
                              </button>
                              <button title="Ver trámites" onClick={() => navigate('/TramitesAdmin')}>
                                <IconEye />
                              </button>
                              <button
                                className={`${styles.archive} ${listoParaArchivar ? styles.ready : ''}`}
                                title={
                                  cliente.archived
                                    ? 'Desarchivar'
                                    : listoParaArchivar
                                      ? 'Archivar (todos sus trámites terminados)'
                                      : 'Archivar'
                                }
                                onClick={() => handleArchivar(cliente)}
                              >
                                <IconArchive />
                              </button>
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
                Mostrando <strong>{(paginaActual - 1) * ITEMS_POR_PAGINA + 1}–{Math.min(paginaActual * ITEMS_POR_PAGINA, filtrados.length)}</strong> de <strong>{filtrados.length}</strong> clientes {tabActiva === 'archivados' ? 'archivados' : 'activos'}
              </div>
              <div className={styles.pgControls}>
                <button className={styles.pgBtn} onClick={() => cambiarPagina(paginaActual - 1)} disabled={paginaActual === 1}>
                  <IconChevronLeft />
                </button>
                {Array.from({ length: totalPaginas }).map((_, i) => (
                  <button
                    key={i}
                    className={`${styles.pgBtn} ${paginaActual === i + 1 ? styles.active : ''}`}
                    onClick={() => cambiarPagina(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button className={styles.pgBtn} onClick={() => cambiarPagina(paginaActual + 1)} disabled={paginaActual === totalPaginas}>
                  <IconChevronRight />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <ClienteModal
        show={showClienteModal}
        onHide={() => setShowClienteModal(false)}
        onGuardado={fetchServices}
        cliente={clienteSeleccionado}
      />
    </div>
  );
}

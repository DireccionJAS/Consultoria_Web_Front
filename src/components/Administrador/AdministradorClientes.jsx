import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { Spinner } from 'react-bootstrap';
import Navbar from '../NavbarAdmin.jsx';
import { clientes, actualizarStatusCliente, archivarCliente } from './../../api/api.js';
import '../../styles/ClientesAdminJAS.css';
import ClienteModal from './ClienteModal.jsx';

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

function TramitesPill({ resumen }) {
  if (!resumen || resumen.total === 0) {
    return <span className="tramites-pill none">Sin trámites</span>;
  }
  if (resumen.activos > 0) {
    return <span className="tramites-pill">{resumen.activos} activo{resumen.activos !== 1 ? 's' : ''}</span>;
  }
  return <span className="tramites-pill done">{resumen.terminados} terminado{resumen.terminados !== 1 ? 's' : ''}</span>;
}

function getPageNumbers(actual, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const paginas = new Set([1, 2, total - 1, total, actual - 1, actual, actual + 1]);
  return [...paginas]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
}

export default function AdministradorClientes() {
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

    if (!token) {
      navigate('/');
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (decoded.role !== 'ADMIN') {
        Swal.fire({
          icon: 'error',
          title: 'Acceso denegado',
          text: 'No tienes permiso para acceder a esta página.',
        });
        navigate('/');
      } else {
        fetchServices();
      }
    } catch (error) {
      console.error('Error decoding token:', error);
      localStorage.removeItem('token');
      navigate('/');
    }
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
    const archivar = !cliente.archived;

    const confirmacion = await Swal.fire({
      icon: 'warning',
      title: archivar ? '¿Estás seguro de archivar a este cliente?' : '¿Estás seguro de desarchivar a este cliente?',
      showCancelButton: true,
      confirmButtonText: archivar ? 'Archivar' : 'Desarchivar',
      cancelButtonText: 'Cancelar',
    });

    if (!confirmacion.isConfirmed) return;

    try {
      await archivarCliente(cliente.idUser, archivar);
      await fetchServices();
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: archivar ? 'Cliente archivado' : 'Cliente desarchivado',
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
      });
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

  const totalPaginas = Math.ceil(filtrados.length / ITEMS_POR_PAGINA);
  const datosPaginados = filtrados.slice(
    (paginaActual - 1) * ITEMS_POR_PAGINA,
    paginaActual * ITEMS_POR_PAGINA
  );

  const cambiarPagina = (numero) => {
    if (numero >= 1 && numero <= totalPaginas) {
      setPaginaActual(numero);
    }
  };

  return (
    <div className="tramites-container clientes-jas-page">
      <div className="fixed-top">
        <Navbar title={'- Clientes'} />
      </div>

      <header className="topbar">
        <div>
          <div className="crumb"><span>Admin</span> <span style={{ color: 'var(--muted-2)' }}>/</span> <span className="accent">Clientes</span></div>
          <div className="page-title-h">Gestión de clientes</div>
        </div>
        <div className="top-actions">
          <button className="icon-btn" title="Notificaciones">
            <IconBell />
            <span className="badge-num">8</span>
          </button>
          <button className="btn btn-accent" onClick={() => { setClienteSeleccionado(null); setShowClienteModal(true); }}>
            <IconPlus /> Agregar cliente
          </button>
        </div>
      </header>

      <div className="content">
        <div className="stats-strip">
          <div className="stat-mini"><div className="lbl">Total clientes</div><div className="val">{totalClientes}</div></div>
          <div className="stat-mini"><div className="lbl">Activos</div><div className="val" style={{ color: 'var(--green)' }}>{totalActivos}</div></div>
          <div className="stat-mini"><div className="lbl">Archivados</div><div className="val" style={{ color: 'var(--gray)' }}>{totalArchivados}</div></div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div className="tabs">
            <button className={`tab ${tabActiva === 'activos' ? 'active' : ''}`} onClick={() => setTabActiva('activos')}>
              <IconUsers />
              Clientes activos <span className="tab-count">{totalActivos}</span>
            </button>
            <button className={`tab ${tabActiva === 'archivados' ? 'active' : ''}`} onClick={() => setTabActiva('archivados')}>
              <IconArchive size={14} strokeWidth={2} />
              Archivados <span className="tab-count">{totalArchivados}</span>
            </button>
          </div>
          <div className="search-box">
            <IconSearch />
            <input
              type="text"
              placeholder="Buscar por nombre, correo o teléfono..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        {cargando ? (
          <div className="loading-state">
            <Spinner animation="border" variant="primary" />
            <p>Cargando clientes...</p>
          </div>
        ) : (
          <div className="table-card">
            {datosPaginados.length > 0 && (
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>#</th>
                    <th>Cliente</th>
                    <th>Correo</th>
                    <th>Teléfono</th>
                    <th>Trámites</th>
                    <th>Estado</th>
                    <th style={{ width: '120px' }}>Acciones</th>
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
                        <td><span className="row-num">{String(numero).padStart(2, '0')}</span></td>
                        <td>
                          <div className="client-cell">
                            <div className="client-avatar" style={{ background: getGradiente(cliente.idUser) }}>
                              {getIniciales(cliente.name)}
                            </div>
                            <div>
                              <div className="client-name">{cliente.name}</div>
                              {desde && <div className="client-meta">{desde}</div>}
                            </div>
                          </div>
                        </td>
                        <td><span style={{ color: 'var(--muted)' }}>{cliente.email}</span></td>
                        <td><span style={{ fontFamily: 'var(--mono)', color: 'var(--muted)' }}>{cliente.phone}</span></td>
                        <td>
                          <TramitesPill resumen={cliente.tramitesSummary} />
                          {listoParaArchivar && (
                            <div className="arc-ready"><IconCheck /> Listo para archivar</div>
                          )}
                        </td>
                        <td>
                          <div className="tg-wrap">
                            <span
                              className={`tg ${cliente.status ? 'on' : ''}`}
                              onClick={() => handleSwitchChange(cliente.idUser, !cliente.status)}
                            ></span>
                            <span className={`tg-label ${cliente.status ? 'on' : 'off'}`}>
                              {cliente.status ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="row-actions">
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
                              className={`archive ${listoParaArchivar ? 'ready' : ''}`}
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
            )}

            {datosPaginados.length === 0 && (
              <div className="empty-state show">
                <div className="empty-icon"><IconArchive size={32} strokeWidth={1.5} /></div>
                {tabActiva === 'archivados' ? (
                  <>
                    <div className="empty-title">No hay clientes archivados</div>
                    <div className="empty-sub">Los clientes que archives aparecerán aquí. Puedes archivar manualmente cuando todos sus trámites estén terminados.</div>
                  </>
                ) : (
                  <>
                    <div className="empty-title">No se encontraron clientes</div>
                    <div className="empty-sub">Intenta con otro nombre, correo o teléfono.</div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {!cargando && filtrados.length > 0 && (
          <div className="pagination">
            <div className="pg-info">
              Mostrando <strong>{(paginaActual - 1) * ITEMS_POR_PAGINA + 1}–{Math.min(paginaActual * ITEMS_POR_PAGINA, filtrados.length)}</strong> de <strong>{filtrados.length}</strong> clientes {tabActiva === 'archivados' ? 'archivados' : 'activos'} · {ITEMS_POR_PAGINA} por página
            </div>
            <div className="pg-controls">
              <button
                className={`pg-btn ${paginaActual === 1 ? 'disabled' : ''}`}
                onClick={() => cambiarPagina(paginaActual - 1)}
                disabled={paginaActual === 1}
              >
                <IconChevronLeft />
              </button>
              {getPageNumbers(paginaActual, totalPaginas).map((p, i, arr) => (
                <React.Fragment key={p}>
                  {i > 0 && p - arr[i - 1] > 1 && <span style={{ color: 'var(--muted-2)', padding: '0 4px' }}>…</span>}
                  <button
                    className={`pg-btn ${paginaActual === p ? 'active' : ''}`}
                    onClick={() => cambiarPagina(p)}
                  >
                    {p}
                  </button>
                </React.Fragment>
              ))}
              <button
                className={`pg-btn ${paginaActual === totalPaginas ? 'disabled' : ''}`}
                onClick={() => cambiarPagina(paginaActual + 1)}
                disabled={paginaActual === totalPaginas}
              >
                <IconChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>

      <ClienteModal
        show={showClienteModal}
        onHide={() => setShowClienteModal(false)}
        onGuardado={fetchServices}
        cliente={clienteSeleccionado}
      />
    </div>
  );
}

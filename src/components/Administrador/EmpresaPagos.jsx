import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import EmpresaSidebar from './EmpresaSidebar.jsx';
import { getAllPayments, clientePorId, getNameService, statusPayments } from './../../api/api.js';
import ModalDetallePago from './ModalDetallePago.jsx';
import ModalConfirmarPagoEfectivo from './ModalConfirmarPagoEfectivo.jsx';
import styles from './../../styles/EmpresaPagos.module.css';

const ITEMS_POR_PAGINA = 7;

function IconBell() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M13.7 21a2 2 0 0 1-3.4 0"></path>
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

function IconSearch() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--muted)' }}>
      <circle cx="11" cy="11" r="8"></circle>
      <path d="M21 21l-4.35-4.35"></path>
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

function IconDownload() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"></path>
    </svg>
  );
}

function IconCheckSmall() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
      <path d="M20 6L9 17l-5-5"></path>
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

function IconTramitePasaporte() {
  return (
    <svg width="18" height="18" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="6" y="4" width="20" height="28" rx="2"></rect>
      <circle cx="16" cy="14" r="3.5"></circle>
      <path d="M10 22h12M10 26h8"></path>
    </svg>
  );
}

function IconTramiteGlobo() {
  return (
    <svg width="18" height="18" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="16" cy="16" r="11"></circle>
      <path d="M5 16h22M16 5a16 16 0 0 1 0 22"></path>
    </svg>
  );
}

function IconTramiteDocumento() {
  return (
    <svg width="18" height="18" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="5" y="6" width="22" height="24" rx="1.5"></rect>
      <path d="M10 12h12M10 16h12M10 20h8"></path>
    </svg>
  );
}

function TramiteIcon({ nombre }) {
  const n = (nombre || '').toLowerCase();
  if (n.includes('eta') || n.includes('canad')) return <IconTramiteGlobo />;
  if (n.includes('entrevista') || n.includes('simulaci')) return <IconTramiteDocumento />;
  return <IconTramitePasaporte />;
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

export default function EmpresaPagos() {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [paginaActual, setPaginaActual] = useState(1);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [pagoDetalle, setPagoDetalle] = useState(null);
  const [modalEfectivoAbierto, setModalEfectivoAbierto] = useState(false);
  const [pagoContextoEfectivo, setPagoContextoEfectivo] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/'); return; }
    try {
      const decoded = jwtDecode(token);
      if (decoded.role !== 'EMPRESA') { navigate('/'); return; }
    } catch (error) {
      console.error('Token inválido', error);
      localStorage.removeItem('token');
      navigate('/');
      return;
    }
    fetchServices();
  }, [navigate]);

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, filtroEstado]);

  const fetchServices = async () => {
    try {
      setCargando(true);
      const response = await getAllPayments();

      if (response.success && Array.isArray(response.response.payments)) {
        const paymentsData = response.response.payments;
        const sortedPayments = paymentsData.sort((a, b) => b.idPayment - a.idPayment);
        const paymentsWithDetails = await Promise.all(
          sortedPayments.map(async (payment) => {
            try {
              const clienteResponse = await clientePorId(payment.idUser);
              const cliente = clienteResponse.success ? clienteResponse.response.user : null;
              const nombreTramite = await getNameService(payment.idTransact);
              return { ...payment, user: cliente, transact: { name: nombreTramite } };
            } catch {
              return { ...payment, user: null, transact: { name: `Trámite #${payment.idTransact}` } };
            }
          })
        );
        setDatos(paymentsWithDetails);
      } else {
        setDatos([]);
      }
    } catch (error) {
      console.error('Error al obtener los pagos', error);
      setDatos([]);
    } finally {
      setCargando(false);
    }
  };

  const handleTogglePago = async (pago) => {
    const nuevoEstado = pago.status === 1 ? 0 : 1;
    try {
      await statusPayments(pago.idPayment, { status: nuevoEstado, total: pago.total });
      fetchServices();
    } catch (error) {
      console.error('Error al actualizar el estado del pago', error);
    }
  };

  const totalActivos = datos.filter((d) => d.status === 1).length;
  const totalInactivos = datos.filter((d) => d.status !== 1).length;

  const porEstado = datos.filter((d) => {
    if (filtroEstado === 'activo') return d.status === 1;
    if (filtroEstado === 'inactivo') return d.status !== 1;
    return true;
  });

  const busquedaStr = busqueda.toLowerCase();
  const filtrados = porEstado.filter((d) =>
    (d.user?.name ?? '').toLowerCase().includes(busquedaStr) ||
    (d.user?.phone ?? '').toLowerCase().includes(busquedaStr) ||
    (d.user?.email ?? '').toLowerCase().includes(busquedaStr) ||
    (d.transact?.name ?? '').toLowerCase().includes(busquedaStr)
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
      <EmpresaSidebar active="pagos" onNavigate={handleNavigate} />

      <main className={styles.main}>
        <header className={styles.topbar}>
          <div>
            <div className={styles.crumb}><span>Empresa</span> <span className={styles.crumbSep}>/</span> <span className={styles.accent}>Pagos</span></div>
            <div className={styles.pageTitle}>Gestión de pagos</div>
          </div>
          <div className={styles.topActions}>
            <button className={styles.iconBtn} aria-label="Notificaciones">
              <IconBell />
            </button>
            <button className={styles.btnAccent} onClick={() => { setPagoContextoEfectivo(null); setModalEfectivoAbierto(true); }}>
              <IconPlus /> Agregar pago
            </button>
          </div>
        </header>

        <div className={styles.content}>
          <div className={styles.toolbar}>
            <div className={styles.searchBar}>
              <IconSearch />
              <input
                type="text"
                placeholder="Buscar por cliente, teléfono, email o trámite..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estado:</span>
              <div className={styles.seg}>
                <button className={filtroEstado === 'todos' ? styles.active : ''} onClick={() => setFiltroEstado('todos')}>Todos</button>
                <button className={filtroEstado === 'activo' ? styles.active : ''} onClick={() => setFiltroEstado('activo')}>Activos <span className={styles.cnt}>{totalActivos}</span></button>
                <button className={filtroEstado === 'inactivo' ? styles.active : ''} onClick={() => setFiltroEstado('inactivo')}>Inactivos <span className={styles.cnt}>{totalInactivos}</span></button>
              </div>
            </div>
          </div>

          <div className={styles.tableCard}>
            {cargando ? (
              <div className={styles.loadingWrap}>
                <div className={styles.spinner}></div>
                <p>Cargando pagos...</p>
              </div>
            ) : datosPaginados.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}><IconSearch /></div>
                <div className={styles.emptyTitle}>No se encontraron pagos</div>
                <div className={styles.emptySub}>Intenta con otro nombre, correo, teléfono o trámite.</div>
              </div>
            ) : (
              <div className={styles.tableScroll}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th style={{ width: 40 }}>#</th>
                      <th>Trámite</th>
                      <th>Cliente</th>
                      <th>Teléfono</th>
                      <th>Correo</th>
                      <th>Monto</th>
                      <th>Estado</th>
                      <th>Empresa</th>
                      <th style={{ width: 90 }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datosPaginados.map((pago, index) => {
                      const numero = (paginaActual - 1) * ITEMS_POR_PAGINA + index + 1;
                      const activo = pago.status === 1;
                      return (
                        <tr key={pago.idPayment}>
                          <td><span className={styles.rowNum}>{String(numero).padStart(2, '0')}</span></td>
                          <td>
                            <div className={styles.tramiteCell}>
                              <div className={styles.tramiteIcon}><TramiteIcon nombre={pago.transact?.name} /></div>
                              <div>
                                <div className={styles.tramiteName}>{pago.transact?.name || 'No disponible'}</div>
                                <div className={styles.tramiteFolio}>#{pago.idPayment}</div>
                              </div>
                            </div>
                          </td>
                          <td><div className={styles.clientName}>{pago.user?.name || 'No disponible'}</div></td>
                          <td><span className={styles.payDate}>{pago.user?.phone || 'N/A'}</span></td>
                          <td><a href="#" style={{ color: 'var(--c2)' }}>{pago.user?.email || 'N/A'}</a></td>
                          <td>
                            <div className={styles.payAmount}>${(pago.total ?? 0).toLocaleString('es-MX')}<small>MXN</small></div>
                            <span className={styles.cashBadge}>Método sin registrar</span>
                          </td>
                          <td>
                            <div className={styles.payCheckWrap} onClick={() => handleTogglePago(pago)}>
                              <span className={`${styles.payCheck} ${activo ? styles.on : ''}`}>
                                <IconCheckSmall />
                              </span>
                              <span className={`${styles.payCheckLabel} ${activo ? styles.on : styles.off}`}>{activo ? 'Activo' : 'Inactivo'}</span>
                            </div>
                          </td>
                          <td>
                            <div className={styles.empresaCell} title="Sin dato de empresa registrado en el backend">
                              <span className={styles.empresaCode}>Sin asignar</span>
                            </div>
                          </td>
                          <td>
                            <div className={styles.rowActions}>
                              <button title="Ver detalle" onClick={() => setPagoDetalle(pago)}><IconEye /></button>
                              <button title="Descargar"><IconDownload /></button>
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
                Mostrando <strong>{(paginaActual - 1) * ITEMS_POR_PAGINA + 1}–{Math.min(paginaActual * ITEMS_POR_PAGINA, filtrados.length)}</strong> de <strong>{filtrados.length}</strong> pagos · {ITEMS_POR_PAGINA} por página
              </div>
              <div className={styles.pgControls}>
                <button className={styles.pgBtn} onClick={() => cambiarPagina(paginaActual - 1)} disabled={paginaActual === 1}>
                  <IconChevronLeft />
                </button>
                {getPageNumbers(paginaActual, totalPaginas).map((p, i, arr) => (
                  <React.Fragment key={p}>
                    {i > 0 && p - arr[i - 1] > 1 && <span style={{ color: 'var(--muted-2)', padding: '0 4px' }}>…</span>}
                    <button
                      className={`${styles.pgBtn} ${paginaActual === p ? styles.active : ''}`}
                      onClick={() => cambiarPagina(p)}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                ))}
                <button className={styles.pgBtn} onClick={() => cambiarPagina(paginaActual + 1)} disabled={paginaActual === totalPaginas}>
                  <IconChevronRight />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <ModalDetallePago
        show={!!pagoDetalle}
        onHide={() => setPagoDetalle(null)}
        pago={pagoDetalle}
        pagosDelTramite={pagoDetalle ? datos.filter((d) => d.idUser === pagoDetalle.idUser && d.idTransact === pagoDetalle.idTransact) : []}
        onRegistrarEfectivo={(pago) => { setPagoDetalle(null); setPagoContextoEfectivo(pago); setModalEfectivoAbierto(true); }}
      />
      <ModalConfirmarPagoEfectivo
        show={modalEfectivoAbierto}
        onHide={() => setModalEfectivoAbierto(false)}
        pago={pagoContextoEfectivo}
        onConfirmado={fetchServices}
      />
    </div>
  );
}

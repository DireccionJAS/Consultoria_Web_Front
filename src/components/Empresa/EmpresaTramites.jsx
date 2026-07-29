
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import EmpresaSidebar from './EmpresaSidebar.jsx';
import CrearTramiteModal from '../tramites/CrearTramiteModal.jsx';
import ActualizarTramiteModal from '../tramites/ActualizarTramiteModal.jsx';
import { trasacciones, actualizarT } from './../../api/api.js';
import styles from './../../styles/EmpresaTramites.module.css';

function SearchIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--muted)' }}><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>; }
function BellIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M13.7 21a2 2 0 0 1-3.4 0" /></svg>; }
function PlusIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>; }
function ChevronDownIcon() { return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6" /></svg>; }
function CheckIcon() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>; }
function EditIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z" /></svg>; }
function DocIcon() { return <svg width="20" height="20" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="6" y="4" width="20" height="28" rx="2" /><circle cx="16" cy="14" r="3.5" /><path d="M10 22h12M10 26h8" /></svg>; }
function EmptyIcon() { return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>; }
function ChevronLeftIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>; }
function ChevronRightIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>; }

const STATUS_META = {
  1: { label: 'En proceso', cls: 'stProceso', color: 'var(--c2)' },
  2: { label: 'En espera', cls: 'stEspera', color: 'var(--amber)' },
  3: { label: 'Falta de pago', cls: 'stPago', color: 'var(--rose)' },
  4: { label: 'Terminado', cls: 'stTerminado', color: 'var(--green)' },
  5: { label: 'Cancelado', cls: 'stCancelado', color: 'var(--gray)' },
  6: { label: 'Revisar', cls: 'stRevisar', color: 'var(--orange)' },
  7: { label: 'Aprobado', cls: 'stAprobado', color: 'var(--green-dark)' },
  8: { label: 'Rechazado', cls: 'stRechazado', color: 'var(--rose-dark)' },
};

// UI-only: no existe todavía una entidad Empresa en el backend, así que la
// asignación aquí no se persiste (se pierde al recargar). Mismas 2 empresas
// que ya usa el selector decorativo de CalendarioAdmin.jsx.
const EMPRESAS = [
  { code: 'JAS', label: 'C.JAS', name: 'Consultoría JAS' },
  { code: 'CMG', label: 'COR.M', name: 'Corporativo Migratorio Gutiérrez' },
];

function EmpresaDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const empresa = EMPRESAS.find((e) => e.code === value) || null;

  useEffect(() => {
    const handleOutside = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  return (
    <div className={styles.statusDd} ref={ref}>
      <div className={styles.empresaCell} style={{ cursor: 'pointer' }} onClick={() => setOpen((o) => !o)}>
        <span className={styles.empresaAvatar}>{empresa ? empresa.code.slice(0, 3) : '—'}</span>
        <span className={styles.empresaCode}>{empresa ? empresa.label : 'Sin asignar'}</span>
        <ChevronDownIcon />
      </div>
      {open && (
        <div className={styles.statusMenu}>
          <div className={`${styles.statusOpt} ${!value ? styles.sel : ''}`} onClick={() => { onChange(null); setOpen(false); }}>
            Sin asignar
            {!value && <span className={styles.check}><CheckIcon /></span>}
          </div>
          {EMPRESAS.map((e) => (
            <div
              key={e.code}
              className={`${styles.statusOpt} ${value === e.code ? styles.sel : ''}`}
              onClick={() => { onChange(e.code); setOpen(false); }}
            >
              {e.name} ({e.label})
              {value === e.code && <span className={styles.check}><CheckIcon /></span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const CHIP_FILTERS = [
  { value: '', label: 'Todos', dot: null },
  { value: '1', label: 'En proceso', dot: 'var(--c2)' },
  { value: '2', label: 'En espera', dot: 'var(--amber)' },
  { value: '3', label: 'Falta de pago', dot: 'var(--rose)' },
  { value: '4', label: 'Terminado', dot: 'var(--green)' },
  { value: '5', label: 'Cancelado', dot: 'var(--gray)' },
  { value: '6', label: 'Revisar', dot: 'var(--orange)' },
  { value: '7', label: 'Aprobado', dot: 'var(--green-dark)' },
  { value: '8', label: 'Rechazado', dot: 'var(--rose-dark)' },
];

function StatusDropdown({ status, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const meta = STATUS_META[status] || { label: 'Desconocido', cls: 'stCancelado' };

  useEffect(() => {
    const handleOutside = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  return (
    <div className={styles.statusDd} ref={ref}>
      <div className={`${styles.statusTrigger} ${styles[meta.cls]}`} onClick={() => setOpen((o) => !o)}>
        <span className={styles.sdot}></span>
        {meta.label}
        <ChevronDownIcon />
      </div>
      {open && (
        <div className={styles.statusMenu}>
          {Object.entries(STATUS_META).map(([code, m]) => (
            <div
              key={code}
              className={`${styles.statusOpt} ${Number(code) === status ? styles.sel : ''}`}
              onClick={() => { onChange(Number(code)); setOpen(false); }}
            >
              <span className={styles.od} style={{ background: m.color }}></span>
              {m.label}
              {Number(code) === status && <span className={styles.check}><CheckIcon /></span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const ITEMS_POR_PAGINA = 7;

export default function EmpresaTramites() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [busqueda, setBusqueda] = useState(searchParams.get('cliente') || '');
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [showCrearTramite, setShowCrearTramite] = useState(false);
  const [showModalA, setShowModalA] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('');
  const [empresaAsignada, setEmpresaAsignada] = useState({});

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  useEffect(() => { setPaginaActual(1); }, [busqueda, estadoSeleccionado]);

  const fetchServices = async () => {
    try {
      const response = await trasacciones();
      if (response.success && Array.isArray(response.response.transactProgresses)) {
        const sortedData = response.response.transactProgresses.sort(
          (a, b) => b.idTransactProgress - a.idTransactProgress
        );
        setDatos(sortedData);
      } else {
        console.error('Formato de respuesta inesperado:', response);
        setDatos([]);
      }
    } catch (error) {
      console.error('Error al obtener los trámites:', error);
      setDatos([]);
    } finally {
      setCargando(false);
    }
  };

  const handleStatusChange = async (idTransactProgress, nuevoEstado) => {
    try {
      await actualizarT(idTransactProgress, nuevoEstado);
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: `Estado actualizado: ${STATUS_META[nuevoEstado]?.label || 'Desconocido'}`,
      });
      fetchServices();
    } catch (error) {
      console.error('Error al actualizar el estado del trámite', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo actualizar el estado.' });
    }
  };

  const porBusqueda = datos.filter((d) => {
    const busquedaStr = busqueda.toLowerCase();
    return (
      d.user?.name?.toLowerCase().includes(busquedaStr) ||
      d.user?.phone?.toLowerCase().includes(busquedaStr) ||
      d.emailAcces?.toLowerCase().includes(busquedaStr) ||
      d.user?.email?.toLowerCase().includes(busquedaStr) ||
      d.transact?.name?.toLowerCase().includes(busquedaStr)
    );
  });

  const counts = porBusqueda.reduce((acc, d) => { acc[d.status] = (acc[d.status] || 0) + 1; return acc; }, {});

  const filtrados = porBusqueda.filter((d) => estadoSeleccionado === '' || d.status === parseInt(estadoSeleccionado, 10));

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / ITEMS_POR_PAGINA));
  const datosPaginados = filtrados.slice(
    (paginaActual - 1) * ITEMS_POR_PAGINA,
    paginaActual * ITEMS_POR_PAGINA
  );

  const cambiarPagina = (n) => { if (n >= 1 && n <= totalPaginas) setPaginaActual(n); };

  const handleNavigate = (key) => {
    console.log('Navegar a sección de sidebar:', key);
  };

  return (
    <div className={styles.page}>
      <EmpresaSidebar active="tramites" tramitesCount={datos.length} onNavigate={handleNavigate} />

      <main className={styles.main}>
        <header className={styles.topbar}>
          <div>
            <div className={styles.crumb}><span>Empresa</span> <span className={styles.crumbSep}>/</span> <span className={styles.accent}>Trámites</span></div>
            <div className={styles.pageTitle}>Gestión de <em>trámites</em></div>
          </div>
          <div className={styles.topActions}>
            <button className={styles.iconBtn} aria-label="Notificaciones">
              <BellIcon />
            </button>
            <button className={styles.btnAccent} onClick={() => setShowCrearTramite(true)}>
              <PlusIcon />
              Agregar trámite
            </button>
          </div>
        </header>

        <div className={styles.content}>
          <div className={styles.toolbar}>
            <div className={styles.toolbarTop}>
              <div className={styles.searchBar}>
                <SearchIcon />
                <input
                  type="text"
                  placeholder="Buscar por cliente, teléfono, email o trámite..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
              <div className={styles.resultsMeta}>
                <strong>{filtrados.length}</strong> trámites {estadoSeleccionado ? 'con este filtro' : 'en total'}
              </div>
            </div>

            <div className={styles.filterChips}>
              {CHIP_FILTERS.map((f) => (
                <button
                  key={f.value}
                  className={`${styles.chip} ${estadoSeleccionado === f.value ? styles.active : ''}`}
                  onClick={() => setEstadoSeleccionado(f.value)}
                >
                  {f.dot && <span className={styles.chipDot} style={{ background: f.dot }}></span>}
                  {f.label}
                  <span className={styles.cnt}>{f.value === '' ? porBusqueda.length : (counts[f.value] || 0)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.tableCard}>
            {cargando ? (
              <div className={styles.loadingWrap}>
                <div className={styles.spinner}></div>
                <p>Cargando trámites...</p>
              </div>
            ) : datosPaginados.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}><EmptyIcon /></div>
                <div className={styles.emptyTitle}>No hay registros</div>
                <div className={styles.emptySub}>No se encontraron trámites con los filtros aplicados. Intenta con otra búsqueda o agrega un nuevo trámite.</div>
              </div>
            ) : (
              <div className={styles.tableScroll}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th style={{ width: 48 }}>#</th>
                      <th>Trámite</th>
                      <th>Cliente</th>
                      <th>Teléfono</th>
                      <th>Email</th>
                      <th>Estado</th>
                      <th>Encargado</th>
                      <th>Empresa</th>
                      <th style={{ width: 90, textAlign: 'right' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datosPaginados.map((cliente, index) => (
                      <tr key={cliente.idTransactProgress}>
                        <td><span className={styles.rowNum}>{String((paginaActual - 1) * ITEMS_POR_PAGINA + index + 1).padStart(2, '0')}</span></td>
                        <td>
                          <div className={styles.tramCell}>
                            <div className={styles.tramImg}><DocIcon /></div>
                            <div>
                              <div className={styles.tramName}>{cliente.transact?.name}</div>
                              <div className={styles.tramFolio}>#{String(cliente.idTransactProgress).padStart(6, '0')}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className={styles.clientName}>{cliente.user?.name}</span></td>
                        <td><a className={styles.cellMono} href={`tel:${cliente.user?.phone}`}>{cliente.user?.phone}</a></td>
                        <td><a className={styles.cellEmail} href={`mailto:${cliente.user?.email}`}>{cliente.user?.email}</a></td>
                        <td>
                          <StatusDropdown
                            status={cliente.status}
                            onChange={(nuevo) => handleStatusChange(cliente.idTransactProgress, nuevo)}
                          />
                        </td>
                        <td><div className={styles.encargadoCell}>— Sin asignar</div></td>
                        <td>
                          <EmpresaDropdown
                            value={empresaAsignada[cliente.idTransactProgress] || null}
                            onChange={(code) => setEmpresaAsignada((prev) => ({ ...prev, [cliente.idTransactProgress]: code }))}
                          />
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className={styles.rowActions}>
                            <button title="Editar" onClick={() => { setClienteSeleccionado(cliente); setShowModalA(true); }}>
                              <EditIcon />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {!cargando && filtrados.length > 0 && (
            <div className={styles.pagination}>
              <div className={styles.pgInfo}>
                Mostrando <strong>{(paginaActual - 1) * ITEMS_POR_PAGINA + 1}–{Math.min(paginaActual * ITEMS_POR_PAGINA, filtrados.length)}</strong> de <strong>{filtrados.length}</strong> trámites
              </div>
              <div className={styles.pgControls}>
                <button className={styles.pgBtn} onClick={() => cambiarPagina(paginaActual - 1)} disabled={paginaActual === 1}>
                  <ChevronLeftIcon />
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
                  <ChevronRightIcon />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <CrearTramiteModal
        show={showCrearTramite}
        onHide={() => setShowCrearTramite(false)}
        scope="empresa"
        onCreated={fetchServices}
      />
      <ActualizarTramiteModal
        show={showModalA}
        onHide={() => setShowModalA(false)}
        onClienteRegistrado={fetchServices}
        cliente={clienteSeleccionado}
      />
    </div>
  );
}

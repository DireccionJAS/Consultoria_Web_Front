import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import EmpresaSidebar from './EmpresaSidebar.jsx';
import { trasacciones, listarEncargados, actualizarTC } from './../../api/api.js';
import styles from './../../styles/EmpresaCalendario.module.css';

const DOW = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

const EV_META = {
  cas: { headClass: 'cas', type: 'Cita CAS · Centro de Atención al Solicitante' },
  con: { headClass: 'con', type: 'Cita Consular · Entrevista en el Consulado' },
  sim: { headClass: 'sim', type: 'Simulación · Práctica de entrevista 1:1' },
  aten: { headClass: 'aten', type: 'Atención a cliente · Vía Zoom' },
};

function IconChevronLeft() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"></path></svg>;
}
function IconChevronRight() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"></path></svg>;
}
function IconPlus() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"></path></svg>;
}
function IconCheck() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12l5 5L20 7"></path></svg>;
}
function IconClose({ size = 13 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 6l12 12M6 18L18 6"></path></svg>;
}
function IconCalendar() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ color: 'var(--c2)' }}><rect x="3" y="4" width="18" height="18" rx="2"></rect><path d="M16 2v4M8 2v4M3 10h18"></path></svg>;
}
function IconCalendarPlus() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"></rect><path d="M16 2v4M8 2v4M3 10h18M12 14v4M10 16h4"></path></svg>;
}
function IconPin() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
}
function IconHouse() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6"></path></svg>;
}
function IconMonitor() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="4" width="20" height="14" rx="2"></rect><path d="M8 22h8M12 18v4"></path></svg>;
}
function IconChat() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 17 0z"></path></svg>;
}
function IconUser() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="7" r="4"></circle><path d="M3 21v-1a7 7 0 0 1 14 0v1"></path></svg>;
}
function IconPhone() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>;
}
function IconEncargado() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4"></circle><path d="M4 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2"></path></svg>;
}
function IconExternal() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 17L17 7M7 7h10v10"></path></svg>;
}

function pad2(n) { return String(n).padStart(2, '0'); }
function toDateStr(d) { return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; }
function extraerFecha(fechaHora) { return fechaHora ? fechaHora.slice(0, 10) : null; }
function extraerHora(fechaHora) { return fechaHora && fechaHora.length >= 16 ? fechaHora.slice(11, 16) : null; }

function getCalendarCells(year, month) {
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const cells = [];
  for (let i = firstDow - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, other: true, date: new Date(year, month - 1, daysInPrevMonth - i) });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, other: false, date: new Date(year, month, d) });
  }
  let next = 1;
  while (cells.length % 7 !== 0) {
    cells.push({ day: next, other: true, date: new Date(year, month + 1, next) });
    next++;
  }
  return cells;
}

function formatFechaHora(fecha, hora) {
  if (!fecha) return 'Sin fecha';
  const [y, m, d] = fecha.split('-').map(Number);
  const texto = `${d} ${MESES[m - 1].toLowerCase()} ${y}`;
  return hora ? `${texto} · ${hora} hrs` : texto;
}

export default function EmpresaCalendario() {
  const navigate = useNavigate();
  const hoy = new Date();
  const [mesActual, setMesActual] = useState(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
  const [datos, setDatos] = useState([]);
  const [encargados, setEncargados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroTramite, setFiltroTramite] = useState('');
  const [eventoDetalle, setEventoDetalle] = useState(null);
  const [nuevaCitaAbierta, setNuevaCitaAbierta] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [ncTipo, setNcTipo] = useState('cas');
  const [ncTramite, setNcTramite] = useState('');
  const [ncFecha, setNcFecha] = useState('');
  const [ncHora, setNcHora] = useState('');
  const [ncCiudad, setNcCiudad] = useState('');
  const [ncEncargado, setNcEncargado] = useState('');

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
    listarEncargados().then((res) => setEncargados(res.success ? res.response.users : [])).catch(() => setEncargados([]));
  }, [navigate]);

  const fetchServices = async () => {
    try {
      setCargando(true);
      const response = await trasacciones();
      setDatos(response.success && Array.isArray(response.response.transactProgresses) ? response.response.transactProgresses : []);
    } catch (error) {
      console.error('Error al obtener las citas', error);
      setDatos([]);
    } finally {
      setCargando(false);
    }
  };

  const tramitesUnicos = useMemo(
    () => [...new Set(datos.map((d) => d.transact?.name).filter(Boolean))],
    [datos]
  );

  const datosFiltrados = useMemo(
    () => (filtroTramite ? datos.filter((d) => d.transact?.name === filtroTramite) : datos),
    [datos, filtroTramite]
  );

  const eventosPorFecha = useMemo(() => {
    const map = {};
    datosFiltrados.forEach((item) => {
      [['cas', item.dateCas], ['con', item.dateCon], ['sim', item.dateSimulation]].forEach(([tipo, fechaHora]) => {
        const fecha = extraerFecha(fechaHora);
        if (!fecha) return;
        if (!map[fecha]) map[fecha] = [];
        map[fecha].push({ tipo, item, fecha, hora: extraerHora(fechaHora) });
      });
    });
    return map;
  }, [datosFiltrados]);

  const proximaFecha = (tipo) => {
    const campo = tipo === 'cas' ? 'dateCas' : tipo === 'con' ? 'dateCon' : 'dateSimulation';
    const ahora = new Date();
    const fechas = datosFiltrados
      .map((item) => item[campo])
      .filter(Boolean)
      .map((f) => new Date(f.replace(' ', 'T')))
      .filter((d) => d >= ahora)
      .sort((a, b) => a - b);
    return fechas[0] || null;
  };

  const citasDelMes = useMemo(() => {
    const counts = { cas: 0, con: 0, sim: 0, aten: 0 };
    Object.values(eventosPorFecha).forEach((evs) => {
      evs.forEach((ev) => {
        const d = new Date(ev.fecha + 'T00:00:00');
        if (d.getFullYear() === mesActual.getFullYear() && d.getMonth() === mesActual.getMonth()) {
          counts[ev.tipo]++;
        }
      });
    });
    return counts;
  }, [eventosPorFecha, mesActual]);

  const totalCitasMes = citasDelMes.cas + citasDelMes.con + citasDelMes.sim + citasDelMes.aten;

  const irAMes = (fecha) => {
    if (!fecha) return;
    setMesActual(new Date(fecha.getFullYear(), fecha.getMonth(), 1));
  };

  const abrirEvento = (tipo, item, fecha, hora) => setEventoDetalle({ tipo, item, fecha, hora });

  const abrirNuevaCita = () => {
    setNcTipo('cas');
    setNcTramite('');
    setNcFecha('');
    setNcHora('09:00');
    setNcCiudad('');
    setNcEncargado('');
    setNuevaCitaAbierta(true);
  };

  const seleccionarTramiteNc = (idTransactProgress) => {
    setNcTramite(idTransactProgress);
    const item = datos.find((d) => String(d.idTransactProgress) === String(idTransactProgress));
    if (!item) return;
    setNcCiudad(ncTipo === 'cas' ? (item.casCity || '') : ncTipo === 'con' ? (item.conCity || '') : '');
    setNcEncargado(item.encargado?.idUser ? String(item.encargado.idUser) : '');
  };

  const puedeAgendar = ncTramite && ncFecha && ncHora && !guardando;

  const handleAgendar = async () => {
    if (!puedeAgendar) return;
    const item = datos.find((d) => String(d.idTransactProgress) === String(ncTramite));
    if (!item) return;
    setGuardando(true);
    const fechaHora = `${ncFecha} ${ncHora}:00`;
    const payload = {
      ...item,
      idEncargado: ncEncargado || item.encargado?.idUser || null,
    };
    if (ncTipo === 'cas') { payload.dateCas = fechaHora; payload.casCity = ncCiudad || item.casCity; }
    if (ncTipo === 'con') { payload.dateCon = fechaHora; payload.conCity = ncCiudad || item.conCity; }
    if (ncTipo === 'sim') { payload.dateSimulation = fechaHora; }
    try {
      const res = await actualizarTC(item.idTransactProgress, payload);
      if (!res?.success) throw new Error(res?.message || 'No se pudo agendar la cita');
      await fetchServices();
      setNuevaCitaAbierta(false);
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'No se pudo agendar la cita', text: error.message || 'Ocurrió un error al agendar la cita.' });
    } finally {
      setGuardando(false);
    }
  };

  const handleNavigate = (key) => {
    console.log('Navegar a sección de sidebar:', key);
  };

  const cells = getCalendarCells(mesActual.getFullYear(), mesActual.getMonth());
  const hoyStr = toDateStr(hoy);

  const proxCas = proximaFecha('cas');
  const proxCon = proximaFecha('con');
  const proxSim = proximaFecha('sim');

  return (
    <div className={styles.page}>
      <EmpresaSidebar active="calendario" onNavigate={handleNavigate} />

      <main className={styles.main}>
        <header className={styles.topbar}>
          <div>
            <div className={styles.crumb}><span>Empresa</span> <span className={styles.crumbSep}>/</span> <span className={styles.accent}>Calendario</span></div>
            <div className={styles.pageTitle}>Calendario de citas</div>
          </div>
          <div className={styles.topActions}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)', textTransform: 'uppercase' }}>Filtrar:</span>
              <select className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} style={{ paddingRight: 30 }} value={filtroTramite} onChange={(e) => setFiltroTramite(e.target.value)}>
                <option value="">Todos los trámites</option>
                {tramitesUnicos.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <button className={`${styles.btn} ${styles.btnAccent}`} onClick={abrirNuevaCita}><IconPlus /> Nueva cita</button>
          </div>
        </header>

        {cargando ? (
          <div className={styles.loadingWrap}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', border: '4px solid var(--line-2)', borderTopColor: 'var(--c2)', animation: 'spin 0.9s linear infinite' }}></div>
          </div>
        ) : (
          <div className={styles.content}>
            {/* LEFT: calendar */}
            <div>
              <div className={styles.quickRow}>
                <button className={styles.quickBtn} onClick={() => irAMes(proxCas)}>
                  <span className={styles.quickDot} style={{ background: 'var(--c2)' }}></span> Próximo CAS
                  <span className={styles.qbDate}>{proxCas ? `${proxCas.getDate()} ${MESES_CORTOS[proxCas.getMonth()]}` : 'Sin citas'}</span>
                </button>
                <button className={styles.quickBtn} onClick={() => irAMes(proxCon)}>
                  <span className={styles.quickDot} style={{ background: 'var(--green)' }}></span> Próximo CON
                  <span className={styles.qbDate}>{proxCon ? `${proxCon.getDate()} ${MESES_CORTOS[proxCon.getMonth()]}` : 'Sin citas'}</span>
                </button>
                <button className={styles.quickBtn} onClick={() => irAMes(proxSim)}>
                  <span className={styles.quickDot} style={{ background: 'var(--orange)' }}></span> Próxima Simulación
                  <span className={styles.qbDate}>{proxSim ? `${proxSim.getDate()} ${MESES_CORTOS[proxSim.getMonth()]}` : 'Sin citas'}</span>
                </button>
              </div>

              <div className={styles.calCard}>
                <div className={styles.calHead}>
                  <div className={styles.calMonth}>
                    {MESES[mesActual.getMonth()]} <span style={{ color: 'var(--muted)', fontWeight: 500 }}>{mesActual.getFullYear()}</span>
                    <div className={styles.calNav}>
                      <button onClick={() => setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() - 1, 1))}><IconChevronLeft /></button>
                      <button onClick={() => setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 1))}><IconChevronRight /></button>
                    </div>
                  </div>
                  <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} onClick={() => setMesActual(new Date(hoy.getFullYear(), hoy.getMonth(), 1))}>Hoy</button>
                </div>

                <div className={styles.calGridHead}>
                  {DOW.map((d) => <div key={d} className={styles.calDow}>{d}</div>)}
                </div>
                <div className={styles.calGrid}>
                  {cells.map((cell, i) => {
                    const dateStr = toDateStr(cell.date);
                    const evs = eventosPorFecha[dateStr] || [];
                    const visibles = evs.slice(0, 2);
                    const resto = evs.length - visibles.length;
                    return (
                      <div key={i} className={`${styles.calCell} ${cell.other ? styles.other : ''}`}>
                        <span className={`${styles.calDaynum} ${!cell.other && dateStr === hoyStr ? styles.today : ''}`}>{cell.day}</span>
                        {evs.length > 0 && (
                          <div className={styles.calEvents}>
                            {visibles.map((ev, j) => (
                              <div
                                key={j}
                                className={`${styles.calEv} ${ev.tipo === 'cas' ? styles.evCas : ev.tipo === 'con' ? styles.evCon : styles.evSim}`}
                                onClick={() => abrirEvento(ev.tipo, ev.item, ev.fecha, ev.hora)}
                              >
                                <span className={styles.evdot}></span>
                                {ev.tipo === 'cas' ? 'CAS' : ev.tipo === 'con' ? 'CON' : 'Sim'} · {(ev.item.user?.name || '').split(' ').slice(0, 2).join(' ')}
                              </div>
                            ))}
                            {resto > 0 && <div className={styles.calMore}>+{resto} más</div>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className={styles.calLegend}>
                  <div className={styles.legItem}><span className={styles.legDot} style={{ background: 'var(--c2)' }}></span> CAS — Centro de Atención</div>
                  <div className={styles.legItem}><span className={styles.legDot} style={{ background: 'var(--green)' }}></span> CON — Consulado</div>
                  <div className={styles.legItem}><span className={styles.legDot} style={{ background: 'var(--orange)' }}></span> Simulación</div>
                  <div className={styles.legItem}><span className={styles.legDot} style={{ background: '#9333EA' }}></span> Atención a cliente</div>
                </div>
              </div>
            </div>

            {/* RIGHT: side */}
            <div className={styles.side}>
              <div className={styles.panel}>
                <div className={styles.panelTitle}>
                  <IconCalendar /> Citas este mes <span className={styles.cnt}>{totalCitasMes} total</span>
                </div>
                <div className={styles.resRow}>
                  <div className={styles.resIcon} style={{ background: 'rgba(45,108,223,0.12)', color: 'var(--c2)' }}><IconPin /></div>
                  <div className={styles.resInfo}><div className={styles.resName}>Citas CAS</div><div className={styles.resMeta}>Centro de Atención</div></div>
                  <div className={styles.resCount} style={{ color: 'var(--c2)' }}>{citasDelMes.cas}</div>
                </div>
                <div className={styles.resRow}>
                  <div className={styles.resIcon} style={{ background: 'var(--green-soft)', color: 'var(--green)' }}><IconHouse /></div>
                  <div className={styles.resInfo}><div className={styles.resName}>Citas Consulado</div><div className={styles.resMeta}>Entrevista consular</div></div>
                  <div className={styles.resCount} style={{ color: 'var(--green)' }}>{citasDelMes.con}</div>
                </div>
                <div className={styles.resRow}>
                  <div className={styles.resIcon} style={{ background: 'var(--orange-soft)', color: 'var(--orange)' }}><IconMonitor /></div>
                  <div className={styles.resInfo}><div className={styles.resName}>Simulaciones</div><div className={styles.resMeta}>Práctica 1:1</div></div>
                  <div className={styles.resCount} style={{ color: 'var(--orange)' }}>{citasDelMes.sim}</div>
                </div>
                <div className={styles.resRow}>
                  <div className={styles.resIcon} style={{ background: 'rgba(147,51,234,0.12)', color: '#9333EA' }}><IconChat /></div>
                  <div className={styles.resInfo}><div className={styles.resName}>Atención a cliente</div><div className={styles.resMeta}>Vía Zoom</div></div>
                  <div className={styles.resCount} style={{ color: '#9333EA' }}>{citasDelMes.aten}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EVENT POPUP */}
        {eventoDetalle && (
          <div className={styles.evPopup} onClick={(e) => { if (e.target === e.currentTarget) setEventoDetalle(null); }}>
            <div className={styles.evModal}>
              <div className={`${styles.evModalHead} ${styles[EV_META[eventoDetalle.tipo].headClass]}`}>
                <div className={styles.evModalType}>{EV_META[eventoDetalle.tipo].type}</div>
                <div className={styles.evModalTitle}>{eventoDetalle.item.transact?.name || 'Trámite'}</div>
                <button className={styles.evModalClose} onClick={() => setEventoDetalle(null)}><IconClose /></button>
              </div>
              <div className={styles.evModalBody}>
                <div className={styles.evDetail}>
                  <div className={styles.evDetailIcon}><IconUser /></div>
                  <div><div className={styles.evDetailLbl}>Cliente</div><div className={styles.evDetailVal}>{eventoDetalle.item.user?.name || 'No disponible'}</div></div>
                </div>
                <div className={styles.evDetail}>
                  <div className={styles.evDetailIcon}><IconPhone /></div>
                  <div><div className={styles.evDetailLbl}>Teléfono</div><div className={styles.evDetailVal}>{eventoDetalle.item.user?.phone || 'No disponible'}</div></div>
                </div>
                <div className={styles.evDetail}>
                  <div className={styles.evDetailIcon}><IconCalendar /></div>
                  <div><div className={styles.evDetailLbl}>Fecha y hora</div><div className={styles.evDetailVal}>{formatFechaHora(eventoDetalle.fecha, eventoDetalle.hora)}</div></div>
                </div>
                {eventoDetalle.tipo !== 'sim' && (
                  <div className={styles.evDetail}>
                    <div className={styles.evDetailIcon}><IconPin /></div>
                    <div><div className={styles.evDetailLbl}>Ciudad</div><div className={styles.evDetailVal}>{(eventoDetalle.tipo === 'cas' ? eventoDetalle.item.casCity : eventoDetalle.item.conCity) || 'No registrada'}</div></div>
                  </div>
                )}
                <div className={styles.evDetail}>
                  <div className={styles.evDetailIcon}><IconEncargado /></div>
                  <div><div className={styles.evDetailLbl}>Encargado asignado</div><div className={styles.evDetailVal}>{eventoDetalle.item.encargado?.name || 'Sin asignar'}</div></div>
                </div>
                <button className={`${styles.btn} ${styles.btnAccent}`} style={{ width: '100%', justifyContent: 'center', marginTop: 16 }} onClick={() => navigate('/EmpresaTramites')}>
                  Ver trámite completo <IconExternal />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* NUEVA CITA MODAL */}
        {nuevaCitaAbierta && (
          <div className={styles.evPopup} onClick={(e) => { if (e.target === e.currentTarget) setNuevaCitaAbierta(false); }}>
            <div className={styles.ncModal}>
              <div className={styles.ncHead}>
                <div className={styles.ncHeadRow}>
                  <div className={styles.ncHeadIcon}><IconCalendarPlus /></div>
                  <div><div className={styles.ncEyebrow}>Agendar</div><div className={styles.ncTitle}>Nueva cita</div></div>
                </div>
                <button className={styles.ncClose} onClick={() => setNuevaCitaAbierta(false)}><IconClose size={14} /></button>
              </div>
              <div className={styles.ncBody}>
                <div className={styles.ncField}>
                  <label className={styles.ncLabel}>Tipo de cita <span className={styles.req}>*</span></label>
                  <div className={styles.ncTypes}>
                    <div className={`${styles.ncType} ${ncTipo === 'cas' ? styles.selCas : ''}`} onClick={() => setNcTipo('cas')}>
                      <div className={styles.ncTypeDot} style={{ background: 'var(--c2)' }}></div><div className={styles.ncTypeName}>CAS</div><div className={styles.ncTypeSub}>Atención</div>
                    </div>
                    <div className={`${styles.ncType} ${ncTipo === 'con' ? styles.selCon : ''}`} onClick={() => setNcTipo('con')}>
                      <div className={styles.ncTypeDot} style={{ background: 'var(--green)' }}></div><div className={styles.ncTypeName}>Consulado</div><div className={styles.ncTypeSub}>Entrevista</div>
                    </div>
                    <div className={`${styles.ncType} ${ncTipo === 'sim' ? styles.selSim : ''}`} onClick={() => setNcTipo('sim')}>
                      <div className={styles.ncTypeDot} style={{ background: 'var(--orange)' }}></div><div className={styles.ncTypeName}>Simulación</div><div className={styles.ncTypeSub}>Práctica</div>
                    </div>
                  </div>
                </div>
                <div className={styles.ncField}>
                  <label className={styles.ncLabel}>Trámite asociado <span className={styles.req}>*</span></label>
                  <select className={styles.ncInp} value={ncTramite} onChange={(e) => seleccionarTramiteNc(e.target.value)}>
                    <option value="">Selecciona un trámite</option>
                    {datos.map((d) => (
                      <option key={d.idTransactProgress} value={d.idTransactProgress}>
                        {d.transact?.name} · {d.user?.name} · #{d.idTransactProgress}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.ncField}>
                  <div className={styles.ncGrid}>
                    <div><label className={styles.ncLabel}>Fecha <span className={styles.req}>*</span></label><input className={styles.ncInp} type="date" value={ncFecha} onChange={(e) => setNcFecha(e.target.value)} /></div>
                    <div><label className={styles.ncLabel}>Hora <span className={styles.req}>*</span></label><input className={styles.ncInp} type="time" value={ncHora} onChange={(e) => setNcHora(e.target.value)} /></div>
                  </div>
                </div>
                <div className={styles.ncField}>
                  <label className={styles.ncLabel}>Ciudad / sede {ncTipo === 'sim' && <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(no aplica para simulación)</span>}</label>
                  <input className={styles.ncInp} value={ncCiudad} onChange={(e) => setNcCiudad(e.target.value)} disabled={ncTipo === 'sim'} placeholder="Ej. Ciudad de México · Hamburgo 213" />
                </div>
                <div className={styles.ncField}>
                  <label className={styles.ncLabel}>Encargado asignado</label>
                  <select className={styles.ncInp} value={ncEncargado} onChange={(e) => setNcEncargado(e.target.value)}>
                    <option value="">Sin asignar</option>
                    {encargados.map((enc) => <option key={enc.idUser} value={enc.idUser}>{enc.name}</option>)}
                  </select>
                </div>
              </div>
              <div className={styles.ncFoot}>
                <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setNuevaCitaAbierta(false)}>Cancelar</button>
                <button className={`${styles.btn} ${styles.btnAccent}`} disabled={!puedeAgendar} onClick={handleAgendar}>
                  <IconCheck /> {guardando ? 'Agendando…' : 'Agendar cita'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

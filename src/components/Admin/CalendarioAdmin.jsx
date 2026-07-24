import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { Spinner } from 'react-bootstrap';
import Navbar from '../NavbarAdmin.jsx';
import { trasacciones, listarEncargados, actualizarTC } from './../../api/api.js';
import '../../styles/CalendarioAdminJAS.css';

const DOW = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

const EV_META = {
  cas: { headClass: 'cas', type: 'Cita CAS · Centro de Atención al Solicitante' },
  con: { headClass: 'con', type: 'Cita Consular · Entrevista en el Consulado' },
  sim: { headClass: 'sim', type: 'Simulación · Práctica de entrevista 1:1' },
  aten: { headClass: 'aten', type: 'Atención a cliente · Vía Zoom' },
};

// "Cita externa" (Atención al cliente) no tiene backend: ni entidad, ni
// sistema de disponibilidad. Estos días/horarios son los mismos datos de
// demo del mockup ("Modal Nueva Cita - Simulacion (standalone).html"); la
// selección es solo visual y "Guardar cita" no persiste nada real.
const EXT_DIAS = [
  { d: '16', m: 'JUN' },
  { d: '23', m: 'MAR' },
  { d: '25', m: 'JUN' },
  { d: '30', m: 'MAR' },
];
const EXT_HORAS = [
  { hora: '09:00' },
  { hora: '10:00' },
  { hora: '12:00', disabled: true },
  { hora: '13:00' },
  { hora: '14:00' },
  { hora: '15:00', disabled: true },
  { hora: '17:00' },
  { hora: '19:00' },
];

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
function IconNcHead() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"></rect><path d="M16 2v4M8 2v4M3 10h18"></path></svg>;
}
function IconArrowRight() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>;
}
function IconChevDown() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"></path></svg>;
}
function IconCalSmall() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"></rect><path d="M16 2v4M8 2v4M3 10h18"></path></svg>;
}
function IconClockOutline() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 3"></path></svg>;
}
function IconZoomCam() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="14" height="12" rx="2"></rect><path d="M16 10l6-4v12l-6-4"></path></svg>;
}
function IconLocationPin() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 12 3a7 7 0 0 1 7 6.5C19 14.8 12 21 12 21z"></path><circle cx="12" cy="9.5" r="2.3"></circle></svg>;
}
function IconCallOutline() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C11.6 21 3 12.4 3 2c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.4 0 .8-.2 1L6.6 10.8z"></path></svg>;
}
function IconClientGroup() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"></circle><path d="M4 21c0-4 4-6 8-6s8 2 8 6"></path></svg>;
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

export default function CalendarioAdmin() {
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
  const [ncAtencion, setNcAtencion] = useState('zoom');

  const [extAbierta, setExtAbierta] = useState(false);
  const [extDia, setExtDia] = useState(0);
  const [extHora, setExtHora] = useState('10:00');
  const [extAtencion, setExtAtencion] = useState('zoom');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/'); return; }
    try {
      const decoded = jwtDecode(token);
      if (decoded.role !== 'ADMIN') {
        Swal.fire({ icon: 'error', title: 'Acceso denegado', text: 'No tienes permiso para acceder a esta página.' });
        navigate('/');
      } else {
        fetchServices();
        listarEncargados().then((res) => setEncargados(res.success ? res.response.users : [])).catch(() => setEncargados([]));
      }
    } catch (error) {
      console.error('Error decoding token:', error);
      localStorage.removeItem('token');
      navigate('/');
    }
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
    setNcAtencion('zoom');
    setNuevaCitaAbierta(true);
  };

  const abrirExterna = () => {
    setExtDia(0);
    setExtHora('10:00');
    setExtAtencion('zoom');
    setNuevaCitaAbierta(false);
    setExtAbierta(true);
  };

  const handleGuardarExterna = () => {
    Swal.fire({
      icon: 'info',
      title: 'Cita externa no conectada',
      text: 'Esta función aún no tiene un backend real donde guardar la cita (no existe entidad ni sistema de disponibilidad para "Atención al cliente").',
    });
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

  const cells = getCalendarCells(mesActual.getFullYear(), mesActual.getMonth());
  const hoyStr = toDateStr(hoy);

  const proxCas = proximaFecha('cas');
  const proxCon = proximaFecha('con');
  const proxSim = proximaFecha('sim');

  return (
    <div className="tramites-container calendario-jas-page">
      <div className="fixed-top">
        <Navbar title={'- Calendario'} />
      </div>

      <header className="topbar">
        <div>
          <div className="crumb"><span>Admin</span> <span style={{ color: 'var(--muted-2)' }}>/</span> <span className="accent">Calendario</span></div>
          <div className="page-title-h">Calendario de citas</div>
        </div>
        <div className="top-actions">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)', textTransform: 'uppercase' }}>Filtrar:</span>
            <select className="btn btn-ghost btn-sm" style={{ paddingRight: 30 }} value={filtroTramite} onChange={(e) => setFiltroTramite(e.target.value)}>
              <option value="">Todos los trámites</option>
              {tramitesUnicos.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select className="btn btn-ghost btn-sm" style={{ paddingRight: 30 }} defaultValue="">
              <option value="">Todas las empresas</option>
              <option value="JAS">Consultoría JAS (C.JAS)</option>
              <option value="CMG">Corporativo Migratorio Gutiérrez (COR.M)</option>
            </select>
          </div>
          <button className="btn btn-accent" onClick={abrirNuevaCita}><IconPlus /> Nueva cita</button>
        </div>
      </header>

      {cargando ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <div className="content">
          {/* LEFT: calendar */}
          <div>
            <div className="quick-row">
              <button className="quick-btn" onClick={() => irAMes(proxCas)}>
                <span className="quick-dot" style={{ background: 'var(--c2)' }}></span> Próximo CAS
                <span className="qb-date">{proxCas ? `${proxCas.getDate()} ${MESES_CORTOS[proxCas.getMonth()]}` : 'Sin citas'}</span>
              </button>
              <button className="quick-btn" onClick={() => irAMes(proxCon)}>
                <span className="quick-dot" style={{ background: 'var(--green)' }}></span> Próximo CON
                <span className="qb-date">{proxCon ? `${proxCon.getDate()} ${MESES_CORTOS[proxCon.getMonth()]}` : 'Sin citas'}</span>
              </button>
              <button className="quick-btn" onClick={() => irAMes(proxSim)}>
                <span className="quick-dot" style={{ background: 'var(--orange)' }}></span> Próxima Simulación
                <span className="qb-date">{proxSim ? `${proxSim.getDate()} ${MESES_CORTOS[proxSim.getMonth()]}` : 'Sin citas'}</span>
              </button>
            </div>

            <div className="cal-card">
              <div className="cal-head">
                <div className="cal-month">
                  {MESES[mesActual.getMonth()]} <span style={{ color: 'var(--muted)', fontWeight: 500 }}>{mesActual.getFullYear()}</span>
                  <div className="cal-nav">
                    <button onClick={() => setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() - 1, 1))}><IconChevronLeft /></button>
                    <button onClick={() => setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 1))}><IconChevronRight /></button>
                  </div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setMesActual(new Date(hoy.getFullYear(), hoy.getMonth(), 1))}>Hoy</button>
              </div>

              <div className="cal-grid-head">
                {DOW.map((d) => <div key={d} className="cal-dow">{d}</div>)}
              </div>
              <div className="cal-grid">
                {cells.map((cell, i) => {
                  const dateStr = toDateStr(cell.date);
                  const evs = eventosPorFecha[dateStr] || [];
                  const visibles = evs.slice(0, 2);
                  const resto = evs.length - visibles.length;
                  return (
                    <div key={i} className={`cal-cell ${cell.other ? 'other' : ''}`}>
                      <span className={`cal-daynum ${!cell.other && dateStr === hoyStr ? 'today' : ''}`}>{cell.day}</span>
                      {evs.length > 0 && (
                        <div className="cal-events">
                          {visibles.map((ev, j) => (
                            <div
                              key={j}
                              className={`cal-ev ev-${ev.tipo}`}
                              onClick={() => abrirEvento(ev.tipo, ev.item, ev.fecha, ev.hora)}
                            >
                              <span className="evdot"></span>
                              {ev.tipo === 'cas' ? 'CAS' : ev.tipo === 'con' ? 'CON' : 'Sim'} · {(ev.item.user?.name || '').split(' ').slice(0, 2).join(' ')}
                            </div>
                          ))}
                          {resto > 0 && <div className="cal-more">+{resto} más</div>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="cal-legend">
                <div className="leg-item"><span className="leg-dot" style={{ background: 'var(--c2)' }}></span> CAS — Centro de Atención</div>
                <div className="leg-item"><span className="leg-dot" style={{ background: 'var(--green)' }}></span> CON — Consulado</div>
                <div className="leg-item"><span className="leg-dot" style={{ background: 'var(--orange)' }}></span> Simulación</div>
                <div className="leg-item"><span className="leg-dot" style={{ background: '#9333EA' }}></span> Atención a cliente</div>
              </div>
            </div>
          </div>

          {/* RIGHT: side */}
          <div className="side">
            <div className="panel">
              <div className="panel-title">
                <IconCalendar /> Citas este mes <span className="cnt">{totalCitasMes} total</span>
              </div>
              <div className="res-row">
                <div className="res-icon" style={{ background: 'rgba(45,108,223,0.12)', color: 'var(--c2)' }}><IconPin /></div>
                <div className="res-info"><div className="res-name">Citas CAS</div><div className="res-meta">Centro de Atención</div></div>
                <div className="res-count" style={{ color: 'var(--c2)' }}>{citasDelMes.cas}</div>
              </div>
              <div className="res-row">
                <div className="res-icon" style={{ background: 'var(--green-soft)', color: 'var(--green)' }}><IconHouse /></div>
                <div className="res-info"><div className="res-name">Citas Consulado</div><div className="res-meta">Entrevista consular</div></div>
                <div className="res-count" style={{ color: 'var(--green)' }}>{citasDelMes.con}</div>
              </div>
              <div className="res-row">
                <div className="res-icon" style={{ background: 'var(--orange-soft)', color: 'var(--orange)' }}><IconMonitor /></div>
                <div className="res-info"><div className="res-name">Simulaciones</div><div className="res-meta">Práctica 1:1</div></div>
                <div className="res-count" style={{ color: 'var(--orange)' }}>{citasDelMes.sim}</div>
              </div>
              <div className="res-row">
                <div className="res-icon" style={{ background: 'rgba(147,51,234,0.12)', color: '#9333EA' }}><IconChat /></div>
                <div className="res-info"><div className="res-name">Atención a cliente</div><div className="res-meta">Vía Zoom</div></div>
                <div className="res-count" style={{ color: '#9333EA' }}>{citasDelMes.aten}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EVENT POPUP */}
      {eventoDetalle && (
        <div className="ev-popup" onClick={(e) => { if (e.target === e.currentTarget) setEventoDetalle(null); }}>
          <div className="ev-modal">
            <div className={`ev-modal-head ${EV_META[eventoDetalle.tipo].headClass}`}>
              <div className="ev-modal-type">{EV_META[eventoDetalle.tipo].type}</div>
              <div className="ev-modal-title">{eventoDetalle.item.transact?.name || 'Trámite'}</div>
              <button className="ev-modal-close" onClick={() => setEventoDetalle(null)}><IconClose /></button>
            </div>
            <div className="ev-modal-body">
              <div className="ev-detail">
                <div className="ev-detail-icon"><IconUser /></div>
                <div><div className="ev-detail-lbl">Cliente</div><div className="ev-detail-val">{eventoDetalle.item.user?.name || 'No disponible'}</div></div>
              </div>
              <div className="ev-detail">
                <div className="ev-detail-icon"><IconPhone /></div>
                <div><div className="ev-detail-lbl">Teléfono</div><div className="ev-detail-val">{eventoDetalle.item.user?.phone || 'No disponible'}</div></div>
              </div>
              <div className="ev-detail">
                <div className="ev-detail-icon"><IconCalendar /></div>
                <div><div className="ev-detail-lbl">Fecha y hora</div><div className="ev-detail-val">{formatFechaHora(eventoDetalle.fecha, eventoDetalle.hora)}</div></div>
              </div>
              {eventoDetalle.tipo !== 'sim' && (
                <div className="ev-detail">
                  <div className="ev-detail-icon"><IconPin /></div>
                  <div><div className="ev-detail-lbl">Ciudad</div><div className="ev-detail-val">{(eventoDetalle.tipo === 'cas' ? eventoDetalle.item.casCity : eventoDetalle.item.conCity) || 'No registrada'}</div></div>
                </div>
              )}
              <div className="ev-detail">
                <div className="ev-detail-icon"><IconEncargado /></div>
                <div><div className="ev-detail-lbl">Encargado asignado</div><div className="ev-detail-val">{eventoDetalle.item.encargado?.name || 'Sin asignar'}</div></div>
              </div>
              <button className="btn btn-accent" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }} onClick={() => navigate('/TramitesAdmin')}>
                Ver trámite completo <IconExternal />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NUEVA CITA MODAL */}
      {nuevaCitaAbierta && (
        <div className="ev-popup" onClick={(e) => { if (e.target === e.currentTarget) setNuevaCitaAbierta(false); }}>
          <div className="ncm-modal">
            <div className="ncm-head">
              <div className="ncm-head-row">
                <div className="ncm-head-icon"><IconNcHead /></div>
                <div className="ncm-head-text"><div className="ncm-eyebrow">Agendar</div><div className="ncm-title">Nueva Cita</div></div>
              </div>
              <button className="ncm-close" onClick={() => setNuevaCitaAbierta(false)}><IconClose size={13} /></button>
            </div>
            <div className="ncm-body">
              <div className="ncm-top-row">
                <div className="ncm-field-label">Tipo de cita <span className="ncm-req">*</span></div>
                <button className="ncm-ext-btn" onClick={abrirExterna}>Cita externa <IconArrowRight /></button>
              </div>
              <div className="ncm-type-grid">
                <div className={`ncm-type-card ${ncTipo === 'cas' ? 'active' : ''}`} onClick={() => setNcTipo('cas')}>
                  <div className="ncm-type-dot" style={{ background: 'var(--ncm-green, #22B07A)' }}></div>
                  <div className="ncm-type-name">CAS</div><div className="ncm-type-sub">Atención</div>
                </div>
                <div className={`ncm-type-card ${ncTipo === 'con' ? 'active' : ''}`} onClick={() => setNcTipo('con')}>
                  <div className="ncm-type-dot" style={{ background: 'var(--ncm-blue, #2D6CDF)' }}></div>
                  <div className="ncm-type-name">Consulado</div><div className="ncm-type-sub">Entrevista</div>
                </div>
                <div className={`ncm-type-card ${ncTipo === 'sim' ? 'active' : ''}`} onClick={() => setNcTipo('sim')}>
                  <div className="ncm-type-dot" style={{ background: 'var(--ncm-orange, #E08A2C)' }}></div>
                  <div className="ncm-type-name">Simulación</div><div className="ncm-type-sub">Práctica</div>
                </div>
              </div>

              <div className="ncm-field">
                <div className="ncm-field-label">Trámite asociado <span className="ncm-req">*</span></div>
                <div className="ncm-select-wrap">
                  <select value={ncTramite} onChange={(e) => seleccionarTramiteNc(e.target.value)}>
                    <option value="">Selecciona un trámite</option>
                    {datos.map((d) => (
                      <option key={d.idTransactProgress} value={d.idTransactProgress}>
                        {d.transact?.name} · {d.user?.name} · #{d.idTransactProgress}
                      </option>
                    ))}
                  </select>
                  <IconChevDown />
                </div>
              </div>

              <div className="ncm-row2">
                <div className="ncm-field">
                  <div className="ncm-field-label">Fecha <span className="ncm-req">*</span></div>
                  <div className="ncm-inp-wrap">
                    <input type="date" value={ncFecha} onChange={(e) => setNcFecha(e.target.value)} />
                    <IconCalSmall />
                  </div>
                </div>
                <div className="ncm-field">
                  <div className="ncm-field-label">Hora <span className="ncm-req">*</span></div>
                  <div className="ncm-inp-wrap">
                    <input type="time" value={ncHora} onChange={(e) => setNcHora(e.target.value)} />
                    <IconClockOutline />
                  </div>
                </div>
              </div>

              {ncTipo === 'sim' ? (
                <div className="ncm-field" style={{ marginBottom: 0 }}>
                  <div className="ncm-field-label">Tipo de atención <span className="ncm-req">*</span></div>
                  <div className="ncm-aten-grid">
                    <div className={`ncm-aten-card ${ncAtencion === 'zoom' ? 'active' : ''}`} onClick={() => setNcAtencion('zoom')}>
                      <div className="ncm-aten-icon"><IconZoomCam /></div>
                      <div className="ncm-aten-name">Zoom</div>
                    </div>
                    <div className={`ncm-aten-card ${ncAtencion === 'presencial' ? 'active' : ''}`} onClick={() => setNcAtencion('presencial')}>
                      <div className="ncm-aten-icon"><IconLocationPin /></div>
                      <div className="ncm-aten-name">Presencial</div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="ncm-field">
                    <div className="ncm-field-label">Ciudad / sede <span className="ncm-req">*</span></div>
                    <div className="ncm-inp-wrap">
                      <input value={ncCiudad} onChange={(e) => setNcCiudad(e.target.value)} placeholder="Ej. Ciudad de México · Hamburgo 213" />
                      <IconLocationPin />
                    </div>
                  </div>
                  <div className="ncm-field" style={{ marginBottom: 0 }}>
                    <div className="ncm-field-label">Admin encargado <span className="ncm-req">*</span></div>
                    <div className="ncm-select-wrap">
                      <select value={ncEncargado} onChange={(e) => setNcEncargado(e.target.value)}>
                        <option value="">Sin asignar</option>
                        {encargados.map((enc) => <option key={enc.idUser} value={enc.idUser}>{enc.name}</option>)}
                      </select>
                      <IconChevDown />
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="ncm-footer">
              <button className="ncm-btn ncm-btn-ghost" onClick={() => setNuevaCitaAbierta(false)}>Cancelar</button>
              <button className="ncm-btn ncm-btn-dark" disabled={!puedeAgendar} onClick={handleAgendar}>
                <IconCheck /> {guardando ? 'Agendando…' : 'Agendar cita'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CITA EXTERNA MODAL (Atención al cliente) */}
      {extAbierta && (
        <div className="ev-popup" onClick={(e) => { if (e.target === e.currentTarget) setExtAbierta(false); }}>
          <div className="extm-modal">
            <div className="ncm-head">
              <div className="ncm-head-row">
                <div className="ncm-head-text"><div className="ncm-eyebrow">Agendar</div><div className="ncm-title">Cita externa</div></div>
              </div>
              <button className="ncm-close" onClick={() => setExtAbierta(false)}><IconClose size={13} /></button>
            </div>
            <div className="ncm-body">
              <div className="extm-client-card">
                <div className="extm-client-icon"><IconClientGroup /></div>
                <div className="extm-client-name">Atención al cliente</div>
                <div className="extm-client-sub">Asesoría general</div>
              </div>

              <div className="ncm-field-label">Día disponible</div>
              <div className="extm-day-grid">
                {EXT_DIAS.map((dia, i) => (
                  <div key={i} className={`extm-day-card ${extDia === i ? 'active' : ''}`} onClick={() => setExtDia(i)}>
                    <div className="d">{dia.d}</div><div className="m">{dia.m}</div>
                  </div>
                ))}
              </div>

              <div className="ncm-field-label">Horario disponible <span className="ncm-req">*</span></div>
              <div className="extm-time-grid">
                {EXT_HORAS.map((h) => (
                  <div
                    key={h.hora}
                    className={`extm-time-card ${h.disabled ? 'disabled' : ''} ${extHora === h.hora ? 'active' : ''}`}
                    onClick={() => !h.disabled && setExtHora(h.hora)}
                  >
                    {h.hora}
                  </div>
                ))}
              </div>

              <div className="ncm-field" style={{ marginBottom: 0 }}>
                <div className="ncm-field-label">Tipo de atención <span className="ncm-req">*</span></div>
                <div className="ncm-aten-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
                  <div className={`ncm-aten-card ${extAtencion === 'zoom' ? 'active' : ''}`} onClick={() => setExtAtencion('zoom')}>
                    <div className="ncm-aten-icon"><IconZoomCam /></div>
                    <div className="ncm-aten-name">Zoom</div>
                  </div>
                  <div className={`ncm-aten-card ${extAtencion === 'llamada' ? 'active' : ''}`} onClick={() => setExtAtencion('llamada')}>
                    <div className="ncm-aten-icon"><IconCallOutline /></div>
                    <div className="ncm-aten-name">Llamada</div>
                  </div>
                  <div className={`ncm-aten-card ${extAtencion === 'presencial' ? 'active' : ''}`} onClick={() => setExtAtencion('presencial')}>
                    <div className="ncm-aten-icon"><IconLocationPin /></div>
                    <div className="ncm-aten-name">Presencial</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="ncm-footer">
              <button className="ncm-btn ncm-btn-ghost" onClick={() => setExtAbierta(false)}>Cancelar</button>
              <button className="ncm-btn ncm-btn-dark" onClick={handleGuardarExterna}>
                <IconCheck /> Guardar cita
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

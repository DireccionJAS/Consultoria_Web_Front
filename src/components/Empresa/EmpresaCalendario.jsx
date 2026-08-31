import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import EmpresaSidebar from './EmpresaSidebar.jsx';
import { trasacciones, listarEncargados, actualizarTC, getHorarios, getAsesorias, crearAsesoria, getAllCitas, eliminarCita } from './../../api/api.js';
import styles from './../../styles/EmpresaCalendario.module.css';
import HeaderLogoutButton from './../common/HeaderLogoutButton.jsx';

const DOW = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

const EV_META = {
  cas: { headClass: 'cas', type: 'Cita CAS · Centro de Atención al Solicitante', badge: 'CAS' },
  con: { headClass: 'con', type: 'Cita Consular · Entrevista en el Consulado', badge: 'CON' },
  sim: { headClass: 'sim', type: 'Simulación · Práctica de entrevista 1:1', badge: 'Simulación' },
  aten: { headClass: 'aten', type: 'Atención a cliente · Vía Zoom', badge: 'Atención a cliente' },
  citaSim: { headClass: 'citaSim', type: 'Simulación (autoservicio) · Agendada por el cliente', badge: 'Simulación · Cliente' },
  citaAten: { headClass: 'citaAten', type: 'Atención (autoservicio) · Agendada por el cliente', badge: 'Atención · Cliente' },
};

// "Cita externa" (Atención al cliente) no tiene entidad propia de citas, pero
// sus días/horas disponibles sí vienen del backend real: se leen de
// GET /api/horarios (tipo ATENCION_REMOTA), la misma fuente que usa
// Empresa > Horarios. Si todavía no hay nada configurado, se cae a un
// fallback con los mismos datos de demo de antes.
const EXT_HORAS_FALLBACK = [
  { hora: '09:00' },
  { hora: '10:00' },
  { hora: '12:00', disabled: true },
  { hora: '13:00' },
  { hora: '14:00' },
  { hora: '15:00', disabled: true },
  { hora: '17:00' },
  { hora: '19:00' },
];
const DIAS_SEMANA_EXT = [
  { key: 'lunes', dow: 1 }, { key: 'martes', dow: 2 }, { key: 'miercoles', dow: 3 },
  { key: 'jueves', dow: 4 }, { key: 'viernes', dow: 5 }, { key: 'sabado', dow: 6 },
];

function calcularExtDias(diasActivos, cantidad = 4) {
  const dowsActivos = DIAS_SEMANA_EXT.filter((d) => diasActivos?.[d.key]).map((d) => d.dow);
  if (dowsActivos.length === 0) return [];
  const fechas = [];
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  let cursor = new Date(hoy); cursor.setDate(cursor.getDate() + 1);
  let guard = 0;
  while (fechas.length < cantidad && guard < 60) {
    if (dowsActivos.includes(cursor.getDay())) {
      fechas.push({
        d: String(cursor.getDate()).padStart(2, '0'),
        m: MESES_CORTOS[cursor.getMonth()].slice(0, 3).toUpperCase(),
        iso: toDateStr(cursor),
      });
    }
    cursor.setDate(cursor.getDate() + 1);
    guard++;
  }
  return fechas;
}

// "Cambiar cita": no existe backend de disponibilidad de horarios (mismo
// caso que "Cita externa"), así que se muestran todos los horarios del
// mockup ("Cambiar Cita (standalone).html") sin marcar ninguno como
// ocupado. El caso "menos de 24h" (comisión de $99 MXN) es solo visual:
// no hay forma de etiquetar en Payment que un cobro es por reagendo.
const CC_HORAS_LEJOS = ['09:00', '10:00', '11:00', '12:00', '16:00', '17:00', '18:00', '19:00'];
const CC_HORAS_CERCA = ['09:00', '10:00', '12:00', '16:00'];

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
function IconWarning() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"></path><path d="M12 9v4M12 17h.01"></path></svg>;
}
function IconCard({ size = 14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"></rect><path d="M2 10h20"></path></svg>;
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
function IconVideoCam() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 7l-7 5 7 5V7z"></path><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>;
}
function IconClientGroup() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"></circle><path d="M4 21c0-4 4-6 8-6s8 2 8 6"></path></svg>;
}

// Reemplaza los <select> nativos (arrastraban el estilo del sistema
// anterior: menú del navegador, sin control del diseño) por un dropdown
// propio consistente con el resto de la app. Se usa 3 veces en este
// archivo (filtro de trámites, Trámite asociado, Admin encargado).
function RichSelect({ value, onChange, options, placeholder = 'Seleccionar', className, menuClassName }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const seleccionado = options.find((o) => o.value === value) || null;

  useEffect(() => {
    const handleOutside = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  return (
    <div className={`${styles.rsWrap} ${className || ''}`} ref={ref}>
      <div className={styles.rsTrigger} onClick={() => setOpen((o) => !o)}>
        <span className={seleccionado ? '' : styles.rsPlaceholder}>{seleccionado ? seleccionado.label : placeholder}</span>
        <IconChevDown />
      </div>
      {open && (
        <div className={`${styles.rsMenu} ${menuClassName || ''}`}>
          {options.length === 0 && <div className={styles.rsEmpty}>Sin opciones</div>}
          {options.map((o) => (
            <div
              key={o.value}
              className={`${styles.rsOpt} ${value === o.value ? styles.sel : ''}`}
              onClick={() => { onChange(o.value); setOpen(false); }}
            >
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
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
  const [asesorias, setAsesorias] = useState([]);
  const [citasReales, setCitasReales] = useState([]);
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
  const [extNombre, setExtNombre] = useState('');
  const [extApellido, setExtApellido] = useState('');
  const [extTelefono, setExtTelefono] = useState('');
  const [extGuardando, setExtGuardando] = useState(false);
  const [horarioRemoto, setHorarioRemoto] = useState(null);

  useEffect(() => {
    if (!extAbierta) return;
    getHorarios()
      .then((response) => setHorarioRemoto(response?.response?.horarios?.ATENCION_REMOTA || null))
      .catch((error) => console.error('Error al obtener horarios de atención remota:', error));
  }, [extAbierta]);

  const extDias = useMemo(() => {
    const diasObj = {};
    DIAS_SEMANA_EXT.forEach((d) => { diasObj[d.key] = (horarioRemoto?.dias || []).includes(d.dow); });
    const dias = calcularExtDias(diasObj);
    if (dias.length > 0) return dias;
    // Sin horario configurado todavía: se ofrecen los próximos días hábiles
    // (lunes a sábado) en vez de fechas de relleno sin fecha ISO real, para
    // que "Cita externa" siempre pueda guardar una fecha válida.
    return calcularExtDias({ lunes: true, martes: true, miercoles: true, jueves: true, viernes: true, sabado: true });
  }, [horarioRemoto]);
  const extHoras = useMemo(() => {
    if (!horarioRemoto?.horas?.length) return EXT_HORAS_FALLBACK;
    return horarioRemoto.horas.map((hora) => ({ hora }));
  }, [horarioRemoto]);

  const [ccAbierta, setCcAbierta] = useState(false);
  const [ccContext, setCcContext] = useState(null);
  const [ccFecha, setCcFecha] = useState('');
  const [ccHora, setCcHora] = useState('');
  const [ccPayMode, setCcPayMode] = useState('online');
  const [ccPayMethod, setCcPayMethod] = useState('stripe');
  const [ccGuardando, setCcGuardando] = useState(false);

  // Simulación sí tiene un backend real de disponibilidad (validarDisponibilidadSimulacion
  // en el backend ya valida día/hora configurados). Antes el selector de Empresa no lo
  // consultaba y dejaba elegir cualquier fecha/hora libre; ahora se marcan como
  // ocupadas/no disponibles usando la misma fuente (GET /api/horarios) y las citas
  // de Simulación ya agendadas (datos), igual que hace "Cita externa" para ATENCION_REMOTA.
  const [simHorario, setSimHorario] = useState(null);

  useEffect(() => {
    if (!nuevaCitaAbierta && !(ccAbierta && ccContext?.tipo === 'sim')) return;
    getHorarios()
      .then((response) => setSimHorario(response?.response?.horarios?.SIMULACION || null))
      .catch((error) => console.error('Error al obtener horarios de simulación:', error));
  }, [nuevaCitaAbierta, ccAbierta, ccContext?.tipo]);

  const simDiasValidos = simHorario?.dias || [];
  const simHorasValidas = useMemo(() => {
    if (simHorario?.horas?.length) return simHorario.horas;
    return CC_HORAS_LEJOS;
  }, [simHorario]);

  const simHorasTomadas = (fecha, excludeIdTransactProgress) => {
    if (!fecha) return [];
    return datos
      .filter((d) => d.idTransactProgress !== excludeIdTransactProgress && extraerFecha(d.dateSimulation) === fecha)
      .map((d) => extraerHora(d.dateSimulation))
      .filter(Boolean);
  };

  const fechaDiaValido = (fecha) => {
    if (!fecha || simDiasValidos.length === 0) return true;
    const dow = new Date(`${fecha}T00:00:00`).getDay();
    return simDiasValidos.includes(dow);
  };

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
    fetchAsesorias();
    fetchCitasReales();
  }, [navigate]);

  const fetchAsesorias = async () => {
    try {
      const res = await getAsesorias();
      setAsesorias(res.success && Array.isArray(res.response.asesorias) ? res.response.asesorias : []);
    } catch (error) {
      console.error('Error al obtener asesorías:', error);
      setAsesorias([]);
    }
  };

  const fetchCitasReales = async () => {
    try {
      const res = await getAllCitas();
      setCitasReales(res.success && Array.isArray(res.response.citas) ? res.response.citas : []);
    } catch (error) {
      console.error('Error al obtener las citas de autoservicio:', error);
      setCitasReales([]);
    }
  };

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
    if (!filtroTramite) {
      asesorias.forEach((a) => {
        if (!a.fecha) return;
        if (!map[a.fecha]) map[a.fecha] = [];
        map[a.fecha].push({ tipo: 'aten', item: a, fecha: a.fecha, hora: a.hora });
      });
      citasReales.forEach((c) => {
        if (!c.fecha) return;
        if (!map[c.fecha]) map[c.fecha] = [];
        const tipo = c.tipo === 'SIMULACION' ? 'citaSim' : 'citaAten';
        map[c.fecha].push({ tipo, item: c, fecha: c.fecha, hora: c.hora });
      });
    }
    return map;
  }, [datosFiltrados, asesorias, citasReales, filtroTramite]);

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
    const counts = { cas: 0, con: 0, sim: 0, aten: 0, citaSim: 0, citaAten: 0 };
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

  const totalCitasMes = citasDelMes.cas + citasDelMes.con + citasDelMes.sim + citasDelMes.aten + citasDelMes.citaSim + citasDelMes.citaAten;

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
    setExtNombre('');
    setExtApellido('');
    setExtTelefono('');
    setNuevaCitaAbierta(false);
    setExtAbierta(true);
  };

  const ATENCION_LABELS = { zoom: 'Zoom', videollamada: 'Videollamada', presencial: 'Presencial' };

  const handleGuardarExterna = async () => {
    if (!extNombre.trim() || !extApellido.trim() || !extTelefono.trim() || !extHora) {
      Swal.fire({ icon: 'warning', title: 'Faltan datos', text: 'Nombre, apellido, teléfono y horario son obligatorios.' });
      return;
    }
    const fechaSeleccionada = extDias[extDia]?.iso;
    if (!fechaSeleccionada) {
      Swal.fire({ icon: 'error', title: 'Sin fecha disponible', text: 'No hay un día válido seleccionado.' });
      return;
    }
    setExtGuardando(true);
    try {
      const res = await crearAsesoria({
        nombre: extNombre.trim(),
        apellido: extApellido.trim(),
        telefono: extTelefono.trim(),
        tipoAtencion: ATENCION_LABELS[extAtencion] || extAtencion,
        fecha: fechaSeleccionada,
        hora: extHora,
      });
      if (!res?.success) throw new Error(res?.message || 'No se pudo guardar la cita externa');
      await fetchAsesorias();
      setExtAbierta(false);
      Swal.fire({ icon: 'success', title: 'Cita externa guardada', text: 'Ya aparece en el calendario.' });
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'No se pudo guardar', text: error.message || 'Ocurrió un error al guardar la cita externa.' });
    } finally {
      setExtGuardando(false);
    }
  };

  const abrirCambiarCita = () => {
    if (!eventoDetalle) return;
    setCcContext({ tipo: eventoDetalle.tipo, item: eventoDetalle.item, fecha: eventoDetalle.fecha, hora: eventoDetalle.hora });
    setCcFecha(eventoDetalle.fecha || '');
    setCcHora('');
    setCcPayMode('online');
    setCcPayMethod('stripe');
    setEventoDetalle(null);
    setCcAbierta(true);
  };

  const ccEsUrgente = ccContext?.fecha && ccContext?.hora
    ? (new Date(`${ccContext.fecha}T${ccContext.hora}:00`) - new Date()) < 24 * 60 * 60 * 1000
    : false;

  const handleCancelarCitaReal = async () => {
    if (!eventoDetalle) return;
    const confirm = await Swal.fire({
      icon: 'warning',
      title: '¿Cancelar esta cita?',
      text: 'Se eliminará la cita agendada por el cliente en su portal.',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No',
    });
    if (!confirm.isConfirmed) return;
    try {
      const res = await eliminarCita(eventoDetalle.item.idCita);
      if (!res?.success) throw new Error(res?.message || 'No se pudo cancelar la cita');
      await fetchCitasReales();
      setEventoDetalle(null);
      Swal.fire({ icon: 'success', title: 'Cita cancelada', text: 'La cita fue eliminada correctamente.' });
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'No se pudo cancelar', text: error.message || 'Ocurrió un error al cancelar la cita.' });
    }
  };

  const handleCancelarCita = async () => {
    if (!eventoDetalle) return;
    const { tipo, item } = eventoDetalle;
    const confirm = await Swal.fire({
      icon: 'warning',
      title: '¿Cancelar esta cita?',
      text: 'Se eliminará la cita agendada. El cliente podrá agendar una nueva.',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No',
    });
    if (!confirm.isConfirmed) return;
    const payload = { ...item };
    if (tipo === 'cas') payload.dateCas = null;
    if (tipo === 'con') payload.dateCon = null;
    if (tipo === 'sim') payload.dateSimulation = null;
    try {
      const res = await actualizarTC(item.idTransactProgress, payload);
      if (!res?.success) throw new Error(res?.message || 'No se pudo cancelar la cita');
      await fetchServices();
      setEventoDetalle(null);
      Swal.fire({ icon: 'success', title: 'Cita cancelada', text: 'La cita fue eliminada correctamente.' });
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'No se pudo cancelar', text: error.message || 'Ocurrió un error al cancelar la cita.' });
    }
  };

  const handleConfirmarCambioLejos = async () => {
    if (!ccContext || !ccFecha || !ccHora) return;
    setCcGuardando(true);
    const fechaHora = `${ccFecha} ${ccHora}:00`;
    const payload = { ...ccContext.item };
    if (ccContext.tipo === 'cas') payload.dateCas = fechaHora;
    if (ccContext.tipo === 'con') payload.dateCon = fechaHora;
    if (ccContext.tipo === 'sim') payload.dateSimulation = fechaHora;
    try {
      const res = await actualizarTC(ccContext.item.idTransactProgress, payload);
      if (!res?.success) throw new Error(res?.message || 'No se pudo cambiar la cita');
      await fetchServices();
      setCcAbierta(false);
      Swal.fire({ icon: 'success', title: 'Cita reagendada', text: 'La nueva fecha y hora se guardaron correctamente.' });
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'No se pudo cambiar la cita', text: error.message || 'Ocurrió un error al reagendar la cita.' });
    } finally {
      setCcGuardando(false);
    }
  };

  const handleConfirmarCambioCerca = () => {
    if (ccPayMode === 'wa') {
      window.open('https://wa.me/527772193613', '_blank');
      return;
    }
    Swal.fire({
      icon: 'info',
      title: 'Cobro de comisión no conectado',
      text: 'El cobro de $99 MXN por cambio con menos de 24 horas aún no está conectado a un pago real (no existe forma de etiquetar en Payment que un cobro es por reagendo).',
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

  const handleNavigate = (key) => {
    console.log('Navegar a sección de sidebar:', key);
  };

  const esCitaCliente = eventoDetalle?.tipo === 'citaSim' || eventoDetalle?.tipo === 'citaAten';

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
            <HeaderLogoutButton />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)', textTransform: 'uppercase' }}>Filtrar:</span>
              <RichSelect
                className={styles.inline}
                value={filtroTramite}
                onChange={setFiltroTramite}
                placeholder="Todos los trámites"
                options={[{ value: '', label: 'Todos los trámites' }, ...tramitesUnicos.map((t) => ({ value: t, label: t }))]}
              />
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
                                className={`${styles.calEv} ${
                                  ev.tipo === 'cas' ? styles.evCas :
                                  ev.tipo === 'con' ? styles.evCon :
                                  ev.tipo === 'aten' ? styles.evAten :
                                  ev.tipo === 'citaSim' ? styles.evCitaSim :
                                  ev.tipo === 'citaAten' ? styles.evCitaAten :
                                  styles.evSim
                                }`}
                                onClick={() => abrirEvento(ev.tipo, ev.item, ev.fecha, ev.hora)}
                              >
                                <span className={styles.evdot}></span>
                                {
                                  ev.tipo === 'cas' ? 'CAS' :
                                  ev.tipo === 'con' ? 'CON' :
                                  ev.tipo === 'aten' ? 'Atención' :
                                  ev.tipo === 'citaSim' ? 'Simulación' :
                                  ev.tipo === 'citaAten' ? 'Atención' :
                                  'Simulación'
                                } · {
                                  ev.tipo === 'aten' ? ev.item.nombre :
                                  (ev.tipo === 'citaSim' || ev.tipo === 'citaAten') ? (ev.item.nombreUsuario || '').split(' ').slice(0, 2).join(' ') :
                                  (ev.item.user?.name || '').split(' ').slice(0, 2).join(' ')
                                }
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
                  <div className={styles.legItem}><span className={styles.legDot} style={{ background: '#0E9F8C' }}></span> Simulación (autoservicio)</div>
                  <div className={styles.legItem}><span className={styles.legDot} style={{ background: '#DB2777' }}></span> Atención (autoservicio)</div>
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
                <div className={styles.resRow}>
                  <div className={styles.resIcon} style={{ background: 'rgba(14,159,140,0.12)', color: '#0E9F8C' }}><IconMonitor /></div>
                  <div className={styles.resInfo}><div className={styles.resName}>Simulación (autoservicio)</div><div className={styles.resMeta}>Agendada por el cliente</div></div>
                  <div className={styles.resCount} style={{ color: '#0E9F8C' }}>{citasDelMes.citaSim}</div>
                </div>
                <div className={styles.resRow}>
                  <div className={styles.resIcon} style={{ background: 'rgba(219,39,119,0.12)', color: '#DB2777' }}><IconChat /></div>
                  <div className={styles.resInfo}><div className={styles.resName}>Atención (autoservicio)</div><div className={styles.resMeta}>Agendada por el cliente</div></div>
                  <div className={styles.resCount} style={{ color: '#DB2777' }}>{citasDelMes.citaAten}</div>
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
                <div className={styles.evModalBadge}><span className={styles.dot}></span> {EV_META[eventoDetalle.tipo].badge}</div>
                <div className={styles.evModalTitle}>{eventoDetalle.tipo === 'aten' ? 'Asesoría gratuita' : esCitaCliente ? (eventoDetalle.item.nombreTramite || 'Cita de autoservicio') : (eventoDetalle.item.transact?.name || 'Trámite')}</div>
                <button className={styles.evModalClose} onClick={() => setEventoDetalle(null)}><IconClose /></button>
              </div>
              <div className={styles.evModalBody}>
                <div className={styles.evDetail}>
                  <div className={`${styles.evDetailIcon} ${styles[eventoDetalle.tipo]}`}><IconUser /></div>
                  <div><div className={styles.evDetailLbl}>Cliente</div><div className={styles.evDetailVal}>{eventoDetalle.tipo === 'aten' ? `${eventoDetalle.item.nombre} ${eventoDetalle.item.apellido}` : esCitaCliente ? (eventoDetalle.item.nombreUsuario || 'No disponible') : (eventoDetalle.item.user?.name || 'No disponible')}</div></div>
                </div>
                <div className={styles.evDetail}>
                  <div className={`${styles.evDetailIcon} ${styles[eventoDetalle.tipo]}`}><IconPhone /></div>
                  <div><div className={styles.evDetailLbl}>Teléfono</div><div className={styles.evDetailVal}>{eventoDetalle.tipo === 'aten' ? eventoDetalle.item.telefono : esCitaCliente ? (eventoDetalle.item.telefono || 'No disponible') : (eventoDetalle.item.user?.phone || 'No disponible')}</div></div>
                </div>
                <div className={styles.evDetail}>
                  <div className={`${styles.evDetailIcon} ${styles[eventoDetalle.tipo]}`}><IconCalendar /></div>
                  <div><div className={styles.evDetailLbl}>Fecha y hora</div><div className={styles.evDetailVal}>{formatFechaHora(eventoDetalle.fecha, eventoDetalle.hora)}</div></div>
                </div>
                <div className={styles.evDetail}>
                  <div className={`${styles.evDetailIcon} ${styles[eventoDetalle.tipo]}`}><IconPin /></div>
                  <div><div className={styles.evDetailLbl}>Ubicación</div><div className={styles.evDetailVal}>{eventoDetalle.tipo === 'aten' ? eventoDetalle.item.tipoAtencion : esCitaCliente ? 'Modalidad por confirmar' : eventoDetalle.tipo === 'sim' ? 'Modalidad por confirmar' : ((eventoDetalle.tipo === 'cas' ? eventoDetalle.item.casCity : eventoDetalle.item.conCity) || 'No registrada')}</div></div>
                </div>
                {eventoDetalle.tipo !== 'aten' && !esCitaCliente && (
                  <div className={styles.evDetail}>
                    <div className={`${styles.evDetailIcon} ${styles[eventoDetalle.tipo]}`}><IconEncargado /></div>
                    <div><div className={styles.evDetailLbl}>Encargado asignado</div><div className={styles.evDetailVal}>{eventoDetalle.item.encargado?.name || 'Sin asignar'}</div></div>
                  </div>
                )}
                {eventoDetalle.tipo === 'aten' && (
                  <div className={styles.evDetail}>
                    <div className={`${styles.evDetailIcon} ${styles[eventoDetalle.tipo]}`}><IconChat /></div>
                    <div><div className={styles.evDetailLbl}>Origen</div><div className={styles.evDetailVal}>Solicitud desde la página pública — confírmala por WhatsApp/teléfono</div></div>
                  </div>
                )}
                {esCitaCliente && (
                  <div className={styles.evDetail}>
                    <div className={`${styles.evDetailIcon} ${styles[eventoDetalle.tipo]}`}><IconChat /></div>
                    <div><div className={styles.evDetailLbl}>Origen</div><div className={styles.evDetailVal}>Cita de autoservicio agendada por el cliente en su portal</div></div>
                  </div>
                )}
                {eventoDetalle.tipo !== 'aten' && !esCitaCliente && <>
                <button className={`${styles.btn} ${styles.btnGhost}`} style={{ width: '100%', justifyContent: 'center', marginTop: 16 }} onClick={abrirCambiarCita}>
                  <IconCalSmall /> Cambiar cita
                </button>
                <button className={`${styles.btn} ${styles.btnDanger}`} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} onClick={handleCancelarCita}>
                  <IconClose size={13} /> Cancelar cita
                </button>
                <button className={`${styles.btn} ${styles.btnAccent}`} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} onClick={() => navigate('/EmpresaTramites')}>
                  Ver trámite completo <IconExternal />
                </button>
                </>}
                {esCitaCliente && (
                  <button className={`${styles.btn} ${styles.btnDanger}`} style={{ width: '100%', justifyContent: 'center', marginTop: 16 }} onClick={handleCancelarCitaReal}>
                    <IconClose size={13} /> Cancelar cita
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CAMBIAR CITA MODAL - extraído 1:1 de "Cambiar Cita (standalone).html" */}
        {ccAbierta && ccContext && (
          <div className={styles.evPopup} onClick={(e) => { if (e.target === e.currentTarget) setCcAbierta(false); }}>
            <div className={styles.ccModal}>
              <div className={styles.ccHead}>
                <div className={styles.ccEyebrow}>Reagendar</div>
                <div className={styles.ccTitle}>Cambiar cita</div>
                <button className={styles.ccClose} onClick={() => setCcAbierta(false)}><IconClose /></button>
              </div>
              <div className={styles.ccBody}>
                <div className={styles.ccSecLabel}>Cita actual</div>
                <div className={styles.ccCurrent}>
                  <div className={styles.ccCurDate}>
                    <div className={styles.ccCurDay}>{ccContext.fecha ? ccContext.fecha.slice(8, 10) : '--'}</div>
                    <div className={styles.ccCurMon}>{ccContext.fecha ? MESES_CORTOS[Number(ccContext.fecha.slice(5, 7)) - 1] : ''}</div>
                  </div>
                  <div className={styles.ccCurInfo}>
                    <div className={styles.ccCurType}>{ccContext.item.transact?.name || 'Trámite'}</div>
                    <div className={styles.ccCurTime}><IconClockOutline /> {formatFechaHora(ccContext.fecha, ccContext.hora)}</div>
                  </div>
                  {ccEsUrgente && <div className={styles.ccCurBadge}>EN &lt;24H</div>}
                </div>

                <div className={styles.ccSecLabel}>Nueva cita</div>
                <div className={styles.ccField}>
                  <label className={styles.ccFieldLabel}>Nuevo día <span className={styles.ccReq}>*</span></label>
                  <div className={styles.ccInpWrap}>
                    <span className={styles.ccInpIcon}><IconCalSmall /></span>
                    <input className={styles.ccInp} type="date" value={ccFecha} onChange={(e) => { setCcFecha(e.target.value); setCcHora(''); }} />
                  </div>
                  {ccContext.tipo === 'sim' && ccFecha && !fechaDiaValido(ccFecha) && (
                    <div className={styles.ccWarnText} style={{ marginTop: 6, color: 'var(--danger, #d33)' }}>
                      Ese día no está configurado para Simulación.
                    </div>
                  )}
                </div>
                <div className={styles.ccField}>
                  <label className={styles.ccFieldLabel}>Nueva hora <span className={styles.ccReq}>*</span></label>
                  <div className={styles.ccTimePills}>
                    {(ccContext.tipo === 'sim' ? simHorasValidas : (ccEsUrgente ? CC_HORAS_CERCA : CC_HORAS_LEJOS)).map((h) => {
                      const ocupada = ccContext.tipo === 'sim' && simHorasTomadas(ccFecha, ccContext.item.idTransactProgress).includes(h);
                      return (
                        <div
                          key={h}
                          className={`${styles.ccTimePill} ${ccHora === h ? styles.sel : ''} ${ocupada ? styles.disabled : ''}`}
                          onClick={() => !ocupada && setCcHora(h)}
                        >
                          {h}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {ccEsUrgente && (
                  <div className={styles.ccWarn}>
                    <div className={styles.ccWarnTop}>
                      <IconWarning />
                      <div className={styles.ccWarnText}>Este cambio genera una comisión de <strong>$99 MXN</strong> por realizarse con menos de 24 horas de anticipación.</div>
                    </div>
                    <div className={styles.ccPayQ}>¿Cómo deseas resolver el pago?</div>
                    <div className={styles.ccPayToggle}>
                      <div className={`${styles.ccPayToggleOpt} ${ccPayMode === 'online' ? styles.active : ''}`} onClick={() => setCcPayMode('online')}>Pagar en línea</div>
                      <div className={`${styles.ccPayToggleOpt} ${ccPayMode === 'wa' ? styles.active : ''}`} onClick={() => setCcPayMode('wa')}>Contactar a la empresa</div>
                    </div>
                    {ccPayMode === 'online' ? (
                      <div className={styles.ccPayMethods}>
                        <div className={`${styles.ccPayMethod} ${ccPayMethod === 'stripe' ? styles.sel : ''}`} onClick={() => setCcPayMethod('stripe')}>
                          <div className={styles.ccPmLogo} style={{ background: '#635bff' }}>Stripe</div><div className={styles.ccPmName}>Tarjeta</div>
                        </div>
                        <div className={`${styles.ccPayMethod} ${ccPayMethod === 'paypal' ? styles.sel : ''}`} onClick={() => setCcPayMethod('paypal')}>
                          <div className={styles.ccPmLogo} style={{ background: '#003087', color: '#ffc439' }}>PayPal</div><div className={styles.ccPmName}>PayPal</div>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.ccPresNote}><IconChat /> Te conectaremos por WhatsApp con Consultoría JAS para coordinar el pago y confirmar tu cambio de cita.</div>
                    )}
                  </div>
                )}
              </div>
              <div className={styles.ccFoot}>
                {ccEsUrgente ? (
                  <button className={`${styles.ccBtn} ${styles.ccBtnPrimary}`} onClick={handleConfirmarCambioCerca}>
                    {ccPayMode === 'online' ? (<><IconCard /> Pagar $99 y confirmar cambio</>) : (<><IconChat /> Abrir WhatsApp de Consultoría JAS</>)}
                  </button>
                ) : (
                  <button className={`${styles.ccBtn} ${styles.ccBtnPrimary}`} disabled={!ccFecha || !ccHora || ccGuardando} onClick={handleConfirmarCambioLejos}>
                    <IconCheck /> {ccGuardando ? 'Guardando…' : 'Confirmar cambio'}
                  </button>
                )}
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
                  <div className={styles.ncHeadIcon}><IconNcHead /></div>
                  <div><div className={styles.ncEyebrow}>Agendar</div><div className={styles.ncTitle}>Nueva Cita</div></div>
                </div>
                <button className={styles.ncClose} onClick={() => setNuevaCitaAbierta(false)}><IconClose size={13} /></button>
              </div>
              <div className={styles.ncBody}>
                <div className={styles.ncTopRow}>
                  <div className={styles.ncFieldLabel}>Tipo de cita <span className={styles.req}>*</span></div>
                  <button className={styles.ncExtBtn} onClick={abrirExterna}>Cita externa <IconArrowRight /></button>
                </div>
                <div className={styles.ncTypeGrid}>
                  <div className={`${styles.ncTypeCard} ${ncTipo === 'cas' ? styles.active : ''}`} onClick={() => setNcTipo('cas')}>
                    <div className={styles.ncTypeDot} style={{ background: 'var(--ncmGreen, #22B07A)' }}></div>
                    <div className={styles.ncTypeName}>CAS</div><div className={styles.ncTypeSub}>Atención</div>
                  </div>
                  <div className={`${styles.ncTypeCard} ${ncTipo === 'con' ? styles.active : ''}`} onClick={() => setNcTipo('con')}>
                    <div className={styles.ncTypeDot} style={{ background: 'var(--ncmBlue, #2D6CDF)' }}></div>
                    <div className={styles.ncTypeName}>Consulado</div><div className={styles.ncTypeSub}>Entrevista</div>
                  </div>
                  <div className={`${styles.ncTypeCard} ${ncTipo === 'sim' ? styles.active : ''}`} onClick={() => setNcTipo('sim')}>
                    <div className={styles.ncTypeDot} style={{ background: 'var(--ncmOrange, #E08A2C)' }}></div>
                    <div className={styles.ncTypeName}>Simulación</div><div className={styles.ncTypeSub}>Práctica</div>
                  </div>
                </div>

                <div className={styles.ncField}>
                  <div className={styles.ncFieldLabel}>Trámite asociado <span className={styles.req}>*</span></div>
                  <RichSelect
                    className={styles.block}
                    value={ncTramite}
                    onChange={seleccionarTramiteNc}
                    placeholder="Selecciona un trámite"
                    options={datos.map((d) => ({
                      value: String(d.idTransactProgress),
                      label: `${d.transact?.name} · ${d.user?.name} · #${d.idTransactProgress}`,
                    }))}
                  />
                </div>

                <div className={styles.ncRow2}>
                  <div className={styles.ncField}>
                    <div className={styles.ncFieldLabel}>Fecha <span className={styles.req}>*</span></div>
                    <div className={styles.ncInpWrap}>
                      <input type="date" value={ncFecha} onChange={(e) => { setNcFecha(e.target.value); setNcHora(''); }} />
                      <IconCalSmall />
                    </div>
                    {ncTipo === 'sim' && ncFecha && !fechaDiaValido(ncFecha) && (
                      <div className={styles.ccWarnText} style={{ marginTop: 6, color: 'var(--danger, #d33)' }}>
                        Ese día no está configurado para Simulación.
                      </div>
                    )}
                  </div>
                  <div className={styles.ncField}>
                    <div className={styles.ncFieldLabel}>Hora <span className={styles.req}>*</span></div>
                    {ncTipo === 'sim' ? (
                      <div className={styles.ccTimePills}>
                        {simHorasValidas.map((h) => {
                          const ocupada = simHorasTomadas(ncFecha).includes(h);
                          return (
                            <div
                              key={h}
                              className={`${styles.ccTimePill} ${ncHora === h ? styles.sel : ''} ${ocupada ? styles.disabled : ''}`}
                              onClick={() => !ocupada && setNcHora(h)}
                            >
                              {h}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className={styles.ncInpWrap}>
                        <input type="time" value={ncHora} onChange={(e) => setNcHora(e.target.value)} />
                        <IconClockOutline />
                      </div>
                    )}
                  </div>
                </div>

                {ncTipo === 'sim' ? (
                  <div className={styles.ncField} style={{ marginBottom: 0 }}>
                    <div className={styles.ncFieldLabel}>Tipo de atención <span className={styles.req}>*</span></div>
                    <div className={styles.ncAtenGrid}>
                      <div className={`${styles.ncAtenCard} ${ncAtencion === 'zoom' ? styles.active : ''}`} onClick={() => setNcAtencion('zoom')}>
                        <div className={styles.ncAtenIcon}><IconZoomCam /></div>
                        <div className={styles.ncAtenName}>Zoom</div>
                      </div>
                      <div className={`${styles.ncAtenCard} ${ncAtencion === 'presencial' ? styles.active : ''}`} onClick={() => setNcAtencion('presencial')}>
                        <div className={styles.ncAtenIcon}><IconLocationPin /></div>
                        <div className={styles.ncAtenName}>Presencial</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={styles.ncField}>
                      <div className={styles.ncFieldLabel}>Ciudad / sede <span className={styles.req}>*</span></div>
                      <div className={styles.ncInpWrap}>
                        <input value={ncCiudad} onChange={(e) => setNcCiudad(e.target.value)} placeholder="Ej. Ciudad de México · Hamburgo 213" />
                        <IconLocationPin />
                      </div>
                    </div>
                    <div className={styles.ncField} style={{ marginBottom: 0 }}>
                      <div className={styles.ncFieldLabel}>Admin encargado <span className={styles.req}>*</span></div>
                      <RichSelect
                        className={styles.block}
                        value={ncEncargado}
                        onChange={setNcEncargado}
                        placeholder="Sin asignar"
                        options={encargados.map((enc) => ({ value: String(enc.idUser), label: enc.name }))}
                      />
                    </div>
                  </>
                )}
              </div>
              <div className={styles.ncFoot}>
                <button className={`${styles.ncBtn} ${styles.ncBtnGhost}`} onClick={() => setNuevaCitaAbierta(false)}>Cancelar</button>
                <button className={`${styles.ncBtn} ${styles.ncBtnDark}`} disabled={!puedeAgendar} onClick={handleAgendar}>
                  <IconCheck /> {guardando ? 'Agendando…' : 'Agendar cita'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CITA EXTERNA MODAL (Atención al cliente) */}
        {extAbierta && (
          <div className={styles.evPopup} onClick={(e) => { if (e.target === e.currentTarget) setExtAbierta(false); }}>
            <div className={styles.extModal}>
              <div className={styles.ncHead}>
                <div className={styles.ncHeadRow}>
                  <div><div className={styles.ncEyebrow}>Agendar</div><div className={styles.ncTitle}>Cita externa</div></div>
                </div>
                <button className={styles.ncClose} onClick={() => setExtAbierta(false)}><IconClose size={13} /></button>
              </div>
              <div className={styles.ncBody}>
                <div className={styles.extClientCard}>
                  <div className={styles.extClientIcon}><IconClientGroup /></div>
                  <div className={styles.extClientName}>Atención al cliente</div>
                  <div className={styles.extClientSub}>Asesoría general</div>
                </div>

                <div className={styles.ncRow2}>
                  <div className={styles.ncField}>
                    <div className={styles.ncFieldLabel}>Nombre <span className={styles.req}>*</span></div>
                    <div className={styles.ncInpWrap}>
                      <input value={extNombre} onChange={(e) => setExtNombre(e.target.value)} placeholder="Nombre" />
                    </div>
                  </div>
                  <div className={styles.ncField}>
                    <div className={styles.ncFieldLabel}>Apellido <span className={styles.req}>*</span></div>
                    <div className={styles.ncInpWrap}>
                      <input value={extApellido} onChange={(e) => setExtApellido(e.target.value)} placeholder="Apellido" />
                    </div>
                  </div>
                </div>
                <div className={styles.ncField}>
                  <div className={styles.ncFieldLabel}>Teléfono <span className={styles.req}>*</span></div>
                  <div className={styles.ncInpWrap}>
                    <input value={extTelefono} onChange={(e) => setExtTelefono(e.target.value)} placeholder="Ej. 777 123 4567" />
                    <IconPhone />
                  </div>
                </div>

                <div className={styles.ncFieldLabel}>Día disponible</div>
                <div className={styles.extDayGrid}>
                  {extDias.map((dia, i) => (
                    <div key={i} className={`${styles.extDayCard} ${extDia === i ? styles.active : ''}`} onClick={() => setExtDia(i)}>
                      <div className={styles.d}>{dia.d}</div><div className={styles.m}>{dia.m}</div>
                    </div>
                  ))}
                </div>

                <div className={styles.ncFieldLabel}>Horario disponible <span className={styles.req}>*</span></div>
                <div className={styles.extTimeGrid}>
                  {extHoras.map((h) => (
                    <div
                      key={h.hora}
                      className={`${styles.extTimeCard} ${h.disabled ? styles.disabled : ''} ${extHora === h.hora ? styles.active : ''}`}
                      onClick={() => !h.disabled && setExtHora(h.hora)}
                    >
                      {h.hora}
                    </div>
                  ))}
                </div>

                <div className={styles.ncField} style={{ marginBottom: 0 }}>
                  <div className={styles.ncFieldLabel}>Tipo de atención <span className={styles.req}>*</span></div>
                  <div className={styles.ncAtenGrid} style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
                    <div className={`${styles.ncAtenCard} ${extAtencion === 'zoom' ? styles.active : ''}`} onClick={() => setExtAtencion('zoom')}>
                      <div className={styles.ncAtenIcon}><IconZoomCam /></div>
                      <div className={styles.ncAtenName}>Zoom</div>
                    </div>
                    <div className={`${styles.ncAtenCard} ${extAtencion === 'videollamada' ? styles.active : ''}`} onClick={() => setExtAtencion('videollamada')}>
                      <div className={styles.ncAtenIcon}><IconVideoCam /></div>
                      <div className={styles.ncAtenName}>Videollamada</div>
                    </div>
                    <div className={`${styles.ncAtenCard} ${extAtencion === 'presencial' ? styles.active : ''}`} onClick={() => setExtAtencion('presencial')}>
                      <div className={styles.ncAtenIcon}><IconLocationPin /></div>
                      <div className={styles.ncAtenName}>Presencial</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.ncFoot}>
                <button className={`${styles.ncBtn} ${styles.ncBtnGhost}`} onClick={() => setExtAbierta(false)}>Cancelar</button>
                <button className={`${styles.ncBtn} ${styles.ncBtnDark}`} disabled={extGuardando} onClick={handleGuardarExterna}>
                  <IconCheck /> {extGuardando ? 'Guardando…' : 'Guardar cita'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

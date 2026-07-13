import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import Navbar from '../NavbarAdmin.jsx';
import '../../styles/HorariosAdminJAS.css';

// Página nueva: no existe ninguna entidad ni endpoint en el backend para
// guardar horarios/disponibilidad (ni de Simulación ni de Atención al
// cliente). Extraída 1:1 de "20-Horarios (standalone).html". "Guardar"
// solo muestra un aviso — no persiste nada real, igual que "Cita externa"
// en el Calendario.

const DIAS = [
  { key: 'lunes', label: 'Lunes', dow: 1 },
  { key: 'martes', label: 'Martes', dow: 2 },
  { key: 'miercoles', label: 'Miércoles', dow: 3 },
  { key: 'jueves', label: 'Jueves', dow: 4 },
  { key: 'viernes', label: 'Viernes', dow: 5 },
  { key: 'sabado', label: 'Sábado', dow: 6 },
];
const DOW_CORTO = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

const HORAS_SIM = ['8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
const HORAS_REMOTA = ['8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];

function diasIniciales(activos) {
  const obj = {};
  DIAS.forEach((d) => { obj[d.key] = activos.includes(d.key); });
  return obj;
}
function horasIniciales(lista, activas) {
  const obj = {};
  lista.forEach((h) => { obj[h] = activas.includes(h); });
  return obj;
}

const SIM_DIAS_DEFAULT = diasIniciales(['lunes', 'miercoles', 'viernes']);
const SIM_HORAS_DEFAULT = horasIniciales(HORAS_SIM, ['8:00', '9:00', '10:00', '11:00', '12:00', '15:00', '16:00', '17:00', '18:00']);

const LLAMADA_DIAS_DEFAULT = diasIniciales(['lunes', 'martes', 'miercoles', 'jueves', 'viernes']);
const LLAMADA_HORAS_DEFAULT = horasIniciales(HORAS_REMOTA, ['8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']);

const VIDEO_DIAS_DEFAULT = diasIniciales(['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']);
const VIDEO_HORAS_DEFAULT = horasIniciales(HORAS_REMOTA, ['8:00', '9:00', '10:00', '11:00', '12:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00']);

const MENSAJE_DIAS_DEFAULT = diasIniciales(['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']);
const MENSAJE_HORAS_DEFAULT = horasIniciales(HORAS_REMOTA, HORAS_REMOTA);

function IconMonitor() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="4" width="20" height="14" rx="2"></rect><path d="M8 22h8M12 18v4"></path></svg>;
}
function IconUser({ size = 14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="7" r="4"></circle><path d="M3 21v-1a7 7 0 0 1 14 0v1"></path></svg>;
}
function IconCheck({ size = 13 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12l5 5L20 7"></path></svg>;
}
function IconCheckTiny() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12l5 5L20 7"></path></svg>;
}
function IconClockOutline({ size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg>;
}
function IconPin({ size = 18 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
}
function IconPhone({ size = 13 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>;
}
function IconVideo({ size = 18 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 10l4.55-2.27A1 1 0 0 1 21 8.6v6.8a1 1 0 0 1-1.45.87L15 14M3 6h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"></path></svg>;
}
function IconChat({ size = 13 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 17 0z"></path></svg>;
}
function IconLock() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
}
function IconAlert() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4M12 8h.01"></path></svg>;
}

function DayChips({ dias, onToggle }) {
  return (
    <div className="days">
      {DIAS.map((d) => (
        <label key={d.key} className={`day-chip ${dias[d.key] ? 'on' : ''}`} onClick={() => onToggle(d.key)}>
          <span className="day-box">{dias[d.key] && <IconCheckTiny />}</span>
          <span className="day-name">{d.label}</span>
        </label>
      ))}
    </div>
  );
}

function HourChips({ horas, lista, onToggle }) {
  return (
    <div className="hours" style={{ gridTemplateColumns: 'repeat(7,1fr)' }}>
      {lista.map((h) => (
        <div key={h} className={`hour-chip ${horas[h] ? 'on' : ''}`} onClick={() => onToggle(h)}>{h}</div>
      ))}
    </div>
  );
}

function proximasFechas(dias, cantidad = 6) {
  const dowsActivos = DIAS.filter((d) => dias[d.key]).map((d) => d.dow);
  if (dowsActivos.length === 0) return [];
  const fechas = [];
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  let cursor = new Date(hoy);
  cursor.setDate(cursor.getDate() + 1);
  let guard = 0;
  while (fechas.length < cantidad && guard < 60) {
    if (dowsActivos.includes(cursor.getDay())) {
      fechas.push(new Date(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
    guard++;
  }
  return fechas;
}

export default function AdministradorHorarios() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('sim');
  const [activeSubTab, setActiveSubTab] = useState('llamada');

  const [simDias, setSimDias] = useState(SIM_DIAS_DEFAULT);
  const [simHoras, setSimHoras] = useState(SIM_HORAS_DEFAULT);

  const [remota, setRemota] = useState({
    llamada: { dias: LLAMADA_DIAS_DEFAULT, horas: LLAMADA_HORAS_DEFAULT },
    video: { dias: VIDEO_DIAS_DEFAULT, horas: VIDEO_HORAS_DEFAULT },
    mensaje: { dias: MENSAJE_DIAS_DEFAULT, horas: MENSAJE_HORAS_DEFAULT },
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/'); return; }
    try {
      const decoded = jwtDecode(token);
      if (decoded.role !== 'ADMIN') {
        Swal.fire({ icon: 'error', title: 'Acceso denegado', text: 'No tienes permiso para acceder a esta página.' });
        navigate('/');
      }
    } catch (error) {
      console.error('Error decoding token:', error);
      localStorage.removeItem('token');
      navigate('/');
    }
  }, [navigate]);

  const toggleSimDia = (key) => setSimDias((prev) => ({ ...prev, [key]: !prev[key] }));
  const toggleSimHora = (h) => setSimHoras((prev) => ({ ...prev, [h]: !prev[h] }));
  const simHorasSeleccionadas = useMemo(() => Object.values(simHoras).filter(Boolean).length, [simHoras]);
  const simFechas = useMemo(() => proximasFechas(simDias), [simDias]);

  const toggleRemotaDia = (canal, key) => setRemota((prev) => ({ ...prev, [canal]: { ...prev[canal], dias: { ...prev[canal].dias, [key]: !prev[canal].dias[key] } } }));
  const toggleRemotaHora = (canal, h) => setRemota((prev) => ({ ...prev, [canal]: { ...prev[canal], horas: { ...prev[canal].horas, [h]: !prev[canal].horas[h] } } }));

  const handleGuardar = () => {
    Swal.fire({
      icon: 'info',
      title: 'Horarios no conectados',
      text: 'Esta función aún no tiene un backend real donde guardar la disponibilidad (no existe entidad de configuración de horarios).',
    });
  };

  const handleCancelarSim = () => { setSimDias(SIM_DIAS_DEFAULT); setSimHoras(SIM_HORAS_DEFAULT); };
  const handleCancelarRemota = () => setRemota({
    llamada: { dias: LLAMADA_DIAS_DEFAULT, horas: LLAMADA_HORAS_DEFAULT },
    video: { dias: VIDEO_DIAS_DEFAULT, horas: VIDEO_HORAS_DEFAULT },
    mensaje: { dias: MENSAJE_DIAS_DEFAULT, horas: MENSAJE_HORAS_DEFAULT },
  });

  return (
    <div className="tramites-container horarios-jas-page">
      <div className="fixed-top">
        <Navbar title={'- Horarios'} />
      </div>

      <header className="topbar">
        <div>
          <div className="crumb"><span>Admin</span> <span style={{ color: 'var(--muted-2)' }}>/</span> <span className="accent">Horarios</span></div>
          <div className="page-title-h">Gestión de horarios</div>
        </div>
      </header>

      <div className="content">
        <div className="tabs">
          <button className={`tab ${activeTab === 'sim' ? 'active' : ''}`} onClick={() => setActiveTab('sim')}><IconMonitor /> Simulación</button>
          <button className={`tab ${activeTab === 'aten' ? 'active' : ''}`} onClick={() => setActiveTab('aten')}><IconUser /> Atención al cliente</button>
        </div>

        {activeTab === 'sim' && (
          <div className="pane">
            <div className="card">
              <div className="card-head">
                <div className="card-icon amber"><IconMonitor /></div>
                <div><div className="card-title">Horarios de simulación</div><div className="card-sub">Días y horas disponibles para prácticas de entrevista</div></div>
              </div>
              <div className="card-body">
                <div className="field">
                  <label className="field-label">Días disponibles</label>
                  <DayChips dias={simDias} onToggle={toggleSimDia} />
                  <div className="next-dates">
                    <div className="nd-label">Próximas fechas de los días seleccionados</div>
                    <div className="nd-list">
                      {simFechas.length === 0 ? (
                        <span style={{ fontSize: 12, color: 'var(--muted)' }}>Selecciona al menos un día</span>
                      ) : simFechas.map((f, i) => (
                        <span key={i} className="nd-pill"><span className="nd-dot"></span>{f.getDate()} {MESES_CORTOS[f.getMonth()]} <span className="nd-day">{DOW_CORTO[f.getDay()]}</span></span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label className="field-label">Horas disponibles <span className="field-hint">— selecciona las que estarán abiertas</span></label>
                  <HourChips horas={simHoras} lista={HORAS_SIM} onToggle={toggleSimHora} />
                  <div className="hours-meta"><IconAlert /> {simHorasSeleccionadas} horas seleccionadas</div>
                </div>
              </div>
              <div className="sec-foot">
                <button className="btn btn-ghost" onClick={handleCancelarSim}>Cancelar</button>
                <button className="btn btn-primary" onClick={handleGuardar}><IconCheck /> Guardar</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'aten' && (
          <div className="pane">
            <div className="card">
              <div className="card-head">
                <div className="card-icon green"><IconPin /></div>
                <div><div className="card-title">Atención presencial</div><div className="card-sub">Horario fijo de oficina</div></div>
              </div>
              <div className="card-body">
                <div className="fixed-box">
                  <div className="fixed-icon"><IconClockOutline /></div>
                  <div><div className="fixed-time">Lunes a Viernes · 8:00 AM – 4:00 PM</div><div className="fixed-lbl">Horario de oficina</div></div>
                  <span className="lock-tag"><IconLock /> No editable</span>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-head">
                <div className="card-icon"><IconVideo /></div>
                <div><div className="card-title">Atención remota</div><div className="card-sub">Configura cada canal: Llamada, Videollamada y Mensaje</div></div>
              </div>
              <div className="card-body">
                <div className="sub-tabs">
                  <button className={`sub-tab ${activeSubTab === 'llamada' ? 'active' : ''}`} onClick={() => setActiveSubTab('llamada')}><IconPhone /> Llamada</button>
                  <button className={`sub-tab ${activeSubTab === 'video' ? 'active' : ''}`} onClick={() => setActiveSubTab('video')}><IconVideo size={13} /> Videollamada</button>
                  <button className={`sub-tab ${activeSubTab === 'mensaje' ? 'active' : ''}`} onClick={() => setActiveSubTab('mensaje')}><IconChat /> Mensaje</button>
                </div>

                {['llamada', 'video', 'mensaje'].map((canal) => activeSubTab === canal && (
                  <div className="sub-pane active" key={canal}>
                    <div className="field">
                      <label className="field-label">Días disponibles</label>
                      <DayChips dias={remota[canal].dias} onToggle={(key) => toggleRemotaDia(canal, key)} />
                    </div>
                    <div className="field" style={{ marginBottom: 0 }}>
                      <label className="field-label">Horas disponibles</label>
                      <HourChips horas={remota[canal].horas} lista={HORAS_REMOTA} onToggle={(h) => toggleRemotaHora(canal, h)} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="sec-foot">
                <button className="btn btn-ghost" onClick={handleCancelarRemota}>Cancelar</button>
                <button className="btn btn-primary" onClick={handleGuardar}><IconCheck /> Guardar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

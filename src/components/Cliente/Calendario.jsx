import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { useEffect, useMemo, useState } from 'react';
import ClienteSidebar from './ClienteSidebar.jsx';
import { clientePorId, getHorarios, getMisCitas, getHorasTomadas, crearCita, eliminarCita } from './../../api/api.js';
import styles from './../../styles/ClienteCitas.module.css';

function ChevronLeft() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>; }
function ChevronRight() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>; }
function PlusIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>; }
function ClockIcon() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>; }
function WarnIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /><path d="M12 9v4M12 17h.01" /></svg>; }
function CalIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18M12 14v4M10 16h4" /></svg>; }
function CloseIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 6l12 12M6 18L18 6" /></svg>; }
function SimIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="4" width="20" height="14" rx="2" /><path d="M8 22h8M12 18v4" /></svg>; }
function AtencionIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="7" r="4" /><path d="M3 21v-1a7 7 0 0 1 14 0v1" /></svg>; }
function CheckIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12l5 5L20 7" /></svg>; }

const DOW = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

const TIPOS = [
  { key: 'SIMULACION', label: 'Simulación', sub: 'Práctica de entrevista', icon: SimIcon, cls: '', ubicacion: 'Sucursal Jiutepec' },
  { key: 'ATENCION', label: 'Atención al cliente', sub: 'Asesoría general', icon: AtencionIcon, cls: 'atencionOpt', ubicacion: 'Videollamada' },
];

function configTipo(tipo) { return tipo === 'ATENCION' ? 'ATENCION_REMOTA' : tipo; }
function toISO(date) {
  const y = date.getFullYear(), m = String(date.getMonth() + 1).padStart(2, '0'), d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
function sameDay(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }

export default function Calendario() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [userId, setUserId] = useState('');
  const [horarios, setHorarios] = useState({ SIMULACION: { dias: [], horas: [] }, ATENCION_REMOTA: { dias: [], horas: [] } });
  const [citas, setCitas] = useState([]);
  const [viewDate, setViewDate] = useState(new Date());

  const [modalOpen, setModalOpen] = useState(false);
  const [tipoSel, setTipoSel] = useState('SIMULACION');
  const [diaSel, setDiaSel] = useState(null);
  const [horaSel, setHoraSel] = useState(null);
  const [horasTomadas, setHorasTomadas] = useState([]);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/'); return; }
    let idUser;
    try {
      const decoded = jwtDecode(token);
      idUser = decoded.idUser;
      setUserId(idUser);
      if (decoded.role !== 'USER') {
        Swal.fire({ icon: 'error', title: 'Acceso denegado', text: 'No tienes permiso para acceder a esta página.' });
        navigate('/');
        return;
      }
    } catch (error) {
      console.error('Token inválido', error);
      localStorage.removeItem('token');
      navigate('/');
      return;
    }

    clientePorId(idUser)
      .then((response) => { if (response.success && response.response.user) setNombre(response.response.user.name); })
      .catch((error) => console.error('Error al obtener datos del cliente:', error));

    cargarHorarios();
    cargarCitas(idUser);
  }, [navigate]);

  const cargarHorarios = () => {
    getHorarios()
      .then((response) => { if (response?.response?.horarios) setHorarios(response.response.horarios); })
      .catch((error) => console.error('Error al obtener horarios:', error));
  };

  const cargarCitas = (idUser) => {
    getMisCitas(idUser)
      .then((response) => { if (response.success) setCitas(response.response?.citas || []); })
      .catch((error) => console.error('Error al obtener citas:', error));
  };

  // --- calendario ---
  const diasDisponiblesSet = useMemo(() => {
    const dias = new Set();
    (horarios.SIMULACION?.dias || []).forEach((d) => dias.add(d));
    (horarios.ATENCION_REMOTA?.dias || []).forEach((d) => dias.add(d));
    return dias;
  }, [horarios]);

  const citasPorFecha = useMemo(() => {
    const map = {};
    citas.forEach((c) => { (map[c.fecha] ||= []).push(c); });
    return map;
  }, [citas]);

  const celdas = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const primerDia = new Date(year, month, 1);
    const inicio = new Date(year, month, 1 - primerDia.getDay());
    const hoy = new Date();
    const out = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(inicio);
      d.setDate(inicio.getDate() + i);
      out.push({
        date: d,
        otherMonth: d.getMonth() !== month,
        isToday: sameDay(d, hoy),
        avail: diasDisponiblesSet.has(d.getDay()) && d >= new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()),
        citasDelDia: citasPorFecha[toISO(d)] || [],
      });
    }
    return out;
  }, [viewDate, diasDisponiblesSet, citasPorFecha]);

  const cambiarMes = (delta) => setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));

  // --- modal ---
  const diasPillsDisponibles = useMemo(() => {
    const activos = horarios[configTipo(tipoSel)]?.dias || [];
    if (activos.length === 0) return [];
    const out = [];
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    cursor.setDate(cursor.getDate() + 1);
    let guard = 0;
    while (out.length < 6 && guard < 60) {
      if (activos.includes(cursor.getDay())) out.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
      guard++;
    }
    return out;
  }, [horarios, tipoSel]);

  const horasPillsDisponibles = horarios[configTipo(tipoSel)]?.horas || [];

  const abrirModal = () => {
    setTipoSel('SIMULACION');
    setDiaSel(diasPillsDisponibles[0] || null);
    setHoraSel(null);
    setHorasTomadas([]);
    setModalOpen(true);
  };

  useEffect(() => {
    if (!modalOpen) return;
    setDiaSel((prev) => {
      const opciones = horarios[configTipo(tipoSel)]?.dias || [];
      if (prev && opciones.includes(prev.getDay())) return prev;
      return diasPillsDisponibles[0] || null;
    });
    setHoraSel(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoSel, modalOpen]);

  useEffect(() => {
    if (!modalOpen || !diaSel) { setHorasTomadas([]); return; }
    getHorasTomadas(tipoSel, toISO(diaSel))
      .then((response) => setHorasTomadas(response?.response?.horasTomadas || []))
      .catch((error) => console.error('Error al obtener disponibilidad:', error));
  }, [modalOpen, diaSel, tipoSel]);

  const confirmarCita = async () => {
    if (!diaSel || !horaSel) {
      Swal.fire({ icon: 'warning', title: 'Falta información', text: 'Elige un día y un horario.' });
      return;
    }
    setGuardando(true);
    try {
      const response = await crearCita({ tipo: tipoSel, fecha: toISO(diaSel), hora: horaSel, idUser: userId });
      if (!response.success) throw new Error(response.message);
      Swal.fire({ icon: 'success', title: '¡Listo!', text: 'Tu cita fue agendada.' });
      setModalOpen(false);
      cargarCitas(userId);
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'No se pudo agendar', text: error.message || 'Ese horario ya no está disponible.' });
      if (diaSel) getHorasTomadas(tipoSel, toISO(diaSel)).then((r) => setHorasTomadas(r?.response?.horasTomadas || []));
    } finally {
      setGuardando(false);
    }
  };

  const cambiarCita = async (cita) => {
    const confirm = await Swal.fire({
      icon: 'warning', title: '¿Cambiar esta cita?', text: 'Se cancelará para que elijas un nuevo horario.',
      showCancelButton: true, confirmButtonText: 'Sí, cambiar', cancelButtonText: 'No',
    });
    if (!confirm.isConfirmed) return;
    try {
      await eliminarCita(cita.idCita);
      cargarCitas(userId);
      setTipoSel(cita.tipo);
      setDiaSel(null);
      setHoraSel(null);
      setHorasTomadas([]);
      setModalOpen(true);
    } catch (error) {
      console.error('Error al cancelar la cita:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cancelar la cita.' });
    }
  };

  const proximasCitas = useMemo(() => {
    const hoyIso = toISO(new Date());
    return [...citas].filter((c) => c.fecha >= hoyIso).sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));
  }, [citas]);

  const tipoInfo = (tipo) => TIPOS.find((t) => t.key === tipo) || TIPOS[0];

  return (
    <div className={styles.page}>
      <ClienteSidebar active="citas" userName={nombre || 'Cliente'} />

      <main className={styles.main}>
        <header className={styles.topbar}>
          <div>
            <div className={styles.crumb}><span>Portal</span> <span style={{ color: 'var(--muted-2)' }}>/</span> <span className={styles.accent}>Citas</span></div>
            <div className={styles.pageTitleH}>Mis citas</div>
          </div>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={abrirModal}><PlusIcon /> Agendar cita</button>
        </header>

        <div className={styles.content}>
          <div className={styles.calCard}>
            <div className={styles.calHead}>
              <div className={styles.calMonth}>
                {MESES[viewDate.getMonth()]} <span style={{ color: 'var(--muted)', fontWeight: 500 }}>{viewDate.getFullYear()}</span>
                <div className={styles.calNav}>
                  <button onClick={() => cambiarMes(-1)}><ChevronLeft /></button>
                  <button onClick={() => cambiarMes(1)}><ChevronRight /></button>
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 7 }}>
                <span className={styles.legDot} style={{ background: 'var(--primary)' }}></span> Horarios disponibles
              </div>
            </div>
            <div className={styles.calGridHead}>
              {DOW.map((d) => <div key={d} className={styles.calDow}>{d}</div>)}
            </div>
            <div className={styles.calGrid}>
              {celdas.map((c, i) => (
                <div
                  key={i}
                  className={`${styles.calCell} ${c.otherMonth ? styles.other : ''} ${c.avail ? styles.avail : ''}`}
                  onClick={c.avail ? () => { setDiaSel(c.date); setModalOpen(true); } : undefined}
                >
                  <span className={`${styles.calDaynum} ${c.isToday ? styles.today : ''}`}>{c.date.getDate()}</span>
                  {c.citasDelDia.map((cita) => (
                    <div key={cita.idCita} className={`${styles.calEv} ${cita.tipo === 'SIMULACION' ? styles.evSim : styles.evAtencion}`}>
                      {tipoInfo(cita.tipo).label} {cita.hora}
                    </div>
                  ))}
                  {c.avail && c.citasDelDia.length === 0 && (
                    <div className={styles.availDot}><span></span><span></span></div>
                  )}
                </div>
              ))}
            </div>
            <div className={styles.calLegend}>
              <div className={styles.legItem}><span className={styles.legDot} style={{ background: 'var(--orange)' }}></span> Simulación</div>
              <div className={styles.legItem}><span className={styles.legDot} style={{ background: 'var(--primary)' }}></span> Atención al cliente</div>
            </div>
          </div>

          <div className={styles.side}>
            <div className={styles.panel}>
              <div className={styles.panelTitle}>Citas agendadas</div>
              {proximasCitas.length === 0 ? (
                <div className={styles.empty}>No tienes citas próximas.</div>
              ) : proximasCitas.map((cita) => {
                const info = tipoInfo(cita.tipo);
                const fecha = new Date(cita.fecha + 'T00:00:00');
                return (
                  <div key={cita.idCita} className={styles.appt}>
                    <div className={`${styles.apptDate} ${info.key === 'SIMULACION' ? styles.sim : styles.atencion}`}>
                      <div className={styles.apptDay}>{fecha.getDate()}</div>
                      <div className={styles.apptMon}>{MESES_CORTOS[fecha.getMonth()]}</div>
                    </div>
                    <div className={styles.apptInfo}>
                      <div className={styles.apptType}>{info.label}</div>
                      <div className={styles.apptTime}><ClockIcon /> {cita.hora} hrs · {info.ubicacion}</div>
                      <div className={styles.apptActions}>
                        <button className={`${styles.apptBtn} ${styles.change}`} onClick={() => cambiarCita(cita)}>Cambiar</button>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className={styles.warnNote}>
                <WarnIcon />
                <div className={styles.warnText}>Los cambios o cancelaciones con <strong>menos de 24 horas</strong> de anticipación generan una comisión de $99 MXN.</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {modalOpen && (
        <div className={styles.scrim} onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}>
          <div className={styles.modal}>
            <div className={styles.modalHead}>
              <div className={styles.mhRow}>
                <div className={styles.mhIcon}><CalIcon /></div>
                <div><div className={styles.mhEyebrow}>Agendar</div><div className={styles.mhTitle}>Nueva cita</div></div>
              </div>
              <button className={styles.mhClose} onClick={() => setModalOpen(false)}><CloseIcon /></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.mField}>
                <label className={styles.mLabel}>Tipo de cita</label>
                <div className={styles.typeOpts}>
                  {TIPOS.map((t) => (
                    <div key={t.key} className={`${styles.typeOpt} ${t.cls ? styles[t.cls] : ''} ${tipoSel === t.key ? styles.sel : ''}`} onClick={() => setTipoSel(t.key)}>
                      <div className={styles.typeOptIcon}><t.icon /></div>
                      <div className={styles.typeOptName}>{t.label}</div>
                      <div className={styles.typeOptSub}>{t.sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.mField}>
                <label className={styles.mLabel}>Día disponible</label>
                {diasPillsDisponibles.length === 0 ? (
                  <div className={styles.empty}>No hay días configurados para este tipo de cita.</div>
                ) : (
                  <div className={styles.dayPills}>
                    {diasPillsDisponibles.map((d) => (
                      <div key={toISO(d)} className={`${styles.dayPill} ${diaSel && sameDay(diaSel, d) ? styles.sel : ''}`} onClick={() => { setDiaSel(d); setHoraSel(null); }}>
                        <div className={styles.dayPillNum}>{d.getDate()}</div>
                        <div className={styles.dayPillMon}>{DOW[d.getDay()]}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.mField} style={{ marginBottom: 0 }}>
                <label className={styles.mLabel}>Horario disponible</label>
                {horasPillsDisponibles.length === 0 ? (
                  <div className={styles.empty}>No hay horarios configurados para este tipo de cita.</div>
                ) : (
                  <div className={styles.timePills}>
                    {horasPillsDisponibles.map((h) => {
                      const taken = horasTomadas.includes(h);
                      return (
                        <div key={h} className={`${styles.timePill} ${horaSel === h ? styles.sel : ''} ${taken ? styles.taken : ''}`} onClick={taken ? undefined : () => setHoraSel(h)}>
                          {h}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <div className={styles.modalFoot}>
              <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setModalOpen(false)}>Cancelar</button>
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={confirmarCita} disabled={guardando}>
                <CheckIcon /> {guardando ? 'Agendando...' : 'Confirmar cita'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

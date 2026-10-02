import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { useEffect, useMemo, useState } from 'react';
import ClienteSidebar from './ClienteSidebar.jsx';
import { clientePorId, getHorarios, getMisCitas, getHorasTomadas, crearCita, eliminarCita, getCambiosCita, tramitesPorId } from './../../api/api.js';
import styles from './../../styles/ClienteCitas.module.css';
import HeaderLogoutButton from './../common/HeaderLogoutButton.jsx';

function ChevronLeft() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>; }
function ChevronRight() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>; }
function PlusIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>; }
function ClockIcon() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>; }
function WarnIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /><path d="M12 9v4M12 17h.01" /></svg>; }
function CalIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18M12 14v4M10 16h4" /></svg>; }
function CloseIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 6l12 12M6 18L18 6" /></svg>; }
function SimIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="4" width="20" height="14" rx="2" /><path d="M8 22h8M12 18v4" /></svg>; }
function CheckIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12l5 5L20 7" /></svg>; }

const DOW = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

// Tipos que el cliente puede agendar él mismo desde esta pantalla: solo
// Atención al cliente, en los días/horas de Empresa > Horarios
// (ATENCION_REMOTA). La Simulación, CAS y Consular las agenda Empresa/Admin
// directo en el trámite — ver TIPOS_INFO para mostrarlas sin ofrecerlas.
const TIPOS = [
  { key: 'ATENCION', label: 'Atención al cliente', sub: 'Resuelve dudas con tu asesor', icon: CalIcon, cls: '', ubicacion: 'En línea' },
];

// Info de despliegue (etiqueta/ubicación) para TODOS los tipos de cita que
// se pueden mostrar en el calendario, incluidas las que agenda el asesor
// directo en el trámite (Simulación/CAS/Consular) y que por eso no viven en TIPOS.
const TIPOS_INFO = {
  ATENCION: TIPOS[0],
  SIMULACION: { key: 'SIMULACION', label: 'Simulación', sub: 'Práctica de entrevista', icon: SimIcon, cls: '', ubicacion: 'Sucursal Jiutepec' },
  CAS: { key: 'CAS', label: 'Cita CAS', sub: 'Centro de Atención al Solicitante', icon: CalIcon, cls: '', ubicacion: 'Tu asesor te dará los detalles' },
  CON: { key: 'CON', label: 'Cita consular', sub: 'Entrevista en el consulado', icon: CalIcon, cls: '', ubicacion: 'Tu asesor te dará los detalles' },
};

function configTipo(tipo) { return tipo === 'ATENCION' ? 'ATENCION_REMOTA' : tipo; }
function toISO(date) {
  const y = date.getFullYear(), m = String(date.getMonth() + 1).padStart(2, '0'), d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
function sameDay(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
function parseISO(str) { return str ? new Date(`${str}T00:00:00`) : null; }

export default function Calendario() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [userId, setUserId] = useState('');
  const [horarios, setHorarios] = useState({ SIMULACION: { dias: [], horas: [] }, ATENCION_REMOTA: { dias: [], horas: [] } });
  const [citas, setCitas] = useState([]);
  // Citas CAS/Consular/Simulación que el asesor agenda directo en el
  // trámite (TransactProgress.dateCas/dateCon/dateSimulation) — viven
  // aparte de la tabla `Cita` (autoagendado), así que sin esto esta
  // pantalla nunca las mostraba aunque sí aparecían en el Dashboard.
  const [citasTramite, setCitasTramite] = useState([]);
  const [viewDate, setViewDate] = useState(new Date());

  const [modalOpen, setModalOpen] = useState(false);
  const [tipoSel, setTipoSel] = useState('ATENCION');
  const [diaSel, setDiaSel] = useState(null);
  const [horaSel, setHoraSel] = useState(null);
  const [horasTomadas, setHorasTomadas] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [cambiosInfo, setCambiosInfo] = useState({ cambiosUsados: 0, cambiosGratisRestantes: 2, comision: 99, comisionSimulacion: 99, advance: false });

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
    cargarCitasTramite(idUser);
    cargarCambiosInfo(idUser);
  }, [navigate]);

  const cargarHorarios = () => {
    getHorarios()
      .then((response) => { if (response?.response?.horarios) setHorarios(response.response.horarios); })
      .catch((error) => console.error('Error al obtener horarios:', error));
  };

  // Refresca los horarios cada 60s para reflejar cambios que la Empresa
  // guarde en Empresa > Horarios mientras el Cliente ya tiene esta
  // pantalla abierta, sin necesidad de recargar.
  useEffect(() => {
    const interval = setInterval(cargarHorarios, 60000);
    return () => clearInterval(interval);
  }, []);

  const cargarCitas = (idUser) => {
    getMisCitas(idUser)
      .then((response) => { if (response.success) setCitas(response.response?.citas || []); })
      .catch((error) => console.error('Error al obtener citas:', error));
  };

  // dateCas/dateCon/dateSimulation vienen como "yyyy-MM-dd HH:mm:ss" en
  // CADA trámite del cliente (no solo el más reciente, a diferencia del
  // Dashboard) — se convierten al mismo shape {fecha, hora, tipo} que usa
  // el resto de esta pantalla para las citas autoagendadas.
  const cargarCitasTramite = (idUser) => {
    tramitesPorId(idUser)
      .then((response) => {
        const tramites = response?.response?.transactProgresses || [];
        const derivadas = [];
        tramites.forEach((t) => {
          [['dateSimulation', 'SIMULACION'], ['dateCas', 'CAS'], ['dateCon', 'CON']].forEach(([campo, tipo]) => {
            const valor = t[campo];
            if (!valor) return;
            const [fecha, horaCompleta] = valor.split(' ');
            derivadas.push({
              idCita: `tramite-${t.idTransactProgress}-${tipo}`,
              fecha,
              hora: (horaCompleta || '').slice(0, 5),
              tipo,
              origenTramite: true,
            });
          });
        });
        setCitasTramite(derivadas);
      })
      .catch((error) => console.error('Error al obtener citas del trámite:', error));
  };

  const cargarCambiosInfo = (idUser) => {
    getCambiosCita(idUser)
      .then((response) => { if (response.success && response.response) setCambiosInfo(response.response); })
      .catch((error) => console.error('Error al obtener los cambios de cita:', error));
  };

  // --- calendario ---
  const diasDisponiblesSet = useMemo(() => {
    const dias = new Set();
    (horarios.ATENCION_REMOTA?.dias || []).forEach((d) => dias.add(d));
    return dias;
  }, [horarios]);

  const todasLasCitas = useMemo(() => [...citas, ...citasTramite], [citas, citasTramite]);

  const citasPorFecha = useMemo(() => {
    const map = {};
    todasLasCitas.forEach((c) => { (map[c.fecha] ||= []).push(c); });
    return map;
  }, [todasLasCitas]);

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
        // A partir de mañana: el backend no acepta citas para hoy.
        avail: diasDisponiblesSet.has(d.getDay()) && d > new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()),
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
    // Próximas ~4 semanas de días configurados (empieza mañana).
    while (out.length < 20 && guard < 60) {
      if (activos.includes(cursor.getDay())) out.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
      guard++;
    }
    return out;
  }, [horarios, tipoSel]);

  const horasPillsDisponibles = horarios[configTipo(tipoSel)]?.horas || [];

  const abrirModal = () => {
    setTipoSel('ATENCION');
    setDiaSel(diasPillsDisponibles[0] || null);
    setHoraSel(null);
    setHorasTomadas([]);
    setModalOpen(true);
  };

  useEffect(() => {
    if (!modalOpen) return;
    setDiaSel((prev) => prev || diasPillsDisponibles[0] || null);
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
      Swal.fire({ icon: 'success', title: '¡Listo!', text: 'Tu cita fue agendada.', showConfirmButton: false, timer: 2500, timerProgressBar: true });
      setModalOpen(false);
      cargarCitas(userId);
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'No se pudo agendar', text: error.message || 'Ese horario ya no está disponible.' });
      if (diaSel) getHorasTomadas(tipoSel, toISO(diaSel)).then((r) => setHorasTomadas(r?.response?.horasTomadas || []));
    } finally {
      setGuardando(false);
    }
  };

  // La comisión de Simulación es el precio real del servicio "Simulación de
  // entrevista" (se actualiza solo si lo editan en Servicios), distinta del
  // flat $99 que sigue aplicando a Atención — ver comisionSimulacion en
  // getCambiosCita.
  const montoComisionTipo = (tipo) => (tipo === 'SIMULACION' ? cambiosInfo.comisionSimulacion : cambiosInfo.comision);

  const avisoComision = (tipo) => cambiosInfo.cambiosGratisRestantes <= 0
    ? `Ya usaste tus 2 cambios/cancelaciones gratuitos de este trámite. Esta acción generará un cargo de $${montoComisionTipo(tipo)} MXN.`
    : `Te ${cambiosInfo.cambiosGratisRestantes === 1 ? 'queda' : 'quedan'} ${cambiosInfo.cambiosGratisRestantes} cambio${cambiosInfo.cambiosGratisRestantes === 1 ? '' : 's'}/cancelación${cambiosInfo.cambiosGratisRestantes === 1 ? '' : 'es'} gratis en este trámite.`;

  const avisarComisionSiAplica = (data) => {
    if (data?.comisionGenerada) {
      Swal.fire({ icon: 'info', title: 'Se generó un cargo', text: `Este cambio generó una comisión de $${data.montoComision ?? cambiosInfo.comision} MXN, la verás reflejada en Pagos.` });
    }
  };

  const cambiarCita = async (cita) => {
    const confirm = await Swal.fire({
      icon: 'warning', title: '¿Cambiar esta cita?', text: `Se cancelará para que elijas un nuevo horario. ${avisoComision(cita.tipo)}`,
      showCancelButton: true, confirmButtonText: 'Sí, cambiar', cancelButtonText: 'No',
    });
    if (!confirm.isConfirmed) return;
    try {
      const response = await eliminarCita(cita.idCita);
      cargarCitas(userId);
      cargarCambiosInfo(userId);
      avisarComisionSiAplica(response?.response);
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

  const cancelarCita = async (cita) => {
    const confirm = await Swal.fire({
      icon: 'warning', title: '¿Cancelar esta cita?', text: avisoComision(cita.tipo),
      showCancelButton: true, confirmButtonText: 'Sí, cancelar', cancelButtonText: 'No',
    });
    if (!confirm.isConfirmed) return;
    try {
      const response = await eliminarCita(cita.idCita);
      cargarCitas(userId);
      cargarCambiosInfo(userId);
      avisarComisionSiAplica(response?.response);
    } catch (error) {
      console.error('Error al cancelar la cita:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cancelar la cita.' });
    }
  };

  const proximasCitas = useMemo(() => {
    const hoyIso = toISO(new Date());
    return todasLasCitas.filter((c) => c.fecha >= hoyIso).sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));
  }, [todasLasCitas]);

  const tipoInfo = (tipo) => TIPOS_INFO[tipo] || TIPOS[0];

  return (
    <div className={styles.page}>
      <ClienteSidebar active="citas" userName={nombre || 'Cliente'} />

      <main className={styles.main}>
        <header className={styles.topbar}>
          <div>
            <div className={styles.crumb}><span>Portal</span> <span style={{ color: 'var(--muted-2)' }}>/</span> <span className={styles.accent}>Citas</span></div>
            <div className={styles.pageTitleH}>Mis citas</div>
          </div>
          <div className={styles.topUser}>
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={abrirModal}><PlusIcon /> Agendar cita</button>
            <HeaderLogoutButton />
          </div>
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
                    <div key={cita.idCita} className={`${styles.calEv} ${cita.tipo === 'ATENCION' ? styles.evAtencion : styles.evSim}`}>
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
              <div className={styles.legItem}><span className={styles.legDot} style={{ background: 'var(--hover)' }}></span> Atención al cliente</div>
              <div className={styles.legItem}><span className={styles.legDot} style={{ background: 'var(--orange)' }}></span> Simulación / CAS / Consular (agendadas por tu asesor)</div>
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
                    <div className={`${styles.apptDate} ${info.key === 'ATENCION' ? styles.atencion : styles.sim}`}>
                      <div className={styles.apptDay}>{fecha.getDate()}</div>
                      <div className={styles.apptMon}>{MESES_CORTOS[fecha.getMonth()]}</div>
                    </div>
                    <div className={styles.apptInfo}>
                      <div className={styles.apptType}>{info.label}</div>
                      <div className={styles.apptTime}><ClockIcon /> {cita.hora} hrs · {info.ubicacion}</div>
                      {cita.origenTramite || cita.tipo === 'SIMULACION' ? (
                        <div className={styles.apptTime} style={{ marginTop: 4 }}>Agendada por tu asesor — para cambios contáctalo directamente.</div>
                      ) : (
                        <div className={styles.apptActions}>
                          <button className={`${styles.apptBtn} ${styles.change}`} onClick={() => cambiarCita(cita)}>Cambiar</button>
                          <button className={`${styles.apptBtn} ${styles.cancel}`} onClick={() => cancelarCita(cita)}>Cancelar</button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div className={styles.warnNote}>
                <WarnIcon />
                <div className={styles.warnText}>
                  {cambiosInfo.cambiosGratisRestantes <= 0
                    ? <>Ya usaste tus <strong>2 cambios/cancelaciones gratuitos</strong> de este trámite. El siguiente genera un cargo de <strong>${cambiosInfo.comision} MXN</strong>.</>
                    : <>Tienes <strong>{cambiosInfo.cambiosGratisRestantes} de 2</strong> cambios/cancelaciones gratis en este trámite. A partir del 3ro se cobra <strong>${cambiosInfo.comision} MXN</strong> por cambio.</>}
                </div>
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
                    <div
                      key={t.key}
                      className={`${styles.typeOpt} ${t.cls ? styles[t.cls] : ''} ${tipoSel === t.key ? styles.sel : ''}`}
                      onClick={() => setTipoSel(t.key)}
                    >
                      <div className={styles.typeOptIcon}><t.icon /></div>
                      <div className={styles.typeOptName}>{t.label}</div>
                      <div className={styles.typeOptSub}>{t.sub}</div>
                    </div>
                  ))}
                </div>
                <div className={styles.lockNote}>
                  <WarnIcon />
                  <div className={styles.lockNoteText}>Tu Simulación de entrevista la agenda tu asesor; aparecerá aquí en cuanto la programe.</div>
                </div>
              </div>

              {/* Solo días/horas configurados en Empresa > Horarios: así el
                  cliente nunca elige algo que el backend le vaya a rechazar. */}
              <div className={styles.mField}>
                <label className={styles.mLabel}>Día</label>
                {diasPillsDisponibles.length === 0 ? (
                  <div className={styles.empty}>Por ahora no hay días disponibles. Intenta más tarde o contacta a tu asesor.</div>
                ) : (
                  <select
                    className={styles.mSelect}
                    value={diaSel ? toISO(diaSel) : ''}
                    onChange={(e) => { setDiaSel(parseISO(e.target.value)); setHoraSel(null); }}
                  >
                    <option value="">Selecciona un día</option>
                    {(diaSel && !diasPillsDisponibles.some((d) => sameDay(d, diaSel)) ? [diaSel, ...diasPillsDisponibles] : diasPillsDisponibles).map((d) => (
                      <option key={toISO(d)} value={toISO(d)}>
                        {DOW[d.getDay()]} {d.getDate()} {MESES_CORTOS[d.getMonth()]} {d.getFullYear()}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className={styles.mField} style={{ marginBottom: 0 }}>
                <label className={styles.mLabel}>Horario</label>
                <select
                  className={styles.mSelect}
                  value={horaSel || ''}
                  onChange={(e) => setHoraSel(e.target.value || null)}
                  disabled={!diaSel}
                >
                  <option value="">Selecciona una hora</option>
                  {horasPillsDisponibles.map((h) => (
                    <option key={h} value={h} disabled={horasTomadas.includes(h)}>
                      {h}{horasTomadas.includes(h) ? ' · ocupado' : ''}
                    </option>
                  ))}
                </select>
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

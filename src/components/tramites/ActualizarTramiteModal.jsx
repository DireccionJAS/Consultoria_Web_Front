import React, { useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import {
  obtenerLosPasos,
  listarEncargados,
  actualizarTC,
  deleteTRansactProgress,
  envioCorreoActualizacion,
} from '../../api/api.js';
import GestionarFormulariosModal from './GestionarFormulariosModal.jsx';
import styles from '../../styles/tramites/ActualizarTramiteModal.module.css';

const STATUS_META = {
  1: { label: 'En proceso', color: 'var(--primary)' },
  2: { label: 'En espera', color: 'var(--amber)' },
  3: { label: 'Falta de pago', color: 'var(--rose)' },
  4: { label: 'Terminado', color: 'var(--green)' },
  5: { label: 'Cancelado', color: 'var(--gray)' },
  6: { label: 'Revisar', color: 'var(--orange)' },
  7: { label: 'Aprobado', color: 'var(--green-dark)' },
  8: { label: 'Rechazado', color: 'var(--rose-dark)' },
};

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function splitDateTime(value) {
  if (!value) return { date: '', time: '' };
  const [date, time] = value.replace('T', ' ').split(' ');
  return { date: date || '', time: (time || '').slice(0, 5) };
}

function joinDateTime(date, time) {
  if (!date) return null;
  const t = time && time.length >= 4 ? time : '00:00';
  return `${date} ${t}:00`;
}

function parseMoney(v) {
  return parseFloat(String(v).replace(/[^0-9.]/g, '')) || 0;
}

function fmtMoney(n) {
  return `$${(n || 0).toLocaleString('en-US')} MXN`;
}

export default function ActualizarTramiteModal({ show, onHide, onClienteRegistrado, cliente }) {
  const citaCas = cliente?.transact?.cas === true;
  const citaCon = cliente?.transact?.con === true;
  const citaSimulacion = cliente?.transact?.simulation === true;

  const [form, setForm] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [pasosDisponibles, setPasosDisponibles] = useState([]);
  const [encargados, setEncargados] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showFormularios, setShowFormularios] = useState(false);

  const [openPaso, setOpenPaso] = useState(false);
  const [openEstado, setOpenEstado] = useState(false);
  const [openEncargado, setOpenEncargado] = useState(false);
  const pasoRef = useRef(null);
  const estadoRef = useRef(null);
  const encargadoRef = useRef(null);

  useEffect(() => {
    if (!cliente) return;
    const cas = splitDateTime(cliente.dateCas);
    const con = splitDateTime(cliente.dateCon);
    const sim = splitDateTime(cliente.dateSimulation);
    setForm({
      emailAcces: cliente.emailAcces || '',
      passwordAcces: cliente.passwordAcces || '',
      stepProgress: cliente.stepProgress ?? '',
      status: cliente.status ?? 1,
      paid: cliente.paid ?? 0,
      paidAll: cliente.paidAll ?? 0,
      advance: !!cliente.advance,
      haveSimulation: cliente.haveSimulation ?? 0,
      dateCas: cas.date,
      timeCas: cas.time,
      dateCon: con.date,
      timeCon: con.time,
      dateSimulation: sim.date,
      timeSimulation: sim.time,
      dateStart: cliente.dateStart || '',
      casCity: cliente.casCity || '',
      conCity: cliente.conCity || '',
      documentsDelivered: !!cliente.documentsDelivered,
      visaIssued: cliente.visaIssued,
      idEncargado: cliente.encargado?.idUser ?? null,
    });
  }, [cliente]);

  useEffect(() => {
    if (!show || !cliente?.transact?.idTransact) return;
    (async () => {
      try {
        const resultado = await obtenerLosPasos(cliente.transact.idTransact);
        const pasos = Array.isArray(resultado?.response?.StepsTransacts)
          ? resultado.response.StepsTransacts
          : [];
        setPasosDisponibles(pasos);
      } catch (error) {
        console.error('Error al obtener los pasos', error);
        setPasosDisponibles([]);
      }
    })();
  }, [show, cliente]);

  useEffect(() => {
    if (!show) return;
    (async () => {
      try {
        const resultado = await listarEncargados();
        setEncargados(Array.isArray(resultado?.response?.users) ? resultado.response.users : []);
      } catch (error) {
        console.error('Error al obtener los encargados', error);
        setEncargados([]);
      }
    })();
  }, [show]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pasoRef.current && !pasoRef.current.contains(e.target)) setOpenPaso(false);
      if (estadoRef.current && !estadoRef.current.contains(e.target)) setOpenEstado(false);
      if (encargadoRef.current && !encargadoRef.current.contains(e.target)) setOpenEncargado(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!show || !form) return null;

  const set = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const pasoActual = pasosDisponibles.find((p) => p.stepNumber === form.stepProgress);
  const statusMeta = STATUS_META[form.status] || { label: 'Selecciona un estado', color: 'var(--muted)' };
  const encargadoActual = encargados.find((e) => e.idUser === form.idEncargado);

  const saldoRestante = Math.max(parseMoney(form.paidAll) - (form.advance ? parseMoney(form.paid) : 0), 0);

  const handleDelete = () => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      setDeleting(true);
      try {
        await deleteTRansactProgress(cliente.idTransactProgress);
        Swal.fire('Eliminado!', 'El trámite ha sido eliminado.', 'success');
        if (typeof onClienteRegistrado === 'function') onClienteRegistrado();
        onHide();
      } catch (error) {
        console.error('Error al eliminar el trámite:', error);
        Swal.fire({ icon: 'error', title: 'Error al eliminar', text: 'No se pudo eliminar el trámite. Inténtalo de nuevo.' });
      } finally {
        setDeleting(false);
      }
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        dateCas: citaCas ? joinDateTime(form.dateCas, form.timeCas) : null,
        dateCon: citaCon ? joinDateTime(form.dateCon, form.timeCon) : null,
        dateSimulation: citaSimulacion ? joinDateTime(form.dateSimulation, form.timeSimulation) : null,
        paid: form.advance ? parseMoney(form.paid) : 0,
        paidAll: parseMoney(form.paidAll),
      };

      await actualizarTC(cliente.idTransactProgress, payload);
      await envioCorreoActualizacion(cliente?.user?.email, cliente?.user?.name, cliente?.transact?.name);

      Swal.fire({ icon: 'success', title: 'Datos guardados y correo enviado', confirmButtonText: 'Aceptar' });

      if (typeof onClienteRegistrado === 'function') onClienteRegistrado();
      onHide();
    } catch (error) {
      console.error(error);
      Swal.fire({ icon: 'error', title: 'Error al actualizar', text: 'Error al actualizar' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onMouseDown={(e) => { if (e.target === e.currentTarget) onHide(); }}>
      <div className={styles.modal}>
        <div className={styles.modalHead}>
          <div className={styles.modalHeadIcon}>
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="6" y="4" width="20" height="28" rx="2" />
              <circle cx="16" cy="14" r="3.5" />
              <path d="M10 22h12M10 26h8" />
            </svg>
          </div>
          <div className={styles.modalHeadInfo}>
            <div className={styles.modalEyebrow}>Folio #{String(cliente?.idTransactProgress || '').padStart(6, '0')}</div>
            <div className={styles.modalTitle}>{cliente?.transact?.name}</div>
            <div className={styles.modalSub}>{cliente?.user?.name}</div>
          </div>
          <button className={styles.modalClose} onClick={onHide} aria-label="Cerrar">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M6 6l12 12M6 18L18 6" />
            </svg>
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Info general */}
          <div className={styles.section}>
            <div className={styles.secHead}>
              <div className={styles.secIcon}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
                </svg>
              </div>
              <div>
                <div className={styles.secTitle}>Información general</div>
                <div className={styles.secSub}>Datos del trámite y cliente</div>
              </div>
              <span className={styles.secReadonlyFlag}>Solo lectura</span>
            </div>
            <div className={styles.secBody}>
              <div className={styles.grid2}>
                <div className={styles.roRow}>
                  <div className={styles.roIcon}>
                    <svg width="16" height="16" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="6" y="4" width="20" height="28" rx="2" /><circle cx="16" cy="14" r="3.5" /><path d="M10 22h12M10 26h8" />
                    </svg>
                  </div>
                  <div><div className={styles.roLbl}>Trámite</div><div className={styles.roVal}>{cliente?.transact?.name}</div></div>
                </div>
                <div className={styles.roRow}>
                  <div className={styles.roIcon}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <circle cx="12" cy="7" r="4" /><path d="M3 21v-1a7 7 0 0 1 14 0v1" />
                    </svg>
                  </div>
                  <div><div className={styles.roLbl}>Cliente</div><div className={styles.roVal}>{cliente?.user?.name}</div></div>
                </div>
              </div>
            </div>
          </div>

          {/* Acceso a plataforma */}
          <div className={styles.section}>
            <div className={styles.secHead}>
              <div className={`${styles.secIcon} ${styles.blue}`}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div>
                <div className={styles.secTitle}>Acceso a plataforma externa</div>
                <div className={styles.secSub}>Credenciales del trámite consular (DS-160, CGI, etc.)</div>
              </div>
            </div>
            <div className={styles.secBody}>
              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Correo de acceso</label>
                  <input className={styles.inp} type="email" value={form.emailAcces} onChange={(e) => set({ emailAcces: e.target.value })} />
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Contraseña de acceso</label>
                  <div className={styles.inpIconWrap}>
                    <input className={styles.inp} type={showPassword ? 'text' : 'password'} value={form.passwordAcces} onChange={(e) => set({ passwordAcces: e.target.value })} />
                    <button type="button" className={styles.inpIconBtn} onClick={() => setShowPassword((v) => !v)}>
                      {showPassword ? (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17.94 17.94A10.94 10.94 0 0112 20C5 20 1 12 1 12a21.86 21.86 0 015.06-6.06M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a21.86 21.86 0 01-2.16 3.19M14.12 14.12a3 3 0 11-4.24-4.24" /><path d="M1 1l22 22" /></svg>
                      ) : (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progreso */}
          <div className={styles.section}>
            <div className={styles.secHead}>
              <div className={styles.secIcon}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
              </div>
              <div>
                <div className={styles.secTitle}>Progreso del trámite</div>
                <div className={styles.secSub}>Paso actual, estado y responsable</div>
              </div>
            </div>
            <div className={styles.secBody}>
              <div className={styles.grid3}>
                {/* Paso actual */}
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Paso actual <span className={styles.req}>*</span></label>
                  <div ref={pasoRef} className={`${styles.selWrap} ${openPaso ? styles.open : ''}`}>
                    <button type="button" className={styles.selTrigger} onClick={() => setOpenPaso((v) => !v)}>
                      {pasoActual ? (
                        <>
                          <span className={styles.selBadge}>{pasoActual.stepNumber}/{pasosDisponibles.length}</span>
                          <span className={styles.selText}>{pasoActual.name}</span>
                        </>
                      ) : (
                        <span className={styles.selPlaceholder}>Selecciona un paso</span>
                      )}
                      <svg className={styles.selChev} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                    </button>
                    {openPaso && (
                      <div className={styles.selMenu}>
                        {pasosDisponibles.length === 0 && <div className={styles.selEmpty}>Sin pasos</div>}
                        {pasosDisponibles.map((paso) => (
                          <div
                            key={paso.stepNumber}
                            className={`${styles.selOpt} ${form.stepProgress === paso.stepNumber ? styles.active : ''}`}
                            onClick={() => { set({ stepProgress: paso.stepNumber }); setOpenPaso(false); }}
                          >
                            <span className={styles.selBadge}>{paso.stepNumber}/{pasosDisponibles.length}</span>
                            <span className={styles.selOptText}>{paso.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Estado actual */}
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Estado actual <span className={styles.req}>*</span></label>
                  <div ref={estadoRef} className={`${styles.selWrap} ${openEstado ? styles.open : ''}`}>
                    <button type="button" className={styles.selTrigger} onClick={() => setOpenEstado((v) => !v)}>
                      <span className={styles.selDot} style={{ background: statusMeta.color }} />
                      <span className={styles.selText}>{statusMeta.label}</span>
                      <svg className={styles.selChev} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                    </button>
                    {openEstado && (
                      <div className={styles.selMenu}>
                        {Object.entries(STATUS_META).map(([code, meta]) => (
                          <div
                            key={code}
                            className={`${styles.selOpt} ${form.status === Number(code) ? styles.active : ''}`}
                            onClick={() => { set({ status: Number(code) }); setOpenEstado(false); }}
                          >
                            <span className={styles.selDot} style={{ background: meta.color }} />
                            <span className={styles.selOptText}>{meta.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Encargado asignado */}
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Encargado asignado</label>
                  <div ref={encargadoRef} className={`${styles.selWrap} ${openEncargado ? styles.open : ''}`}>
                    <button type="button" className={styles.selTrigger} onClick={() => setOpenEncargado((v) => !v)}>
                      {encargadoActual ? (
                        <>
                          <span className={styles.selAvatar}>{getInitials(encargadoActual.name)}</span>
                          <span className={styles.selText}>{encargadoActual.name}</span>
                        </>
                      ) : (
                        <>
                          <span className={`${styles.selAvatar} ${styles.empty}`}>?</span>
                          <span className={styles.selPlaceholder}>Sin asignar</span>
                        </>
                      )}
                      <svg className={styles.selChev} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                    </button>
                    {openEncargado && (
                      <div className={styles.selMenu}>
                        <div className={styles.selOpt} onClick={() => { set({ idEncargado: null }); setOpenEncargado(false); }}>
                          <span className={`${styles.selAvatar} ${styles.empty}`}>?</span>
                          <span className={styles.selOptText}>Sin asignar</span>
                        </div>
                        {encargados.map((enc) => (
                          <div
                            key={enc.idUser}
                            className={`${styles.selOpt} ${form.idEncargado === enc.idUser ? styles.active : ''}`}
                            onClick={() => { set({ idEncargado: enc.idUser }); setOpenEncargado(false); }}
                          >
                            <span className={styles.selAvatar}>{getInitials(enc.name)}</span>
                            <span className={styles.selOptText}>{enc.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cita CAS */}
          {citaCas && (
            <div className={`${styles.section} ${styles.conditional}`}>
              <div className={styles.secHead}>
                <div className={`${styles.secIcon} ${styles.blue}`}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                </div>
                <div><div className={styles.secTitle}>Cita CAS</div><div className={styles.secSub}>Centro de Atención al Solicitante</div></div>
                <span className={styles.secFlag}>Aplica para este servicio</span>
              </div>
              <div className={styles.secBody}>
                <div className={styles.grid3}>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Ciudad CAS</label>
                    <input className={styles.inp} value={form.casCity} onChange={(e) => set({ casCity: e.target.value })} placeholder="Ej. Ciudad de México" />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Fecha CAS</label>
                    <input className={styles.inp} type="date" value={form.dateCas} onChange={(e) => set({ dateCas: e.target.value })} />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Horario CAS</label>
                    <input className={styles.inp} type="time" value={form.timeCas} onChange={(e) => set({ timeCas: e.target.value })} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cita Consular */}
          {citaCon && (
            <div className={`${styles.section} ${styles.conditional}`}>
              <div className={styles.secHead}>
                <div className={`${styles.secIcon} ${styles.green}`}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6" /></svg>
                </div>
                <div><div className={styles.secTitle}>Cita Consular</div><div className={styles.secSub}>Entrevista en el consulado</div></div>
                <span className={styles.secFlag}>Aplica para este servicio</span>
              </div>
              <div className={styles.secBody}>
                <div className={styles.grid3}>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Ciudad Consulado</label>
                    <input className={styles.inp} value={form.conCity} onChange={(e) => set({ conCity: e.target.value })} placeholder="Ej. Ciudad de México" />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Fecha Consular</label>
                    <input className={styles.inp} type="date" value={form.dateCon} onChange={(e) => set({ dateCon: e.target.value })} />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Horario Consular</label>
                    <input className={styles.inp} type="time" value={form.timeCon} onChange={(e) => set({ timeCon: e.target.value })} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Simulación */}
          {citaSimulacion && (
            <div className={`${styles.section} ${styles.conditional}`}>
              <div className={styles.secHead}>
                <div className={`${styles.secIcon} ${styles.amber}`}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="4" width="20" height="14" rx="2" /><path d="M8 22h8M12 18v4" /><circle cx="9" cy="11" r="2" /></svg>
                </div>
                <div><div className={styles.secTitle}>Simulación de entrevista</div><div className={styles.secSub}>Práctica 1:1 con consultor</div></div>
                <span className={styles.secFlag}>Aplica para este servicio</span>
              </div>
              <div className={styles.secBody}>
                <div className={styles.grid3}>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Fecha simulación</label>
                    <input className={styles.inp} type="date" value={form.dateSimulation} onChange={(e) => set({ dateSimulation: e.target.value })} />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Hora simulación</label>
                    <input className={styles.inp} type="time" value={form.timeSimulation} onChange={(e) => set({ timeSimulation: e.target.value })} />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>¿Simulación realizada?</label>
                    <div className={styles.seg}>
                      <button type="button" className={form.haveSimulation === 1 ? styles.onGreen : ''} onClick={() => set({ haveSimulation: 1 })}>Sí</button>
                      <button type="button" className={form.haveSimulation === 0 ? styles.on : ''} onClick={() => set({ haveSimulation: 0 })}>No</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pagos */}
          <div className={styles.section}>
            <div className={styles.secHead}>
              <div className={`${styles.secIcon} ${styles.green}`}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="6" width="18" height="14" rx="2" /><path d="M3 10h18M7 14h4" /></svg>
              </div>
              <div><div className={styles.secTitle}>Pagos</div><div className={styles.secSub}>Montos y liquidación</div></div>
            </div>
            <div className={styles.secBody}>
              <div className={styles.grid3}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Pago total <span className={styles.req}>*</span></label>
                  <input className={styles.inp} value={form.paidAll} onChange={(e) => set({ paidAll: e.target.value })} />
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>¿Adelanto?</label>
                  <div className={styles.seg}>
                    <button type="button" className={form.advance ? styles.onGreen : ''} onClick={() => set({ advance: true })}>Sí</button>
                    <button type="button" className={!form.advance ? styles.on : ''} onClick={() => set({ advance: false })}>No</button>
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Monto de adelanto</label>
                  <input className={styles.inp} value={form.paid} onChange={(e) => set({ paid: e.target.value })} />
                </div>
              </div>
              <div className={styles.payCalc}>
                <div className={styles.payRow}><span className={styles.lbl}>Pago total</span><span className={styles.val}>{fmtMoney(parseMoney(form.paidAll))}</span></div>
                <div className={styles.payRow}><span className={styles.lbl}>Adelanto pagado</span><span className={styles.val} style={{ color: 'var(--green)' }}>{fmtMoney(form.advance ? parseMoney(form.paid) : 0)}</span></div>
                <div className={`${styles.payRow} ${styles.liquidado}`}><span className={styles.lbl}>Monto por liquidar (automático)</span><span className={styles.val}>{fmtMoney(saldoRestante)}</span></div>
              </div>
            </div>
          </div>

          {/* Documentos */}
          <div className={styles.section}>
            <div className={styles.secHead}>
              <div className={styles.secIcon}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></svg>
              </div>
              <div><div className={styles.secTitle}>Documentos</div><div className={styles.secSub}>Entrega de formatos al cliente</div></div>
            </div>
            <div className={styles.secBody}>
              <label className={`${styles.checkboxRow} ${form.documentsDelivered ? styles.on : ''}`} onClick={() => set({ documentsDelivered: !form.documentsDelivered })}>
                <span className={styles.cbx}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
                </span>
                <span>
                  <span className={styles.cbxText}>Entrega de formatos completada</span><br />
                  <span className={styles.cbxSub}>El cliente recibió todos los formatos requeridos para su trámite</span>
                </span>
              </label>
            </div>
          </div>

          {/* Resultado final */}
          <div className={styles.section}>
            <div className={styles.secHead}>
              <div className={`${styles.secIcon} ${styles.green}`}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg>
              </div>
              <div><div className={styles.secTitle}>Resultado final</div><div className={styles.secSub}>Estatus de la visa y emisión</div></div>
            </div>
            <div className={styles.secBody}>
              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Estatus del trámite</label>
                  <div className={styles.seg}>
                    <button type="button" className={form.status === 7 ? styles.onGreen : ''} onClick={() => set({ status: 7 })}>Aprobada</button>
                    <button type="button" className={form.status === 8 ? styles.onRose : ''} onClick={() => set({ status: 8 })}>Rechazada</button>
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Emisión de visa</label>
                  <div className={styles.seg}>
                    <button type="button" className={form.visaIssued === true ? styles.onGreen : ''} onClick={() => set({ visaIssued: true })}>Emitida</button>
                    <button type="button" className={form.visaIssued === false ? styles.onRose : ''} onClick={() => set({ visaIssued: false })}>No emitida</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.emailNotice}>
            <div className={styles.emailNoticeIcon}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 6l-10 7L2 6" /></svg>
            </div>
            <div className={styles.emailNoticeText}>
              Al guardar, <strong>{cliente?.user?.name || 'el cliente'}</strong> recibirá un correo con la actualización de su trámite (cambios de estado, citas y montos).
            </div>
          </div>
        </div>

        <div className={styles.modalFoot}>
          <button type="button" className={`${styles.btn} ${styles.btnDanger}`} onClick={handleDelete} disabled={deleting || submitting}>
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </button>
          <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setShowFormularios(true)}>
            Formularios
          </button>
          <div className={styles.footSpacer}>
            <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={onHide} disabled={submitting}>Cancelar</button>
            <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Guardando...' : 'Guardar y notificar'}
            </button>
          </div>
        </div>
      </div>

      <GestionarFormulariosModal
        show={showFormularios}
        onHide={() => setShowFormularios(false)}
        idTransactProgress={cliente?.idTransactProgress}
      />
    </div>
  );
}

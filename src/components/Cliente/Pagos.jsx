import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { useEffect, useMemo, useState } from 'react';
import ClienteSidebar from './ClienteSidebar.jsx';
import Liquidacion from './Modals/Liquidacion.jsx';
import { clientePorId, tramitesPorId, getStepById } from './../../api/api.js';
import styles from './../../styles/ClientePagos.module.css';

function TramiteIcon() { return <svg width="17" height="17" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="6" y="4" width="20" height="28" rx="2" /><circle cx="16" cy="14" r="3.5" /><path d="M10 22h12M10 26h8" /></svg>; }
function PayIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>; }
function CheckIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12l5 5L20 7" /></svg>; }
function EyeIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>; }
function CloseIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 6l12 12M6 18L18 6" /></svg>; }
function CasIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>; }
function ConIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6" /></svg>; }

const STATUS_META = {
  1: { label: 'En proceso' }, 2: { label: 'En espera' }, 3: { label: 'Falta de pago' },
  4: { label: 'Terminado' }, 5: { label: 'Cancelado' }, 6: { label: 'En revisión' }, 7: { label: 'Aprobado' },
};

function fmtMoney(n) { return `$${(n || 0).toLocaleString('es-MX')}`; }
function fmtFecha(v) {
  if (!v) return null;
  const d = new Date(v.replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) + (v.includes(':') ? ` · ${d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} hrs` : '');
}

export default function Pagos() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [userId, setUserId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [datos, setDatos] = useState([]);
  const [pasosPorTransact, setPasosPorTransact] = useState({});
  const [cargando, setCargando] = useState(true);
  const [detalle, setDetalle] = useState(null);
  const [pagando, setPagando] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/'); return; }
    let idUser;
    try {
      const decoded = jwtDecode(token);
      idUser = decoded.idUser;
      setUserId(idUser);
      setUserEmail(decoded.sub || '');
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

    cargarTramites(idUser);
  }, [navigate]);

  const cargarTramites = async (idUser) => {
    try {
      const response = await tramitesPorId(idUser);
      if (!response.success || !Array.isArray(response.response.transactProgresses)) { setDatos([]); return; }
      const items = response.response.transactProgresses;
      setDatos(items);

      const idsTransact = [...new Set(items.map((t) => t.idTransact))];
      const entries = await Promise.all(idsTransact.map(async (idTransact) => {
        try {
          const stepsResponse = await getStepById(idTransact);
          return [idTransact, stepsResponse?.response?.StepsTransacts || []];
        } catch {
          return [idTransact, []];
        }
      }));
      setPasosPorTransact(Object.fromEntries(entries));
    } catch (error) {
      console.error('Error al obtener los trámites:', error);
      setDatos([]);
    } finally {
      setCargando(false);
    }
  };

  const resumen = useMemo(() => {
    const total = datos.reduce((acc, t) => acc + (t.paidAll || 0), 0);
    const pagado = datos.reduce((acc, t) => acc + (t.paid || 0), 0);
    return { total, pagado, pendiente: Math.max(total - pagado, 0) };
  }, [datos]);

  const estadoPago = (t) => {
    const restante = (t.paidAll || 0) - (t.paid || 0);
    if (restante <= 0) return { label: 'Pagado', cls: styles.stPagado };
    if ((t.paid || 0) > 0) return { label: 'En proceso', cls: styles.stProceso };
    return { label: 'Falta de pago', cls: styles.stPend };
  };

  const abrirDetalle = (t) => setDetalle(t);
  const cerrarDetalle = () => setDetalle(null);

  const pasoActual = (t) => {
    const pasos = pasosPorTransact[t.idTransact] || [];
    return pasos.find((p) => p.stepNumber === t.stepProgress) || null;
  };

  return (
    <div className={styles.page}>
      <ClienteSidebar active="pagos" userName={nombre || 'Cliente'} />

      <main className={styles.main}>
        <header className={styles.topbar}>
          <div>
            <div className={styles.crumb}><span>Portal</span> <span style={{ color: 'var(--muted-2)' }}>/</span> <span className={styles.accent}>Pagos</span></div>
            <div className={styles.pageTitleH}>Mis pagos</div>
          </div>
          <div className={styles.topAvatar}>{(nombre.trim().charAt(0) || 'C').toUpperCase()}</div>
        </header>

        <div className={styles.content}>
          <div className={styles.summaryStrip}>
            <div className={`${styles.sumCard} ${styles.total}`}>
              <div className={styles.sumLbl}>Total de mis trámites</div>
              <div className={styles.sumVal}>{fmtMoney(resumen.total)} <small>MXN</small></div>
            </div>
            <div className={`${styles.sumCard} ${styles.box} ${styles.paid}`}>
              <div className={styles.sumLbl}>Pagado</div>
              <div className={styles.sumVal}>{fmtMoney(resumen.pagado)}</div>
            </div>
            <div className={`${styles.sumCard} ${styles.box} ${styles.pend}`}>
              <div className={styles.sumLbl}>Saldo pendiente</div>
              <div className={styles.sumVal}>{fmtMoney(resumen.pendiente)}</div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHead}>
              <div className={styles.cardTitle}>Detalle de pagos por trámite</div>
              <div className={styles.cardSub}>Liquida tus saldos pendientes o consulta el detalle de cada trámite</div>
            </div>
            {cargando ? null : datos.length === 0 ? (
              <div className={styles.empty}>Aún no tienes trámites registrados.</div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>ID</th><th>Fecha inicio</th><th>Trámite</th><th>Monto</th><th>Pagado</th><th>Restante</th><th>Liquidar</th><th>Estado</th><th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {datos.map((t) => {
                      const restante = (t.paidAll || 0) - (t.paid || 0);
                      const estado = estadoPago(t);
                      return (
                        <tr key={t.idTransactProgress}>
                          <td><span className={styles.pid}>#{String(t.idTransactProgress).padStart(3, '0')}</span></td>
                          <td><span className={styles.pdate}>{fmtFecha(t.dateStart) || 'Sin definir'}</span></td>
                          <td>
                            <div className={styles.tramiteCell}>
                              <div className={styles.tramiteIcon}><TramiteIcon /></div>
                              <span className={styles.tramiteName}>{t.transact?.description || 'Trámite'}</span>
                            </div>
                          </td>
                          <td><span className={styles.amt}>{fmtMoney(t.paidAll)}</span></td>
                          <td><span className={`${styles.amt} ${styles.paid}`}>{fmtMoney(t.paid)}</span></td>
                          <td><span className={`${styles.amt} ${restante > 0 ? styles.rest : styles.zero}`}>{fmtMoney(restante)}</span></td>
                          <td>
                            {restante > 0 ? (
                              <button className={styles.liqBtn} onClick={() => setPagando(t)}><PayIcon /> Pagar</button>
                            ) : (
                              <span className={styles.liqDone}><CheckIcon /> Liquidado</span>
                            )}
                          </td>
                          <td><span className={`${styles.stTag} ${estado.cls}`}>{estado.label}</span></td>
                          <td><button className={styles.eyeBtn} onClick={() => abrirDetalle(t)}><EyeIcon /></button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {detalle && (() => {
        const restante = (detalle.paidAll || 0) - (detalle.paid || 0);
        const estado = estadoPago(detalle);
        const paso = pasoActual(detalle);
        return (
          <div className={styles.scrim} onClick={(e) => { if (e.target === e.currentTarget) cerrarDetalle(); }}>
            <div className={styles.modal}>
              <div className={styles.modalHead}>
                <div className={styles.mhEyebrow}>Detalle de pago · #{String(detalle.idTransactProgress).padStart(3, '0')}</div>
                <div className={styles.mhTitle}>{detalle.transact?.description || 'Trámite'}</div>
                <div className={styles.mhSub}>{fmtFecha(detalle.dateStart) ? `Iniciado ${fmtFecha(detalle.dateStart)}` : 'Sin fecha de inicio'} · folio #{String(detalle.idTransactProgress).padStart(6, '0')}</div>
                <button className={styles.mhClose} onClick={cerrarDetalle}><CloseIcon /></button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.secLabel}>Citas oficiales</div>
                <div className={styles.citaGrid}>
                  <div className={`${styles.citaBox} ${detalle.dateCas ? styles.has : styles.none}`}>
                    <div className={styles.citaTop}><span className={`${styles.citaPin} ${styles.cas}`}><CasIcon /></span><span className={styles.citaName}>Cita CAS</span></div>
                    <div className={`${styles.citaVal} ${detalle.dateCas ? '' : styles.muted}`}>{fmtFecha(detalle.dateCas) || 'No cuentas con cita agendada'}</div>
                  </div>
                  <div className={`${styles.citaBox} ${detalle.dateCon ? styles.has : styles.none}`}>
                    <div className={styles.citaTop}><span className={`${styles.citaPin} ${styles.con}`}><ConIcon /></span><span className={styles.citaName}>Cita Consular</span></div>
                    <div className={`${styles.citaVal} ${detalle.dateCon ? '' : styles.muted}`}>{fmtFecha(detalle.dateCon) || 'No cuentas con cita agendada'}</div>
                  </div>
                </div>

                <div className={styles.secLabel}>Información de pago</div>
                <div className={styles.detSummary}>
                  <div className={styles.detBox}><div className={styles.detBoxLbl}>Pagado</div><div className={styles.detBoxVal} style={{ color: 'var(--green)' }}>{fmtMoney(detalle.paid)}</div></div>
                  <div className={styles.detBox}><div className={styles.detBoxLbl}>Pago total</div><div className={styles.detBoxVal}>{fmtMoney(detalle.paidAll)}</div></div>
                  <div className={styles.detBox}><div className={styles.detBoxLbl}>Estado</div><div style={{ marginTop: 3 }}><span className={`${styles.stTag} ${estado.cls}`}>{estado.label}</span></div></div>
                </div>

                <div className={styles.secLabel}>Estado del trámite</div>
                <div className={styles.stepBox}>
                  <div className={styles.stepNum}>{detalle.stepProgress ?? '–'}</div>
                  <div>
                    <div className={styles.stepName}>{paso?.name || STATUS_META[detalle.status]?.label || 'En proceso'}</div>
                    <div className={styles.stepDesc}>{paso?.description || 'Tu asesor está dando seguimiento a este paso.'}</div>
                  </div>
                </div>
              </div>
              {restante > 0 && (
                <div className={styles.modalFoot}>
                  <div className={styles.footPend}>Saldo pendiente: <strong>{fmtMoney(restante)} MXN</strong></div>
                  <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => { setPagando(detalle); cerrarDetalle(); }}><PayIcon /> Liquidar saldo</button>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      <Liquidacion
        show={!!pagando}
        onHide={() => setPagando(null)}
        service={pagando}
        userEmail={userEmail}
        userId={userId}
        onSuccess={() => { setPagando(null); Swal.fire('¡Listo!', 'Tu pago se procesó correctamente.', 'success'); cargarTramites(userId); }}
        onError={(error) => Swal.fire('Error', error?.message || 'Falló el pago.', 'error')}
      />
    </div>
  );
}

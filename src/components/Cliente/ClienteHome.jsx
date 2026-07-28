import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { useEffect, useState } from 'react';
import ClienteSidebar from './ClienteSidebar.jsx';
import { clientePorId, tramitesPorId, getStepById } from './../../api/api.js';
import styles from './../../styles/ClienteDashboard.module.css';

function BellIcon() { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M13.7 21a2 2 0 0 1-3.4 0" /></svg>; }
function ArrowIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 17L17 7M7 7h10v10" /></svg>; }
function TramiteIcon() { return <svg width="22" height="22" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="6" y="4" width="20" height="28" rx="2" /><circle cx="16" cy="14" r="3.5" /><path d="M10 22h12M10 26h8" /></svg>; }
function CitasIcon({ size = 22 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>; }
function FormulariosIcon({ size = 22 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 7h6M9 11h6M9 15h4" /></svg>; }
function PagosIcon({ size = 22 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="6" width="18" height="14" rx="2" /><path d="M3 10h18M7 14h4" /></svg>; }

const STATUS_META = {
  1: { label: 'En proceso', cls: 'tagProceso' },
  2: { label: 'En espera', cls: 'tagEspera' },
  3: { label: 'Falta de pago', cls: 'tagEspera' },
  4: { label: 'Terminado', cls: 'tagTerminado' },
  6: { label: 'En revisión', cls: 'tagEspera' },
  7: { label: 'Aprobado', cls: 'tagTerminado' },
};

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
function formatCita(fecha) {
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return null;
  const hora = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return { fecha: `${d.getDate()} ${MESES[d.getMonth()]}`, hora: `${hora}:${min}` };
}

export default function ClienteHome() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [tramite, setTramite] = useState(null);
  const [totalPasos, setTotalPasos] = useState(null);
  const [tramitesCount, setTramitesCount] = useState(null);

  // Efecto para manejar el cambio de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) navigate('/ClienteHome-sm');
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/'); return; }
    let idUser;
    try {
      const decoded = jwtDecode(token);
      idUser = decoded.idUser;
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
      .then((response) => {
        if (response.success && response.response.user) setNombre(response.response.user.name);
      })
      .catch((error) => console.error('Error al obtener datos del cliente:', error));

    tramitesPorId(idUser)
      .then((response) => {
        if (!response.success || !Array.isArray(response.response.transactProgresses)) return;
        const activos = response.response.transactProgresses;
        setTramitesCount(activos.length);
        if (activos.length === 0) return;
        const actual = [...activos].sort((a, b) => b.idTransactProgress - a.idTransactProgress)[0];
        setTramite(actual);
        return getStepById(actual.idTransact);
      })
      .then((stepsResponse) => {
        if (stepsResponse?.response?.StepsTransacts) setTotalPasos(stepsResponse.response.StepsTransacts.length);
      })
      .catch((error) => console.error('Error al obtener trámites:', error));
  }, [navigate]);

  const primerNombre = nombre ? nombre.trim().split(/\s+/)[0] : '';
  const statusMeta = tramite ? STATUS_META[tramite.status] : null;
  const cita = tramite ? formatCita(tramite.dateSimulation || tramite.dateCas || tramite.dateCon) : null;
  const citaLabel = tramite?.dateSimulation ? 'Simulación de entrevista' : tramite?.dateCas ? 'Cita CAS' : tramite?.dateCon ? 'Cita consular' : null;
  const pendiente = tramite ? Math.max((tramite.paidAll || 0) - (tramite.paid || 0), 0) : null;
  const progresoPct = tramite && totalPasos ? Math.round((tramite.stepProgress / totalPasos) * 100) : null;

  return (
    <div className={styles.dashboard}>
      <ClienteSidebar active="inicio" userName={nombre || 'Cliente'} tramitesCount={tramitesCount} />

      <main className={styles.main}>
        <header className={styles.topbar}>
          <div>
            <div className={styles.greetH}>Hola, <em>{primerNombre || 'de nuevo'}</em> 👋</div>
            <div className={styles.greetSub}>Bienvenido de vuelta a tu portal de Consultoría JAS</div>
          </div>
          <div className={styles.topUser}>
            <button className={styles.topBell}><BellIcon /><span className={styles.dot}></span></button>
            <div className={styles.topAvatar}>{(primerNombre[0] || 'C').toUpperCase()}</div>
          </div>
        </header>

        <div className={styles.content}>
          {tramite ? (
            <>
              <div className={styles.hero}>
                <div className={styles.heroEyebrow}>— Tu trámite activo</div>
                <div className={styles.heroTitle}>{tramite.transact?.description || 'Trámite'}</div>
                {progresoPct != null && (
                  <>
                    <div className={styles.heroSub}>Vas en el paso {tramite.stepProgress} de {totalPasos}.</div>
                    <div className={styles.heroProgress}>
                      <div className={styles.hpBar}><div className={styles.hpFill} style={{ width: `${progresoPct}%` }}></div></div>
                      <span className={styles.hpLabel}>Paso {tramite.stepProgress} de {totalPasos} · {progresoPct}%</span>
                    </div>
                  </>
                )}
              </div>

              <div className={styles.cardsGrid}>
                <div className={styles.card}>
                  <div className={`${styles.cardIcon} ${styles.ciBlue}`}><TramiteIcon /></div>
                  <div className={styles.cardLabel}>Trámite activo</div>
                  <div className={styles.cardValue}>{tramite.transact?.description || 'Trámite'}</div>
                  <div className={styles.cardMeta}>folio #{String(tramite.idTransactProgress).padStart(6, '0')}</div>
                  {statusMeta && <span className={`${styles.tag} ${styles[statusMeta.cls]}`}>{statusMeta.label}</span>}
                </div>

                <div className={styles.card}>
                  <div className={`${styles.cardIcon} ${styles.ciGreen}`}><CitasIcon /></div>
                  <div className={styles.cardLabel}>Próxima cita</div>
                  {cita ? (
                    <>
                      <div className={styles.cardValue}>{cita.fecha} <small>· {cita.hora}</small></div>
                      <div className={styles.cardMeta}>{citaLabel}</div>
                      <button className={styles.cardLink} onClick={() => navigate('/Calendario')}>Ver en calendario <ArrowIcon /></button>
                    </>
                  ) : (
                    <>
                      <div className={styles.cardValue}>Sin agendar</div>
                      <div className={styles.cardMeta}>Aún no tienes una cita programada</div>
                    </>
                  )}
                </div>

                <div className={styles.card}>
                  <div className={`${styles.cardIcon} ${styles.ciAmber}`}><FormulariosIcon /></div>
                  <div className={styles.cardLabel}>Formularios</div>
                  <div className={styles.cardValue}>DS-160</div>
                  <div className={styles.cardMeta}>Consulta con tu asesor para tu formulario</div>
                </div>

                <div className={styles.card}>
                  <div className={`${styles.cardIcon} ${styles.ciRose}`}><PagosIcon /></div>
                  <div className={styles.cardLabel}>Saldo pendiente</div>
                  <div className={styles.cardValue}>${pendiente.toLocaleString('es-MX')} <small>MXN</small></div>
                  <div className={styles.cardMeta}>de ${(tramite.paidAll || 0).toLocaleString('es-MX')} total</div>
                  {pendiente > 0 && (
                    <button className={styles.cardLink} style={{ color: 'var(--rose)' }} onClick={() => navigate('/MisTramites')}>Liquidar saldo <ArrowIcon /></button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className={styles.hero}>
              <div className={styles.heroEyebrow}>— Bienvenido</div>
              <div className={styles.heroTitle}>Aún no tienes un trámite activo</div>
              <div className={styles.heroSub}>Cuando tu asesor registre tu trámite, aquí verás su avance.</div>
            </div>
          )}

          <div>
            <div className={styles.sectionTitle}>Accesos directos</div>
            <div className={styles.sectionSub}>Lo que más usas, a un clic</div>
            <div className={styles.quickGrid}>
              <div className={styles.quickCard} onClick={() => navigate('/Calendario')}>
                <div className={styles.qcIcon}><CitasIcon /></div>
                <div><div className={styles.qcName}>Citas</div><div className={styles.qcSub}>Agenda tu simulación</div></div>
                <div className={styles.qcArrow}><ArrowIcon /></div>
              </div>
              <div className={styles.quickCard} onClick={() => navigate('/MisTramites')}>
                <div className={styles.qcIcon}><FormulariosIcon /></div>
                <div><div className={styles.qcName}>Mis trámites</div><div className={styles.qcSub}>Revisa tu avance</div></div>
                <div className={styles.qcArrow}><ArrowIcon /></div>
              </div>
              <div className={styles.quickCard} onClick={() => navigate('/MisTramites')}>
                <div className={styles.qcIcon}><PagosIcon /></div>
                <div><div className={styles.qcName}>Pagos</div><div className={styles.qcSub}>Liquida tu saldo</div></div>
                <div className={styles.qcArrow}><ArrowIcon /></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

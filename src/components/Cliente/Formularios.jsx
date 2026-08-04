import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { useEffect, useState } from 'react';
import ClienteSidebar from './ClienteSidebar.jsx';
import { clientePorId, tramitesPorId, getPersonasByProgress } from './../../api/api.js';
import styles from './../../styles/ClienteFormularios.module.css';

function WarnIcon() { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /><path d="M12 9v4M12 17h.01" /></svg>; }
function InfoIcon() { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>; }
function WhatsAppIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 17 0z" /></svg>; }
function LinkIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.5 1.5" /><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.5-1.5" /></svg>; }
function CopyIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>; }
function CheckIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12l5 5L20 7" /></svg>; }
function OpenIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" /></svg>; }
function LockIcon() { return <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>; }
function ArrowIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>; }

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

const ACTIVO = new Set([1, 2, 3, 6]);

export default function Formularios() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [tramite, setTramite] = useState(null);
  const [personas, setPersonas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [copiadoId, setCopiadoId] = useState(null);

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
      .then(async (response) => {
        if (!response.success || !Array.isArray(response.response.transactProgresses)) return;
        const items = response.response.transactProgresses;
        const activos = items.filter((t) => ACTIVO.has(t.status));
        const actual = [...(activos.length ? activos : items)].sort((a, b) => b.idTransactProgress - a.idTransactProgress)[0];
        setTramite(actual || null);
        if (!actual) return;
        const pendiente = (actual.paidAll || 0) - (actual.paid || 0);
        const aplica = actual.transact?.cas || actual.transact?.con;
        if (pendiente <= 0 && aplica) {
          const personasResponse = await getPersonasByProgress(actual.idTransactProgress);
          setPersonas(personasResponse?.response?.personas || []);
        }
      })
      .catch((error) => console.error('Error al obtener el trámite:', error))
      .finally(() => setCargando(false));
  }, [navigate]);

  const pendiente = tramite ? Math.max((tramite.paidAll || 0) - (tramite.paid || 0), 0) : 0;
  const aplica = !!(tramite?.transact?.cas || tramite?.transact?.con);
  const bloqueado = !tramite || pendiente > 0;

  const copiarLink = (persona) => {
    if (persona.ds160Link) navigator.clipboard?.writeText(persona.ds160Link);
    setCopiadoId(persona.idTramitePersona);
    setTimeout(() => setCopiadoId((id) => (id === persona.idTramitePersona ? null : id)), 1600);
  };

  return (
    <div className={styles.page}>
      <ClienteSidebar active="formularios" userName={nombre || 'Cliente'} />

      <main className={styles.main}>
        <header className={styles.topbar}>
          <div>
            <div className={styles.crumb}><span>Portal</span> <span style={{ color: 'var(--muted-2)' }}>/</span> <span className={styles.accent}>Formularios</span></div>
            <div className={styles.pageTitleH}>Formularios requeridos</div>
          </div>
          <div className={styles.topAvatar}>{(nombre.trim().charAt(0) || 'C').toUpperCase()}</div>
        </header>

        <div className={styles.content}>
          {cargando ? null : bloqueado ? (
            <div className={styles.locked}>
              <div className={styles.lockedIcon}><LockIcon /></div>
              <div className={styles.lockedTitle}>{tramite ? 'Completa tu pago para acceder a los formularios' : 'No tienes un trámite activo'}</div>
              <div className={styles.lockedSub}>
                {tramite
                  ? <>Tus formularios se desbloquearán automáticamente una vez que registremos tu pago. Tienes un saldo pendiente de <strong>${pendiente.toLocaleString('es-MX')} MXN</strong>.</>
                  : 'Cuando tu asesor registre tu trámite, aquí verás tus formularios.'}
              </div>
              {tramite && (
                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => navigate('/MisTramites')}>Ir a pagos <ArrowIcon /></button>
              )}
            </div>
          ) : !aplica ? (
            <div className={styles.locked}>
              <div className={styles.lockedIcon}><InfoIcon /></div>
              <div className={styles.lockedTitle}>Este trámite no requiere formularios</div>
              <div className={styles.lockedSub}>Tu trámite actual no incluye cita CAS ni cita consular, así que no necesitas llenar ningún formulario aquí.</div>
            </div>
          ) : (
            <>
              <div className={styles.bannerCombo}>
                <div className={`${styles.bcLine} ${styles.warn}`}>
                  <span className={styles.bcIc}><WarnIcon /></span>
                  <span className={styles.bcText}>Debes llenar <strong>todos los formularios en esta misma pantalla</strong>, uno por cada persona. No cierres esta ventana hasta completarlos todos.</span>
                </div>
                <div className={`${styles.bcLine} ${styles.info}`}>
                  <span className={styles.bcIc}><InfoIcon /></span>
                  <span className={styles.bcText}>Tienes <strong>{personas.filter((p) => !p.filled).length}</strong> formulario(s) pendiente(s) por completar. Llena cada uno por separado y avisa a tu asesor por WhatsApp cuando termines todos.</span>
                </div>
              </div>

              <div className={styles.note}>
                <div className={styles.noteIcon}><WhatsAppIcon /></div>
                <div className={styles.noteText}>Una vez que hayas llenado tu formulario, <strong>avisa a tu asesor por WhatsApp</strong> para que lo revise y continúe con tu trámite.</div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <div>
                    <div className={styles.cardTitle}>Formulario DS-160</div>
                    <div className={styles.cardSub}>Un link por persona · {tramite.transact?.description || 'Trámite'}</div>
                  </div>
                  {personas.length > 0 && <span className={styles.dsBadge}>{personas.length} persona{personas.length === 1 ? '' : 's'}</span>}
                </div>

                {personas.length === 0 ? (
                  <div className={styles.empty}>Tu asesor aún no ha registrado los formularios de este trámite.</div>
                ) : personas.map((p) => (
                  <div key={p.idTramitePersona} className={styles.formRow}>
                    <div className={styles.person}>
                      <div className={styles.personAv}>{getInitials(p.name)}</div>
                      <div><div className={styles.personName}>{p.name}</div><div className={styles.personRole}>{p.role}</div></div>
                    </div>
                    {p.ds160Link ? (
                      <>
                        <div className={styles.linkBox}>
                          <span className={styles.linkIcon}><LinkIcon /></span>
                          <span className={styles.linkUrl}>{p.ds160Link}</span>
                        </div>
                        <button className={`${styles.copyBtn} ${copiadoId === p.idTramitePersona ? styles.copied : ''}`} onClick={() => copiarLink(p)}>
                          {copiadoId === p.idTramitePersona ? <><CheckIcon /> Copiado</> : <><CopyIcon /> Copiar</>}
                        </button>
                        <a className={styles.openBtn} href={p.ds160Link} target="_blank" rel="noopener noreferrer"><OpenIcon /> Abrir</a>
                      </>
                    ) : (
                      <div className={styles.linkBox}><span className={styles.linkUrl}>Tu asesor aún no ha compartido el link</span></div>
                    )}
                    <div className={styles.formStatus}>
                      <span className={`${styles.fsTag} ${p.filled ? styles.fsDone : styles.fsPend}`}>{p.filled ? 'Llenado' : 'Pendiente'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

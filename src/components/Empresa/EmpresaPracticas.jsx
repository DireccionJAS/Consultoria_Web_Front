import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import EmpresaSidebar from './EmpresaSidebar.jsx';
import styles from './../../styles/EmpresaPracticas.module.css';

// Extraído 1:1 de "17-Practicas (standalone).html" y del modal "Nueva
// institución" agregado en "17-Practicas (standalone) (1).html". El
// backend no tiene
// ninguna entidad de "solicitudes de prácticas" ni "instituciones", y el
// formulario público de Prácticas (PracticasSection.jsx en la landing)
// ni siquiera envía los datos a ningún lado (su handleSubmit solo hace
// setSubmitted(true)) — así que no existe ninguna fuente real de
// solicitudes que mostrar aquí. La bandeja de "Solicitudes" usa los
// mismos datos de ejemplo del mockup, sin persistencia (eliminar es solo
// local). El tab "Instituciones" sí parte de datos reales: el arreglo
// INSTITUTIONS de PracticasSection.jsx (los mismos 4 logos que hoy se
// muestran en la landing), también editable solo en local.

const SOLICITUDES_INICIALES = [
  { id: 1, nombre: 'Dahiane Ayala', nueva: true, whatsapp: '777 145 2230', institucion: 'UTEZ', correoInst: 'vinculacion@utez.edu.mx', telInst: '777 367 9700', gradiente: 'linear-gradient(135deg,#6FAEDB,#4E6A9C)' },
  { id: 2, nombre: 'Roberto Guzmán', nueva: true, whatsapp: '777 588 1144', institucion: 'UPEMOR', correoInst: 'practicas@upemor.edu.mx', telInst: '777 362 1100', gradiente: 'linear-gradient(135deg,#7ec286,#2c7a3f)' },
  { id: 3, nombre: 'Mariana Cortés', nueva: false, whatsapp: '777 901 3322', institucion: 'UAEM', correoInst: 'servicio.social@uaem.mx', telInst: '777 329 7000', gradiente: 'linear-gradient(135deg,#fbd28b,#e89e3b)' },
  { id: 4, nombre: 'José Luis Mora', nueva: false, whatsapp: '777 410 5567', institucion: 'TecNM', correoInst: 'vinculacion@cuernavaca.tecnm.mx', telInst: '777 312 2314', gradiente: 'linear-gradient(135deg,#b89dc8,#6b3e8c)' },
  { id: 5, nombre: 'Ana Patricia Ruiz', nueva: false, whatsapp: '777 776 8890', institucion: 'UTEZ', correoInst: 'vinculacion@utez.edu.mx', telInst: '777 367 9700', gradiente: 'linear-gradient(135deg,#e89a7c,#c25a2e)' },
];

const INSTITUCIONES_INICIALES = [
  { id: 1, mark: 'U', color: '#1B6B3A', name: 'UTEZ', sub: 'Univ. Tecnológica Emiliano Zapata' },
  { id: 2, mark: 'U', color: '#7A1F2B', name: 'UPEMOR', sub: 'Univ. Politécnica del Estado de Morelos' },
  { id: 3, mark: 'U', color: '#2D6CDF', name: 'UAEM', sub: 'Univ. Autónoma del Estado de Morelos' },
  { id: 4, mark: 'T', color: '#C68714', name: 'TecNM', sub: 'Tecnológico Nacional de México' },
];

function IconSearch() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--muted)' }}><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.35-4.35"></path></svg>; }
function IconEye() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>; }
function IconTrashSm({ size = 15 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path></svg>; }
function IconTrashLg() { return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>; }
function IconPlus({ size = 14 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"></path></svg>; }
function IconClose({ size = 13 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 6l12 12M6 18L18 6"></path></svg>; }
function IconSchool({ size = 16 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>; }
function IconSchoolBig() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>; }
function IconTray() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-6l-2 3h-4l-2-3H2"></path><path d="M5.5 5.5L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.5A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.5z"></path></svg>; }
function IconPerson() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="7" r="4"></circle><path d="M3 21v-1a7 7 0 0 1 14 0v1"></path></svg>; }
function IconWhats({ size = 16 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 17 0z"></path></svg>; }
function IconMail({ size = 16 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 6l-10 7L2 6"></path></svg>; }
function IconPhone() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>; }

function getIniciales(nombre) {
  const partes = nombre.trim().split(/\s+/);
  return ((partes[0]?.[0] ?? '') + (partes[1]?.[0] ?? '')).toUpperCase();
}

export default function EmpresaPracticas() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('solicitudes');
  const [busqueda, setBusqueda] = useState('');
  const [solicitudes, setSolicitudes] = useState(SOLICITUDES_INICIALES);
  const [detalleAbierto, setDetalleAbierto] = useState(null);
  const [eliminando, setEliminando] = useState(null);
  const [instituciones, setInstituciones] = useState(INSTITUCIONES_INICIALES);
  const [agregarAbierto, setAgregarAbierto] = useState(false);
  const [nuevoNombreCorto, setNuevoNombreCorto] = useState('');
  const [nuevoNombreCompleto, setNuevoNombreCompleto] = useState('');

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
    }
  }, [navigate]);

  const handleNavigate = (key) => { console.log('Navegar a sección de sidebar:', key); };

  const filtradas = useMemo(() => solicitudes.filter((s) =>
    s.nombre.toLowerCase().includes(busqueda.toLowerCase()) || s.institucion.toLowerCase().includes(busqueda.toLowerCase())
  ), [solicitudes, busqueda]);

  const nuevasEstaSemana = useMemo(() => solicitudes.filter((s) => s.nueva).length, [solicitudes]);
  const institucionesDistintas = useMemo(() => new Set(solicitudes.map((s) => s.institucion)).size, [solicitudes]);

  const handleEliminarSolicitud = () => {
    if (!eliminando) return;
    setSolicitudes((prev) => prev.filter((s) => s.id !== eliminando.id));
    setEliminando(null);
  };

  const handleEliminarInstitucion = (id) => setInstituciones((prev) => prev.filter((i) => i.id !== id));

  const abrirAgregarInstitucion = () => {
    setNuevoNombreCorto('');
    setNuevoNombreCompleto('');
    setAgregarAbierto(true);
  };

  const cerrarAgregarInstitucion = () => setAgregarAbierto(false);

  const handleConfirmarAgregarInstitucion = () => {
    const name = nuevoNombreCorto.trim();
    const sub = nuevoNombreCompleto.trim();
    if (!name) return;
    const colores = ['#1B6B3A', '#7A1F2B', '#2D6CDF', '#C68714', '#6b3e8c', '#c25a2e'];
    const color = colores[instituciones.length % colores.length];
    setInstituciones((prev) => [...prev, { id: Date.now(), mark: name[0].toUpperCase(), color, name, sub }]);
    setAgregarAbierto(false);
  };

  return (
    <div className={styles.page}>
      <EmpresaSidebar active="practicas" onNavigate={handleNavigate} />

      <main className={styles.main}>
        <header className={styles.topbar}>
          <div>
            <div className={styles.crumb}><span>Menú extendido</span> <span className={styles.crumbSep}>/</span> <span className={styles.accent}>Prácticas profesionales</span></div>
            <div className={styles.pageTitle}>Prácticas profesionales</div>
          </div>
        </header>

        <div className={styles.content}>
          <div className={styles.tabs}>
            <button className={`${styles.tab} ${tab === 'solicitudes' ? styles.active : ''}`} onClick={() => setTab('solicitudes')}>
              <IconTray /> Solicitudes recibidas <span className={styles.tabCount}>{solicitudes.length}</span>
            </button>
            <button className={`${styles.tab} ${tab === 'logos' ? styles.active : ''}`} onClick={() => setTab('logos')}>
              <IconSchoolBig /> Instituciones <span className={styles.tabCount}>{instituciones.length}</span>
            </button>
          </div>

          {tab === 'solicitudes' && (
            <div className={styles.pane}>
              <div className={styles.statsStrip}>
                <div className={styles.statMini}><div className={styles.lbl}>Solicitudes totales</div><div className={styles.val}>{solicitudes.length}</div></div>
                <div className={styles.statMini}><div className={styles.lbl}>Nuevas esta semana</div><div className={styles.val} style={{ color: 'var(--green)' }}>{nuevasEstaSemana}</div></div>
                <div className={styles.statMini}><div className={styles.lbl}>Instituciones distintas</div><div className={styles.val}>{institucionesDistintas}</div></div>
              </div>

              <div className={styles.tableCard}>
                <div className={styles.tblHeadRow}>
                  <div>
                    <div className={styles.tblTitle}>Bandeja de solicitudes</div>
                    <div className={styles.tblSub}>Estudiantes que quieren hacer prácticas en JAS</div>
                  </div>
                  <div className={styles.searchBox}>
                    <IconSearch />
                    <input type="text" placeholder="Buscar solicitante o institución..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                  </div>
                </div>

                {filtradas.length === 0 ? (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}><IconTray /></div>
                    <div className={styles.emptyTitle}>No se encontraron solicitudes</div>
                    <div className={styles.emptySub}>Intenta con otro nombre o institución.</div>
                  </div>
                ) : (
                  <div className={styles.tableScroll}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th style={{ width: 40 }}>#</th>
                          <th>Solicitante</th>
                          <th>Institución</th>
                          <th>Correo institución</th>
                          <th>Tel. institución</th>
                          <th style={{ width: 90 }}>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtradas.map((s, i) => (
                          <tr key={s.id}>
                            <td><span className={styles.rowNum}>{String(i + 1).padStart(2, '0')}</span></td>
                            <td>
                              <div className={styles.solCell}>
                                <div className={styles.solAvatar} style={{ background: s.gradiente }}>{getIniciales(s.nombre)}</div>
                                <div>
                                  <div className={styles.solName}>{s.nombre} {s.nueva && <span className={styles.newBadge}>NUEVA</span>}</div>
                                  <div className={styles.solWa}>WA {s.whatsapp}</div>
                                </div>
                              </div>
                            </td>
                            <td><span className={styles.instTag}>{s.institucion}</span></td>
                            <td><span className={styles.cellMuted}>{s.correoInst}</span></td>
                            <td><span className={styles.cellMono}>{s.telInst}</span></td>
                            <td>
                              <div className={styles.rowActions}>
                                <button title="Ver detalle" onClick={() => setDetalleAbierto(s)}><IconEye /></button>
                                <button className={styles.del} title="Eliminar" onClick={() => setEliminando(s)}><IconTrashSm /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'logos' && (
            <div className={styles.pane}>
              <div className={styles.tableCard}>
                <div className={styles.tblHeadRow}>
                  <div>
                    <div className={styles.tblTitle}>Logos de instituciones</div>
                    <div className={styles.tblSub}>Se muestran en la sección de Prácticas de la landing</div>
                  </div>
                </div>
                <div className={styles.logosGrid}>
                  {instituciones.map((inst) => (
                    <div key={inst.id} className={styles.logoCard}>
                      <button className={styles.logoDel} title="Eliminar" onClick={() => handleEliminarInstitucion(inst.id)}><IconTrashSm size={14} /></button>
                      <div className={styles.logoMark} style={{ background: inst.color }}>{inst.mark}</div>
                      <div>
                        <div className={styles.logoName}>{inst.name}</div>
                        <div className={styles.logoSub}>{inst.sub}</div>
                      </div>
                    </div>
                  ))}
                  <button className={styles.logoAdd} onClick={abrirAgregarInstitucion}>
                    <div className={styles.logoAddIcon}><IconPlus size={22} /></div>
                    <div className={styles.logoAddText}>Agregar logo</div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {detalleAbierto && (
        <div className={styles.scrim} onMouseDown={(e) => { if (e.target === e.currentTarget) setDetalleAbierto(null); }}>
          <div className={styles.modal}>
            <div className={styles.modalHead}>
              <div className={styles.mhEyebrow}>Solicitud de prácticas</div>
              <div className={styles.mhTitle}>{detalleAbierto.nombre}</div>
              <button className={styles.mhClose} onClick={() => setDetalleAbierto(null)}><IconClose /></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detRow}>
                <div className={styles.detIcon}><IconPerson /></div>
                <div><div className={styles.detLbl}>Nombre completo</div><div className={styles.detVal}>{detalleAbierto.nombre}</div></div>
              </div>
              <div className={styles.detRow}>
                <div className={styles.detIcon}><IconWhats /></div>
                <div><div className={styles.detLbl}>WhatsApp del solicitante</div><div className={styles.detVal}>{detalleAbierto.whatsapp}</div></div>
              </div>
              <div className={styles.detRow}>
                <div className={styles.detIcon}><IconSchool /></div>
                <div><div className={styles.detLbl}>Institución educativa</div><div className={styles.detVal}>{detalleAbierto.institucion}</div></div>
              </div>
              <div className={styles.detRow}>
                <div className={styles.detIcon}><IconMail /></div>
                <div><div className={styles.detLbl}>Correo de la institución</div><div className={styles.detVal}>{detalleAbierto.correoInst}</div></div>
              </div>
              <div className={styles.detRow}>
                <div className={styles.detIcon}><IconPhone /></div>
                <div><div className={styles.detLbl}>Teléfono de la institución</div><div className={styles.detVal}>{detalleAbierto.telInst}</div></div>
              </div>
            </div>
            <div className={styles.modalFoot}>
              <a className={`${styles.btn} ${styles.btnWa}`} href={`https://wa.me/52${detalleAbierto.whatsapp.replace(/\s/g, '')}`} target="_blank" rel="noreferrer">
                <IconWhats size={14} /> WhatsApp
              </a>
              <a className={`${styles.btn} ${styles.btnMail}`} href={`mailto:${detalleAbierto.correoInst}`}>
                <IconMail size={14} /> Correo
              </a>
            </div>
          </div>
        </div>
      )}

      {eliminando && (
        <div className={styles.scrim} onMouseDown={(e) => { if (e.target === e.currentTarget) setEliminando(null); }}>
          <div className={styles.modal} style={{ maxWidth: 400 }}>
            <div className={styles.modalBody} style={{ padding: '32px 24px 20px', textAlign: 'center' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--rose-soft)', color: 'var(--rose)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <IconTrashLg />
              </div>
              <div style={{ fontFamily: 'var(--display)', fontWeight: 600, fontSize: 20, letterSpacing: '-0.02em', marginBottom: 8 }}>¿Eliminar solicitud?</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>Esta acción no se puede deshacer.</div>
            </div>
            <div className={styles.modalFoot} style={{ justifyContent: 'flex-end' }}>
              <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setEliminando(null)}>Cancelar</button>
              <button className={styles.btn} style={{ background: 'var(--rose)', color: '#fff' }} onClick={handleEliminarSolicitud}>Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}

      {agregarAbierto && (
        <div className={styles.scrim} onMouseDown={(e) => { if (e.target === e.currentTarget) cerrarAgregarInstitucion(); }}>
          <div className={styles.modal} style={{ maxWidth: 420 }}>
            <div className={styles.modalHead}>
              <div className={styles.mhEyebrow}>Logos de instituciones</div>
              <div className={styles.mhTitle}>Nueva institución</div>
              <button className={styles.mhClose} onClick={cerrarAgregarInstitucion}><IconClose /></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.instField}>
                <label className={styles.instLabel}>Nombre corto</label>
                <input
                  type="text"
                  className={styles.instInput}
                  placeholder="ej. UTEZ"
                  value={nuevoNombreCorto}
                  onChange={(e) => setNuevoNombreCorto(e.target.value)}
                  autoFocus
                />
              </div>
              <div className={styles.instField}>
                <label className={styles.instLabel}>Nombre completo</label>
                <input
                  type="text"
                  className={styles.instInput}
                  placeholder="Nombre completo de la institución"
                  value={nuevoNombreCompleto}
                  onChange={(e) => setNuevoNombreCompleto(e.target.value)}
                />
              </div>
            </div>
            <div className={styles.modalFoot} style={{ justifyContent: 'flex-end' }}>
              <button className={`${styles.btn} ${styles.btnGhost}`} onClick={cerrarAgregarInstitucion}>Cancelar</button>
              <button
                className={styles.btn}
                style={{ background: 'var(--c2)', color: '#fff' }}
                onClick={handleConfirmarAgregarInstitucion}
                disabled={!nuevoNombreCorto.trim()}
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

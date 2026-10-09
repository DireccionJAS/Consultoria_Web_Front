import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import AdminSidebar from './AdminSidebar.jsx';
import EnviarFormularioModal from './EnviarFormularioModal.jsx';
import {
  getFormatosFormulario, guardarLinkFormato, subirPdfFormato, quitarPdfFormato, verPdfFormato, getTramitesFormularios,
} from './../../api/api.js';
import styles from './../../styles/AdminTramites.module.css';
import fs from './../../styles/AdminFormularios.module.css';
import NotificationBell from './../common/NotificationBell.jsx';
import HeaderLogoutButton from './../common/HeaderLogoutButton.jsx';
import { EMPRESA_UI, formatoMoneda, formatFechaCorta, estadoFormulario, abrirPdf } from './../../utils/formularios.js';

// Admin > Formularios: arriba el formulario fijo de cada empresa (link de
// Google Forms y/o PDF); abajo los trámites de los clientes asignados para
// mandárselo cuando ya cubrieron su pago inicial. El formulario lo decide la
// empresa seleccionada para cada trámite; aquí se elige link o PDF.

const NOMBRE_EJEMPLO = 'Nombre Apellido';
const ITEMS_POR_PAGINA = 15;
const MAX_PDF_MB = 5;

function SearchIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--muted)' }}><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>; }
function DocIcon() { return <svg width="20" height="20" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="6" y="4" width="20" height="28" rx="2" /><circle cx="16" cy="14" r="3.5" /><path d="M10 22h12M10 26h8" /></svg>; }
function EmptyIcon() { return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 7h6M9 11h6M9 15h4" /></svg>; }
function SendIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" /></svg>; }
function UploadIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>; }
function CheckIcon() { return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12l5 5L20 7" /></svg>; }
function ChevronLeftIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>; }
function ChevronRightIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>; }

const FILTROS = [
  { value: '', label: 'Todos' },
  { value: 'listos', label: 'Listos para enviar', dot: 'var(--c2)' },
  { value: 'enviados', label: 'Enviados', dot: 'var(--green)' },
  { value: 'pendiente', label: 'Pago inicial pendiente', dot: 'var(--amber)' },
];

function pasaFiltro(t, filtro) {
  const enviados = estadoFormulario(t).enviadas.length > 0;
  if (filtro === 'listos') return t.advance && !enviados;
  if (filtro === 'enviados') return enviados;
  if (filtro === 'pendiente') return !t.advance;
  return true;
}

function FormatoCard({ formato, onCambio }) {
  const [link, setLink] = useState(formato.link || '');
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const inputRef = useRef(null);
  const ui = EMPRESA_UI[formato.empresaCode] || {};

  const cambiado = link.trim() !== (formato.link || '');
  const linkPrueba = link.trim() ? link.trim().replace('{nombre}', encodeURIComponent(NOMBRE_EJEMPLO)) : null;

  const guardar = async () => {
    setGuardando(true);
    try {
      const r = await guardarLinkFormato(formato.idEmpresa, link.trim());
      if (!r.success) { Swal.fire({ icon: 'warning', title: 'No se guardó', text: r.message }); return; }
      onCambio(r.response.formato);
      Swal.fire({ icon: 'success', title: 'Link guardado', timer: 1600, showConfirmButton: false });
    } catch (error) {
      console.error('Error al guardar el link:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo guardar el link.' });
    } finally {
      setGuardando(false);
    }
  };

  const subir = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      Swal.fire({ icon: 'warning', title: 'Solo PDF', text: 'Selecciona un archivo PDF.' });
      return;
    }
    if (file.size > MAX_PDF_MB * 1024 * 1024) {
      Swal.fire({ icon: 'warning', title: 'Archivo muy pesado', text: `El PDF no puede pesar más de ${MAX_PDF_MB} MB.` });
      return;
    }
    setSubiendo(true);
    try {
      const r = await subirPdfFormato(formato.idEmpresa, file);
      if (!r.success) { Swal.fire({ icon: 'warning', title: 'No se guardó', text: r.message }); return; }
      onCambio(r.response.formato);
      Swal.fire({ icon: 'success', title: 'PDF guardado', timer: 1600, showConfirmButton: false });
    } catch (error) {
      console.error('Error al subir el PDF:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo subir el PDF.' });
    } finally {
      setSubiendo(false);
    }
  };

  const quitar = async () => {
    const ok = await Swal.fire({
      icon: 'warning', title: '¿Quitar el PDF?', text: `Los clientes de ${formato.empresaNombre} que ya lo recibieron por PDF ya no podrán descargarlo.`,
      showCancelButton: true, confirmButtonText: 'Quitar', cancelButtonText: 'Cancelar',
    });
    if (!ok.isConfirmed) return;
    try {
      const r = await quitarPdfFormato(formato.idEmpresa);
      if (!r.success) { Swal.fire({ icon: 'warning', title: 'No se quitó', text: r.message }); return; }
      onCambio(r.response.formato);
    } catch (error) {
      console.error('Error al quitar el PDF:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo quitar el PDF.' });
    }
  };

  return (
    <div className={fs.formatoCard}>
      <div className={fs.formatoHead}>
        <div className={fs.formatoLogo}>{ui.logo ? <img src={ui.logo} alt={formato.empresaCode} /> : formato.empresaCode}</div>
        <div style={{ minWidth: 0 }}>
          <div className={fs.formatoName}>{formato.empresaNombre}</div>
          <div className={fs.formatoMeta}>
            {formatFechaCorta(formato.updatedAt) ? `Actualizado ${formatFechaCorta(formato.updatedAt)}` : 'Sin configurar'}
          </div>
        </div>
        <div className={fs.availRow}>
          <span className={`${fs.avail} ${formato.link ? fs.on : fs.off}`}>{formato.link && <CheckIcon />}Link</span>
          <span className={`${fs.avail} ${formato.tienePdf ? fs.on : fs.off}`}>{formato.tienePdf && <CheckIcon />}PDF</span>
        </div>
      </div>
      <div className={fs.formatoBody}>
        <div>
          <label className={fs.blockLabel} htmlFor={`link-${formato.idEmpresa}`}>Link del formulario (Google Forms)</label>
          <div className={fs.linkRow}>
            <input
              id={`link-${formato.idEmpresa}`}
              className={fs.inp}
              type="url"
              placeholder="https://docs.google.com/forms/..."
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
            <button type="button" className={`${fs.miniBtn} ${fs.miniBtnPrimary}`} onClick={guardar} disabled={!cambiado || guardando}>
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
          <div className={fs.hint}>
            Escribe <code>{'{nombre}'}</code> donde va el nombre en el link prellenado de Google Forms y a cada persona le llega ya escrito.
            {linkPrueba && <> {' '}<a href={linkPrueba} target="_blank" rel="noreferrer">Probar link</a></>}
          </div>
        </div>
        <div>
          <span className={fs.blockLabel}>PDF del formulario</span>
          <input ref={inputRef} type="file" accept="application/pdf,.pdf" style={{ display: 'none' }} onChange={subir} />
          {formato.tienePdf ? (
            <div className={fs.pdfBox}>
              <div className={fs.pdfIcon}>PDF</div>
              <div className={fs.pdfName} title={formato.pdfNombre}>{formato.pdfNombre}</div>
              <div className={fs.pdfActions}>
                <button type="button" className={fs.miniBtn} onClick={() => abrirPdf(() => verPdfFormato(formato.idEmpresa))}>Ver</button>
                <button type="button" className={fs.miniBtn} onClick={() => inputRef.current?.click()} disabled={subiendo}>
                  {subiendo ? 'Subiendo...' : 'Reemplazar'}
                </button>
                <button type="button" className={`${fs.miniBtn} ${fs.miniBtnDanger}`} onClick={quitar}>Quitar</button>
              </div>
            </div>
          ) : (
            <button type="button" className={fs.uploadBtn} onClick={() => inputRef.current?.click()} disabled={subiendo}>
              <UploadIcon /> {subiendo ? 'Subiendo...' : `Subir PDF (máx. ${MAX_PDF_MB} MB)`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function PagoInicial({ t }) {
  if (t.advance) {
    return (
      <div className={fs.pillWrap}>
        <span className={`${fs.pill} ${fs.pillGreen}`}>Pagado</span>
        <span className={fs.pillSub}>{formatoMoneda(t.paid)} de {formatoMoneda(t.paidAll)}</span>
      </div>
    );
  }
  return (
    <div className={fs.pillWrap}>
      <span className={`${fs.pill} ${fs.pillAmber}`}>Pendiente</span>
      <span className={fs.pillSub}>Anticipo {formatoMoneda(t.anticipo)} · lleva {formatoMoneda(t.paid)}</span>
    </div>
  );
}

function EstadoFormulario({ t }) {
  const e = estadoFormulario(t);
  if (e.tipo === 'sin') {
    return <span className={`${fs.pill} ${fs.pillGray}`}>Sin enviar</span>;
  }
  const personas = `${e.enviadas.length} ${e.enviadas.length === 1 ? 'persona' : 'personas'}`;
  return (
    <div className={fs.pillWrap}>
      {e.tipo === 'llenado'
        ? <span className={`${fs.pill} ${fs.pillGreen}`}>Llenado {e.llenadas}/{e.enviadas.length}</span>
        : <span className={`${fs.pill} ${fs.pillBlue}`}>Enviado · {e.formato === 'PDF' ? 'PDF' : 'Link'}</span>}
      <span className={fs.pillSub}>
        {e.tipo === 'llenado' ? (e.formato === 'PDF' ? 'PDF' : 'Link') : `Llenado ${e.llenadas}/${e.enviadas.length}`}
        {' · '}{personas}{formatFechaCorta(e.fecha) ? ` · ${formatFechaCorta(e.fecha)}` : ''}
      </span>
    </div>
  );
}

export default function AdminFormularios() {
  const navigate = useNavigate();
  const [formatos, setFormatos] = useState([]);
  const [tramites, setTramites] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState('');
  const [pagina, setPagina] = useState(1);
  const [seleccionado, setSeleccionado] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/'); return; }
    try {
      const decoded = jwtDecode(token);
      if (decoded.role !== 'ADMIN') { navigate('/'); return; }
    } catch (error) {
      console.error('Token inválido', error);
      localStorage.removeItem('token');
      navigate('/');
      return;
    }
    Promise.all([getFormatosFormulario(), getTramitesFormularios()])
      .then(([rf, rt]) => {
        setFormatos(rf.success && Array.isArray(rf.response.formatos) ? rf.response.formatos : []);
        setTramites(rt.success && Array.isArray(rt.response.tramites) ? rt.response.tramites : []);
      })
      .catch((error) => console.error('Error al cargar formularios:', error))
      .finally(() => setCargando(false));
  }, [navigate]);

  const recargarTramites = async () => {
    try {
      const rt = await getTramitesFormularios();
      if (rt.success && Array.isArray(rt.response.tramites)) setTramites(rt.response.tramites);
    } catch (error) {
      console.error('Error al recargar trámites:', error);
    }
  };

  const actualizarFormato = (nuevo) => {
    if (!nuevo) return;
    setFormatos((prev) => prev.map((f) => (f.idEmpresa === nuevo.idEmpresa ? nuevo : f)));
  };

  const termino = busqueda.trim().toLowerCase();
  const porBusqueda = tramites.filter((t) => !termino || [t.clienteNombre, t.clienteEmail, t.clienteTelefono, t.servicio, t.personName]
    .some((v) => v && v.toLowerCase().includes(termino)));
  const filtrados = porBusqueda.filter((t) => pasaFiltro(t, filtro));
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / ITEMS_POR_PAGINA));
  const visibles = filtrados.slice((pagina - 1) * ITEMS_POR_PAGINA, pagina * ITEMS_POR_PAGINA);
  const formatoDe = (t) => formatos.find((f) => f.idEmpresa === t.idEmpresa) || null;

  return (
    <div className={styles.page}>
      <AdminSidebar active="formularios" />

      <main className={styles.main}>
        <header className={styles.topbar}>
          <div>
            <div className={styles.crumb}><span>Principal</span> <span className={styles.crumbSep}>/</span> <span className={styles.accent}>Formularios</span></div>
            <div className={styles.pageTitle}>Formularios y <em>formatos</em></div>
          </div>
          <div className={styles.topActions}>
            <NotificationBell role="admin" />
            <HeaderLogoutButton />
          </div>
        </header>

        <div className={styles.content}>
          <div className={fs.sectionHead}>
            <div>
              <div className={fs.sectionTitle}>Formatos</div>
              <div className={fs.sectionSub}>Cada trámite usa el formulario de la empresa elegida al crearlo. Puedes enviar el link o el PDF configurado para esa empresa.</div>
            </div>
          </div>
          {cargando ? null : (
            <div className={fs.formatosGrid}>
              {/* key con updatedAt: al guardar se vuelve a montar con el valor nuevo */}
              {formatos.map((f) => <FormatoCard key={`${f.idEmpresa}-${f.updatedAt || ''}`} formato={f} onCambio={actualizarFormato} />)}
            </div>
          )}

          <div className={fs.sectionHead} style={{ marginTop: 8 }}>
            <div>
              <div className={fs.sectionTitle}>Enviar a clientes</div>
              <div className={fs.sectionSub}>Se puede enviar en cuanto el cliente cubre el pago inicial (anticipo) de su trámite.</div>
            </div>
          </div>

          <div className={styles.toolbar}>
            <div className={styles.toolbarTop}>
              <div className={styles.searchBar}>
                <SearchIcon />
                <input type="text" placeholder="Buscar por cliente, email, teléfono o trámite..." value={busqueda} onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }} />
              </div>
              <div className={styles.resultsMeta}><strong>{filtrados.length}</strong> trámites {filtro ? 'con este filtro' : 'en total'}</div>
            </div>
            <div className={styles.filterChips}>
              {FILTROS.map((f) => (
                <button key={f.value} className={`${styles.chip} ${filtro === f.value ? styles.active : ''}`} onClick={() => { setFiltro(f.value); setPagina(1); }}>
                  {f.dot && <span className={styles.chipDot} style={{ background: f.dot }}></span>}
                  {f.label}
                  <span className={styles.cnt}>{porBusqueda.filter((t) => pasaFiltro(t, f.value)).length}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.tableCard}>
            {cargando ? (
              <div className={styles.loadingWrap}><div className={styles.spinner}></div><p>Cargando...</p></div>
            ) : visibles.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}><EmptyIcon /></div>
                <div className={styles.emptyTitle}>{tramites.length === 0 ? 'Aún no tienes clientes asignados' : 'No hay registros'}</div>
                <div className={styles.emptySub}>
                  {tramites.length === 0
                    ? 'Aquí aparecen los trámites de los clientes que Empresa te asigna como encargado.'
                    : 'No se encontraron trámites con los filtros aplicados.'}
                </div>
              </div>
            ) : (
              <div className={styles.tableScroll}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th style={{ width: 48 }}>#</th>
                      <th>Cliente</th>
                      <th>Empresa</th>
                      <th>Trámite</th>
                      <th>Pago inicial</th>
                      <th>Formulario</th>
                      <th style={{ textAlign: 'right' }}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibles.map((t, i) => {
                      const ui = EMPRESA_UI[t.empresaCode] || {};
                      const enviado = estadoFormulario(t).tipo !== 'sin';
                      return (
                        <tr key={t.idTransactProgress}>
                          <td><span className={styles.rowNum}>{String((pagina - 1) * ITEMS_POR_PAGINA + i + 1).padStart(2, '0')}</span></td>
                          <td>
                            <div className={fs.clientCell}>
                              <span className={styles.clientName}>{t.clienteNombre}</span>
                              <span className={fs.clientMail}>{t.clienteEmail}</span>
                            </div>
                          </td>
                          <td>
                            <div className={fs.empresaCell}>
                              {ui.logo && <img className={fs.empresaLogo} src={ui.logo} alt="" />}
                              <span className={fs.empresaCode}>{ui.corto || t.empresaCode || '—'}</span>
                            </div>
                          </td>
                          <td>
                            <div className={styles.tramCell}>
                              <div className={styles.tramImg}><DocIcon /></div>
                              <div>
                                <div className={styles.tramName}>{t.servicio}</div>
                                <div className={styles.tramFolio}>
                                  #{String(t.idTransactProgress).padStart(3, '0')}
                                  {t.personName && t.personName !== t.clienteNombre ? ` • ${t.personName}` : ''}
                                  {formatFechaCorta(t.dateStart) ? ` • ${formatFechaCorta(t.dateStart)}` : ''}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td><PagoInicial t={t} /></td>
                          <td><EstadoFormulario t={t} /></td>
                          <td style={{ textAlign: 'right' }}>
                            {enviado ? (
                              <button className={`${fs.actionBtn} ${fs.actionBtnGhost}`} onClick={() => setSeleccionado(t)}>Ver / reenviar</button>
                            ) : (
                              <button
                                className={fs.actionBtn}
                                onClick={() => setSeleccionado(t)}
                                disabled={!t.advance}
                                title={t.advance ? 'Enviar el formulario al cliente' : 'Disponible cuando el cliente cubra su pago inicial'}
                              >
                                <SendIcon /> Enviar
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {!cargando && filtrados.length > ITEMS_POR_PAGINA && (
            <div className={styles.pagination}>
              <div className={styles.pgInfo}>
                Mostrando <strong>{(pagina - 1) * ITEMS_POR_PAGINA + 1}–{Math.min(pagina * ITEMS_POR_PAGINA, filtrados.length)}</strong> de <strong>{filtrados.length}</strong> trámites
              </div>
              <div className={styles.pgControls}>
                <button className={styles.pgBtn} onClick={() => setPagina((p) => p - 1)} disabled={pagina === 1}><ChevronLeftIcon /></button>
                {Array.from({ length: totalPaginas }).map((_, i) => (
                  <button key={i} className={`${styles.pgBtn} ${pagina === i + 1 ? styles.active : ''}`} onClick={() => setPagina(i + 1)}>{i + 1}</button>
                ))}
                <button className={styles.pgBtn} onClick={() => setPagina((p) => p + 1)} disabled={pagina === totalPaginas}><ChevronRightIcon /></button>
              </div>
            </div>
          )}
        </div>
      </main>

      {seleccionado && (
        <EnviarFormularioModal
          key={seleccionado.idTransactProgress}
          tramite={seleccionado}
          formato={formatoDe(seleccionado)}
          onHide={() => setSeleccionado(null)}
          onCambio={recargarTramites}
        />
      )}
    </div>
  );
}

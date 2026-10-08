import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { enviarFormulario, marcarFormularioLlenado } from './../../api/api.js';
import { EMPRESA_UI } from './../../utils/formularios.js';
import ms from './../../styles/tramites/ActualizarTramiteModal.module.css';
import em from './../../styles/EnviarFormularioModal.module.css';

const ROLES = ['Titular', 'Acompañante'];

function iniciales(nombre = '') {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[1][0]).toUpperCase();
}

function LinkIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.5 1.5" /><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.5-1.5" /></svg>; }
function PdfIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M12 18v-6M9 15l3 3 3-3" /></svg>; }
function TrashIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" /></svg>; }
function PlusIcon() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>; }
function MailIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 6l-10 7L2 6" /></svg>; }

let siguienteKey = 1;
const nuevaKey = () => `n${siguienteKey++}`;

// Envía (o reenvía) el formulario de un trámite: el de la empresa del cliente,
// como link o PDF, a cada persona de la lista. Quitar o renombrar personas
// se aplica al guardar; "Llenado" se marca al momento.
// Se monta con key = trámite (ver AdminFormularios), así el estado inicial
// sale directo de las props.
function personasIniciales(tramite) {
  if ((tramite.personas || []).length > 0) {
    return tramite.personas.map((p) => ({ key: `p${p.idTramitePersona}`, idTramitePersona: p.idTramitePersona, name: p.name, role: p.role, filled: p.filled, enviadoAt: p.enviadoAt }));
  }
  return [{ key: nuevaKey(), idTramitePersona: null, name: tramite.personName || tramite.clienteNombre || '', role: 'Titular', filled: false, enviadoAt: null }];
}

function tipoInicial(tramite, formato) {
  const enviada = (tramite.personas || []).find((p) => p.enviadoAt && p.formato);
  if (enviada) return enviada.formato;
  return formato?.link ? 'LINK' : formato?.tienePdf ? 'PDF' : 'LINK';
}

export default function EnviarFormularioModal({ tramite, formato, onHide, onCambio }) {
  const [tipo, setTipo] = useState(() => tipoInicial(tramite, formato));
  const [personas, setPersonas] = useState(() => personasIniciales(tramite));
  const [enviando, setEnviando] = useState(false);
  const [marcando, setMarcando] = useState(null);

  const ui = EMPRESA_UI[tramite.empresaCode] || {};
  const yaEnviado = (tramite.personas || []).some((p) => p.enviadoAt);
  const hayLink = !!formato?.link;
  const hayPdf = !!formato?.tienePdf;
  const linkConNombre = hayLink && formato.link.includes('{nombre}');
  const disponible = tipo === 'LINK' ? hayLink : hayPdf;

  const cambiar = (key, campo, valor) => setPersonas((prev) => prev.map((p) => (p.key === key ? { ...p, [campo]: valor } : p)));
  const agregar = () => setPersonas((prev) => [...prev, { key: nuevaKey(), idTramitePersona: null, name: '', role: 'Acompañante', filled: false, enviadoAt: null }]);

  const quitar = async (p) => {
    if (p.enviadoAt) {
      const ok = await Swal.fire({
        icon: 'warning', title: `¿Quitar a ${p.name || 'esta persona'}?`,
        text: 'Ya se le había enviado. Al guardar y reenviar dejará de verlo en el portal del cliente.',
        showCancelButton: true, confirmButtonText: 'Quitar', cancelButtonText: 'Cancelar',
      });
      if (!ok.isConfirmed) return;
    }
    setPersonas((prev) => prev.filter((x) => x.key !== p.key));
  };

  const alternarLlenado = async (p) => {
    setMarcando(p.key);
    try {
      const r = await marcarFormularioLlenado(p.idTramitePersona, !p.filled);
      if (!r.success) { Swal.fire({ icon: 'warning', title: 'No se actualizó', text: r.message }); return; }
      cambiar(p.key, 'filled', !p.filled);
      onCambio?.();
    } catch (error) {
      console.error('Error al marcar el formulario:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo actualizar.' });
    } finally {
      setMarcando(null);
    }
  };

  const enviar = async () => {
    if (personas.length === 0) { Swal.fire({ icon: 'warning', title: 'Falta una persona', text: 'Agrega al menos a una persona.' }); return; }
    if (personas.some((p) => !p.name.trim())) { Swal.fire({ icon: 'warning', title: 'Falta un nombre', text: 'Escribe el nombre de cada persona.' }); return; }
    setEnviando(true);
    try {
      const r = await enviarFormulario(tramite.idTransactProgress, {
        formato: tipo,
        personas: personas.map((p) => ({ idTramitePersona: p.idTramitePersona, name: p.name.trim(), role: p.role })),
      });
      if (!r.success) { Swal.fire({ icon: 'warning', title: 'No se envió', text: r.message }); return; }
      onCambio?.();
      onHide();
      Swal.fire({
        icon: 'success', title: yaEnviado ? 'Formulario reenviado' : 'Formulario enviado',
        text: `${tramite.clienteNombre} ya lo ve en su portal y se le mandó un aviso por correo.`,
        timer: 3200, showConfirmButton: false,
      });
    } catch (error) {
      console.error('Error al enviar el formulario:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo enviar el formulario.' });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className={ms.overlay} onMouseDown={(e) => { if (e.target === e.currentTarget && !enviando) onHide(); }}>
      <div className={ms.modal} style={{ maxWidth: 640 }}>
        <div className={ms.modalHead}>
          <div className={ms.modalHeadIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 7h6M9 11h6M9 15h4" /></svg>
          </div>
          <div className={ms.modalHeadInfo}>
            <div className={ms.modalEyebrow}>Folio #{String(tramite.idTransactProgress).padStart(6, '0')} · {tramite.servicio}</div>
            <div className={ms.modalTitle}>{yaEnviado ? 'Formulario enviado' : 'Enviar formulario'}</div>
            <div className={ms.modalSub}>{tramite.clienteNombre}</div>
          </div>
          <button className={ms.modalClose} onClick={onHide} aria-label="Cerrar" disabled={enviando}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 6l12 12M6 18L18 6" /></svg>
          </button>
        </div>

        <div className={ms.modalBody}>
          <div className={em.empresaBox}>
            {ui.logo && <img className={em.empresaLogo} src={ui.logo} alt="" />}
            <div>
              <div className={em.empresaTitle}>Formulario de {tramite.empresaNombre || 'la empresa del cliente'}</div>
              <div className={em.empresaSub}>Se elige solo según la empresa del cliente.</div>
            </div>
          </div>

          {!hayLink && !hayPdf && (
            <div className={`${em.aviso} ${em.avisoWarn}`}>
              Todavía no hay link ni PDF del formulario de {tramite.empresaNombre}. Configúralo arriba en <strong>&nbsp;Formatos&nbsp;</strong> y vuelve a intentarlo.
            </div>
          )}

          <div>
            <span className={em.sectionLabel}>¿Cómo se lo mandas?</span>
            <div className={em.opciones}>
              <button type="button" className={`${em.opcion} ${tipo === 'LINK' ? em.sel : ''}`} onClick={() => setTipo('LINK')} disabled={!hayLink}>
                <span className={em.opcionIcon}><LinkIcon /></span>
                <span>
                  <div className={em.opcionTitle}>Link en línea</div>
                  <div className={em.opcionSub}>
                    {!hayLink ? 'Sin link configurado' : linkConNombre ? 'Lo llena en Google Forms con su nombre ya escrito.' : 'Lo abre y llena en Google Forms.'}
                  </div>
                </span>
              </button>
              <button type="button" className={`${em.opcion} ${tipo === 'PDF' ? em.sel : ''}`} onClick={() => setTipo('PDF')} disabled={!hayPdf}>
                <span className={em.opcionIcon}><PdfIcon /></span>
                <span>
                  <div className={em.opcionTitle}>PDF para descargar</div>
                  <div className={em.opcionSub}>{hayPdf ? 'Lo descarga desde su portal.' : 'Sin PDF configurado'}</div>
                </span>
              </button>
            </div>
          </div>

          <div>
            <span className={em.sectionLabel}>Personas (un formulario por cada una)</span>
            <div className={em.personas}>
              {personas.map((p) => (
                <div key={p.key} className={em.persona}>
                  <div className={em.avatar}>{iniciales(p.name)}</div>
                  <input className={em.inp} type="text" placeholder="Nombre completo" value={p.name} maxLength={120} onChange={(e) => cambiar(p.key, 'name', e.target.value)} />
                  <select className={`${em.inp} ${em.rol}`} value={p.role} onChange={(e) => cambiar(p.key, 'role', e.target.value)}>
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <div className={em.estadoCell}>
                    {p.enviadoAt && p.idTramitePersona ? (
                      <button
                        type="button"
                        className={`${em.estado} ${p.filled ? em.estadoLlenado : em.estadoPendiente}`}
                        onClick={() => alternarLlenado(p)}
                        disabled={marcando === p.key}
                        title="Cambiar entre Pendiente y Llenado"
                      >
                        {p.filled ? 'Llenado' : 'Pendiente'}
                      </button>
                    ) : (
                      <span className={`${em.estado} ${em.estadoNuevo}`}>Sin enviar</span>
                    )}
                  </div>
                  <button type="button" className={em.quitar} onClick={() => quitar(p)} disabled={personas.length === 1} aria-label="Quitar persona" title="Quitar persona">
                    <TrashIcon />
                  </button>
                </div>
              ))}
              <button type="button" className={em.agregar} onClick={agregar}><PlusIcon /> Agregar acompañante</button>
            </div>
          </div>

          <div className={`${em.aviso} ${em.avisoInfo}`}>
            <MailIcon />
            <span>Al enviarlo, al cliente le llega un aviso en su portal (Formularios) y un correo. Cuando lo llene, márcalo aquí como <strong>Llenado</strong>.</span>
          </div>
        </div>

        <div className={ms.modalFoot}>
          <div className={ms.footSpacer}>
            <button type="button" className={`${ms.btn} ${ms.btnGhost}`} onClick={onHide} disabled={enviando}>Cancelar</button>
            <button type="button" className={`${ms.btn} ${ms.btnPrimary}`} onClick={enviar} disabled={enviando || !disponible || !tramite.advance}>
              {enviando ? 'Enviando...' : yaEnviado ? 'Guardar y reenviar' : 'Enviar al cliente'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

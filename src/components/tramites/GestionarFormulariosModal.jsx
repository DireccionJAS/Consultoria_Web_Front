import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { getPersonasByProgress, createPersona, updatePersona, deletePersona } from '../../api/api.js';
import styles from '../../styles/tramites/ActualizarTramiteModal.module.css';
import rowStyles from '../../styles/tramites/GestionarFormularios.module.css';

const ROLES = ['Titular', 'Acompañante'];

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function GestionarFormulariosModal({ show, onHide, idTransactProgress }) {
  const [personas, setPersonas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [nuevo, setNuevo] = useState({ name: '', role: ROLES[0], ds160Link: '' });

  useEffect(() => {
    if (show && idTransactProgress) fetchPersonas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, idTransactProgress]);

  const fetchPersonas = async () => {
    setCargando(true);
    try {
      const response = await getPersonasByProgress(idTransactProgress);
      setPersonas(response?.response?.personas || []);
    } catch (error) {
      console.error('Error al obtener personas:', error);
      setPersonas([]);
    } finally {
      setCargando(false);
    }
  };

  const handleAgregar = async () => {
    if (!nuevo.name.trim()) {
      Swal.fire({ icon: 'warning', title: 'Falta el nombre', text: 'Ingresa el nombre de la persona.' });
      return;
    }
    setGuardando(true);
    try {
      await createPersona({ ...nuevo, idTransactProgress });
      setNuevo({ name: '', role: ROLES[0], ds160Link: '' });
      fetchPersonas();
    } catch (error) {
      console.error('Error al agregar la persona:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo agregar la persona.' });
    } finally {
      setGuardando(false);
    }
  };

  const handleUpdate = async (persona, cambios) => {
    try {
      const payload = {
        name: persona.name,
        role: persona.role,
        ds160Link: persona.ds160Link,
        filled: persona.filled,
        ...cambios,
      };
      await updatePersona(persona.idTramitePersona, payload);
      fetchPersonas();
    } catch (error) {
      console.error('Error al actualizar la persona:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo actualizar la persona.' });
    }
  };

  const handleEliminar = async (persona) => {
    const confirm = await Swal.fire({
      icon: 'warning', title: '¿Eliminar persona?', text: `Se eliminará a ${persona.name} y su link de formulario.`,
      showCancelButton: true, confirmButtonText: 'Eliminar', cancelButtonText: 'Cancelar',
    });
    if (!confirm.isConfirmed) return;
    try {
      await deletePersona(persona.idTramitePersona);
      fetchPersonas();
    } catch (error) {
      console.error('Error al eliminar la persona:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar la persona.' });
    }
  };

  if (!show) return null;

  return (
    <div className={styles.overlay} onMouseDown={(e) => { if (e.target === e.currentTarget) onHide(); }}>
      <div className={styles.modal} style={{ maxWidth: 620 }}>
        <div className={styles.modalHead}>
          <div className={styles.modalHeadIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 7h6M9 11h6M9 15h4" /></svg>
          </div>
          <div className={styles.modalHeadInfo}>
            <div className={styles.modalEyebrow}>Folio #{String(idTransactProgress || '').padStart(6, '0')}</div>
            <div className={styles.modalTitle}>Formularios y personas</div>
            <div className={styles.modalSub}>Agrega a cada persona su link de DS-160 y marca cuando ya lo haya llenado</div>
          </div>
          <button className={styles.modalClose} onClick={onHide} aria-label="Cerrar">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 6l12 12M6 18L18 6" /></svg>
          </button>
        </div>

        <div className={styles.modalBody}>
          {cargando ? (
            <div className={rowStyles.empty}>Cargando...</div>
          ) : personas.length === 0 ? (
            <div className={rowStyles.empty}>Aún no hay personas registradas en este trámite.</div>
          ) : (
            <div className={rowStyles.list}>
              {personas.map((p) => (
                <div key={p.idTramitePersona} className={rowStyles.row}>
                  <div className={rowStyles.avatar}>{getInitials(p.name)}</div>
                  <div className={rowStyles.info}>
                    <div className={rowStyles.name}>{p.name}</div>
                    <div className={rowStyles.role}>{p.role}</div>
                  </div>
                  <input
                    className={`${styles.inp} ${rowStyles.linkInput}`}
                    type="text"
                    placeholder="Link del DS-160"
                    defaultValue={p.ds160Link || ''}
                    onBlur={(e) => { if (e.target.value !== (p.ds160Link || '')) handleUpdate(p, { ds160Link: e.target.value }); }}
                  />
                  <button
                    type="button"
                    className={`${rowStyles.statusTag} ${p.filled ? rowStyles.done : rowStyles.pending}`}
                    onClick={() => handleUpdate(p, { filled: !p.filled })}
                  >
                    {p.filled ? 'Llenado' : 'Pendiente'}
                  </button>
                  <button type="button" className={rowStyles.deleteBtn} onClick={() => handleEliminar(p)} aria-label="Eliminar persona">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" /></svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className={rowStyles.addRow}>
            <input className={styles.inp} type="text" placeholder="Nombre" value={nuevo.name} onChange={(e) => setNuevo((v) => ({ ...v, name: e.target.value }))} />
            <select className={styles.inp} value={nuevo.role} onChange={(e) => setNuevo((v) => ({ ...v, role: e.target.value }))}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <input className={styles.inp} type="text" placeholder="Link del DS-160 (opcional)" value={nuevo.ds160Link} onChange={(e) => setNuevo((v) => ({ ...v, ds160Link: e.target.value }))} />
            <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleAgregar} disabled={guardando}>
              {guardando ? 'Agregando...' : 'Agregar'}
            </button>
          </div>
        </div>

        <div className={styles.modalFoot}>
          <div className={styles.footSpacer}>
            <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={onHide}>Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

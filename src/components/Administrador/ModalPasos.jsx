import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { getStepById, updateSteps, deleteStepById } from './../../api/api.js';
import styles from './../../styles/ModalesServicio.module.css';

// Extraído 1:1 de "15-ModalesServicio (standalone).html" (modal ver pasos).
// El mockup no conecta el botón de editar (lápiz) a ninguna acción; aquí
// se reutiliza el mismo patrón de inputs que ya usa "Agregar paso" para
// permitir editar el nombre/descripción de un paso existente. Eliminar
// persiste de inmediato contra deleteStepById (igual que ActualizarPasos.jsx
// ya hacía); "Guardar cambios" crea/actualiza el resto vía updateSteps.

function IconSteps() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M8 6h13M8 12h13M8 18h13"></path><circle cx="3.5" cy="6" r="1.4"></circle><circle cx="3.5" cy="12" r="1.4"></circle><circle cx="3.5" cy="18" r="1.4"></circle></svg>;
}
function IconClose() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 6l12 12M6 18L18 6"></path></svg>;
}
function IconStepsSmall() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 11l3 3 8-8M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>;
}
function IconEdit() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"></path></svg>;
}
function IconTrash() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path></svg>;
}
function IconPlus() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"></path></svg>;
}
function IconCheck() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12l5 5L20 7"></path></svg>;
}

function renumerar(lista) {
  return lista.map((s, i) => ({ ...s, numStep: i + 1 }));
}

export default function ModalPasos({ show, onHide, servicio, onGuardado }) {
  const [steps, setSteps] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [confirmingKey, setConfirmingKey] = useState(null);

  useEffect(() => {
    if (!show || !servicio) return;
    fetchSteps();
    setConfirmingKey(null);
  }, [show, servicio]);

  const fetchSteps = async () => {
    try {
      setCargando(true);
      const response = await getStepById(servicio.idTransact);
      const lista = response?.success && Array.isArray(response.response?.StepsTransacts) ? response.response.StepsTransacts : [];
      setSteps(lista.map((s, i) => ({
        id: s.idStep,
        name: s.name || '',
        description: s.description || '',
        numStep: s.numStep || s.stepNumber || i + 1,
        needCalendar: s.needCalendar === 1,
        editing: false,
        isNew: false,
      })));
    } catch (error) {
      console.error('Error al obtener pasos:', error);
      setSteps([]);
    } finally {
      setCargando(false);
    }
  };

  if (!show || !servicio) return null;

  const keyOf = (step, idx) => step.id ?? `new-${idx}`;

  const toggleEdit = (idx) => setSteps((prev) => prev.map((s, i) => (i === idx ? { ...s, editing: !s.editing } : s)));

  const handleStepField = (idx, campo) => (e) => {
    const value = e.target.value;
    setSteps((prev) => prev.map((s, i) => (i === idx ? { ...s, [campo]: value } : s)));
  };

  const handleAgregarPaso = () => {
    setSteps((prev) => renumerar([...prev, { name: '', description: '', needCalendar: false, editing: true, isNew: true }]));
  };

  const handleConfirmarEliminar = async (idx) => {
    const step = steps[idx];
    if (step.id) {
      try {
        const res = await deleteStepById(step.id);
        if (res && res.success === false) throw new Error(res.message || 'No se pudo eliminar el paso');
      } catch {
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar el paso.' });
        setConfirmingKey(null);
        return;
      }
    }
    setSteps((prev) => renumerar(prev.filter((_, i) => i !== idx)));
    setConfirmingKey(null);
    onGuardado && onGuardado();
  };

  const handleGuardarCambios = async () => {
    if (steps.some((s) => !s.name || !s.description)) {
      Swal.fire({ icon: 'warning', title: 'Faltan datos', text: 'Todos los pasos necesitan nombre y descripción.' });
      return;
    }
    setGuardando(true);
    try {
      const formattedSteps = steps.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        numStep: s.numStep,
        needCalendar: s.needCalendar ? 1 : 0,
      }));
      if (formattedSteps.length > 0) {
        const results = await updateSteps(servicio.idTransact, formattedSteps);
        const conError = results.find((r) => r.error);
        if (conError) throw new Error(conError.message || 'Error al guardar algunos pasos');
      }
      Swal.fire({
        toast: true, position: 'top-end', icon: 'success', title: 'Pasos actualizados',
        showConfirmButton: false, timer: 2500, timerProgressBar: true,
      });
      onGuardado && onGuardado();
      onHide();
    } catch (error) {
      console.error('Error al guardar pasos', error);
      Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'No se pudieron guardar los pasos.' });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className={styles.scrim} onMouseDown={(e) => { if (e.target === e.currentTarget) onHide(); }}>
      <div className={`${styles.modal} ${styles.sm}`}>
        <div className={styles.modalHead}>
          <div className={styles.mhRow}>
            <div className={styles.mhIcon}><IconSteps /></div>
            <div>
              <div className={styles.mhEyebrow}>Pasos del servicio</div>
              <div className={styles.mhTitle}>{servicio.name}</div>
            </div>
          </div>
          <button className={styles.mhClose} onClick={onHide}><IconClose /></button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.stepsIntro}>
            <div className={styles.siIcon}><IconStepsSmall /></div>
            <div><div className={styles.siTitle}>Proceso del trámite</div><div className={styles.siSub}>Los pasos se renumeran automáticamente</div></div>
            <div className={styles.siCount}>{cargando ? '—' : steps.length}</div>
          </div>

          {!cargando && steps.map((step, idx) => {
            const key = keyOf(step, idx);
            const confirming = confirmingKey === key;
            return (
              <div key={key} className={`${styles.stepItem} ${confirming ? styles.confirming : ''}`}>
                <div className={styles.stepNum}>{step.numStep}</div>
                {step.editing ? (
                  <div className={styles.stepContent}>
                    <input className={`${styles.inp} ${styles.stepEditName}`} placeholder="Nombre del paso" value={step.name} onChange={handleStepField(idx, 'name')} />
                    <input className={`${styles.inp} ${styles.stepEditDesc}`} placeholder="Descripción del paso" value={step.description} onChange={handleStepField(idx, 'description')} />
                  </div>
                ) : (
                  <div className={styles.stepContent}>
                    <div className={styles.stepName}>{step.name}</div>
                    <div className={styles.stepDesc}>{step.description}</div>
                  </div>
                )}
                {!confirming && (
                  <div className={styles.stepActions}>
                    <button onClick={() => toggleEdit(idx)}><IconEdit /></button>
                    <button className={styles.del} onClick={() => setConfirmingKey(key)}><IconTrash /></button>
                  </div>
                )}
                {confirming && (
                  <div className={styles.confirmBar}>
                    <span className={styles.confirmText}>¿Eliminar?</span>
                    <button className={`${styles.confirmBtn} ${styles.yes}`} onClick={() => handleConfirmarEliminar(idx)}>Sí</button>
                    <button className={`${styles.confirmBtn} ${styles.no}`} onClick={() => setConfirmingKey(null)}>No</button>
                  </div>
                )}
              </div>
            );
          })}

          {!cargando && (
            <button className={styles.stepAdd} onClick={handleAgregarPaso}><IconPlus /> Agregar paso</button>
          )}
        </div>

        <div className={styles.modalFoot}>
          <button className={`${styles.btn} ${styles.btnGhost}`} onClick={onHide}>Cancelar</button>
          <button className={`${styles.btn} ${styles.btnPrimary}`} disabled={guardando || cargando} onClick={handleGuardarCambios}>
            {guardando ? 'Guardando…' : 'Guardar cambios'} <IconCheck />
          </button>
        </div>
      </div>
    </div>
  );
}

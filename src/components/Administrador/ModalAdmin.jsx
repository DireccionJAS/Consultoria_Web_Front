import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { createAdmin, actualizar as actualizarAdminAPI } from './../../api/api.js';
import styles from './../../styles/ClienteModal.module.css';

// Extraído 1:1 de "16-Admins (standalone).html" (modal crear/editar admin).
// Reutiliza ClienteModal.module.css porque la estructura (scrim/modal/
// campos/toggle) es genérica, no específica de clientes.

function IconAdmin() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM3 21v-2a5 5 0 0 1 5-5h2M19 16v6M22 19h-6"></path>
    </svg>
  );
}
function IconClose() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 6l12 12M6 18L18 6"></path></svg>;
}
function IconPersonSmall() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="7" r="4"></circle><path d="M3 21v-1a7 7 0 0 1 14 0v1"></path></svg>;
}
function IconEmail() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 6l-10 7L2 6"></path></svg>;
}
function IconPhone() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>;
}
function IconLock() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
}
function IconEye() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
}
function IconStatus() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><path d="M22 4L12 14.01l-3-3"></path></svg>;
}
function IconCheck() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12l5 5L20 7"></path></svg>;
}

const CAMPOS_INICIALES = { name: '', email: '', phone: '', password: '' };

export default function ModalAdmin({ show, onHide, admin, onGuardado }) {
  const esEdicion = !!admin;
  const [campos, setCampos] = useState(CAMPOS_INICIALES);
  const [status, setStatus] = useState(true);
  const [showPw, setShowPw] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!show) return;
    if (admin) {
      setCampos({ name: admin.name || '', email: admin.email || '', phone: admin.phone || '', password: '' });
      setStatus(!!admin.status);
    } else {
      setCampos(CAMPOS_INICIALES);
      setStatus(true);
    }
    setShowPw(false);
  }, [show, admin]);

  if (!show) return null;

  const handleChange = (campo) => (e) => setCampos((prev) => ({ ...prev, [campo]: e.target.value }));

  const handleGuardar = async () => {
    if (!campos.name || !campos.email || !campos.phone || (!esEdicion && !campos.password)) {
      Swal.fire({ icon: 'warning', title: 'Faltan datos', text: 'Completa los campos obligatorios.' });
      return;
    }

    setGuardando(true);
    try {
      if (esEdicion) {
        await actualizarAdminAPI(admin.idUser, { name: campos.name, email: campos.email, phone: campos.phone, status });
      } else {
        await createAdmin({ name: campos.name, email: campos.email, phone: campos.phone, password: campos.password, status });
      }
      Swal.fire({
        toast: true, position: 'top-end', icon: 'success',
        title: esEdicion ? 'Admin actualizado' : 'Admin registrado',
        showConfirmButton: false, timer: 2500, timerProgressBar: true,
      });
      onGuardado && onGuardado();
      onHide();
    } catch (error) {
      console.error('Error al guardar el admin', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo guardar el administrador.' });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className={styles.scrim} onMouseDown={(e) => { if (e.target === e.currentTarget) onHide(); }}>
      <div className={styles.modal}>
        <div className={styles.modalHead}>
          <div className={styles.modalHeadRow}>
            <div className={styles.modalHeadIcon}><IconAdmin /></div>
            <div>
              <div className={styles.modalEyebrow}>{esEdicion ? 'Editar administrador' : 'Nuevo administrador'}</div>
              <div className={styles.modalTitle}>{esEdicion ? 'Editar admin' : 'Agregar admin'}</div>
            </div>
          </div>
          <button className={styles.modalClose} onClick={onHide}><IconClose /></button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.grid2}>
            <div className={`${styles.field} ${styles.full}`}>
              <label className={styles.fieldLabel}>Nombre completo <span className={styles.req}>*</span></label>
              <div className={styles.inpWrap}>
                <span className={styles.inpIcon}><IconPersonSmall /></span>
                <input className={styles.inp} type="text" placeholder="Nombre y apellidos" value={campos.name} onChange={handleChange('name')} />
              </div>
            </div>

            <div className={`${styles.field} ${styles.full}`}>
              <label className={styles.fieldLabel}>Correo electrónico <span className={styles.req}>*</span></label>
              <div className={styles.inpWrap}>
                <span className={styles.inpIcon}><IconEmail /></span>
                <input className={styles.inp} type="email" placeholder="admin@consultoriajas.com" value={campos.email} onChange={handleChange('email')} />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>Teléfono <span className={styles.req}>*</span></label>
              <div className={styles.inpWrap}>
                <span className={styles.inpIcon}><IconPhone /></span>
                <input className={styles.inp} type="tel" placeholder="777 000 0000" value={campos.phone} onChange={handleChange('phone')} />
              </div>
            </div>

            {!esEdicion && (
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Contraseña <span className={styles.req}>*</span></label>
                <div className={styles.inpWrap}>
                  <span className={styles.inpIcon}><IconLock /></span>
                  <input className={styles.inp} type={showPw ? 'text' : 'password'} placeholder="Mínimo 8 caracteres" value={campos.password} onChange={handleChange('password')} />
                  <button className={styles.inpToggle} onClick={() => setShowPw((v) => !v)}><IconEye /></button>
                </div>
              </div>
            )}
          </div>

          <div className={`${styles.field} ${styles.full}`} style={{ marginBottom: 0 }}>
            <label className={styles.fieldLabel}>Estado de la cuenta</label>
            <div className={styles.statusBox}>
              <div className={styles.statusInfo}>
                <div className={`${styles.statusIcon} ${status ? styles.on : styles.off}`}><IconStatus /></div>
                <div>
                  <div className={styles.statusTitle}>{status ? 'Cuenta activa' : 'Cuenta inactiva'}</div>
                  <div className={styles.statusSub}>{status ? 'Puede acceder al panel y gestionar sus clientes' : 'No podrá acceder al panel'}</div>
                </div>
              </div>
              <div className={`${styles.tg} ${status ? styles.on : ''}`} onClick={() => setStatus((v) => !v)}></div>
            </div>
          </div>
        </div>

        <div className={styles.modalFoot}>
          <button className={`${styles.btn} ${styles.btnGhost}`} onClick={onHide}>Cancelar</button>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleGuardar} disabled={guardando}>
            {esEdicion ? 'Guardar cambios' : 'Guardar admin'} <IconCheck />
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { RegistrarCliente as registrarClienteAPI, actualizar as actualizarClienteAPI } from './../../api/api.js';
import styles from './../../styles/ClienteModal.module.css';

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function formatMesAnio(createdAt) {
  if (!createdAt) return null;
  const [datePart] = createdAt.split(' ');
  const [year, month] = (datePart || '').split('-');
  const idx = parseInt(month, 10) - 1;
  if (!year || Number.isNaN(idx) || idx < 0 || idx > 11) return null;
  return `${MESES[idx]} ${year}`;
}

function getIniciales(name) {
  if (!name) return '?';
  const partes = name.trim().split(/\s+/);
  const primera = partes[0]?.[0] ?? '';
  const segunda = partes[1]?.[0] ?? '';
  return (primera + segunda).toUpperCase();
}

function IconPerson() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="4"></circle>
      <path d="M4 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2"></path>
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M6 6l12 12M6 18L18 6"></path>
    </svg>
  );
}

function IconPersonSmall() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="7" r="4"></circle>
      <path d="M3 21v-1a7 7 0 0 1 14 0v1"></path>
    </svg>
  );
}

function IconEmail() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 6l-10 7L2 6"></path>
    </svg>
  );
}

function IconInfo() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M12 16v-4M12 8h.01"></path>
    </svg>
  );
}

function IconChevronDown() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--muted)' }}>
      <path d="M6 9l6 6 6-6"></path>
    </svg>
  );
}

function IconPhone() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
  );
}

function IconLock() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="11" width="18" height="11" rx="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
  );
}

function IconEye() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  );
}

function IconStatus() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <path d="M22 4L12 14.01l-3-3"></path>
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M5 12l5 5L20 7"></path>
    </svg>
  );
}

const CAMPOS_INICIALES = { name: '', email: '', phone: '', password: '' };

export default function ClienteModal({ show, onHide, cliente, onGuardado }) {
  const esEdicion = !!cliente;
  const [campos, setCampos] = useState(CAMPOS_INICIALES);
  const [status, setStatus] = useState(true);
  const [showPw, setShowPw] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!show) return;
    if (cliente) {
      setCampos({ name: cliente.name || '', email: cliente.email || '', phone: cliente.phone || '', password: '' });
      setStatus(!!cliente.status);
    } else {
      setCampos(CAMPOS_INICIALES);
      setStatus(true);
    }
    setShowPw(false);
  }, [show, cliente]);

  if (!show) return null;

  const handleChange = (campo) => (e) => {
    setCampos((prev) => ({ ...prev, [campo]: e.target.value }));
  };

  const handleGuardar = async () => {
    if (!campos.name || !campos.email || !campos.phone || (!esEdicion && !campos.password)) {
      Swal.fire({ icon: 'warning', title: 'Faltan datos', text: 'Completa los campos obligatorios.' });
      return;
    }

    setGuardando(true);
    try {
      if (esEdicion) {
        await actualizarClienteAPI(cliente.idUser, {
          name: campos.name,
          email: campos.email,
          phone: campos.phone,
          status,
        });
      } else {
        await registrarClienteAPI({
          name: campos.name,
          email: campos.email,
          phone: campos.phone,
          password: campos.password,
          status,
        });
      }
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: esEdicion ? 'Cliente actualizado' : 'Cliente registrado',
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
      });
      onGuardado && onGuardado();
      onHide();
    } catch (error) {
      console.error('Error al guardar el cliente', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo guardar el cliente.' });
    } finally {
      setGuardando(false);
    }
  };

  const mesAnio = esEdicion ? formatMesAnio(cliente.createdAt) : null;
  const tramitesActivos = esEdicion ? cliente.tramitesSummary?.activos ?? 0 : 0;
  const idFormateado = esEdicion ? String(cliente.idUser).padStart(5, '0') : '';

  return (
    <div className={styles.scrim} onMouseDown={(e) => { if (e.target === e.currentTarget) onHide(); }}>
      <div className={styles.modal}>
        <div className={styles.modalHead}>
          <div className={styles.modalHeadRow}>
            <div className={styles.modalHeadIcon}><IconPerson /></div>
            <div>
              <div className={styles.modalEyebrow}>{esEdicion ? 'Edición de cliente' : 'Registro de cliente'}</div>
              <div className={styles.modalTitle}>{esEdicion ? 'Editar cliente' : 'Agregar cliente'}</div>
            </div>
          </div>
          <button className={styles.modalClose} onClick={onHide}><IconClose /></button>
        </div>

        <div className={styles.modalBody}>
          {esEdicion && (
            <div className={`${styles.editInfo} ${styles.show}`}>
              <div className={styles.editInfoAvatar}>{getIniciales(cliente.name)}</div>
              <div>
                <div className={styles.editInfoText}>Editando a <strong>{cliente.name}</strong></div>
                <div className={styles.editInfoMeta}>
                  Cliente #{idFormateado}
                  {mesAnio && ` · registrado ${mesAnio}`}
                  {` · ${tramitesActivos} trámite${tramitesActivos !== 1 ? 's' : ''} activo${tramitesActivos !== 1 ? 's' : ''}`}
                </div>
              </div>
            </div>
          )}

          <div className={styles.grid2}>
            <div className={`${styles.field} ${styles.full}`}>
              <label className={styles.fieldLabel}>Nombre completo <span className={styles.req}>*</span></label>
              <div className={styles.inpWrap}>
                <span className={styles.inpIcon}><IconPersonSmall /></span>
                <input
                  className={styles.inp}
                  type="text"
                  placeholder="Nombre y apellidos"
                  value={campos.name}
                  onChange={handleChange('name')}
                />
              </div>
            </div>

            <div className={`${styles.field} ${styles.full}`}>
              <label className={styles.fieldLabel}>Correo electrónico <span className={styles.req}>*</span></label>
              <div className={styles.inpWrap}>
                <span className={styles.inpIcon}><IconEmail /></span>
                <input
                  className={styles.inp}
                  type="email"
                  placeholder="cliente@correo.com"
                  value={campos.email}
                  onChange={handleChange('email')}
                />
              </div>
              <div className={`${styles.fieldMsg} ${styles.hint}`}><IconInfo /> Se usará como usuario para iniciar sesión en el portal</div>
            </div>

            <div className={`${styles.field} ${styles.full}`}>
              <label className={styles.fieldLabel}>Teléfono <span className={styles.req}>*</span></label>
              <div className={styles.phoneWrap}>
                <div className={styles.countrySel}>
                  <span className={styles.countryFlag}>🇲🇽</span>
                  <span className={styles.countryCode}>+52</span>
                  <IconChevronDown />
                </div>
                <div className={styles.inpWrap} style={{ flex: 1 }}>
                  <span className={styles.inpIcon}><IconPhone /></span>
                  <input
                    className={styles.inp}
                    type="tel"
                    placeholder="777 123 4567"
                    value={campos.phone}
                    onChange={handleChange('phone')}
                  />
                </div>
              </div>
            </div>

            {!esEdicion && (
              <div className={`${styles.field} ${styles.full}`}>
                <label className={styles.fieldLabel}>Contraseña Consular <span className={styles.req}>*</span></label>
                <div className={styles.inpWrap}>
                  <span className={styles.inpIcon}><IconLock /></span>
                  <input
                    className={styles.inp}
                    type={showPw ? 'text' : 'password'}
                    placeholder="Mínimo 8 caracteres"
                    value={campos.password}
                    onChange={handleChange('password')}
                  />
                  <button className={styles.inpToggle} onClick={() => setShowPw((v) => !v)}><IconEye /></button>
                </div>
                <div className={styles.pwStrength}></div>
              </div>
            )}
          </div>

          <div className={`${styles.field} ${styles.full}`} style={{ marginBottom: 0 }}>
            <label className={styles.fieldLabel}>Estado de la cuenta</label>
            <div className={styles.statusBox}>
              <div className={styles.statusInfo}>
                <div className={`${styles.statusIcon} ${status ? styles.on : styles.off}`}>
                  <IconStatus />
                </div>
                <div>
                  <div className={styles.statusTitle}>{status ? 'Cuenta activa' : 'Cuenta inactiva'}</div>
                  <div className={styles.statusSub}>
                    {status ? 'El cliente puede iniciar sesión y ver sus trámites' : 'El cliente no podrá acceder al portal'}
                  </div>
                </div>
              </div>
              <div className={`${styles.tg} ${status ? styles.on : ''}`} onClick={() => setStatus((v) => !v)}></div>
            </div>
          </div>
        </div>

        <div className={styles.modalFoot}>
          <button className={`${styles.btn} ${styles.btnGhost}`} onClick={onHide}>Cancelar</button>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleGuardar} disabled={guardando}>
            {esEdicion ? 'Guardar cambios' : 'Guardar cliente'}
            <IconCheck />
          </button>
        </div>
      </div>
    </div>
  );
}

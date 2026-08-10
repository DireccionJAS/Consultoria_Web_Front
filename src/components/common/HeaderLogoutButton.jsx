import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import styles from '../../styles/HeaderLogoutButton.module.css';

function LogoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}
function WarnIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 9v4M12 17h.01M10.29 3.86l-8.18 14.14A2 2 0 0 0 3.82 21h16.36a2 2 0 0 0 1.71-3l-8.18-14.14a2 2 0 0 0-3.42 0z" />
    </svg>
  );
}

export default function HeaderLogoutButton() {
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const confirmLogout = () => {
    localStorage.removeItem('token');
    navigate('/Login');
  };

  return (
    <>
      <button
        type="button"
        className={styles.iconBtn}
        title="Cerrar sesión"
        aria-label="Cerrar sesión"
        onClick={() => setConfirmOpen(true)}
      >
        <LogoutIcon />
      </button>

      {confirmOpen && createPortal(
        <div className={styles.scrim} onClick={(e) => { if (e.target === e.currentTarget) setConfirmOpen(false); }}>
          <div className={styles.logoutModal}>
            <div className={styles.logoutIcon}><WarnIcon /></div>
            <div className={styles.logoutTitle}>¿Cerrar sesión?</div>
            <div className={styles.logoutText}>Tendrás que iniciar sesión de nuevo para acceder a tu panel.</div>
            <div className={styles.logoutFoot}>
              <button className={styles.logoutBtnGhost} onClick={() => setConfirmOpen(false)}>Cancelar</button>
              <button className={styles.logoutBtnDanger} onClick={confirmLogout}>Cerrar sesión</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

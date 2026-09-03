import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './../../styles/FloatingHomeButton.module.css';

function ArrowIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7"></path>
    </svg>
  );
}

const HOME_POR_ROL = {
  ADMIN: '/HomeAdmin',
  EMPRESA: '/HomeEmpresa',
  USER: '/ClienteHome',
};

// Botón flotante solo visible en móvil (mismo breakpoint 991.98px en el que
// las 3 sidebars se ocultan por completo) — sin él, entrar a una pantalla
// como Trámites/Clientes en el celular no dejaba forma de volver al panel
// principal, ya que ahí no queda ningún menú de navegación visible.
export default function FloatingHomeButton({ role }) {
  const location = useLocation();
  const home = HOME_POR_ROL[role];

  if (!home) return null;
  if (location.pathname === home || location.pathname === `${home}-sm`) return null;

  return (
    <Link to={home} className={styles.floatBack} aria-label="Volver al inicio">
      <ArrowIcon />
    </Link>
  );
}

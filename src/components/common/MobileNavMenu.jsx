import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './../../styles/MobileNavMenu.module.css';

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M4 7h16M4 12h16M4 17h16"></path>
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6 6 18M6 6l12 12"></path>
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18l6-6-6-6"></path>
    </svg>
  );
}

// Mismas secciones/rutas que cada Sidebar de escritorio (Admin/Empresa/Cliente)
// -- las 3 sidebars se ocultan por completo en movil (<991.98px) sin ningun
// menu de reemplazo, asi que la mayoria de pantallas (Pagos, Horarios,
// Servicios, Admins, Pagina Publica, etc.) eran inalcanzables desde el
// celular salvo por los 2 accesos directos del dashboard.
const MENU_POR_ROL = {
  ADMIN: {
    portal: 'Admin',
    secciones: [
      {
        items: [
          { label: 'Dashboard', path: '/HomeAdmin' },
          { label: 'Trámites', path: '/TramitesAdmin' },
          { label: 'Clientes', path: '/ClientesAdmin' },
          { label: 'Pagos', path: '/PagosAdmin' },
          { label: 'Calendario', path: '/CalendarioAdmin' },
        ],
      },
      {
        titulo: 'Sistema',
        items: [{ label: 'Mi Perfil', path: '/PerfilAdmin' }],
      },
    ],
  },
  EMPRESA: {
    portal: 'Empresa',
    secciones: [
      {
        titulo: 'Principal',
        items: [
          { label: 'Inicio', path: '/HomeEmpresa' },
          { label: 'Trámites', path: '/EmpresaTramites' },
          { label: 'Clientes', path: '/EmpresaClientes' },
          { label: 'Pagos', path: '/EmpresaPagos' },
          { label: 'Calendario', path: '/EmpresaCalendario' },
          { label: 'Horarios', path: '/EmpresaHorarios' },
        ],
      },
      {
        titulo: 'Gestión',
        items: [
          { label: 'Servicios', path: '/EmpresaServicios' },
          { label: 'Admins', path: '/EmpresaAdmins' },
        ],
      },
      {
        titulo: 'Configuración',
        items: [{ label: 'Página Pública', path: '/EmpresaPaginaPublica' }],
      },
      {
        titulo: 'Menú extendido',
        items: [
          { label: 'Prácticas Profesionales', path: '/EmpresaPracticas' },
          { label: 'Recursos', path: '/EmpresaRecursos' },
          { label: 'Legalidad', path: '/EmpresaLegalidad' },
        ],
      },
      {
        titulo: 'Sistema',
        items: [{ label: 'Mi Perfil', path: '/EmpresaPerfil' }],
      },
    ],
  },
  USER: {
    portal: 'Cliente',
    secciones: [
      {
        titulo: 'Menú',
        items: [
          { label: 'Inicio', path: '/ClienteHome' },
          { label: 'Servicios', path: '/ClienteServicios' },
          { label: 'Mis trámites', path: '/MisTramites' },
          { label: 'Formularios', path: '/Formularios' },
          { label: 'Citas', path: '/Calendario' },
          { label: 'Pagos', path: '/ClientePagos' },
        ],
      },
      {
        titulo: 'Cuenta',
        items: [{ label: 'Mi perfil', path: '/MiPerfil' }],
      },
    ],
  },
};

export default function MobileNavMenu({ role }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const config = MENU_POR_ROL[role];

  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    function handleKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  if (!config) return null;

  const ir = (path) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <div ref={rootRef}>
      <button className={styles.trigger} aria-label="Abrir menú" onClick={() => setOpen((o) => !o)}>
        <MenuIcon />
      </button>

      {open && <div className={styles.backdrop} onClick={() => setOpen(false)} />}

      {open && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>Portal {config.portal}</div>
            <button className={styles.closeBtn} aria-label="Cerrar menú" onClick={() => setOpen(false)}>
              <CloseIcon />
            </button>
          </div>
          <div className={styles.list}>
            {config.secciones.map((seccion, i) => (
              <div key={i} className={styles.seccion}>
                {seccion.titulo && <div className={styles.seccionTitulo}>{seccion.titulo}</div>}
                {seccion.items.map((item) => (
                  <div
                    key={item.path}
                    className={`${styles.item} ${location.pathname === item.path ? styles.active : ''}`}
                    onClick={() => ir(item.path)}
                  >
                    {item.label}
                    <ChevronIcon />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

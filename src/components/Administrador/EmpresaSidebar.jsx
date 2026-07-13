import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import styles from './../../styles/EmpresaSidebar.module.css';
import logo from './../../img/logo_letras_negras.png';

function HomeIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 12L12 3l9 9v9a2 2 0 0 1-2 2h-4v-7H10v7H6a2 2 0 0 1-2-2v-9z" /></svg>; }
function TramitesIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 11l3 3 8-8M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>; }
function ClientesIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="8" r="4" /><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2M17 11l2 2 4-4" /></svg>; }
function PagosIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="6" width="18" height="14" rx="2" /><path d="M3 10h18M7 14h4" /></svg>; }
function CalendarioIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>; }
function HorariosIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>; }
function ServiciosIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>; }
function AdminsIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="8" r="4" /><path d="M3 21v-1a6 6 0 0 1 6-6h0a6 6 0 0 1 6 6v1" /><circle cx="17" cy="8" r="3" /></svg>; }
function GlobeIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 0 20 15.3 15.3 0 0 1 0-20z" /></svg>; }
function ChevronIcon() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>; }
function PracticasIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 10L12 5 2 10l10 5 10-5zM6 12v5c0 1.5 2.5 3 6 3s6-1.5 6-3v-5" /></svg>; }
function RecursosIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>; }
function LegalidadIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2l8 4v6c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6z" /></svg>; }
function PerfilIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="7" r="4" /><path d="M3 21v-1a7 7 0 0 1 14 0v1" /></svg>; }
function LogoutIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>; }

const PAGINA_PUBLICA_SUBITEMS = [
  { key: 'inicio', label: 'Inicio' },
  { key: 'servicios', label: 'Servicios' },
  { key: 'nosotros', label: 'Nosotros' },
  { key: 'testimonios', label: 'Testimonios' },
  { key: 'faq', label: 'FAQ' },
  { key: 'contacto', label: 'Contacto' },
];

function NavItem({ icon, label, active, badge, onClick }) {
  return (
    <div className={`${styles.navItem} ${active ? styles.active : ''}`} onClick={onClick}>
      {icon}
      {label}
      {badge != null && <span className={styles.navBadge}>{badge}</span>}
    </div>
  );
}

export default function EmpresaSidebar({
  active = 'inicio',
  userName = 'Empresa JAS',
  tramitesCount = 87,
  clientesCount = 214,
  onNavigate,
}) {
  const navigate = useNavigate();
  const [paginaPublicaOpen, setPaginaPublicaOpen] = useState(active === 'pagina-publica');
  const activeSubItem = active.startsWith('pagina-publica:') ? active.split(':')[1] : null;

  const initials = (name) => {
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
  };

  const go = (key) => {
    if (onNavigate) onNavigate(key);
    if (key === 'inicio') navigate('/HomeEmpresa');
    if (key === 'tramites') navigate('/EmpresaTramites');
    if (key === 'clientes') navigate('/EmpresaClientes');
    if (key === 'pagos') navigate('/EmpresaPagos');
    if (key === 'calendario') navigate('/EmpresaCalendario');
  };

  const handleLogout = () => {
    Swal.fire({
      icon: 'warning',
      title: '¿Cerrar sesión?',
      text: 'Tendrás que iniciar sesión de nuevo para acceder a tu panel.',
      showCancelButton: true,
      confirmButtonText: 'Cerrar sesión',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
        navigate('/Login');
      }
    });
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <img src={logo} alt="JAS" />
        <div>
          <div className={styles.brandText}>Consultoría <em>JAS</em></div>
          <div className={styles.brandTag}>Empresa</div>
        </div>
      </div>

      <div className={styles.sbSection}>Principal</div>
      <NavItem icon={<HomeIcon />} label="Inicio" active={active === 'inicio'} onClick={() => go('inicio')} />
      <NavItem icon={<TramitesIcon />} label="Trámites" badge={tramitesCount} active={active === 'tramites'} onClick={() => go('tramites')} />
      <NavItem icon={<ClientesIcon />} label="Clientes" badge={clientesCount} active={active === 'clientes'} onClick={() => go('clientes')} />
      <NavItem icon={<PagosIcon />} label="Pagos" active={active === 'pagos'} onClick={() => go('pagos')} />
      <NavItem icon={<CalendarioIcon />} label="Calendario" active={active === 'calendario'} onClick={() => go('calendario')} />
      <NavItem icon={<HorariosIcon />} label="Horarios" active={active === 'horarios'} onClick={() => go('horarios')} />

      <div className={styles.sbSection}>Gestión</div>
      <NavItem icon={<ServiciosIcon />} label="Servicios" active={active === 'servicios'} onClick={() => go('servicios')} />
      <NavItem icon={<AdminsIcon />} label="Admins" active={active === 'admins'} onClick={() => go('admins')} />

      <div className={styles.sbSection}>Configuración</div>
      <div
        className={`${styles.navItem} ${paginaPublicaOpen ? styles.open : ''} ${active === 'pagina-publica' ? styles.active : ''}`}
        onClick={() => setPaginaPublicaOpen((o) => !o)}
      >
        <GlobeIcon />
        Página Pública
        <span className={styles.navChevron}><ChevronIcon /></span>
      </div>
      <div className={`${styles.navSubmenu} ${!paginaPublicaOpen ? styles.collapsed : ''}`}>
        {PAGINA_PUBLICA_SUBITEMS.map((item) => (
          <div
            key={item.key}
            className={`${styles.navSubitem} ${activeSubItem === item.key ? styles.active : ''}`}
            onClick={() => onNavigate && onNavigate(`pagina-publica:${item.key}`)}
          >
            {item.label}
          </div>
        ))}
      </div>

      <div className={styles.sbSection}>Menú extendido</div>
      <NavItem icon={<PracticasIcon />} label="Prácticas Profesionales" active={active === 'practicas'} onClick={() => go('practicas')} />
      <NavItem icon={<RecursosIcon />} label="Recursos" active={active === 'recursos'} onClick={() => go('recursos')} />
      <NavItem icon={<LegalidadIcon />} label="Legalidad" active={active === 'legalidad'} onClick={() => go('legalidad')} />

      <div className={styles.sbSection}>Sistema</div>
      <NavItem icon={<PerfilIcon />} label="Mi Perfil" active={active === 'perfil'} onClick={() => go('perfil')} />
      <NavItem icon={<LogoutIcon />} label="Cerrar Sesión" onClick={handleLogout} />

      <div className={styles.sbUser}>
        <div className={styles.sbAvatar}>{initials(userName)}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className={styles.sbUserName}>{userName}</div>
          <div className={styles.sbUserRole}>Empresa</div>
        </div>
      </div>
    </aside>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './../../styles/AdminSidebar.module.css';
import logo from './../../img/logo_letras_negras.png';

function HomeIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 12L12 3l9 9v9a2 2 0 0 1-2 2h-4v-7H10v7H6a2 2 0 0 1-2-2v-9z" /></svg>; }
function TramitesIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 11l3 3 8-8M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>; }
function ClientesIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="8" r="4" /><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2M17 11l2 2 4-4" /></svg>; }
function PagosIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="6" width="18" height="14" rx="2" /><path d="M3 10h18M7 14h4" /></svg>; }
function CalendarioIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>; }
function PerfilIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="7" r="4" /><path d="M3 21v-1a7 7 0 0 1 14 0v1" /></svg>; }
function LogoutIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>; }
function WarnIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 9v4M12 17h.01M10.29 3.86l-8.18 14.14A2 2 0 0 0 3.82 21h16.36a2 2 0 0 0 1.71-3l-8.18-14.14a2 2 0 0 0-3.42 0z" /></svg>; }

function NavItem({ icon, label, active, badge, onClick }) {
  return (
    <div className={`${styles.navItem} ${active ? styles.active : ''}`} onClick={onClick}>
      {icon}
      {label}
      {badge != null && <span className={styles.navBadge}>{badge}</span>}
    </div>
  );
}

export default function AdminSidebar({
  active = 'dashboard',
  userName = 'Admin',
  tramitesCount = null,
  clientesCount = null,
  onNavigate,
}) {
  const navigate = useNavigate();
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const initials = (name) => {
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
  };

  const go = (key) => {
    if (onNavigate) onNavigate(key);
    if (key === 'dashboard') navigate('/HomeAdmin');
    if (key === 'tramites') navigate('/TramitesAdmin');
    if (key === 'clientes') navigate('/ClientesAdmin');
    if (key === 'pagos') navigate('/PagosAdmin');
    if (key === 'calendario') navigate('/CalendarioAdmin');
    if (key === 'perfil') navigate('/PerfilAdmin');
  };

  const handleLogout = () => setLogoutConfirmOpen(true);
  const confirmLogout = () => {
    localStorage.removeItem('token');
    navigate('/Login');
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <img src={logo} alt="JAS" />
        <div>
          <div className={styles.brandText}>Consultoría <em>JAS</em></div>
          <div className={styles.brandTag}>Admin</div>
        </div>
      </div>

      <div className={styles.sbSection}>Principal</div>
      <NavItem icon={<HomeIcon />} label="Dashboard" active={active === 'dashboard'} onClick={() => go('dashboard')} />
      <NavItem icon={<TramitesIcon />} label="Trámites" badge={tramitesCount} active={active === 'tramites'} onClick={() => go('tramites')} />
      <NavItem icon={<ClientesIcon />} label="Clientes" badge={clientesCount} active={active === 'clientes'} onClick={() => go('clientes')} />
      <NavItem icon={<PagosIcon />} label="Pagos" active={active === 'pagos'} onClick={() => go('pagos')} />
      <NavItem icon={<CalendarioIcon />} label="Calendario" active={active === 'calendario'} onClick={() => go('calendario')} />

      <div className={styles.sbSection}>Sistema</div>
      <NavItem icon={<PerfilIcon />} label="Mi Perfil" active={active === 'perfil'} onClick={() => go('perfil')} />
      <NavItem icon={<LogoutIcon />} label="Cerrar Sesión" onClick={handleLogout} />

      <div className={styles.sbUser}>
        <div className={styles.sbAvatar}>{initials(userName)}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className={styles.sbUserName}>{userName}</div>
          <div className={styles.sbUserRole}>Admin</div>
        </div>
      </div>

      {logoutConfirmOpen && (
        <div className={styles.scrim} onClick={(e) => { if (e.target === e.currentTarget) setLogoutConfirmOpen(false); }}>
          <div className={styles.logoutModal}>
            <div className={styles.logoutIcon}><WarnIcon /></div>
            <div className={styles.logoutTitle}>¿Cerrar sesión?</div>
            <div className={styles.logoutText}>Tendrás que iniciar sesión de nuevo para acceder a tu panel.</div>
            <div className={styles.logoutFoot}>
              <button className={styles.logoutBtnGhost} onClick={() => setLogoutConfirmOpen(false)}>Cancelar</button>
              <button className={styles.logoutBtnDanger} onClick={confirmLogout}>Cerrar sesión</button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

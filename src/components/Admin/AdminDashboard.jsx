import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import AdminSidebar from './AdminSidebar.jsx';
import { clientePorId } from './../../api/api.js';
import styles from './../../styles/AdminDashboard.module.css';

function SearchIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--muted)' }}><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>; }
function BellIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M13.7 21a2 2 0 0 1-3.4 0" /></svg>; }
function ArrowIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 17L17 7M7 7h10v10" /></svg>; }
function ScopeIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>; }
function TramitesIcon({ size = 22 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 11l3 3 8-8M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>; }
function ClientesIcon({ size = 22 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="8" r="4" /><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2M17 11l2 2 4-4" /></svg>; }
function CalendarioIcon({ size = 22 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>; }

// Sin badges/conteos/agenda: no existe todavía un sistema de notificaciones ni
// de estadísticas agregadas en el backend para el Admin (trámites/clientes
// asignados, citas del día) — mostrar números o citas aquí sería inventar datos.
// Ver mismo criterio en EmpresaDashboard.jsx.
const NAV_CARDS = [
  {
    key: 'tramites', name: 'Trámites', desc: 'Trámites de tus clientes asignados.',
    icon: TramitesIcon, featured: true, path: '/TramitesAdmin',
  },
  {
    key: 'clientes', name: 'Clientes', desc: 'Clientes que la empresa te asignó.',
    icon: ClientesIcon, path: '/ClientesAdmin',
  },
  {
    key: 'calendario', name: 'Calendario', desc: 'Citas CAS, CON y simulaciones de tu cartera.',
    icon: CalendarioIcon, path: '/Calendar',
  },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/'); return; }
    let idUser;
    try {
      const decoded = jwtDecode(token);
      idUser = decoded.idUser;
      if (decoded.role !== 'ADMIN') { navigate('/'); return; }
    } catch (error) {
      console.error('Token inválido', error);
      localStorage.removeItem('token');
      navigate('/');
      return;
    }

    clientePorId(idUser)
      .then((response) => {
        if (response.success && response.response.user) {
          setNombre(response.response.user.name);
        }
      })
      .catch((error) => console.error('Error al obtener datos del admin:', error));
  }, [navigate]);

  const primerNombre = nombre ? nombre.trim().split(/\s+/)[0] : '';

  return (
    <div className={styles.dashboard}>
      <AdminSidebar active="dashboard" userName={nombre || 'Admin'} />

      <main className={styles.main}>
        <header className={styles.topbar}>
          <div>
            <div className={styles.crumb}><span>Principal</span> <span className={styles.crumbSep}>/</span> <span className={styles.accent}>Inicio</span></div>
            <div className={styles.pageTitle}>Panel principal</div>
          </div>

          <div className={styles.topSearch}>
            <SearchIcon />
            <input type="text" placeholder="Buscar mis clientes por cliente, trámite, servicio..." />
          </div>

          <div className={styles.topActions}>
            <button className={styles.iconBtn} aria-label="Notificaciones">
              <BellIcon />
            </button>
          </div>
        </header>

        <div className={styles.content}>
          <div className={styles.welcomeBlock}>
            <div className={styles.greet}>Buen día{primerNombre ? <>, <em>{primerNombre}</em></> : ''}.</div>
            <div className={styles.greetSub}>Bienvenido a tu panel de administración.</div>
          </div>

          <div className={styles.scopeBanner}>
            <div className={styles.scopeIcon}><ScopeIcon /></div>
            <div>
              <div className={styles.scopeTitle}>Estás viendo solo tu cartera asignada</div>
              <div className={styles.scopeDesc}>Los clientes y trámites que la Empresa te asignó. El resto del sistema no es visible para ti.</div>
            </div>
          </div>

          <div className={styles.gridSection}>
            <div>
              <div className={styles.sectionEyebrow}>— Módulos del sistema</div>
              <div className={styles.sectionTitle}>Accesos directos</div>
            </div>

            <div className={styles.navGrid}>
              {NAV_CARDS.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.key}
                    className={`${styles.navCard} ${card.featured ? styles.featured : ''}`}
                    onClick={() => navigate(card.path)}
                  >
                    <div className={styles.navCardTop}>
                      <div className={styles.navCardIcon}><Icon /></div>
                    </div>
                    <div className={styles.navCardBody}>
                      <div className={styles.navCardName}>{card.name}</div>
                      <div className={styles.navCardDesc}>{card.desc}</div>
                    </div>
                    <div className={styles.navCardFoot}>
                      <div className={styles.navArrow}><ArrowIcon /></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

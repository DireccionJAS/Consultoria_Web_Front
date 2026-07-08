import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import EmpresaSidebar from './EmpresaSidebar.jsx';
import styles from './../../styles/EmpresaDashboard.module.css';

function SearchIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--muted)' }}><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>; }
function BellIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M13.7 21a2 2 0 0 1-3.4 0" /></svg>; }
function PlusIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>; }
function ArrowIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 17L17 7M7 7h10v10" /></svg>; }
function TramitesIcon({ size = 22 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 11l3 3 8-8M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>; }
function ClientesIcon({ size = 22 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="8" r="4" /><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2M17 11l2 2 4-4" /></svg>; }
function ServiciosIcon({ size = 22 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>; }
function PagosIcon({ size = 22 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="6" width="18" height="14" rx="2" /><path d="M3 10h18M7 14h4" /></svg>; }
function CalendarioIcon({ size = 22 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>; }
function DocsIcon({ size = 22 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></svg>; }

const NAV_CARDS = [
  {
    key: 'tramites', name: 'Trámites', desc: 'Gestiona todos los trámites en curso, su estado y avance.',
    icon: TramitesIcon, badge: '5 pendientes', badgeStyle: null, count: '87', countLabel: 'activos', featured: true,
  },
  {
    key: 'clientes', name: 'Clientes', desc: 'Registro, edición y estado de cuentas de clientes.',
    icon: ClientesIcon, badge: '+24 nuevos', badgeStyle: { background: 'var(--green-soft)', color: 'var(--green)' }, count: '214', countLabel: 'registrados',
  },
  {
    key: 'servicios', name: 'Servicios', desc: 'Catálogo de visas, pasaportes y formularios.',
    icon: ServiciosIcon, badge: '13 activos', badgeStyle: { background: 'rgba(45, 108, 223, 0.12)', color: 'var(--c2)' }, count: '13', countLabel: 'en catálogo',
  },
  {
    key: 'pagos', name: 'Pagos', desc: 'Cobros, abonos y movimientos vía Stripe/PayPal.',
    icon: PagosIcon, badge: '2 por confirmar', badgeStyle: null, count: '$284k', countLabel: 'este mes',
  },
  {
    key: 'calendario', name: 'Calendario', desc: 'Citas CAS, CON y simulaciones diferenciadas por color.',
    icon: CalendarioIcon, badge: '4 hoy', badgeStyle: { background: 'var(--amber-soft)', color: 'var(--amber)' }, count: '38', countLabel: 'próximas 7d',
  },
  {
    key: 'documentos', name: 'Documentos', desc: 'Términos, Privacidad y otros documentos legales.',
    icon: DocsIcon, badge: '2 PDFs', badgeStyle: { background: 'rgba(0, 0, 42, 0.06)', color: 'var(--muted)' }, count: '2', countLabel: 'actualizados',
  },
];

export default function EmpresaDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/'); return; }
    try {
      const decoded = jwtDecode(token);
      if (decoded.role !== 'EMPRESA') { navigate('/'); }
    } catch (error) {
      console.error('Token inválido', error);
      localStorage.removeItem('token');
      navigate('/');
    }
  }, [navigate]);

  const handleNavigate = (key) => {
    console.log('Navegar a sección de sidebar:', key);
  };

  return (
    <div className={styles.dashboard}>
      <EmpresaSidebar active="inicio" onNavigate={handleNavigate} />

      <main className={styles.main}>
        <header className={styles.topbar}>
          <div>
            <div className={styles.crumb}><span>Empresa</span> <span className={styles.crumbSep}>/</span> <span className={styles.accent}>Inicio</span></div>
            <div className={styles.pageTitle}>Panel principal</div>
          </div>

          <div className={styles.topSearch}>
            <SearchIcon />
            <input type="text" placeholder="Buscar cliente, trámite, servicio..." />
            <span className={styles.kbd}>⌘K</span>
          </div>

          <div className={styles.topActions}>
            <button className={styles.iconBtn} aria-label="Notificaciones">
              <BellIcon />
              <span className={styles.badgeNum}>8</span>
            </button>
            <button className={styles.btnAccent}>
              <PlusIcon />
              Nuevo trámite
            </button>
          </div>
        </header>

        <div className={styles.content}>
          <div className={styles.welcomeRow}>
            <div>
              <div className={styles.greet}>Buen día, <em>Jasmín</em>.</div>
              <div className={styles.greetSub}>Hoy es miércoles 27 de mayo · tienes 4 citas y 5 trámites por revisar.</div>
            </div>
          </div>

          <div className={styles.notifBanner}>
            <div className={styles.notifIcon}>
              <div className={styles.ring}></div>
              <BellIcon />
            </div>
            <div className={styles.notifBody}>
              <div className={styles.notifTitle}>Tienes <span className={styles.notifCount}>8</span> notificaciones pendientes</div>
              <div className={styles.notifDesc}>5 trámites por revisar · 2 mensajes nuevos de clientes · 1 pago confirmado</div>
            </div>
            <button className={styles.notifCta}>
              Revisar todo
              <span style={{ marginLeft: 4 }}>→</span>
            </button>
          </div>

          <div className={styles.gridSection}>
            <div className={styles.sectionHeadRow}>
              <div>
                <div className={styles.sectionEyebrow}>— Módulos del sistema</div>
                <div className={styles.sectionTitle}>Accesos directos</div>
              </div>
              <button className={styles.btnOutline}>Personalizar</button>
            </div>

            <div className={styles.navGrid}>
              {NAV_CARDS.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.key} className={`${styles.navCard} ${card.featured ? styles.featured : ''}`}>
                    <div className={styles.navCardTop}>
                      <div className={styles.navCardIcon}><Icon /></div>
                      <span className={styles.navCardBadge} style={card.badgeStyle || undefined}>{card.badge}</span>
                    </div>
                    <div className={styles.navCardBody}>
                      <div className={styles.navCardName}>{card.name}</div>
                      <div className={styles.navCardDesc}>{card.desc}</div>
                    </div>
                    <div className={styles.navCardFoot}>
                      <div className={styles.navCardCount}>{card.count} <small>{card.countLabel}</small></div>
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

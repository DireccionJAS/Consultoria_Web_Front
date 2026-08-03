import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar.jsx';
import styles from './../../styles/AdminNotificaciones.module.css';

function IconBell() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M13.7 21a2 2 0 0 1-3.4 0"></path>
    </svg>
  );
}

function IconPerson() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="4"></circle>
      <path d="M4 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2"></path>
    </svg>
  );
}

function IconCard() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="6" width="18" height="14" rx="2"></rect>
      <path d="M3 10h18M7 14h4"></path>
    </svg>
  );
}

function IconCash() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="6" width="20" height="12" rx="2"></rect>
      <circle cx="12" cy="12" r="2.5"></circle>
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="18" rx="2"></rect>
      <path d="M16 2v4M8 2v4M3 10h18"></path>
    </svg>
  );
}

function IconWarning() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"></path>
      <path d="M12 9v4M12 17h.01"></path>
    </svg>
  );
}

const ICONS_POR_TIPO = {
  persona: IconPerson,
  pago: IconCard,
  efectivo: IconCash,
  cita: IconCalendar,
  aviso: IconWarning,
};

const NOTIFICACIONES_INICIALES = [
  {
    id: 1,
    tipo: 'persona',
    leida: false,
    hora: 'Hace 20 min · 24 jun, 14:10',
    mensaje: <>Se te ha asignado el cliente <strong>María Rodríguez</strong> para el trámite <strong>Visa Americana B1/B2</strong></>,
  },
  {
    id: 2,
    tipo: 'pago',
    leida: false,
    hora: 'Hace 1 h · 24 jun, 13:40',
    mensaje: <>El cliente <strong>María Rodríguez</strong> realizó un pago de <strong>$4,500</strong> por Visa B1/B2 mediante <strong>Stripe</strong></>,
  },
  {
    id: 3,
    tipo: 'cita',
    leida: false,
    hora: 'Hace 4 h · 24 jun, 10:30',
    mensaje: <>El cliente <strong>Carlos Domínguez</strong> agendó una cita de <strong>Simulación</strong> para el 28 jun a las 16:00</>,
  },
  {
    id: 4,
    tipo: 'cita',
    leida: false,
    hora: 'Ayer · 23 jun, 17:42',
    mensaje: <>El cliente <strong>Lucía Rangel</strong> cambió su cita del <strong>23 jun</strong> al <strong>30 jun</strong></>,
  },
  {
    id: 5,
    tipo: 'aviso',
    leida: false,
    hora: 'Ayer · 23 jun, 09:50',
    mensaje: <>El cliente <strong>Pedro Morales</strong> cambió su cita con menos de 24 horas. Comisión: <strong>$99</strong></>,
  },
  {
    id: 6,
    tipo: 'cita',
    leida: false,
    hora: '22 jun, 16:05',
    mensaje: <>Un visitante (<strong>Laura Méndez</strong>) agendó una cita de Atención al cliente para el 26 jun a las 10:00</>,
  },
  {
    id: 7,
    tipo: 'efectivo',
    leida: true,
    hora: '21 jun, 12:18',
    mensaje: <>El cliente <strong>Andrea Vega</strong> liquidó el pago total de su trámite <strong>eTA Canadá</strong></>,
  },
];

export default function AdminNotificaciones() {
  const [notificaciones, setNotificaciones] = useState(NOTIFICACIONES_INICIALES);
  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  const marcarLeida = (id) => {
    setNotificaciones((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true } : n)));
  };

  const marcarTodasLeidas = () => {
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
  };

  const handleNavigate = (key) => {
    console.log('Navegar a sección de sidebar:', key);
  };

  return (
    <div className={styles.page}>
      <AdminSidebar active="notificaciones" notificacionesCount={noLeidas || null} onNavigate={handleNavigate} />

      <main className={styles.main}>
        <header className={styles.topbar}>
          <div>
            <div className={styles.crumb}><span>Admin</span> <span className={styles.crumbSep}>/</span> <span className={styles.accent}>Notificaciones</span></div>
            <div className={styles.pageTitle}>Notificaciones</div>
          </div>
          <div className={styles.topActions}>
            <button className={styles.iconBtn} aria-label="Notificaciones">
              <IconBell />
              {noLeidas > 0 && <span className={styles.badgeNum}>{noLeidas}</span>}
            </button>
          </div>
        </header>

        <div className={styles.content}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitleWrap}>
                <div className={styles.cardTitle}>Notificaciones</div>
                {noLeidas > 0 && <span className={styles.cardBadge}>{noLeidas} nuevas</span>}
              </div>
              <button className={styles.markAllBtn} onClick={marcarTodasLeidas} disabled={noLeidas === 0}>
                Marcar todas como leídas
              </button>
            </div>

            <div className={styles.list}>
              {notificaciones.map((n) => {
                const Icon = ICONS_POR_TIPO[n.tipo];
                return (
                  <div
                    key={n.id}
                    className={`${styles.item} ${!n.leida ? styles.unread : ''}`}
                    onClick={() => marcarLeida(n.id)}
                  >
                    <div className={`${styles.itemIcon} ${styles[n.tipo]}`}>
                      <Icon />
                    </div>
                    <div className={styles.itemBody}>
                      <div className={styles.itemText}>{n.mensaje}</div>
                      <div className={styles.itemTime}>{n.hora}</div>
                    </div>
                    {!n.leida && <span className={styles.itemDot}></span>}
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

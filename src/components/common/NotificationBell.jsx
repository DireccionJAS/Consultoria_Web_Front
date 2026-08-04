import React, { useEffect, useRef, useState } from "react";
import styles from "./../../styles/NotificationBell.module.css";

function IconBell() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
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

const NOTIFICACIONES_EMPRESA = [
  {
    id: 1,
    tipo: "persona",
    leida: false,
    hora: "Hace 8 min · 24 jun, 14:32",
    mensaje: <>El cliente <strong>Andrea Vega</strong> se ha registrado en el sistema</>,
  },
  {
    id: 2,
    tipo: "pago",
    leida: false,
    hora: "Hace 1 h · 24 jun, 13:40",
    mensaje: <>El cliente <strong>María Rodríguez</strong> realizó un pago de <strong>$4,500</strong> por Visa B1/B2 mediante <strong>Stripe</strong></>,
  },
  {
    id: 3,
    tipo: "efectivo",
    leida: false,
    hora: "Hace 3 h · 24 jun, 11:15",
    mensaje: <>El admin <strong>Jasmín A.</strong> confirmó un pago en efectivo de <strong>$3,000</strong> del cliente <strong>Juan P. Ortiz</strong></>,
  },
  {
    id: 4,
    tipo: "cita",
    leida: false,
    hora: "Ayer · 23 jun, 18:20",
    mensaje: <>El cliente <strong>Carlos Domínguez</strong> agendó una cita de <strong>Simulación</strong> para el 28 jun a las 16:00</>,
  },
  {
    id: 5,
    tipo: "cita",
    leida: false,
    hora: "Ayer · 23 jun, 16:05",
    mensaje: <>Un visitante (<strong>Laura Méndez</strong>) agendó una cita de Atención al cliente para el 26 jun a las 10:00</>,
  },
  {
    id: 6,
    tipo: "aviso",
    leida: true,
    hora: "22 jun, 09:50",
    mensaje: <>El cliente <strong>Pedro Morales</strong> cambió su cita con menos de 24 horas. Comisión generada: <strong>$99</strong></>,
  },
];

const NOTIFICACIONES_ADMIN = [
  {
    id: 1,
    tipo: "persona",
    leida: false,
    hora: "Hace 20 min · 24 jun, 14:10",
    mensaje: <>Se te ha asignado el cliente <strong>María Rodríguez</strong> para el trámite <strong>Visa Americana B1/B2</strong></>,
  },
  {
    id: 2,
    tipo: "pago",
    leida: false,
    hora: "Hace 1 h · 24 jun, 13:40",
    mensaje: <>El cliente <strong>María Rodríguez</strong> realizó un pago de <strong>$4,500</strong> por Visa B1/B2 mediante <strong>Stripe</strong></>,
  },
  {
    id: 3,
    tipo: "cita",
    leida: false,
    hora: "Hace 4 h · 24 jun, 10:30",
    mensaje: <>El cliente <strong>Carlos Domínguez</strong> agendó una cita de <strong>Simulación</strong> para el 28 jun a las 16:00</>,
  },
  {
    id: 4,
    tipo: "cita",
    leida: false,
    hora: "Ayer · 23 jun, 17:42",
    mensaje: <>El cliente <strong>Lucía Rangel</strong> cambió su cita del <strong>23 jun</strong> al <strong>30 jun</strong></>,
  },
  {
    id: 5,
    tipo: "aviso",
    leida: false,
    hora: "Ayer · 23 jun, 09:50",
    mensaje: <>El cliente <strong>Pedro Morales</strong> cambió su cita con menos de 24 horas. Comisión: <strong>$99</strong></>,
  },
  {
    id: 6,
    tipo: "cita",
    leida: false,
    hora: "22 jun, 16:05",
    mensaje: <>Un visitante (<strong>Laura Méndez</strong>) agendó una cita de Atención al cliente para el 26 jun a las 10:00</>,
  },
  {
    id: 7,
    tipo: "efectivo",
    leida: true,
    hora: "21 jun, 12:18",
    mensaje: <>El cliente <strong>Andrea Vega</strong> liquidó el pago total de su trámite <strong>eTA Canadá</strong></>,
  },
];

export default function NotificationBell({ role = "empresa" }) {
  const initial = role === "admin" ? NOTIFICACIONES_ADMIN : NOTIFICACIONES_EMPRESA;
  const [notificaciones, setNotificaciones] = useState(initial);
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    function handleKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const marcarLeida = (id) => {
    setNotificaciones((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true } : n)));
  };

  const marcarTodasLeidas = () => {
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
  };

  return (
    <div className={styles.root} ref={rootRef}>
      <button className={styles.trigger} aria-label="Notificaciones" onClick={() => setOpen((o) => !o)}>
        <IconBell />
        {noLeidas > 0 && <span className={styles.triggerBadge}>{noLeidas}</span>}
      </button>

      {open && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitleWrap}>
              <div className={styles.panelTitle}>Notificaciones</div>
              {noLeidas > 0 && <span className={styles.panelBadge}>{noLeidas} nuevas</span>}
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
                  className={`${styles.item} ${!n.leida ? styles.unread : ""}`}
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
      )}
    </div>
  );
}

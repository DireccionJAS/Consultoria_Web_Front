import React, { useEffect, useRef, useState } from "react";
import { getNotificaciones, marcarNotificacionLeida, marcarTodasNotificacionesLeidas } from "./../../api/api.js";
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

// Refresca la bandeja cada 60s (mismo intervalo que Cliente/Calendario.jsx
// usa para horarios) para que el badge de no-leídas se mantenga al día sin
// depender de que el usuario recargue la página.
const INTERVALO_REFRESCO_MS = 60000;

// El backend decide a qué bandeja pertenece cada notificación según el rol
// real del JWT de quien llama (ver NotificationServiceImp.esVisibleParaCaller),
// no según ningún prop — los 8 call sites siguen pasando role="empresa"/
// "admin" mayormente por documentación in-situ, ya no tiene efecto aquí.
export default function NotificationBell() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const cargarNotificaciones = () => {
    getNotificaciones()
      .then((response) => {
        if (response.success && Array.isArray(response.response.notificaciones)) {
          setNotificaciones(response.response.notificaciones);
        }
      })
      .catch((error) => console.error("Error al obtener notificaciones:", error));
  };

  useEffect(() => {
    cargarNotificaciones();
    const interval = setInterval(cargarNotificaciones, INTERVALO_REFRESCO_MS);
    return () => clearInterval(interval);
  }, []);

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

  const marcarLeida = (idNotification) => {
    setNotificaciones((prev) => prev.map((n) => (n.idNotification === idNotification ? { ...n, leida: true } : n)));
    marcarNotificacionLeida(idNotification).catch((error) => console.error("Error al marcar notificación como leída:", error));
  };

  const marcarTodasLeidas = () => {
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
    marcarTodasNotificacionesLeidas().catch((error) => console.error("Error al marcar notificaciones como leídas:", error));
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
            {notificaciones.length === 0 ? (
              <div style={{ padding: '24px 16px', textAlign: 'center', fontSize: 13, color: 'rgba(0,0,42,0.5)' }}>
                No tienes notificaciones todavía.
              </div>
            ) : (
              notificaciones.map((n) => {
                const Icon = ICONS_POR_TIPO[n.tipo] || IconWarning;
                return (
                  <div
                    key={n.idNotification}
                    className={`${styles.item} ${!n.leida ? styles.unread : ""}`}
                    onClick={() => marcarLeida(n.idNotification)}
                  >
                    <div className={`${styles.itemIcon} ${styles[n.tipo]}`}>
                      <Icon />
                    </div>
                    <div className={styles.itemBody}>
                      <div className={styles.itemText}>{n.mensaje}</div>
                      <div className={styles.itemTime}>{n.createdAt}</div>
                    </div>
                    {!n.leida && <span className={styles.itemDot}></span>}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

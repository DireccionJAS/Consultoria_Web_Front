import React, { useEffect, useState } from 'react';
import { getServiceById } from './../../api/api.js';
import styles from './../../styles/PagoModals.module.css';

function IconPagos() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="6" width="18" height="14" rx="2"></rect>
      <path d="M3 10h18M7 14h4"></path>
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M6 6l12 12M6 18L18 6"></path>
    </svg>
  );
}

function IconCash() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <rect x="2" y="6" width="20" height="12" rx="2"></rect>
      <circle cx="12" cy="12" r="2.5"></circle>
    </svg>
  );
}

function getIniciales(name) {
  if (!name) return '?';
  const partes = name.trim().split(/\s+/);
  return ((partes[0]?.[0] || '') + (partes[1]?.[0] || '')).toUpperCase();
}

export default function ModalDetallePago({ show, onHide, pago, pagosDelTramite = [], onRegistrarEfectivo }) {
  const [costoTramite, setCostoTramite] = useState(null);
  const [cargandoCosto, setCargandoCosto] = useState(false);

  useEffect(() => {
    if (!show || !pago?.idTransact) return;
    setCargandoCosto(true);
    getServiceById(pago.idTransact)
      .then((data) => setCostoTramite(data?.response?.Transact?.cost ?? null))
      .catch(() => setCostoTramite(null))
      .finally(() => setCargandoCosto(false));
  }, [show, pago?.idTransact]);

  if (!show || !pago) return null;

  const pagado = pagosDelTramite.reduce((sum, p) => sum + (p.total ?? 0), 0);
  const restante = costoTramite != null ? Math.max(costoTramite - pagado, 0) : null;
  const pendiente = restante != null && restante > 0;

  const historial = [...pagosDelTramite].sort((a, b) => (a.dateStart ?? '').localeCompare(b.dateStart ?? ''));

  return (
    <div className={`${styles.root} ${styles.overlay}`} onClick={onHide}>
      <div className={`${styles.modal} ${styles.wide}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHead}>
          <div className={styles.mhRow}>
            <div className={styles.mhIcon}><IconPagos /></div>
            <div>
              <div className={styles.mhEyebrow}>Pago · #{pago.idPayment}</div>
              <div className={styles.mhTitle}>Detalle del pago</div>
            </div>
          </div>
          <button className={styles.mhClose} onClick={onHide}><IconClose /></button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.detClientrow}>
            <div className={styles.dcLeft}>
              <div className={styles.dcAv}>{getIniciales(pago.user?.name)}</div>
              <div>
                <div className={styles.dcName}>{pago.user?.name || 'No disponible'}</div>
                <div className={styles.dcSvc}>{pago.transact?.name || 'No disponible'} · folio #{pago.idTransact}</div>
              </div>
            </div>
            {restante != null && (
              <span className={`${styles.stTag} ${pendiente ? styles.stPend : styles.stPagado}`}>
                {pendiente ? 'Pendiente' : 'Pagado'}
              </span>
            )}
          </div>

          <div className={styles.detSummary}>
            <div className={styles.detBox}>
              <div className={styles.detBoxLbl}>Monto total</div>
              <div className={styles.detBoxVal}>{costoTramite != null ? `$${costoTramite.toLocaleString('es-MX')}` : cargandoCosto ? '…' : 'N/D'}</div>
            </div>
            <div className={styles.detBox}>
              <div className={styles.detBoxLbl}>Pagado</div>
              <div className={`${styles.detBoxVal} ${styles.paid}`}>${pagado.toLocaleString('es-MX')}</div>
            </div>
            <div className={styles.detBox}>
              <div className={styles.detBoxLbl}>Restante</div>
              <div className={`${styles.detBoxVal} ${styles.rest}`}>{restante != null ? `$${restante.toLocaleString('es-MX')}` : '—'}</div>
            </div>
          </div>

          <div className={styles.secLabel}>Historial de pagos</div>
          <table className={styles.htable}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Concepto</th>
                <th>Monto</th>
                <th>Método</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((p) => (
                <tr key={p.idPayment}>
                  <td><span className={styles.htdDate}>{p.dateStart || '—'}</span></td>
                  <td><span className={styles.mutedSmall}>Sin registrar</span></td>
                  <td><span className={styles.htdAmt}>${(p.total ?? 0).toLocaleString('es-MX')}</span></td>
                  <td><span className={styles.mutedSmall}>Sin registrar</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.modalFoot}>
          <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => onRegistrarEfectivo(pago)}>
            <IconCash /> Registrar pago en efectivo
          </button>
          <button className={`${styles.btn} ${styles.btnGhost}`} onClick={onHide}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

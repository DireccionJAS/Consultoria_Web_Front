import React, { useEffect, useState } from 'react';
import { registrarPagoEfectivo } from './../../api/api.js';
import styles from './../../styles/PagoModals.module.css';

function IconCash() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="6" width="20" height="12" rx="2"></rect>
      <circle cx="12" cy="12" r="2.5"></circle>
      <path d="M6 12h.01M18 12h.01"></path>
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

function IconUser() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="7" r="4"></circle>
      <path d="M3 21v-1a7 7 0 0 1 14 0v1"></path>
    </svg>
  );
}

function IconTramite() {
  return (
    <svg width="16" height="16" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="6" y="4" width="20" height="28" rx="2"></rect>
      <circle cx="16" cy="14" r="3.5"></circle>
      <path d="M10 22h12M10 26h8"></path>
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M5 12l5 5L20 7"></path>
    </svg>
  );
}

function IconInfo() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <path d="M22 4L12 14.01l-3-3"></path>
    </svg>
  );
}

const hoy = () => new Date().toISOString().slice(0, 10);

export default function ModalConfirmarPagoEfectivo({ show, onHide, pago, onConfirmado }) {
  const [concepto, setConcepto] = useState('Adelanto');
  const [monto, setMonto] = useState('');
  const [fecha, setFecha] = useState(hoy());
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (show) {
      setConcepto('Adelanto');
      setMonto('');
      setFecha(hoy());
    }
  }, [show]);

  if (!show || !pago) return null;

  const montoNumero = parseFloat(monto);
  const puedeConfirmar = !enviando && !Number.isNaN(montoNumero) && montoNumero > 0;

  const handleConfirmar = async () => {
    if (!puedeConfirmar) return;
    setEnviando(true);
    try {
      await registrarPagoEfectivo({
        idUser: pago.idUser,
        idTransact: pago.idTransact,
        total: montoNumero,
      });
      onConfirmado();
      onHide();
    } catch {
      // el error ya se reporta en consola dentro de registrarPagoEfectivo
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className={`${styles.root} ${styles.overlay}`} onClick={onHide}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHead}>
          <div className={styles.mhRow}>
            <div className={styles.mhIcon}><IconCash /></div>
            <div>
              <div className={styles.mhEyebrow}>Registrar pago</div>
              <div className={styles.mhTitle}>Confirmar pago en efectivo</div>
            </div>
          </div>
          <button className={styles.mhClose} onClick={onHide}><IconClose /></button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.roRow}>
            <div className={styles.roIcon}><IconUser /></div>
            <div><div className={styles.roLbl}>Cliente</div><div className={styles.roVal}>{pago.user?.name || 'No disponible'}</div></div>
          </div>
          <div className={styles.roRow} style={{ marginBottom: 18 }}>
            <div className={styles.roIcon}><IconTramite /></div>
            <div><div className={styles.roLbl}>Trámite</div><div className={styles.roVal}>{pago.transact?.name || 'No disponible'}</div></div>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Concepto <span className={styles.req}>*</span></label>
            <select className={styles.inp} value={concepto} onChange={(e) => setConcepto(e.target.value)}>
              <option>Adelanto</option>
              <option>Liquidación restante</option>
            </select>
          </div>

          <div className={styles.grid2}>
            <div className={styles.field} style={{ marginBottom: 0 }}>
              <label className={styles.fieldLabel}>Monto recibido <span className={styles.req}>*</span></label>
              <div className={styles.moneyWrap} style={{ height: 38 }}>
                <span className={styles.moneyPrefix}>$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  placeholder="0"
                />
                <span className={styles.moneySuffix}>MXN</span>
              </div>
            </div>
            <div className={styles.field} style={{ marginBottom: 0 }}>
              <label className={styles.fieldLabel}>Fecha del pago <span className={styles.req}>*</span></label>
              <input className={styles.inp} type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} style={{ height: 38 }} />
            </div>
          </div>

          <div className={styles.cashNote}>
            <IconInfo />
            <div className={styles.cashNoteText}>El pago se registrará en el historial del trámite y actualizará el saldo automáticamente.</div>
          </div>
        </div>

        <div className={styles.modalFoot}>
          <button className={`${styles.btn} ${styles.btnGhost}`} onClick={onHide}>Cancelar</button>
          <button className={`${styles.btn} ${styles.btnPrimary}`} disabled={!puedeConfirmar} onClick={handleConfirmar}>
            <IconCheck /> {enviando ? 'Confirmando…' : 'Confirmar pago'}
          </button>
        </div>
      </div>
    </div>
  );
}

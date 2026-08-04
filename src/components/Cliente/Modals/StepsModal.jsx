import React from 'react';
import { Modal } from 'react-bootstrap';
import styles from './../../../styles/servicios/client/ServiceModals.module.css';

function ListIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M8 6h13M8 12h13M8 18h13" /><circle cx="3.5" cy="6" r="1.4" /><circle cx="3.5" cy="12" r="1.4" /><circle cx="3.5" cy="18" r="1.4" /></svg>;
}
function ClockIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>;
}
function CloseIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 6l12 12M6 18L18 6" /></svg>;
}
function ArrowIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>;
}

const StepsModal = ({
  show,
  onHide,
  steps,
  loading = false,
  service = null,
  onContratar = null,
}) => {
  return (
    <Modal show={show} onHide={onHide} centered dialogClassName={styles.modalDialog}>
      <div className={styles.head}>
        <div className={styles.headInfo}>
          <div className={styles.headIcon}><ListIcon /></div>
          <div>
            <h2>Pasos del servicio</h2>
            {service?.name && (
              <div className={styles.headSub}>{service.name} · {steps.length} {steps.length === 1 ? 'paso' : 'pasos'}</div>
            )}
          </div>
        </div>
        <button className={styles.closeBtn} aria-label="Cerrar" onClick={onHide}><CloseIcon /></button>
      </div>

      <div className={styles.body}>
        {loading ? (
          <p className={styles.emptyState}>Cargando pasos...</p>
        ) : steps.length > 0 ? (
          <>
            <div className={styles.stepsSummary}>
              <div className={styles.ssIcon}><ClockIcon /></div>
              <div className={styles.ssMeta}>
                <div className={styles.ssItem}>
                  <span className={styles.ssVal}>{steps.length}</span>
                  <span className={styles.ssLab}>Pasos</span>
                </div>
                <div className={styles.ssItem}>
                  <span className={styles.ssVal}>4-8<small style={{ fontSize: 10 }}> sem</small></span>
                  <span className={styles.ssLab}>Duración</span>
                </div>
                <div className={styles.ssItem}>
                  <span className={styles.ssVal}>96<small style={{ fontSize: 10 }}>%</small></span>
                  <span className={styles.ssLab}>Éxito</span>
                </div>
              </div>
            </div>

            <div className={styles.stepsList}>
              {steps.map((step, index) => (
                <div key={step.idStep ?? index} className={styles.step}>
                  <div className={styles.stepNum}>{step.stepNumber ?? index + 1}</div>
                  <div className={styles.stepContent}>
                    <div className={styles.stepTitle}>{step.name}</div>
                    {step.description && <div className={styles.stepDesc}>{step.description}</div>}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className={styles.emptyState}>No hay pasos disponibles para este servicio.</p>
        )}
      </div>

      <div className={styles.foot}>
        <span className={styles.footNote}>Tiempos estimados según el trámite.</span>
        {onContratar && service && (
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => onContratar(service)}>
            Contratar este servicio
            <ArrowIcon />
          </button>
        )}
      </div>
    </Modal>
  );
};

export default StepsModal;

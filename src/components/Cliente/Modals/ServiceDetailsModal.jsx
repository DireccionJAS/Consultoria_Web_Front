import React from 'react';
import { Modal } from 'react-bootstrap';
import styles from './../../../styles/servicios/client/ServiceModals.module.css';

function CloseIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 6l12 12M6 18L18 6" /></svg>;
}
function ClockIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>;
}
function ApprovalIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg>;
}
function StepsIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>;
}
function ListIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M8 6h13M8 12h13M8 18h13" /><circle cx="3.5" cy="6" r="1.2" /><circle cx="3.5" cy="12" r="1.2" /><circle cx="3.5" cy="18" r="1.2" /></svg>;
}
function ArrowIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>;
}

const ServiceDetailsModal = ({
  show,
  onHide,
  service,
  onShowSteps,
  isZoomed,
  onToggleZoom,
  steps = [],
  loading = false,
  isFeatured = false,
  onContratar = null,
}) => {
  if (!service) return null;

  const cost = service.cost ?? service.cashAdvance ?? 0;
  const anticipo = service.cashAdvance ?? null;
  const showAnticipo = anticipo != null && cost > 0 && anticipo < cost;
  const restoPct = showAnticipo ? Math.round(((cost - anticipo) / cost) * 100) : null;

  return (
    <>
      <Modal show={show} onHide={onHide} centered dialogClassName={styles.modalWide}>
        <div className={styles.hero} style={service.image ? { backgroundImage: `url("${service.image}")` } : undefined}>
          {isFeatured && <span className={styles.heroTag}>Destacado</span>}
          <button className={styles.heroClose} aria-label="Cerrar" onClick={onHide}><CloseIcon /></button>
        </div>

        <div className={styles.content}>
          <h2>{service.name}</h2>
          <p className={styles.lead} style={{ whiteSpace: 'pre-line' }}>{service.description}</p>

          <div className={styles.sectionLabel}>Información clave</div>
          <div className={styles.metaGrid}>
            <div className={styles.metaCard}>
              <div className={styles.metaIcon}><ClockIcon /></div>
              <div className={styles.metaVal}>4-8<small style={{ fontSize: 11, fontFamily: 'var(--mono)', fontWeight: 500, color: 'var(--muted)' }}> sem</small></div>
              <div className={styles.metaLab}>Duración</div>
            </div>
            <div className={styles.metaCard}>
              <div className={styles.metaIcon}><ApprovalIcon /></div>
              <div className={styles.metaVal}>96%</div>
              <div className={styles.metaLab}>Aprobación</div>
            </div>
            <div className={styles.metaCard}>
              <div className={styles.metaIcon}><StepsIcon /></div>
              <div className={styles.metaVal}>{loading ? '—' : steps.length}</div>
              <div className={styles.metaLab}>Pasos</div>
            </div>
          </div>

          <div className={styles.priceRow}>
            <div>
              <div className={styles.priceLabel}>{showAnticipo ? 'Pago total' : 'Precio'}</div>
              <div className={styles.priceVal}>${cost.toLocaleString('es-MX')}<small>MXN</small></div>
            </div>
            {showAnticipo && (
              <div className={styles.priceDeposit}>
                <div className={styles.priceLabel}>Anticipo</div>
                <div className={styles.depositVal}>${anticipo.toLocaleString('es-MX')} MXN</div>
                <div className={styles.priceNote}>{restoPct}% al finalizar el trámite</div>
              </div>
            )}
          </div>

          {service.imageDetail && (
            <>
              <div className={styles.sectionLabel} style={{ marginTop: 20 }}>Detalle de costos</div>
              <img
                src={service.imageDetail}
                alt="Detalle de costos"
                style={{ width: '100%', borderRadius: 12, cursor: 'zoom-in', marginBottom: 6 }}
                onClick={onToggleZoom}
              />
              <p className={styles.priceNote}>Haz clic para ampliar</p>
            </>
          )}
        </div>

        <div className={styles.foot}>
          <button className={`${styles.btn} ${styles.btnOutline}`} onClick={() => onShowSteps(service.idTransact)}>
            <ListIcon /> Ver pasos
          </button>
          {onContratar && (
            <button className={`${styles.btn} ${styles.btnAccent}`} onClick={() => onContratar(service)}>
              Contratar ahora
              <ArrowIcon />
            </button>
          )}
        </div>
      </Modal>

      {isZoomed && (
        <div onClick={onToggleZoom} className={styles.imageZoomOverlay}>
          <div className={styles.imageZoomHeader}>
            <span className={styles.imageZoomTitle}>Información de costos</span>
            <button
              type="button"
              className={styles.imageZoomClose}
              onClick={(e) => { e.stopPropagation(); onToggleZoom(); }}
              aria-label="Cerrar"
            >
              &times;
            </button>
          </div>
          <img src={service.imageDetail} alt="Ampliado" className={styles.zoomedImage} />
        </div>
      )}
    </>
  );
};

export default ServiceDetailsModal;

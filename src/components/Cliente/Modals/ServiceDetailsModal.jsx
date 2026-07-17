import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import styles from './../../../styles/ClienteServicios.module.css';

const ServiceDetailsModal = ({ 
  show, 
  onHide, 
  service, 
  onShowSteps, 
  isZoomed, 
  onToggleZoom 
}) => {
  if (!service) return null;

  return (
    <>
      <Modal
        show={show}
        onHide={onHide}
        centered
        className={styles.previewModal}
      >
        <Modal.Header closeButton className={styles.modalHeader}>
          <Modal.Title className={styles.modalTitle}>{service.name}</Modal.Title>
        </Modal.Header>
        
        <Modal.Body className={styles.previewModalBody}>
          <div className={styles.previewContent}>
            {/* Sección de imagen */}
            <div className={styles.imageSection}>
              <img
                src={service.image}
                alt={service.name}
                className={styles.previewImage}
              />
            </div>

            {/* Sección de información */}
            <div className={styles.infoSection}>
              <div className={styles.descriptionContainer}>
                <h6 className={styles.sectionTitle}>Descripción</h6>
                <p className={styles.description} style={{ whiteSpace: 'pre-line' }}>
                  {service.description}
                </p>
              </div>

              <div className={styles.priceContainer}>
                <span className={styles.priceLabel}>Pago inicial:</span>
                <span className={styles.priceValue}>MX$ {service.cashAdvance}.00</span>
              </div>

              <div className={styles.detailSection}>
                <h6 className={styles.sectionTitle}>Información de costos</h6>
                <img
                  src={service.imageDetail}
                  alt="Detalle de costos"
                  className={styles.detailImage}
                  onClick={onToggleZoom}
                />
                <small className={styles.clickHint}>Haz clic para ampliar</small>
              </div>
            </div>
          </div>
        </Modal.Body>
        
        <Modal.Footer className={styles.previewModalFooter}>
          <Button 
            variant="info" 
            onClick={() => onShowSteps(service.idTransact)}
            className={styles.stepsButton}
          >
            Ver pasos
          </Button>
          <Button 
            variant="secondary" 
            onClick={onHide}
            className={styles.closeButton}
          >
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Zoom Overlay - Fuera del modal para pantalla completa */}
      {isZoomed && (
        <div
          onClick={onToggleZoom}
          className={styles.imageZoomOverlay}
        >
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
          <img
            src={service.imageDetail}
            alt="Ampliado"
            className={styles.zoomedImage}
          />
        </div>
      )}
    </>
  );
};

export default ServiceDetailsModal;
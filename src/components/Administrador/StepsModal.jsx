import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';  // IMPORTAR hook
import styles from './../../styles/AdminServicios.module.css';
import modalUtils from '../../utils/modalUtils.js';  // asegúrate que importas modalUtils

export default function StepsModal({ 
  show, 
  onHide, 
  onExited,
  steps = [], 
  serviceId,
  onClearSteps,
  onAddSteps
}) {
  const navigate = useNavigate();  // USAR hook

  const handleClose = () => {
    onHide();
    if (onClearSteps) {
      onClearSteps();
    }
  };

  const handleAddSteps = () => {
    if (!serviceId) {
      console.error('❌ No hay serviceId disponible para agregar pasos');
      return;
    }
    if (onAddSteps) {
      onAddSteps();
    }
  };

  const handleUpdateSteps = () => {
    if (!serviceId) return;
    onHide(); // Cerramos modal
    setTimeout(() => {
      modalUtils.smartCleanup();
      navigate("/ActualizarPasos", { state: { serviceID: serviceId, isEditMode: true } });  // NAVEGA
    }, 300);
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      onExited={onExited}
      centered
      className={styles.modalSteps}
    >
      <Modal.Header closeButton className="modal-header">
        <Modal.Title className="modal-title">Pasos del trámite</Modal.Title>
      </Modal.Header>

      <Modal.Body className="modal-body">
        {steps && steps.length > 0 ? (
          <ol className={styles.stepsList} style={{ paddingLeft: '0' }}>
            {steps.map((step, index) => (
              <li key={step.id || index} className={styles.stepItem}>
                {step.name}
              </li>
            ))}
          </ol>
        ) : (
          <div className={styles.noStepsContainer}>
            <p className={styles.loadingMessage}>
              No hay pasos disponibles para este trámite.
              {serviceId ? ' ¿Desea agregar pasos al trámite?' : ' ID de servicio no disponible.'}
            </p>
            {serviceId && (
              <Button
                onClick={handleAddSteps}
                className={`${styles.btnAddSteps} btn-info`}
              >
                Agregar pasos
              </Button>
            )}
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="modal-footer">
        <Button
          variant="secondary"
          onClick={handleClose}
          className={styles.btnSecondary}
        >
          Cerrar
        </Button>
        {steps && steps.length > 0 && serviceId && (
          <Button
            variant="primary"
            onClick={handleUpdateSteps}
            className={styles.btnPrimary}
          >
            Actualizar
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}

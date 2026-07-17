import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { getAllProcess, getStepById } from './../../api/api.js';
import Navbar from '../NavbarAdmin.jsx';
import ServicePreviewModal from './ServicePreviewModal.jsx';
import StepsModal from './StepsModal.jsx';
import ModalServicio from './ModalServicio.jsx';
import AdminServiceCard from './AdminServiceCard.jsx';
import modalUtils from '../../utils/modalUtils.js';
import ModalErrorBoundary from '../common/ModalErrorBoundary.jsx';

import styles from './../../styles/AdminServicios.module.css';

export default function AdministradorServicios() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);

  // Service Preview Modal states
  const [previewModalIsOpen, setPreviewModalIsOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  // Steps Modal states
  const [steps, setSteps] = useState([]);
  const [idService, setIdService] = useState(null);
  const [stepsModalIsOpen, setStepsModalIsOpen] = useState(false);
  const [serviceId, setServiceId] = useState(null);
  const [shouldNavigateToAddSteps, setShouldNavigateToAddSteps] = useState(false);

  // Modal de agregar servicio
  const [modalServicioAbierto, setModalServicioAbierto] = useState(false);

  // Función para mostrar los pasos del trámite (cuando das clic en "Ver pasos")
  const handleViewSteps = async (id) => {
    setServiceId(id);
    // aquí puedes traer los pasos desde el backend si lo necesitas
    setStepsModalIsOpen(true);
  };

  // Se invoca desde el modal cuando se quiere agregar pasos
  const handleRequestAddSteps = () => {
    setShouldNavigateToAddSteps(true);  // Marcar intención
    setStepsModalIsOpen(false);         // Cerrar el modal
  };
  useEffect(() => {
    // Aplicar el estilo de fondo al body cuando se monta el componente
    document.body.className = styles.backgroundBody;

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (decoded.role !== "ADMIN") {
        Swal.fire({
          icon: 'error',
          title: 'Acceso denegado',
          text: 'No tienes permiso para acceder a esta página.',
        });
        navigate("/");
      } else {
        fetchServices();
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      localStorage.removeItem("token");
      navigate("/");
    }

    // Cleanup: remover la clase cuando el componente se desmonte
    return () => {
      document.body.className = '';
    };
  }, [navigate]);

  const fetchServices = async () => {
    try {
      const response = await getAllProcess();
      if (response.success && Array.isArray(response.response.Transacts)) {
        setServices(response.response.Transacts);
      } else {
        console.error("Unexpected API response format:", response);
        setServices([]);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      setServices([]);
    }
  };

  const truncateDescription = (description, maxChars) => {
    if (!description) return '';
    return description.length > maxChars
      ? description.slice(0, maxChars) + '...'
      : description;
  };

  // Function to fetch steps by ID
  const fetchStepsById = async (stepId) => {
    try {
      const response = await getStepById(stepId);
      if (response.success && Array.isArray(response.response.StepsTransacts)) {
        setSteps(response.response.StepsTransacts);
      } else {
        setSteps([]);
      }
    } catch (error) {
      console.error("Error al obtener pasos:", error);
      setSteps([]);
    }
  };

  // Service Preview Modal handlers
  const openPreviewModal = async (service) => {
    setSelectedService(service);
    setPreviewModalIsOpen(true);
    setIdService(service.idTransact);
    await fetchStepsById(service.idTransact);
  };

  const closePreviewModal = () => {
    setSelectedService(null);
    setPreviewModalIsOpen(false);
    setSteps([]); // Clear the steps list
    // Usar utilidad inteligente de limpieza
    modalUtils.smartCleanup();
  };

  // Steps Modal handlers
  const openStepsModal = async (idTransact) => {
    try {
      setServiceId(idTransact);
      const response = await getStepById(idTransact);
      setSteps(response.response.StepsTransacts || []);
      setStepsModalIsOpen(true); // ✅
    } catch (error) {
      console.error('❌ Error al obtener pasos:', error);
      setSteps([]);
    }
  };

  const closeStepsModal = () => {
    setShowStepsModal(false);
    // Usar utilidad inteligente de limpieza
    modalUtils.smartCleanup();
  };

  const clearSteps = () => {
    setSteps([]);
  };

  const handleEditClick = (service) => {
    navigate(`/ActualizarServicio`, { state: { service } });
  };

  // Format the price to show only 2 decimals
  const formatPrice = (price) => price.toFixed(2);

  return (
    <div className={styles.container}>
      <div className="fixed-top">
        <Navbar title="- Servicios" />
      </div>

      <div className={styles.servicesSlider}>
        <h1 className={styles.title}>Servicios disponibles</h1>
        <div className={styles.servicesGrid}>
          {services.map((service, index) => (
            <AdminServiceCard
              key={index}
              service={service}
              onEdit={handleEditClick}
              onViewSteps={openStepsModal}
              onPreview={openPreviewModal}
              formatPrice={formatPrice}
              truncateDescription={truncateDescription}
            />
          ))}
        </div>
      </div>

      <div>
        <button
          className={styles.bottonAggregate}
          onClick={() => setModalServicioAbierto(true)}
        >
          Agregar Servicio
        </button>
      </div>

      {/* Service Preview Modal */}
      <ModalErrorBoundary onReset={() => {
        setStepsModalIsOpen(false);  // ✅
        setSteps([]);
      }}>
        <ServicePreviewModal
          show={previewModalIsOpen}
          onHide={closePreviewModal}
          service={selectedService}
          onViewSteps={openStepsModal}
        />
      </ModalErrorBoundary>

      {/* Steps Modal */}
      <ModalErrorBoundary onReset={() => {
        setShowStepsModal(false);
        setSteps([]);
      }}>
        <StepsModal
          show={stepsModalIsOpen}
          onHide={() => setStepsModalIsOpen(false)}
          serviceId={serviceId}
          steps={steps}
          onClearSteps={() => setSteps([])}
          onAddSteps={handleRequestAddSteps}
          onExited={() => {
            modalUtils.smartCleanup();
            if (shouldNavigateToAddSteps && serviceId) {
              setShouldNavigateToAddSteps(false);
              navigate("/RegistrarPasos", { state: { serviceID: serviceId } });
            }
          }}
        />

      </ModalErrorBoundary>

      <ModalServicio
        show={modalServicioAbierto}
        onHide={() => setModalServicioAbierto(false)}
        servicio={null}
        onGuardado={fetchServices}
      />
    </div>
  );
}
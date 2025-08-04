import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { getAllProcess, getStepById } from './../../api/api.js';
import Navbar from '../NavbarAdmin.jsx';
import Slider from 'react-slick';
import { Icon } from '@iconify/react';
import ServicePreviewModal from './ServicePreviewModal.jsx';
import StepsModal from './StepsModal.jsx';
import AdminServiceCard from './AdminServiceCard.jsx';
import modalUtils from '../../utils/modalUtils.js';
import ModalErrorBoundary from '../common/ModalErrorBoundary.jsx';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import styles from './../../styles/AdminServicios.module.css';

export default function AdministradorServicios() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);

  // Service Preview Modal states
  const [previewModalIsOpen, setPreviewModalIsOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  // Steps Modal states
  const [steps, setSteps] = useState([]);
  const [idService, setIdService] = useState(null);
  const [stepsModalIsOpen, setStepsModalIsOpen] = useState(false);
  const [serviceId, setServiceId] = useState(null);
  const [shouldNavigateToAddSteps, setShouldNavigateToAddSteps] = useState(false);

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

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      setIdService(idTransact); // Set ID first
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

  // Custom arrows for slider
  const PrevArrow = ({ onClick }) => (
    <div className={styles.slickArrowPrev} onClick={onClick}>
      <Icon icon="mdi:arrow-left-circle" width="30" height="30" color="black" />
    </div>
  );

  const NextArrow = ({ onClick }) => (
    <div className={styles.slickArrowNext} onClick={onClick}>
      <Icon icon="mdi:arrow-right-circle" width="30" height="30" color="black" />
    </div>
  );

  const sliderSettings = {
    dots: false,
    infinite: services.length > 3,
    speed: 300,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 3, infinite: services.length > 3 } },
      { breakpoint: 900, settings: { slidesToShow: 1, infinite: services.length > 1, centerMode: true, centerPadding: '0px' } },
      { breakpoint: 600, settings: { slidesToShow: 1, infinite: services.length > 1, centerMode: true, centerPadding: '0px', arrows: false, dots: true } }
    ]
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
        {isMobile ? (
          <div className={styles.mobileContainer}>
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
        ) : (
          <div className={styles.desktopSlider}>
            <Slider {...sliderSettings}>
              {services.map((service, index) => (
                <div key={index} className={styles.sliderItem}>
                  <AdminServiceCard
                    key={index}
                    service={service}
                    onEdit={handleEditClick}
                    onViewSteps={openStepsModal}
                    onPreview={openPreviewModal}
                    formatPrice={formatPrice}
                    truncateDescription={truncateDescription}
                  />
                </div>
              ))}
            </Slider>
          </div>
        )}
      </div>

      <div>
        <button
          className={styles.bottonAggregate}
          onClick={() => navigate("/RegistrarServicio")}
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
    </div>
  );
}
// ClienteServicios.jsx (Refactorizado)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { getAllProcess, getStepById } from './../../api/api.js';
import Navbar from '../NavbarUser.jsx';
import Slider from 'react-slick';
import { Icon } from '@iconify/react';

// Importar los modales separados
import ServiceDetailsModal from './Modals/ServiceDetailsModal.jsx';
import PaymentModal from './Modals/PaymentModal.jsx';
import StepsModal from './Modals/StepsModal.jsx';
import ServiceCard from './ServiceCard.jsx';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import styles from './../../styles/ClienteServicios.module.css';

export default function ClienteServicios() {
  const navigate = useNavigate();

  // Estados principales
  const [services, setServices] = useState([]);
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);
  const [preselectedServiceId, setPreselectedServiceId] = useState(null);

  // Estados para modal de detalles
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);

  // Estados para modal de pasos
  const [stepsModalOpen, setStepsModalOpen] = useState(false);
  const [steps, setSteps] = useState([]);
  const [stepsLoading, setStepsLoading] = useState(false);

  // Estados para modal de pago
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [serviceToPay, setServiceToPay] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/");

    try {
      const decoded = jwtDecode(token);
      setUserEmail(decoded.sub || "");
      setUserId(decoded.idUser || "");

      if (decoded.role !== "USER") {
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
  }, [navigate]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Efecto para manejar servicio preseleccionado desde la landing page
  useEffect(() => {
    const checkPreselectedService = () => {
      const selectedServiceData = sessionStorage.getItem('selectedService');

      
      if (selectedServiceData && services.length > 0) {
        try {
          const selectedService = JSON.parse(selectedServiceData);
          
          // Buscar el servicio en la lista actual
          const serviceExists = services.find(s => s.idTransact === selectedService.idTransact);
          
          if (serviceExists) {
            console.log('Estableciendo servicio preseleccionado para resaltado');
            // Establecer el ID del servicio preseleccionado para resaltado visual
            setPreselectedServiceId(serviceExists.idTransact);
            
            // Abrir el modal de pago directamente después de un breve delay
            console.log('Abriendo modal de pago en 1 segundo...');
            setTimeout(() => {
              console.log('Abriendo modal de pago para:', serviceExists);
              setServiceToPay(serviceExists);
              setPaymentModalOpen(true);
              // Limpiar el sessionStorage después de usar
              sessionStorage.removeItem('selectedService');
              console.log('SessionStorage limpiado');
            }, 1000);
          } else {
            console.log('Servicio no encontrado en la lista actual');
          }
        } catch (error) {
          console.error("Error parsing selected service:", error);
          sessionStorage.removeItem('selectedService');
        }
      } else {
        console.log('No hay servicio preseleccionado o servicios aún no cargados');
      }
    };

    if (services.length > 0) {
      checkPreselectedService();
    }
  }, [services]);

  // Efecto para limpiar el resaltado visual después de unos segundos
  useEffect(() => {
    if (preselectedServiceId) {
      const timer = setTimeout(() => {
        setPreselectedServiceId(null);
      }, 10000); // Limpiar después de 10 segundos

      return () => clearTimeout(timer);
    }
  }, [preselectedServiceId]);
const fetchServices = async () => {
  try {
    console.log('Iniciando carga de servicios...');
    const response = await getAllProcess();
    if (response.success && Array.isArray(response.response.Transacts)) {
      const allServices = response.response.Transacts;
      const activeServices = allServices.filter(service => service.status === true);
      setServices(activeServices);
    } else {
      console.error("Unexpected API response format:", response);
      setServices([]);
    }
  } catch (error) {
    console.error("Error fetching services:", error);
    setServices([]);
  }
};


  const fetchStepsById = async (idTransact) => {
    setStepsLoading(true);
    try {
      const response = await getStepById(idTransact);
      if (response.success && Array.isArray(response.response.StepsTransacts)) {
        setSteps(response.response.StepsTransacts);
      } else {
        setSteps([]);
      }
    } catch (error) {
      console.error("Error al obtener pasos:", error);
      setSteps([]);
    } finally {
      setStepsLoading(false);
    }
  };

  const truncateDescription = (text, max) =>
    text?.length > max ? `${text.slice(0, max)}...` : text || '';

  // Componentes de flechas para el slider
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
    infinite: false,
    speed: 300,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      { breakpoint: 1400, settings: { slidesToShow: 2, infinite: services.length > 2 } },
      { breakpoint: 900, settings: { slidesToShow: 1, infinite: services.length > 1, centerMode: true, centerPadding: '0px' } },
      { breakpoint: 600, settings: { slidesToShow: 1, infinite: services.length > 1, centerMode: true, centerPadding: '0px', arrows: false, dots: true } }
    ]
  };

  // Handlers para modal de detalles
  const handleOpenDetailsModal = async (service) => {
    setSelectedService(service);
    setDetailsModalOpen(true);
    await fetchStepsById(service.idTransact);
  };

  const handleCloseDetailsModal = () => {
    setSelectedService(null);
    setDetailsModalOpen(false);
    setSteps([]);
    setIsZoomed(false);
  };

  const handleToggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  // Handlers para modal de pasos
  const handleOpenStepsModal = async (idTransact) => {
    console.log("idTransact:", idTransact);
    await fetchStepsById(idTransact);
    setStepsModalOpen(true);
  };

  const handleCloseStepsModal = () => {
    setStepsModalOpen(false);
    setSteps([]);
  };

  // Handlers para modal de pago
  const handleOpenPaymentModal = (service) => {
    setServiceToPay(service);
    setPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setServiceToPay(null);
    setPaymentModalOpen(false);
  };

  const handlePaymentSuccess = () => {
    handleClosePaymentModal();
    if (serviceToPay.name && /160/.test(serviceToPay.name)) {
      Swal.fire({
        title: '¡Pago procesado!',
        text: 'Un correo se ha enviado a ' + userEmail + ', con los detalles de la transacción.',
        icon: 'info',
        confirmButtonText: 'Entendido'
      });

    } else {
      Swal.fire('¡Listo!', 'Tu pago se procesó correctamente.', 'success');
    }
  };

  const handlePaymentError = (error) => {
    Swal.fire('Error', error.message || 'Falló el pago.', 'error');
  };
  <style jsx>{`
                .navbar-fixed {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    z-index: 1001; /* Más alto que el navbar original */
                    width: 100%;
                }'
  `}</style>

  return (
    <div className={styles.container}>
      <div className="navbar-fixed">
        <Navbar title="- Servicios" />
      </div>

      <div className={styles.servicesSlider}>
        <h1 className={styles.title}>Servicios disponibles</h1>
        {preselectedServiceId && (
          <div className={styles.preselectedNotice}>
            <p>🎯 Servicio seleccionado desde la página principal</p>
          </div>
        )}
        {isMobile ? (
          <div className={styles.mobileContainer}>
            {services.map((service, index) => (
              <ServiceCard
                key={index}
                service={service}
                onShowDetails={handleOpenDetailsModal}
                onPay={handleOpenPaymentModal}
                isPreselected={service.idTransact === preselectedServiceId}
              />
            ))}
          </div>
        ) : (
          <div className={styles.desktopSlider} style={{ width: '100%' }}>
            <Slider {...sliderSettings} variableWidth={false}>
              {services.map((service, index) => (
                <div key={index} className={styles.sliderItem} style={{ width: '100%' }}>
                  <ServiceCard
                    key={index}
                    service={service}
                    onShowDetails={handleOpenDetailsModal}
                    onPay={handleOpenPaymentModal}
                    isPreselected={service.idTransact === preselectedServiceId}
                  />
                </div>
              ))}
            </Slider>
          </div>
        )}
      </div>

      {/* Modal de Detalles del Servicio */}
      <ServiceDetailsModal
        show={detailsModalOpen}
        onHide={handleCloseDetailsModal}
        service={selectedService}
        onShowSteps={handleOpenStepsModal}
        isZoomed={isZoomed}
        onToggleZoom={handleToggleZoom}
      />

      {/* Modal de Pago */}
      <PaymentModal
        show={paymentModalOpen}
        onHide={handleClosePaymentModal}
        service={serviceToPay}
        userEmail={userEmail}
        userId={userId}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />

      {/* Modal de Pasos */}
      <StepsModal
        show={stepsModalOpen}
        onHide={handleCloseStepsModal}
        steps={steps}
        loading={stepsLoading}
      />
    </div>
  );
}
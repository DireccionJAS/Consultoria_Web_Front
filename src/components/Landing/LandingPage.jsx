import React, { useState, useEffect, useRef } from "react";
import { getAllProcess, getStepById, getPaginaPublicaConfig } from './../../api/api.js';
import ServiceDetailsModal from './../Cliente/Modals/ServiceDetailsModal.jsx';
import StepsModal from './../Cliente/Modals/StepsModal.jsx';
import PaymentModal from './../Cliente/Modals/PaymentModal.jsx';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import 'leaflet/dist/leaflet.css';

// Importar componentes separados
import LandingNavbar from './LandingNavbar.jsx';
import HeroSection from './HeroSection.jsx';
import MarqueeSection from './MarqueeSection.jsx';
import ServicesSection from './ServicesSection.jsx';
import AboutSection from './AboutSection.jsx';
import StatsSection from './StatsSection.jsx';
import AgendaSection from './AgendaSection.jsx';
import TestimonialsSection from './TestimonialsSection.jsx';
import FAQSection from './FAQSection.jsx';
import ContactSection from './ContactSection.jsx';
import PracticasSection from './PracticasSection.jsx';
import FooterSection from './FooterSection.jsx';

// Scroll con curva tipo edición (lento-rápido-lento) hasta `el`, dejando
// espacio para la barra fija de arriba. Resuelve al llegar. Con "reducir
// movimiento" (Windows: efectos de animación apagados) es más corto.
const ESPACIO_NAVBAR = 110;
function scrollSuave(el) {
  return new Promise((resolve) => {
    if (!el) { resolve(); return; }
    const inicio = window.scrollY;
    const destino = Math.max(0, el.getBoundingClientRect().top + inicio - ESPACIO_NAVBAR);
    const distancia = destino - inicio;
    const reducir = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (Math.abs(distancia) < 4) {
      window.scrollTo({ top: destino, behavior: 'instant' });
      resolve();
      return;
    }
    // Más distancia = un poco más de tiempo, sin pasar de ~1.4 s.
    const duracion = reducir ? 450 : Math.min(1400, 650 + Math.abs(distancia) * 0.25);
    const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const t0 = performance.now();
    const paso = (ahora) => {
      const t = Math.min(1, (ahora - t0) / duracion);
      // behavior 'instant': el html tiene scroll-behavior: smooth y si no,
      // cada cuadro se animaría por su cuenta (se ve trabado).
      window.scrollTo({ top: inicio + distancia * easeInOutCubic(t), behavior: 'instant' });
      if (t < 1) requestAnimationFrame(paso);
      else resolve();
    };
    requestAnimationFrame(paso);
  });
}

export default function LandingPage() {
  const [services, setServices] = useState([]);
  const [activeSection, setActiveSection] = useState('hero');
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [stepsModalOpen, setStepsModalOpen] = useState(false);
  const [stepsService, setStepsService] = useState(null);
  const [steps, setSteps] = useState([]);
  const [stepsLoading, setStepsLoading] = useState(false);
  const [faqActiveIndex, setFaqActiveIndex] = useState(0);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedServiceForPayment, setSelectedServiceForPayment] = useState(null);
  const [servicioDestacadoId, setServicioDestacadoId] = useState(null);
  const [destinoServicios, setDestinoServicios] = useState({});
  const [highlightServiceId, setHighlightServiceId] = useState(null);
  const [destinoVisibleId, setDestinoVisibleId] = useState(null);
  const [whatsapp, setWhatsapp] = useState(null);
  const highlightTimeoutRef = useRef(null);

  // Servicio destacado: se elige en Empresa > Página pública > Servicios.
  // No reordena `services` directamente (evita condiciones de carrera con
  // fetchServices) — ServicesSection recibe orderedServices ya calculado.
  useEffect(() => {
    getPaginaPublicaConfig()
      .then((response) => {
        if (!response.success || !response.response?.config) return;
        const c = response.response.config;
        if (c.servicioDestacadoId != null) setServicioDestacadoId(c.servicioDestacadoId);
        if (c.whatsapp) setWhatsapp(c.whatsapp);
        setDestinoServicios({
          visaUsa: c.servicioVisaUsa ?? null,
          visaIndia: c.servicioVisaIndia ?? null,
          visaEgipto: c.servicioVisaEgipto ?? null,
          etaCanada: c.servicioEtaCanada ?? null,
          visaCanada: c.servicioVisaCanada ?? null,
        });
      })
      .catch((error) => console.error('Error al obtener configuración de página pública:', error));
  }, []);

  const DESTINO_BADGE_TO_KEY = {
    'Visa Americana': 'visaUsa',
    'Visa India': 'visaIndia',
    'Visa Egipto': 'visaEgipto',
    'eTA Canadá': 'etaCanada',
    'Visa Canadiense': 'visaCanada',
  };

  // Carrusel de destinos: baja suave a la tarjeta del servicio, la ilumina y,
  // al terminar de llegar, abre su "Ver pasos". El brillo se apaga despacio
  // después de cerrar la ventanita (ver handleCloseStepsModal).
  const handleDestinoClick = (badge) => {
    const key = DESTINO_BADGE_TO_KEY[badge];
    const targetId = key ? destinoServicios[key] : null;
    if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
    setHighlightServiceId(null);
    if (targetId) {
      setDestinoVisibleId(targetId);
      const publicado = services.some((s) => s.idTransact === targetId);
      // ServicesSection solo muestra 4 servicios y mete el del destino si no
      // estaba visible: esperar al render para que la tarjeta ya exista.
      setTimeout(async () => {
        await scrollSuave(document.getElementById(`servicio-${targetId}`));
        setHighlightServiceId(targetId);
        if (publicado) {
          highlightTimeoutRef.current = setTimeout(() => handleOpenStepsModal(targetId), 280);
        } else {
          highlightTimeoutRef.current = setTimeout(() => setHighlightServiceId(null), 2600);
        }
      }, 0);
    } else {
      scrollSuave(document.getElementById('servicios'));
    }
  };

  const orderedServices = servicioDestacadoId != null
    ? [...services].sort((a, b) => {
        if (a.idTransact === servicioDestacadoId) return -1;
        if (b.idTransact === servicioDestacadoId) return 1;
        return 0;
      })
    : services;

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
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

  const handleFaqToggle = (index) => {
    setFaqActiveIndex(faqActiveIndex === index ? null : index);
  };

  const handleOpenDetailsModal = async (service) => {
    setSelectedService(service);
    setDetailsModalOpen(true);
    await fetchStepsById(service.idTransact);
  };

  const handleOpenPaymentModal = (service) => {
    setSelectedServiceForPayment(service);
    setPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setSelectedServiceForPayment(null);
    setPaymentModalOpen(false);
  };


 const singint = (service) => {
  if (service) {
    const minimalService = {
      idTransact: service.idTransact,
      name: service.name,
      cost: service.cost,
      cashAdvance: service.cashAdvance,
      isDateService: service.isDateService,
      cas: service.cas,
      con: service.con,
      simulation: service.simulation,
      status: service.status
    };
    sessionStorage.setItem('selectedService', JSON.stringify(minimalService));
  }
  window.location.href = '/Login';
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

  const handleOpenStepsModal = async (idTransact) => {
    setStepsService(services.find((s) => s.idTransact === idTransact) || null);
    await fetchStepsById(idTransact);
    setStepsModalOpen(true);
  };

  const handleCloseStepsModal = () => {
    if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
    highlightTimeoutRef.current = setTimeout(() => setHighlightServiceId(null), 1600);
    setStepsModalOpen(false);
    setStepsService(null);
    setSteps([]);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;

      for (let i = navSections.length - 1; i >= 0; i--) {
        const section = navSections[i];
        const element = document.getElementById(section.id);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(section.id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navSections = [
    { id: 'hero', label: 'Inicio', href: '#hero' },
    { id: 'servicios', label: 'Servicios', href: '#servicios' },
    { id: 'nosotros', label: 'Nosotros', href: '#nosotros' },
    { id: 'testimonios', label: 'Testimonios', href: '#testimonios' },
    { id: 'faq', label: 'Preguntas', href: '#faq' },
    { id: 'contacto', label: 'Contacto', href: '#contacto' }
  ];

  const handleNavClick = (sectionId) => {
    setActiveSection(sectionId);
  };

  return (
  <div>
    <LandingNavbar
      activeSection={activeSection}
      navSections={navSections}
      handleNavClick={handleNavClick}
    />

    <main>
      <HeroSection onDestinoClick={handleDestinoClick} />

      <MarqueeSection />

      <ServicesSection
        services={orderedServices}
        handleOpenDetailsModal={handleOpenDetailsModal}
        handleOpenStepsModal={handleOpenStepsModal}
        singint={handleOpenPaymentModal}
        highlightServiceId={highlightServiceId}
        destinoVisibleId={destinoVisibleId}
        whatsapp={whatsapp}
      />

      <AboutSection />

      <StatsSection />

      <AgendaSection />

      <TestimonialsSection />

      <FAQSection
        faqActiveIndex={faqActiveIndex}
        handleFaqToggle={handleFaqToggle}
      />

      <ContactSection />

      <PracticasSection />

    <FooterSection />

    {/* Modales */}
    {detailsModalOpen && selectedService && (
      <ServiceDetailsModal
        show={detailsModalOpen}
        onHide={handleCloseDetailsModal}
        service={selectedService}
        steps={steps}
        onShowSteps={handleOpenStepsModal}
        loading={stepsLoading}
        isZoomed={isZoomed}
        onToggleZoom={handleToggleZoom}
        isFeatured={orderedServices[0]?.idTransact === selectedService?.idTransact}
        onContratar={(service) => { handleCloseDetailsModal(); handleOpenPaymentModal(service); }}
      />
    )}

    {stepsModalOpen && (
      <StepsModal
        show={stepsModalOpen}
        onHide={handleCloseStepsModal}
        steps={steps}
        loading={stepsLoading}
        service={stepsService}
        onContratar={(service) => { handleCloseStepsModal(); handleOpenPaymentModal(service); }}
      />
    )}

    {paymentModalOpen && selectedServiceForPayment && (
      <PaymentModal
        show={paymentModalOpen}
        onHide={handleClosePaymentModal}
        service={selectedServiceForPayment}
        userEmail={null}
        userId={null}
        onSuccess={() => {}}
        onError={() => {}}
        isPreviewMode={true}
        onLoginRequired={() => singint(selectedServiceForPayment)}
      />
    )}
        </main>

  </div>
);
}

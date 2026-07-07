import React, { useState, useEffect } from "react";
import { getAllProcess, getStepById } from './../../api/api.js';
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

export default function LandingPage() {
  const [services, setServices] = useState([]);
  const [activeSection, setActiveSection] = useState('hero');
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [stepsModalOpen, setStepsModalOpen] = useState(false);
  const [steps, setSteps] = useState([]);
  const [stepsLoading, setStepsLoading] = useState(false);
  const [faqActiveIndex, setFaqActiveIndex] = useState(0);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedServiceForPayment, setSelectedServiceForPayment] = useState(null);

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
    await fetchStepsById(idTransact);
    setStepsModalOpen(true);
  };

  const handleCloseStepsModal = () => {
    setStepsModalOpen(false);
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
      <HeroSection />

      <MarqueeSection />

      <ServicesSection
        services={services}
        handleOpenDetailsModal={handleOpenDetailsModal}
        handleOpenStepsModal={handleOpenStepsModal}
        singint={handleOpenPaymentModal}
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
      />
    )}

    {stepsModalOpen && (
      <StepsModal
        show={stepsModalOpen}
        onHide={handleCloseStepsModal}
        steps={steps}
        loading={stepsLoading}
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

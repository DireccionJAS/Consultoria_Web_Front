import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { getAllProcess, getStepById, clientePorId } from './../../api/api.js';
import ClienteSidebar from './ClienteSidebar.jsx';

// Modales existentes, reutilizados tal cual
import ServiceDetailsModal from './Modals/ServiceDetailsModal.jsx';
import PaymentModal from './Modals/PaymentModal.jsx';
import StepsModal from './Modals/StepsModal.jsx';
import CartPaymentModal from './Modals/CartPaymentModal.jsx';

import styles from './../../styles/ClienteServiciosGrid.module.css';
import HeaderLogoutButton from './../common/HeaderLogoutButton.jsx';

function ListIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M8 6h13M8 12h13M8 18h13" /><circle cx="3.5" cy="6" r="1.2" /><circle cx="3.5" cy="12" r="1.2" /><circle cx="3.5" cy="18" r="1.2" /></svg>; }
function ArrowIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>; }
function PlusIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>; }
function CheckIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12l5 5L20 7" /></svg>; }
function CartIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>; }

// Servicios elegibles para el carrito (pagar 2+ en un solo cobro): solo
// servicios "simples" de precio fijo. Se excluyen Visa Americana, traslados
// (múltiples opciones de precio), DS-160 y CAS/CON (requieren nombre de
// persona/formulario) y servicios con cita (isDateService) — cada uno de
// esos ya tiene su propio flujo de pago con lógica que el carrito no
// replica en esta primera versión.
function esElegibleParaCarrito(service) {
  const name = (service.name || '').toLowerCase();
  const isVisaAmericana = service.name === 'Visa Americana' || service.name === 'Visa Americana (4 meses)';
  const isTraslado = name === 'servicio de traslado para solicitantes de visa' || name.includes('traslado');
  const hasDs = name.includes('ds');
  const hasElaboracionOCreacion = name.includes('elaboracion') || name.includes('elaboración') || name.includes('creacion') || name.includes('creación');
  const isDs160 = hasDs && hasElaboracionOCreacion;
  const isAdelantoVisaAmericana = name.includes('adelanto') && (name.includes('cita') || name.includes('anticipo')) && name.includes('visa') && name.includes('americana');
  return !isVisaAmericana && !isTraslado && !isDs160 && !isAdelantoVisaAmericana && !service.isDateService && !service.cas && !service.con;
}

export default function ClienteServicios() {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState('');
  const [services, setServices] = useState([]);
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [preselectedServiceId, setPreselectedServiceId] = useState(null);

  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);

  const [stepsModalOpen, setStepsModalOpen] = useState(false);
  const [stepsService, setStepsService] = useState(null);
  const [steps, setSteps] = useState([]);
  const [stepsLoading, setStepsLoading] = useState(false);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [serviceToPay, setServiceToPay] = useState(null);

  const [cartItems, setCartItems] = useState([]);
  const [cartModalOpen, setCartModalOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/');

    try {
      const decoded = jwtDecode(token);
      setUserEmail(decoded.sub || '');
      setUserId(decoded.idUser || '');

      if (decoded.role !== 'USER') {
        Swal.fire({ icon: 'error', title: 'Acceso denegado', text: 'No tienes permiso para acceder a esta página.' });
        navigate('/');
      } else {
        fetchServices();
        clientePorId(decoded.idUser)
          .then((response) => { if (response.success && response.response.user) setNombre(response.response.user.name); })
          .catch((error) => console.error('Error al obtener datos del cliente:', error));
      }
    } catch (error) {
      console.error('Error decoding token:', error);
      localStorage.removeItem('token');
      navigate('/');
    }
  }, [navigate]);

  // Servicio preseleccionado desde la landing page (se abre el pago directo)
  useEffect(() => {
    if (services.length === 0) return;
    const selectedServiceData = sessionStorage.getItem('selectedService');
    if (!selectedServiceData) return;
    try {
      const preselected = JSON.parse(selectedServiceData);
      const serviceExists = services.find((s) => s.idTransact === preselected.idTransact);
      if (serviceExists) {
        setPreselectedServiceId(serviceExists.idTransact);
        setTimeout(() => {
          setServiceToPay(serviceExists);
          setPaymentModalOpen(true);
          sessionStorage.removeItem('selectedService');
        }, 1000);
      }
    } catch (error) {
      console.error('Error parsing selected service:', error);
      sessionStorage.removeItem('selectedService');
    }
  }, [services]);

  useEffect(() => {
    if (!preselectedServiceId) return;
    const timer = setTimeout(() => setPreselectedServiceId(null), 10000);
    return () => clearTimeout(timer);
  }, [preselectedServiceId]);

  const fetchServices = async () => {
    try {
      const response = await getAllProcess();
      if (response.success && Array.isArray(response.response.Transacts)) {
        setServices(response.response.Transacts.filter((s) => s.status === true));
      } else {
        console.error('Unexpected API response format:', response);
        setServices([]);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]);
    }
  };

  const fetchStepsById = async (idTransact) => {
    setStepsLoading(true);
    try {
      const response = await getStepById(idTransact);
      setSteps(response.success && Array.isArray(response.response.StepsTransacts) ? response.response.StepsTransacts : []);
    } catch (error) {
      console.error('Error al obtener pasos:', error);
      setSteps([]);
    } finally {
      setStepsLoading(false);
    }
  };

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
  const handleToggleZoom = () => setIsZoomed((v) => !v);

  const handleOpenStepsModal = async (idTransact) => {
    setStepsService(services.find((s) => s.idTransact === idTransact) || null);
    await fetchStepsById(idTransact);
    setStepsModalOpen(true);
  };
  const handleCloseStepsModal = () => { setStepsModalOpen(false); setStepsService(null); setSteps([]); };

  const handleOpenPaymentModal = (service) => { setServiceToPay(service); setPaymentModalOpen(true); };
  const handleClosePaymentModal = () => { setServiceToPay(null); setPaymentModalOpen(false); };

  const toggleCartItem = (service) => {
    setCartItems((prev) => {
      const yaEsta = prev.some((s) => s.idTransact === service.idTransact);
      if (yaEsta) return prev.filter((s) => s.idTransact !== service.idTransact);
      return [...prev, service];
    });
  };
  const cartTotal = cartItems.reduce((sum, s) => sum + (s.cashAdvance ?? s.cost ?? 0), 0);
  const handleOpenCartModal = () => setCartModalOpen(true);
  const handleCloseCartModal = () => setCartModalOpen(false);
  const handleCartPaymentSuccess = () => {
    setCartModalOpen(false);
    setCartItems([]);
    Swal.fire('¡Listo!', 'Tus pagos se procesaron correctamente.', 'success');
  };
  const handleCartPaymentError = (error) => Swal.fire('Error', error.message || 'Falló el pago.', 'error');

  const handlePaymentSuccess = () => {
    handleClosePaymentModal();
    if (serviceToPay?.name && /160/.test(serviceToPay.name)) {
      Swal.fire({ title: '¡Pago procesado!', text: `Un correo se ha enviado a ${userEmail}, con los detalles de la transacción.`, icon: 'info', confirmButtonText: 'Entendido' });
    } else {
      Swal.fire('¡Listo!', 'Tu pago se procesó correctamente.', 'success');
    }
  };
  const handlePaymentError = (error) => Swal.fire('Error', error.message || 'Falló el pago.', 'error');

  return (
    <div className={styles.page}>
      <ClienteSidebar active="servicios" userName={nombre || 'Cliente'} serviciosCount={services.length || null} />

      <main className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.crumb}>Portal / <span className={styles.accent}>Servicios</span></div>
          <div className={styles.pageTitleH}>Servicios disponibles</div>
          <HeaderLogoutButton />
        </header>

        <div className={styles.content}>
          {services.length === 0 ? (
            <div className={styles.empty}>No hay servicios disponibles por el momento.</div>
          ) : (
            <div className={styles.svcGrid}>
              {services.map((service, index) => (
                <div
                  key={service.idTransact}
                  className={styles.svcCard}
                  style={preselectedServiceId === service.idTransact ? { outline: `2px solid var(--primary)` } : undefined}
                >
                  <div className={styles.svcImg} style={service.image ? { backgroundImage: `url("${service.image}")` } : undefined}>
                    <span className={styles.svcNum}>{String(index + 1).padStart(2, '0')}</span>
                  </div>
                  <div className={styles.svcBody}>
                    <h3 className={styles.svcName}>{service.name}</h3>
                    <p className={styles.svcDesc}>{service.description?.length > 130 ? `${service.description.slice(0, 130)}...` : service.description}</p>
                  </div>
                  <div className={styles.svcFoot}>
                    <div className={styles.svcActions}>
                      <button className={styles.svcAction} onClick={() => handleOpenStepsModal(service.idTransact)}><ListIcon />Ver pasos</button>
                      <button className={styles.svcAction} onClick={() => handleOpenDetailsModal(service)}>Ver más</button>
                    </div>
                    <div className={styles.svcPriceRow}>
                      <div className={styles.svcPrice}>${(service.cost ?? service.cashAdvance ?? 0).toLocaleString('es-MX')}<small>MXN</small></div>
                      <button className={styles.svcContratar} onClick={() => handleOpenPaymentModal(service)}>Contratar <ArrowIcon /></button>
                    </div>
                    {esElegibleParaCarrito(service) && (
                      <button
                        className={`${styles.cartToggle} ${cartItems.some((s) => s.idTransact === service.idTransact) ? styles.cartToggleActive : ''}`}
                        onClick={() => toggleCartItem(service)}
                      >
                        {cartItems.some((s) => s.idTransact === service.idTransact) ? <><CheckIcon /> En el carrito</> : <><PlusIcon /> Agregar a un pago conjunto</>}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className={styles.cartBar}>
            <div className={styles.cartBarInfo}>
              <CartIcon />
              <span>{cartItems.length} servicio{cartItems.length > 1 ? 's' : ''} seleccionado{cartItems.length > 1 ? 's' : ''}</span>
              <span className={styles.cartBarTotal}>${cartTotal.toLocaleString('es-MX')} MXN</span>
            </div>
            <div className={styles.cartBarActions}>
              <button className={styles.cartBarClear} onClick={() => setCartItems([])}>Vaciar</button>
              <button className={styles.cartBarPay} onClick={handleOpenCartModal}>Pagar todo junto <ArrowIcon /></button>
            </div>
          </div>
        )}
      </main>

      <ServiceDetailsModal
        show={detailsModalOpen}
        onHide={handleCloseDetailsModal}
        service={selectedService}
        onShowSteps={handleOpenStepsModal}
        isZoomed={isZoomed}
        onToggleZoom={handleToggleZoom}
        steps={steps}
        loading={stepsLoading}
        isFeatured={services[0]?.idTransact === selectedService?.idTransact}
        onContratar={(service) => { handleCloseDetailsModal(); handleOpenPaymentModal(service); }}
      />
      <PaymentModal
        show={paymentModalOpen}
        onHide={handleClosePaymentModal}
        service={serviceToPay}
        userEmail={userEmail}
        userId={userId}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />
      <StepsModal
        show={stepsModalOpen}
        onHide={handleCloseStepsModal}
        steps={steps}
        loading={stepsLoading}
        service={stepsService}
        onContratar={(service) => { handleCloseStepsModal(); handleOpenPaymentModal(service); }}
      />
      <CartPaymentModal
        show={cartModalOpen}
        onHide={handleCloseCartModal}
        services={cartItems}
        userEmail={userEmail}
        userId={userId}
        onSuccess={handleCartPaymentSuccess}
        onError={handleCartPaymentError}
      />
    </div>
  );
}

// Main PaymentModal.jsx (Actualizado)
import React from 'react';
import { Modal } from 'react-bootstrap';
import { usePaymentOptions } from '../hooks/UsePaymentOption';
import DS160Section from './components/DS160Section';
import StripePaymentSection from './components/StripePaymentSection';
import paymentStyles from '../../../styles/servicios/client/PaymentModal.module.css';
import { LockIcon } from 'lucide-react';
import PayPalScriptLoader from '../../PayPal/PayPalScriptLoader';
import PayPalButton from '../../PayPal/BottonTest';
import Swal from 'sweetalert2';

// SVGs inline para logos y escudo
const VisaSVG = () => (
  <svg width="40" height="14" viewBox="0 0 40 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="14" rx="2" fill="#fff" />
    <text x="7" y="11" fontSize="10" fontWeight="bold" fill="#1a1f71">VISA</text>
  </svg>
);
const MastercardSVG = () => (
  <svg width="40" height="14" viewBox="0 0 40 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="15" cy="7" r="6" fill="#eb001b" />
    <circle cx="25" cy="7" r="6" fill="#f79e1b" />
    <text x="5" y="12" fontSize="7" fontWeight="bold" fill="#222">MC</text>
  </svg>
);
const StripeSVG = () => (
  <svg width="40" height="14" viewBox="0 0 40 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="14" rx="2" fill="#635bff" />
    <text x="6" y="11" fontSize="10" fontWeight="bold" fill="#fff">Stripe</text>
  </svg>
);
const ShieldSVG = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L20 6V12C20 17 16 21 12 22C8 21 4 17 4 12V6L12 2Z" fill="#1A3F75" stroke="#1A3F75" strokeWidth="1.5" />
    <path d="M9 12L11 14L15 10" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PaymentModal = ({
  show,
  onHide,
  service,
  userEmail,
  userId,
  onSuccess,
  onError,
  isPreviewMode = false,
  onLoginRequired
}) => {
  const {
    serviceInfo,
    paymentOptions,
    selectedPaymentType,
    setSelectedPaymentType,
    selectedLiquidationPlan,
    setSelectedLiquidationPlan,
    validatedPaymentType,
    costoTotal,
    pendienteLiquidar,
    currentPaymentOption,
  } = usePaymentOptions(service);

  // Debug temporal para verificar tipos de servicio
  React.useEffect(() => {
    if (service && serviceInfo) {

    }
  }, [service, serviceInfo, paymentOptions]);

  const [quantity, setQuantity] = React.useState(1);

  if (!service) return null;
  const { isDs160, isVisaAmericana, haveOtherCost } = serviceInfo;

  const handleQuantityChange = (newQty) => {
    if (newQty >= 1 && newQty <= 15) setQuantity(newQty);
  };

  // Calcular total pago inicial
  const getTotalAmount = () => {
    if (!currentPaymentOption) return (service?.cost || service?.cashAdvance || 0) * quantity;
    return currentPaymentOption.amount * quantity;
  };

  // Funciones para obtener precios con valores por defecto usando la lógica del hook
  const getCashAdvance = () => {
    // Para Visa Americana, usar el adelanto
    if (serviceInfo.isVisaAmericana && paymentOptions.adelanto) {
      return paymentOptions.adelanto.amount || 0;
    }
    // Para otros servicios, usar cashAdvance del servicio
    return service?.cashAdvance || 0;
  };

  const getCost = () => {
    // Para Visa Americana, usar el costo del plan de 4 meses
    if (serviceInfo.isVisaAmericana && paymentOptions['4meses']) {
      return paymentOptions['4meses'].amount || 0;
    }
    // Para otros servicios, usar cost del servicio
    return service?.cost || service?.cashAdvance || 0;
  };

  const getOptionCost = () => {
    // Para Visa Americana, usar el costo del plan de 8 meses
    if (serviceInfo.isVisaAmericana && paymentOptions['8meses']) {
      return paymentOptions['8meses'].amount || 0;
    }
    // Para otros servicios, usar optionCost del servicio
    return service?.optionCost || 0;
  };

  // Función para obtener las opciones de pago disponibles para mostrar
  const getAvailablePaymentOptions = () => {
    const options = [];

    if (serviceInfo.isVisaAmericana) {
      // Para Visa Americana, mostrar adelanto y planes
      if (paymentOptions.adelanto) {
        options.push({
          label: 'Adelanto inicial',
          amount: paymentOptions.adelanto.amount,
          description: paymentOptions.adelanto.description
        });
      }
      if (paymentOptions['4meses']) {
        options.push({
          label: 'Plan 4 meses',
          amount: paymentOptions['4meses'].amount,
          description: paymentOptions['4meses'].description
        });
      }
      if (paymentOptions['8meses']) {
        options.push({
          label: 'Plan 8 meses',
          amount: paymentOptions['8meses'].amount,
          description: paymentOptions['8meses'].description
        });
      }
    } else if (serviceInfo.isDs160) {
      // Para DS-160, mostrar opciones específicas
      Object.entries(paymentOptions).forEach(([key, option]) => {
        options.push({
          label: option.description || key,
          amount: option.amount,
          description: option.processingTime || ''
        });
      });
    } else {
      // Para otros servicios, mostrar precio básico
      options.push({
        label: 'Precio del servicio',
        amount: service?.cashAdvance || service?.cost || 0,
        description: 'Pago único'
      });
    }

    return options;
  };

  // Preview intercept
  const handlePaymentAttempt = () => {
    if (!isPreviewMode) return;
    Swal.fire({
      title: 'Iniciar Sesión Requerido',
      text: 'Para continuar con el pago, necesitas iniciar sesión.',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Iniciar Sesión',
      cancelButtonText: 'Cancelar'
    }).then(res => {
      if (res.isConfirmed) { onHide(); onLoginRequired && onLoginRequired(); }
    });
  };

  return (
    <Modal show={show} onHide={onHide} centered dialogClassName={paymentStyles.customDialog} backdropClassName={paymentStyles.modalBackdrop}>
      <Modal.Header closeButton className={paymentStyles.modalHeader}>
        <Modal.Title className={paymentStyles.paymentModalTitle}>
          <div className={paymentStyles.serviceIcon}><LockIcon size={32} /></div>
          <div>
            <div className={paymentStyles.serviceTitle}>{service.name}</div>
            <div className={paymentStyles.serviceSubtitle}>
              {isPreviewMode ? (
                serviceInfo.isVisaAmericana ?
                  `Vista previa - Desde $${getCashAdvance()} MXN` :
                  serviceInfo.isDs160 ?
                    `Vista previa - Formulario DS-160` :
                    serviceInfo.isTransportService ?
                      `Vista previa - Servicio de Traslado` :
                      `Vista previa - Desde $${getCashAdvance()} MXN`
              ) : (
                isDs160 ? 'Formulario DS-160 - Pago seguro con Stripe y Paypal ' : 'Pago seguro con Stripe y PayPal'
              )}
            </div>
          </div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className={paymentStyles.modalBody}>
        {/* Seguridad */}
        <div className={paymentStyles.securitySection}>
          <div className={paymentStyles.securityBadge}><ShieldSVG /> Pago 100% seguro</div>
        </div>

        {/* Selector de Plazo para Adelanto de Visa Americana */}
        {validatedPaymentType === 'adelanto' && isVisaAmericana && (
          <div style={{
            marginTop: 20,
            padding: '20px',
            backgroundColor: '#E4ECF0',
            borderRadius: '16px',
            border: '1px solid rgba(0,0,42,0.10)',
            fontFamily: '"Inter", system-ui, sans-serif'
          }}>
            <h4 style={{
              marginBottom: '16px',
              fontSize: '16px',
              fontWeight: '600',
              fontFamily: '"Bricolage Grotesque", system-ui, sans-serif',
              color: '#00002A'
            }}>
              Selecciona el plazo para liquidar tu trámite:
            </h4>

            <div style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <button
                onClick={() => setSelectedLiquidationPlan('4meses')}
                style={{
                  padding: '12px 20px',
                  border: selectedLiquidationPlan === '4meses' ? '2px solid #1A3F75' : '1px solid rgba(0,0,42,0.18)',
                  borderRadius: '999px',
                  backgroundColor: selectedLiquidationPlan === '4meses' ? '#fff' : 'transparent',
                  color: '#00002A',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontFamily: '"Inter", system-ui, sans-serif',
                  fontWeight: selectedLiquidationPlan === '4meses' ? '600' : '500',
                  transition: 'all 0.2s ease'
                }}
              >
                4 Meses - ${getCost()} MXN
              </button>

              <button
                onClick={() => setSelectedLiquidationPlan('8meses')}
                style={{
                  padding: '12px 20px',
                  border: selectedLiquidationPlan === '8meses' ? '2px solid #1A3F75' : '1px solid rgba(0,0,42,0.18)',
                  borderRadius: '999px',
                  backgroundColor: selectedLiquidationPlan === '8meses' ? '#fff' : 'transparent',
                  color: '#00002A',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontFamily: '"Inter", system-ui, sans-serif',
                  fontWeight: selectedLiquidationPlan === '8meses' ? '600' : '500',
                  transition: 'all 0.2s ease'
                }}
              >
                8 Meses - ${getOptionCost()} MXN
              </button>
            </div>

            {/* Información del pago */}
            <div style={{
              padding: '14px 16px',
              backgroundColor: '#DFF5E5',
              border: '1px solid rgba(40,160,82,0.25)',
              borderRadius: '12px',
              fontSize: '13.5px',
              fontFamily: '"Inter", system-ui, sans-serif',
              color: '#1F7B3D'
            }}>
              <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>
                Resumen del pago:
              </p>
              <p style={{ margin: '0 0 4px 0' }}>
                • Adelanto ahora: ${getCashAdvance() * quantity} MXN
              </p>
              <p style={{ margin: '0 0 4px 0' }}>
                • Total del trámite: ${costoTotal() * quantity} MXN
              </p>
              <p style={{ margin: '0', fontWeight: '700' }}>
                • Pendiente por liquidar: ${pendienteLiquidar() * quantity} MXN
              </p>
            </div>
          </div>
        )}

        {/* Contenido principal */}
        {isPreviewMode ? (
          <div style={{ marginTop: 20, fontFamily: '"Inter", system-ui, sans-serif' }}>
            <div style={{
              fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              fontSize: '10px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#4E6A9C',
              marginBottom: 12,
            }}>
              Opciones de pago
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {Object.entries(paymentOptions).map(([key, option], index) => (
                <div key={key} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 16px',
                  borderRadius: 14,
                  background: index === 0 ? 'linear-gradient(135deg, #E4ECF0 0%, #B4C8D8 100%)' : '#E4ECF0',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: '#00002A', fontSize: 13.5 }}>{option.description || key}</div>
                    {option.processingTime && (
                      <div style={{ fontSize: 11.5, color: 'rgba(0,0,42,0.55)', marginTop: 2 }}>
                        {option.processingTime}
                      </div>
                    )}
                  </div>
                  <span style={{
                    fontFamily: '"Bricolage Grotesque", system-ui, sans-serif',
                    fontWeight: 700,
                    color: '#00002A',
                    fontSize: '18px',
                  }}>
                    ${option.amount}<small style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 10, color: 'rgba(0,0,42,0.55)', marginLeft: 4 }}>MXN</small>
                  </span>
                </div>
              ))}
            </div>
            <button className={paymentStyles.previewButton} onClick={handlePaymentAttempt} style={{ width: '100%', padding: '13px', fontSize: 14 }}>
              Iniciar sesión para pagar
            </button>
          </div>
        ) : (
          <>
            {isDs160 ? (
              <DS160Section
                service={service}
                paymentOptions={paymentOptions}
                selectedPaymentType={validatedPaymentType}
                onPaymentTypeChange={setSelectedPaymentType}
                currentPaymentOption={currentPaymentOption}
                userEmail={userEmail}
                quantity={quantity}
                userId={userId}
                totalAmount={getTotalAmount()}
                onQuantityChange={handleQuantityChange}
                onSuccess={onSuccess}
                onError={onError}
                onHide={onHide}
              />
            ) : (
              <StripePaymentSection
                service={service}
                paymentOptions={paymentOptions}
                selectedPaymentType={validatedPaymentType}
                onPaymentTypeChange={setSelectedPaymentType}
                currentPaymentOption={currentPaymentOption}
                isVisaAmericana={isVisaAmericana}
                haveOtherCost={haveOtherCost}
                userEmail={userEmail}
                userId={userId}
                quantity={quantity}
                totalAmount={getTotalAmount()}
                onQuantityChange={handleQuantityChange}
                onSuccess={onSuccess}
                onError={onError}
                costoTotal={costoTotal()}
              />
            )}
            {/* Separador */}
            <div className={paymentStyles.paymentSeparator}>
              <div className={paymentStyles.separatorLine} />
              <span className={paymentStyles.separatorText}>o paga con</span>
              <div className={paymentStyles.separatorLine} />
            </div>
            {/* PayPal */}
            <PayPalScriptLoader>
              <PayPalButton
                amount={getTotalAmount()}
                onSuccess={onSuccess}
                onError={onError}
                costoTotal={costoTotal()}
                userId={userId}
                quantity={quantity}
                service={{ ...service, cost: getTotalAmount() }}
                liquidationPlan={selectedLiquidationPlan}
              />
            </PayPalScriptLoader>
          </>
        )}

        {/* Logos */}
        <div className={paymentStyles.paymentMethods}>
          <VisaSVG />
          <MastercardSVG />
          <StripeSVG />
        </div>

        {/* Nota */}
        <div className={paymentStyles.privacyNote}>
          Nunca almacenamos datos de tu tarjeta.
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default PaymentModal;
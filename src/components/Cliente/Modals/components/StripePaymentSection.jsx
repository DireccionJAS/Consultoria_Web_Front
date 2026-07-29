import React, { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from './../../../CheckoutForm.jsx';
import PaymentOptions from './PaymentOption.jsx';
import InfoBox from './InfoBox.jsx'; // Asegúrate de que esté en la misma carpeta
import CalendarBooking from './CalendarBooking.jsx'; // Asegúrate de importar el nuevo componente
import stylesModal from './../../../../styles/StripePaymentSection.module.css';


const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
const stripePromise = loadStripe(stripeKey);

const StripePaymentSection = ({
  service,
  paymentOptions,
  selectedPaymentType,
  onPaymentTypeChange,
  currentPaymentOption,
  isVisaAmericana,
  haveOtherCost,
  userEmail,
  userId,
  costoTotal,
  quantity = 1,
  totalAmount,
  onQuantityChange,
  onSuccess,
  onError
}) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [extraFee, setExtraFee] = useState(0);
  const isDS160 = service?.name && [
    'ds-160',
    'ds160',
    'creación y generación de ds160',
    'creacion y generacion de ds160'
  ].some(name => service.name.trim().toLowerCase() === name);
  const showSinglePayment = service?.cashAdvance !== undefined && service?.cost !== undefined && Number(service.cashAdvance) === Number(service.cost);

  // Detectar si es adelanto de cita visa americana
  const isAdvanceVisaAmericana = service?.name?.toLowerCase().includes('adelanto') &&
    (service?.name?.toLowerCase().includes('cita') || service?.name?.toLowerCase().includes('anticipo')) &&
    service?.name?.toLowerCase().includes('visa') &&
    service?.name?.toLowerCase().includes('americana');

  // Si es adelanto de cita visa americana, usar siempre las opciones del hook
  const shouldShowPaymentOptions = !showSinglePayment || isAdvanceVisaAmericana;

  // Función para manejar cambio de cantidad (se pasa al CheckoutForm)
  const handleQuantityChange = (newQuantity) => {
    if (onQuantityChange) {
      onQuantityChange(newQuantity);
    }
  };

  // Función para detectar si la hora seleccionada es después de las 17:00
  const handleDateSelected = (dateTime) => {
    setSelectedDate(dateTime);
    if (dateTime) {
      const hour = parseInt(dateTime.split('T')[1]?.split(':')[0], 10);
      setExtraFee(hour >= 21 ? 99 : 0);
    } else {
      setExtraFee(0);
    }
  };
  const selectedLiquidationPlan = selectedPaymentType;
  const liquidationTotal = (paymentOptions && paymentOptions[selectedLiquidationPlan]?.amount) || 0;
  const totalWithExtraFee = (liquidationTotal * quantity) + extraFee;
  return (
    <div className={stylesModal.modalContainer}>
      {showSinglePayment && !isAdvanceVisaAmericana ? (
        <div style={{ marginBottom: 24 }}>
          <InfoBox
            backgroundColor="#DFF5E5"
            borderColor="rgba(40,160,82,0.25)"
            color="#1F7B3D"
            title="Pago único"
            items={[
              `Monto a pagar: $${service.cashAdvance} MXN`,
              'Pago único para el servicio',
              'Pago seguro con Stripe',
            ]}
          />
          {service?.isDateService && (
            <div className={stylesModal.agendarCitaBox}>
              <h4 className={stylesModal.agendarCitaTitle}>
                Agendar cita
              </h4>
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <CalendarBooking onDateSelected={handleDateSelected} />
              </div>
              {!selectedDate && (
                <div className={stylesModal.alerta}>
                  Selecciona una fecha y hora antes de continuar con el pago.
                </div>
              )}
              {extraFee > 0 && (
                <div className={stylesModal.extraFee}>
                  Horarios después de las 5:00 PM tienen un costo adicional de $99 MXN.
                </div>
              )}
            </div>
          )}
          <Elements stripe={stripePromise}>
            <CheckoutForm
              amount={(currentPaymentOption?.amount || 0) + extraFee}
              totalAmount={totalAmount ? totalAmount + extraFee : (currentPaymentOption?.amount || 0) + extraFee}
              description={`Pago ${service?.name || ''}`}
              idProductoTransaccion={service?.idTransact}
              userEmail={userEmail}
              customer={userId}
              quantity={quantity}
              onQuantityChange={handleQuantityChange}
              onSuccess={onSuccess}
              onError={onError}
              serviceName={service?.name}
              disabled={service?.isDateService && !selectedDate}
              selectedDate={selectedDate}
              service={service}
              idTransactProgress={service?.idTransactProgress}
              liquidationPlan={selectedLiquidationPlan}
          
              
            />
          </Elements>
        </div>
      ) : (
        <>
          <PaymentOptions
            paymentOptions={paymentOptions}
            selectedPaymentType={selectedPaymentType}
            onPaymentTypeChange={onPaymentTypeChange}
            isVisaAmericana={isVisaAmericana}
          />
          {/* Visa Americana Info */}
          {isVisaAmericana && (
            <InfoBox
              backgroundColor="rgba(111, 174, 219, 0.10)"
              borderColor="rgba(111, 174, 219, 0.30)"
              color="#1A3F75"
              title="Información sobre Visa Americana"
              items={[
                'El apartado reserva tu lugar en el proceso',
                'Procesamiento en 4 meses: Servicio estándar',
                ...(haveOtherCost ? ['Procesamiento en 8 meses: Opción económica con más tiempo'] : []),
                'Todos los pagos son seguros y procesados por Stripe'
              ]}
            />
          )}
          {service?.isDateService && (
            <div className={stylesModal.agendarCitaBox}>
              <h4 className={stylesModal.agendarCitaTitle}>
                Agendar cita
              </h4>
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <CalendarBooking onDateSelected={handleDateSelected} />
              </div>
              {!selectedDate && (
                <div className={stylesModal.alerta}>
                  Selecciona una fecha y hora antes de continuar con el pago.
                </div>
              )}
              {extraFee > 0 && (
                <div className={stylesModal.extraFee}>
                  Horarios después de las 5:00 PM tienen un costo adicional de $30 MXN.
                </div>
              )}
            </div>
          )}

          <Elements stripe={stripePromise}>

            <CheckoutForm
              amount={(currentPaymentOption?.amount || 0) + extraFee}
              totalAmount={totalAmount ? totalAmount + extraFee : (currentPaymentOption?.amount || 0) + extraFee}
              description={currentPaymentOption?.description}
              idProductoTransaccion={service?.idTransact}
              userEmail={userEmail}
              customer={userId}
              quantity={quantity}
              onQuantityChange={handleQuantityChange}
              onSuccess={onSuccess}
              onError={onError}
              serviceName={service?.name}
              disabled={service?.isDateService && !selectedDate}
              selectedDate={selectedDate}
              service={service}
              idTransactProgress={service?.idTransactProgress}
              liquidationPlan={selectedLiquidationPlan}
              costoTotal={costoTotal}
       

            />
          </Elements>
        </>
      )}
    </div>
  );
};

export default StripePaymentSection; // No olvides exportar el componente 
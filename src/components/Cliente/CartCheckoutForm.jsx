import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createProcessWithPayment, envioCorreo } from './../../api/api.js';
import apiClient from './../../api/apiClient.js';
import cartStyles from './../../styles/CartPaymentModal.module.css';

// Cobra UNA sola vez por el total de los servicios seleccionados, y solo
// después de un cobro exitoso crea un trámite (TransactProgress) por cada
// servicio y un Payment por cada uno — todos con el mismo externalChargeRef
// (el id del PaymentIntent de Stripe) para poder correlacionarlos después.
// Mismo patrón de seguridad que CheckoutForm.jsx: el Payment de cada
// servicio se crea DESPUÉS de que su trámite se creó con éxito, nunca antes.
export default function CartCheckoutForm({ services, totalAmount, userEmail, userId, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!services || services.length === 0) return;
    setLoading(true);
    setMessage('');

    try {
      const { data } = await apiClient.post('/pay/payint', {
        amount: Math.round(totalAmount * 100),
        currency: 'mxn',
        description: `Pago conjunto de ${services.length} servicios`,
        customerEmail: userEmail,
        customerId: userId,
      });

      const clientSecret = data.clientSecret;
      const paymentIntentId = clientSecret.split('_secret_')[0];
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        setMessage('No se encontró el método de pago.');
        setLoading(false);
        return;
      }

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: { name: 'Cliente ' + userId, email: userEmail },
        },
      });

      if (result.error) {
        setMessage(result.error.message);
        onError && onError(result.error);
        setLoading(false);
        return;
      }

      if (result.paymentIntent.status !== 'succeeded') {
        setMessage('El pago no fue completado.');
        onError && onError(new Error('El pago no fue completado.'));
        setLoading(false);
        return;
      }

      try {
        // Paso 1: un trámite por servicio. Si cualquiera falla, NINGÚN
        // Payment se crea todavía (ver paso 2).
        for (const service of services) {
          const monto = service.cashAdvance ?? service.cost ?? 0;
          const progressResult = await createProcessWithPayment({
            total: monto,
            paid: monto,
            status: 1,
            idUser: parseInt(userId, 10),
            idTransact: service.idTransact,
          });
          if (!progressResult?.success) {
            throw new Error(progressResult?.message || `No se pudo registrar el trámite de "${service.name}".`);
          }
        }

        // Paso 2: un Payment por servicio, ya con todos los trámites
        // creados con éxito, todos correlacionados al mismo cobro real.
        for (const service of services) {
          const monto = service.cashAdvance ?? service.cost ?? 0;
          const paymentResponse = await apiClient.post('/payment', {
            total: monto,
            status: 1,
            idUser: parseInt(userId, 10),
            idTransact: service.idTransact,
            externalChargeRef: paymentIntentId,
          });
          if (!paymentResponse.data?.success) {
            throw new Error(paymentResponse.data?.message || `No se pudo registrar el pago de "${service.name}".`);
          }
          envioCorreo(userEmail, userId, service.name).catch((error) => console.error('Error al enviar correo:', error));
        }

        onSuccess && onSuccess(result.paymentIntent);
      } catch (dbError) {
        console.error('Error al registrar el pago conjunto en la base de datos:', dbError);
        const detalle = dbError.response?.data?.message || dbError.message;
        setMessage(`Pago exitoso, pero hubo un problema al guardar tu registro${detalle ? `: ${detalle}` : ''}. Por favor, contacta a soporte.`);
        onError && onError(dbError);
      }
    } catch (err) {
      console.error('Error creando el cobro conjunto:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || err.message || 'Error al procesar el pago.';
      setMessage(errorMessage);
      onError && onError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className={cartStyles.cardBox}>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                fontFamily: '"Inter", system-ui, sans-serif',
                color: '#00002A',
                '::placeholder': { color: 'rgba(0,0,42,0.38)' },
              },
              invalid: { color: '#B73E3E' },
            },
          }}
        />
      </div>

      {message && <div className={cartStyles.errorMsg}>{message}</div>}

      <button type="submit" className={cartStyles.submitBtn} disabled={!stripe || loading || services.length === 0}>
        {loading ? 'Procesando…' : `Pagar $${totalAmount.toLocaleString('es-MX')} MXN`}
      </button>
    </form>
  );
}

import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import apiClient from './../api/apiClient.js';

export default function Checkout({
  amount,
  description,
  idProductoTransaccion,
  userEmail,
  customer,
  onSuccess,
  onError,
  serviceName
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!idProductoTransaccion) {
      setMessage('Error: ID de transacción no válido.');
      setLoading(false);
      return;
    }

    try {
      // Crear PaymentIntent en backend
      const { data } = await apiClient.post(`/pay/payint`, {
        amount: amount * 100, // Centavos
        currency: 'mxn',
        description: description,
        customerEmail: userEmail,
        customerId: customer
      });

      const clientSecret = data.clientSecret;
      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        setMessage('No se encontró el método de pago.');
        setLoading(false);
        return;
      }

      // Confirmar pago con Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: `Cliente ${customer}`,
            email: userEmail
          }
        }
      });

      if (result.error) {
        setMessage(result.error.message);
        onError && onError(result.error);
      } else if (result.paymentIntent.status === 'succeeded') {
        setMessage('¡Pago exitoso!');

        // Registrar pago en DB
        await apiClient.post(`/payment`, {
          total: amount,
          status: 1,
          idUser: parseInt(customer),
          idTransact: parseInt(idProductoTransaccion, 10)
        });

        onSuccess && onSuccess(result.paymentIntent);
      }
    } catch (err) {
      console.error(err);
      setMessage('Error al procesar el pago.');
      onError && onError(err);
    } finally {
      setLoading(false);
    }
  };

  const fontSans = '"Inter", system-ui, sans-serif';
  const fontDisplay = '"Bricolage Grotesque", system-ui, sans-serif';

  return (
    <form onSubmit={handleSubmit} style={{ fontFamily: fontSans }}>
      <div style={{
        marginBottom: '1rem',
        padding: '14px 16px',
        backgroundColor: '#E4ECF0',
        borderRadius: '14px',
      }}>
        <p style={{ margin: '0 0 4px', fontSize: 13, color: 'rgba(0,0,42,0.65)' }}>{description}</p>
        <p style={{ margin: '0 0 4px', fontSize: 13, color: 'rgba(0,0,42,0.65)' }}>Email: {userEmail}</p>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, fontFamily: fontDisplay, color: '#00002A' }}>Monto: MX${amount}</p>
      </div>

      <div style={{
        padding: '14px',
        border: '1px solid rgba(0,0,42,0.18)',
        borderRadius: '14px',
        marginBottom: '1rem',
        backgroundColor: '#fff',
      }}>
        <CardElement options={{
          style: {
            base: {
              fontSize: '16px',
              fontFamily: '"Inter", system-ui, sans-serif',
              color: '#00002A',
              '::placeholder': { color: 'rgba(0,0,42,0.38)' }
            },
            invalid: { color: '#B73E3E' }
          },
          hidePostalCode: true
        }} />
      </div>

      <button
        type="submit"
        disabled={!stripe || loading}
        style={{
          backgroundColor: loading ? 'rgba(0,0,42,0.25)' : '#00002A',
          color: '#fff',
          border: 'none',
          padding: '13px 15px',
          borderRadius: '999px',
          fontSize: 14,
          fontWeight: 600,
          fontFamily: fontSans,
          cursor: loading ? 'not-allowed' : 'pointer',
          width: '100%'
        }}
      >
        {loading ? 'Procesando...' : `Pagar MX$${amount}`}
      </button>

      {message && (
        <div style={{
          marginTop: '1rem',
          backgroundColor: message.includes('exitoso') ? '#DFF5E5' : '#F5DADA',
          color: message.includes('exitoso') ? '#1F7B3D' : '#B73E3E',
          border: `1px solid ${message.includes('exitoso') ? 'rgba(40,160,82,0.25)' : 'rgba(183,62,62,0.25)'}`,
          padding: '10px 14px',
          borderRadius: '10px',
          fontSize: 13.5,
        }}>
          {message}
        </div>
      )}
    </form>
  );
}

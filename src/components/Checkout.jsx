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

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '1rem' }}>
        <p>{description}</p>
        <p><strong>Monto:</strong> MX${amount}</p>
        <p><strong>Email:</strong> {userEmail}</p>
      </div>

      <div style={{
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        marginBottom: '1rem'
      }}>
        <CardElement options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#424770',
              '::placeholder': { color: '#aab7c4' }
            },
            invalid: { color: '#c23d4b' }
          },
          hidePostalCode: true
        }} />
      </div>

      <button
        type="submit"
        disabled={!stripe || loading}
        style={{
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          padding: '10px 15px',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          width: '100%'
        }}
      >
        {loading ? 'Procesando...' : `Pagar MX$${amount}`}
      </button>

      {message && (
        <div style={{
          marginTop: '1rem',
          backgroundColor: message.includes('exitoso') ? '#d4edda' : '#f8d7da',
          color: message.includes('exitoso') ? '#155724' : '#721c24',
          padding: '10px',
          borderRadius: '4px'
        }}>
          {message}
        </div>
      )}
    </form>
  );
}

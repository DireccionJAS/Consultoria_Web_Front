import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import apiClient from '../api/apiClient.js';
import Swal from 'sweetalert2';

export default function SimpleCheckoutForm({
  amount,
  description,
  userEmail,
  customer,
  onSuccess 
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userEmail || userEmail === 'N/A' || !customer || customer === 'N/A') {
      Swal.fire({
        icon: 'warning',
        title: 'Datos incompletos',
        text: 'Faltan datos del cliente. No se puede continuar con el pago.',
      });
      return;
    }

    setLoading(true);

    try {
      const { data } = await apiClient.post(`/pay/payint`, {
        amount: amount * 100,
        currency: 'mxn',
        description,
        customerEmail: userEmail,
        customerId: customer
      });

      const clientSecret = data.clientSecret;
      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se encontró el método de pago.'
        });
        return;
      }

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: `Cliente ${customer}`,
            email: userEmail
          }
        },
      });

      if (result.error) {
        Swal.fire({
          icon: 'error',
          title: 'Error en el pago',
          text: result.error.message || 'El pago no se pudo completar.'
        });
      } else if (result.paymentIntent.status === 'succeeded') {
        Swal.fire({
          icon: 'success',
          title: 'Pago exitoso',
          text: 'El cobro extra ha sido procesado exitosamente.'
        });
        if (onSuccess) {
          onSuccess(result); 
        }
      }
    } catch (err) {
      console.error('Error al crear PaymentIntent:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error inesperado',
        text: err.response?.data?.error || 'Ocurrió un problema al procesar el pago.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <p>Monto: MX${amount}</p>
        <p>Correo: {userEmail}</p>
      </div>

      <CardElement
        options={{
          style: {
            base: { fontSize: '16px', color: '#424770' },
            invalid: { color: '#c23d4b' }
          },
          hidePostalCode: true
        }}
      />

      <button type="submit" disabled={!stripe || loading}>
        {loading ? 'Procesando…' : `Pagar MX$${amount}`}
      </button>
    </form>
  );
}

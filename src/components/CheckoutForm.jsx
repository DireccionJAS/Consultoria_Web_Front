import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createProcessWithPayment, payDS160, envioCorreo } from './../api/api.js';
import apiClient from './../api/apiClient.js';

export default function CheckoutForm({
  amount,
  description,
  idProductoTransaccion,
  userEmail,
  liquidationPlan,
  costoTotal,
  customer,
  onSuccess,
  onError,
  serviceName,
  disabled = false,
  selectedDate,
  service,
  idTransactProgress,
  quantity = 1,
  onQuantityChange
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Determinar si es Visa Americana
  const isVisaAmericana = service?.name === 'Visa Americana' || service?.name === 'Visa Americana (4 meses)';
  const isAdvancePayment = description && description.includes('Apartado');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (idProductoTransaccion === undefined || idProductoTransaccion === null || isNaN(parseInt(idProductoTransaccion, 10))) {
      setMessage('Error: Identificador de transacción del producto no válido o no proporcionado.');
      console.error("Error: idProductoTransaccion no es válido:", idProductoTransaccion);
      setLoading(false);
      onError && onError({ message: 'ID de transacción de producto inválido.' });
      return;
    }

    try {
      const { data } = await apiClient.post(`/pay/payint`, {
        amount: (amount * 100)* quantity, 
        currency: 'mxn',
        description: serviceName ? `${serviceName} - ${description}` : description,
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

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: 'Cliente ' + customer,
            email: userEmail
          }
        },
      });

      if (result.error) {
        setMessage(result.error.message);
        onError && onError(result.error);
      } else if (result.paymentIntent.status === 'succeeded') {
        setMessage('¡Pago exitoso!');
        onSuccess && onSuccess(result.paymentIntent);

        // Guardar el registro del pago en la base de datos
        try {
          // CLAVE: Determinar el costo total correcto para el trámite




          const paymentData = {
            total: amount* quantity , // Monto total pagado
            status: 1,
            idUser: parseInt(customer),
            quantity: parseInt(quantity) || 1,
            idTransact: parseInt(idProductoTransaccion)
          };



          await apiClient.post(`/payment`, paymentData);

          // Crear los procesos
          for (let i = 0; i < paymentData.quantity; i++) {

            // Crear una copia de paymentData con el monto realmente pagado
            const processPaymentData = {
              total: costoTotal, // Monto total del trámite
              paid: amount, // Monto total pagado
              date: selectedDate || null,
              status: 1,
              idUser: parseInt(customer),
              idTransact: parseInt(idProductoTransaccion),
            };
            await createProcessWithPayment(processPaymentData);
             await envioCorreo(userEmail,customer,serviceName);
          }
          // Enviar correo DS-160 si aplica
          if (serviceName) {
            const serviceNameLower = serviceName.trim().toLowerCase();
            const hasElaboracion = serviceNameLower.includes('elaboracion') || serviceNameLower.includes('elaboración');
            const hasCreacion = serviceNameLower.includes('creacion') || serviceNameLower.includes('creación');
            const hasDs = serviceNameLower.includes('ds');
            
            // Debe tener DS obligatoriamente Y al menos una de las otras dos (elaboracion o creacion)
            if (hasDs && (hasElaboracion || hasCreacion)) {
              try {
                await payDS160(userEmail);
              } catch (mailError) {
                console.error('Error al enviar correo de confirmación DS-160:', mailError);
              }
            }
          }

        } catch (dbError) {
          console.error("Error al guardar el pago en la base de datos:", dbError);
          console.error("Detalles del error:", dbError.response?.data || dbError.message);
          setMessage(`Pago en Stripe exitoso, pero hubo un problema al guardar su registro. Por favor, contacte a soporte.`);
        }
      }
    } catch (err) {
      console.error("Error creando PaymentIntent:", err.response?.data || err.message);
      let errorMessage = 'Error al procesar el pago.';
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setMessage(errorMessage);
      onError && onError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <div className="product-info" style={{ marginBottom: '20px' }}>
        <h4>{description}</h4>

        {/* Información especial para Visa Americana con adelanto */}
        {isVisaAmericana && isAdvancePayment && (
          <div style={{
            padding: '12px',
            backgroundColor: '#e3f2fd',
            border: '1px solid #2196f3',
            borderRadius: '8px',
            marginBottom: '12px'
          }}>
            <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#1976d2' }}>
              Visa Americana - Adelanto ({liquidationPlan})
            </p>
            <p style={{ margin: '0 0 4px 0', fontSize: '14px' }}>
              Pagando ahora: ${amount*quantity} MXN (Adelanto)
            </p>
            <p style={{ margin: '0 0 4px 0', fontSize: '14px' }}>
              Total del trámite: ${costoTotal*quantity} MXN
            </p>
            <p style={{ margin: '0', fontSize: '14px' }}>
              Pendiente: ${(costoTotal*quantity)-(amount*quantity)} MXN
            </p>
          </div>
        )}

        {/* Información general del producto */}
        <div style={{
          padding: '12px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          marginBottom: '12px'
        }}>
          <p style={{ margin: '0 0 4px 0', fontSize: '14px' }}>
            Servicio: {serviceName || 'Servicio general'}
          </p>
          <p style={{ margin: '0 0 4px 0', fontSize: '14px' }}>
            Cantidad: {quantity} X {amount} MXN
          </p>
          <p style={{ margin: '0', fontSize: '16px', fontWeight: '600' }}>
            Total a pagar: ${amount*quantity} MXN
          </p>
        </div>

        {/* Selector de cantidad si es necesario */}
        {onQuantityChange && (
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
              Cantidad:
            </label>
            <input
              type="number"
              min="1"
              max="15"
              value={quantity}
              onChange={(e) => onQuantityChange(parseInt(e.target.value) || 1)}
              style={{
                width: '100px',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>
        )}
      </div>

      {/* Elemento de tarjeta de Stripe */}
      <div style={{
        padding: '12px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        marginBottom: '16px',
        backgroundColor: '#fff'
      }}>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>

      {/* Botón de pago */}
      <button
        type="submit"
        disabled={!stripe || loading || disabled}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: disabled || loading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: disabled || loading ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.3s ease'
        }}
      >
        {loading ? 'Procesando...' : `Pagar $${amount*quantity} MXN`}
      </button>

      {/* Mensaje de estado */}
      {message && (
        <div style={{
          marginTop: '12px',
          padding: '8px 12px',
          borderRadius: '4px',
          backgroundColor: message.includes('exitoso') ? '#d4edda' : '#f8d7da',
          color: message.includes('exitoso') ? '#155724' : '#721c24',
          border: `1px solid ${message.includes('exitoso') ? '#c3e6cb' : '#f5c6cb'}`,
          fontSize: '14px'
        }}>
          {message}
        </div>
      )}

      {/* Información adicional de seguridad */}
      <div style={{
        marginTop: '16px',
        padding: '8px',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
        fontSize: '12px',
        color: '#6c757d',
        textAlign: 'center'
      }}>
        🔒 Pago seguro procesado por Stripe. Sus datos están protegidos.
      </div>
    </form>
  );
}
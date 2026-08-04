import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createProcessWithPayment, payDS160, envioCorreo, createPersona } from './../api/api.js';
import { buildDs160Link } from './../utils/ds160.js';
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
  const [names, setNames] = useState(['']);

  // Mantiene un campo de nombre por cada unidad de "cantidad"
  useEffect(() => {
    setNames((prev) => {
      const next = [...prev];
      while (next.length < quantity) next.push('');
      next.length = quantity;
      return next;
    });
  }, [quantity]);

  const handleNameChange = (index, value) => {
    setNames((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const namesComplete = names.length === quantity && names.every((n) => n.trim().length > 0);

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

    if (!namesComplete) {
      setMessage(quantity > 1 ? 'Ingresa el nombre de cada persona antes de pagar.' : 'Ingresa el nombre del titular antes de pagar.');
      setLoading(false);
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
              personName: (names[i] || '').trim() || null,
            };
            const progressResult = await createProcessWithPayment(processPaymentData);
            await envioCorreo(userEmail,customer,serviceName);

            // El módulo de Formularios (link DS-160 por persona) solo aplica a
            // trámites con cita CAS o cita consular (service.cas / service.con)
            if (service?.cas || service?.con) {
              const nuevoIdTransactProgress = progressResult?.response?.idTransactProgress;
              if (nuevoIdTransactProgress) {
                try {
                  await createPersona({
                    name: (names[i] || '').trim(),
                    role: i === 0 ? 'Titular' : 'Acompañante',
                    ds160Link: buildDs160Link(names[i]),
                    idTransactProgress: nuevoIdTransactProgress,
                  });
                } catch (personaError) {
                  console.error('Error al crear la persona del DS-160:', personaError);
                }
              }
            }
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

  const fontSans = '"Inter", system-ui, sans-serif';
  const fontDisplay = '"Bricolage Grotesque", system-ui, sans-serif';
  const fontMono = '"JetBrains Mono", ui-monospace, monospace';

  return (
    <form onSubmit={handleSubmit} className="checkout-form" style={{ fontFamily: fontSans }}>
      <div className="product-info" style={{ marginBottom: '20px' }}>
        <h4 style={{ fontFamily: fontDisplay, fontWeight: 600, fontSize: 17, color: '#00002A', marginBottom: 12 }}>{description}</h4>

        {/* Información especial para Visa Americana con adelanto */}
        {isVisaAmericana && isAdvancePayment && (
          <div style={{
            padding: '14px 16px',
            backgroundColor: 'rgba(111, 174, 219, 0.10)',
            border: '1px solid rgba(111, 174, 219, 0.25)',
            borderRadius: '14px',
            marginBottom: '12px'
          }}>
            <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#1A3F75' }}>
              Visa Americana - Adelanto ({liquidationPlan})
            </p>
            <p style={{ margin: '0 0 4px 0', fontSize: '13.5px', color: '#00002A' }}>
              Pagando ahora: ${amount*quantity} MXN (Adelanto)
            </p>
            <p style={{ margin: '0 0 4px 0', fontSize: '13.5px', color: '#00002A' }}>
              Total del trámite: ${costoTotal*quantity} MXN
            </p>
            <p style={{ margin: '0', fontSize: '13.5px', color: '#00002A' }}>
              Pendiente: ${(costoTotal*quantity)-(amount*quantity)} MXN
            </p>
          </div>
        )}

        {/* Información general del producto */}
        <div style={{
          padding: '14px 16px',
          backgroundColor: '#E4ECF0',
          borderRadius: '14px',
          marginBottom: '12px'
        }}>
          <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: 'rgba(0,0,42,0.65)' }}>
            Servicio: {serviceName || 'Servicio general'}
          </p>
          <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: 'rgba(0,0,42,0.65)' }}>
            Cantidad: {quantity} X {amount} MXN
          </p>
          <p style={{ margin: '0', fontSize: '15px', fontWeight: '700', fontFamily: fontDisplay, color: '#00002A' }}>
            Total a pagar: ${amount*quantity} MXN
          </p>
        </div>

        {/* Selector de cantidad si es necesario */}
        {onQuantityChange && (
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 600, color: '#00002A' }}>
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
                padding: '10px 12px',
                border: '1px solid rgba(0,0,42,0.18)',
                borderRadius: '10px',
                fontSize: '13.5px',
                fontFamily: fontSans,
              }}
            />
          </div>
        )}

        {/* Nombre por cada persona pagada */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 600, color: '#00002A' }}>
            {quantity > 1 ? 'Nombre de cada persona' : 'Nombre del titular'}
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {names.map((name, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {quantity > 1 && (
                  <span style={{
                    width: 22, height: 22, borderRadius: '50%',
                    backgroundColor: '#E4ECF0', color: '#1A3F75',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, fontFamily: fontDisplay, flexShrink: 0,
                  }}>
                    {i + 1}
                  </span>
                )}
                <input
                  type="text"
                  placeholder={quantity > 1 ? `Nombre de la persona ${i + 1}` : 'Nombre del titular'}
                  value={name}
                  onChange={(e) => handleNameChange(i, e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    border: '1px solid rgba(0,0,42,0.18)',
                    borderRadius: '10px',
                    fontSize: '13.5px',
                    fontFamily: fontSans,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Elemento de tarjeta de Stripe */}
      <div style={{
        padding: '14px',
        border: '1px solid rgba(0,0,42,0.18)',
        borderRadius: '14px',
        marginBottom: '16px',
        backgroundColor: '#fff'
      }}>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                fontFamily: '"Inter", system-ui, sans-serif',
                color: '#00002A',
                '::placeholder': {
                  color: 'rgba(0,0,42,0.38)',
                },
              },
              invalid: {
                color: '#B73E3E',
              },
            },
          }}
        />
      </div>

      {/* Botón de pago */}
      <button
        type="submit"
        disabled={!stripe || loading || disabled || !namesComplete}
        style={{
          width: '100%',
          padding: '13px',
          backgroundColor: disabled || loading || !namesComplete ? 'rgba(0,0,42,0.25)' : '#00002A',
          color: 'white',
          border: 'none',
          borderRadius: '999px',
          fontSize: '14px',
          fontWeight: '600',
          fontFamily: fontSans,
          cursor: disabled || loading || !namesComplete ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.3s ease'
        }}
        onMouseEnter={(e) => { if (!disabled && !loading && namesComplete) e.currentTarget.style.backgroundColor = '#1A3F75'; }}
        onMouseLeave={(e) => { if (!disabled && !loading && namesComplete) e.currentTarget.style.backgroundColor = '#00002A'; }}
      >
        {loading ? 'Procesando...' : `Pagar $${amount*quantity} MXN`}
      </button>

      {/* Mensaje de estado */}
      {message && (
        <div style={{
          marginTop: '12px',
          padding: '10px 14px',
          borderRadius: '10px',
          backgroundColor: message.includes('exitoso') ? '#DFF5E5' : '#F5DADA',
          color: message.includes('exitoso') ? '#1F7B3D' : '#B73E3E',
          border: `1px solid ${message.includes('exitoso') ? 'rgba(40,160,82,0.25)' : 'rgba(183,62,62,0.25)'}`,
          fontSize: '13.5px',
          fontFamily: fontSans,
        }}>
          {message}
        </div>
      )}

      {/* Información adicional de seguridad */}
      <div style={{
        marginTop: '16px',
        padding: '10px',
        backgroundColor: '#E4ECF0',
        borderRadius: '10px',
        fontSize: '11.5px',
        fontFamily: fontMono,
        letterSpacing: '0.02em',
        color: 'rgba(0,0,42,0.6)',
        textAlign: 'center'
      }}>
        Pago seguro procesado por Stripe. Sus datos están protegidos.
      </div>
    </form>
  );
}
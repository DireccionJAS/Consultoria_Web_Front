import React, { useEffect, useRef } from 'react';
import { createProcessWithPayment } from '../../api/api.js';
import apiClient from '../../api/apiClient.js';
import { useState } from 'react';

const PayPalButton = ({ amount, onSuccess, onError, userId, service, setPaypalStatus, quantity =1 , costoTotal }) => {
  const paypalRef = useRef();
  const [paymentStatus, setPaymentStatus] = useState(null);


  const formattedAmount = (() => {
    let num = Number(amount);
    if (isNaN(num) || num <= 0) num = 1;
    return num.toFixed(2);
  })();

  useEffect(() => {
    if (!window.paypal) return;

    if (paypalRef.current) {
      paypalRef.current.innerHTML = '';
    }
    window.paypal.Buttons({
      createOrder: (data, actions) => {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: formattedAmount
            }
          }]
        });
      },
      onApprove: (data, actions) => {
        return actions.order.capture().then(async function (details) {

          setPaymentStatus(details.status);


          if (setPaypalStatus) {
            setPaypalStatus(details.status);
          }

          if (details.status === "COMPLETED") {
            try {

              let idTransact;
              if (service.transact && service.transact.idTransact) {
                idTransact = service.transact.idTransact;
              } else if (service.idTransact) {
                idTransact = service.idTransact;
              } else {
                console.error('No se encontró idTransact en service:', service);
                throw new Error('idTransact no encontrado en service');
              }
              let paymentData = {}; // Declarar afuera

              if (quantity > 1) {
                paymentData = {
                  total: parseFloat(costoTotal) , 
                  paid: parseFloat(amount) / quantity,
                  status: 1,
                  idUser: parseInt(userId),
                  idTransact: idTransact,
                  quantity: parseInt(quantity) || 1
                };
              } else {
                paymentData = {
                  total: parseFloat(costoTotal), 
                  paid: parseFloat(amount),
                  status: 1,
                  idUser: parseInt(userId),
                  idTransact: idTransact,
                  quantity: parseInt(quantity) || 1
                };
              }


              // El registro de Payment se crea DESPUÉS de que todos los
              // trámites se hayan creado con éxito (no antes): mismo fix
              // que ya se hizo en CheckoutForm.jsx/Stripe — si se crea el
              // Payment primero y luego falla un trámite, queda un cobro
              // ya aprobado por PayPal sin ningún trámite asociado.
              for (let i = 0; i < paymentData.quantity; i++) {
                const progressResult = await createProcessWithPayment(paymentData);
                if (!progressResult?.success) {
                  throw new Error(progressResult?.message || 'No se pudo registrar el trámite.');
                }
              }

              const response = await apiClient.post(`/payment`, paymentData);
              if (!response.data.success) {
                throw new Error(response.data.message || 'No se pudo registrar el pago.');
              }
              if (onSuccess) onSuccess(details);
            } catch (error) {
              console.error('Error al procesar registro:', error);
              if (onError) onError(error);
            }
          } else {
            console.warn('Pago no completado. Status:', details.status);
            if (onError) onError(new Error('El pago no fue completado.'));
          }
        });
      },
      onError: (err) => {
        console.error('Error PayPal:', err);
        if (onError) onError(err);
      }
    }).render(paypalRef.current);
  }, [formattedAmount, onSuccess, onError, userId, service, setPaypalStatus]);

  return <div ref={paypalRef}></div>;
};

export default PayPalButton;
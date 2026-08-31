import React from 'react';
import { Modal } from 'react-bootstrap';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { LockIcon } from 'lucide-react';
import CartCheckoutForm from './../CartCheckoutForm.jsx';
import paymentStyles from './../../../styles/servicios/client/PaymentModal.module.css';
import cartStyles from './../../../styles/CartPaymentModal.module.css';

const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
const stripePromise = loadStripe(stripeKey);

// Modal separado del PaymentModal de un solo servicio (deliberado: ese
// modal ya carga mucha lógica específica de Visa Americana/DS-160/planes de
// liquidación — replicar ese comportamiento para un carrito de N servicios
// no es necesario en esta primera versión, que solo cubre servicios simples
// de precio fijo, ver esElegibleParaCarrito en ClienteServicios.jsx).
export default function CartPaymentModal({ show, onHide, services, userEmail, userId, onSuccess, onError }) {
  const total = (services || []).reduce((sum, s) => sum + (s.cashAdvance ?? s.cost ?? 0), 0);

  return (
    <Modal show={show} onHide={onHide} centered dialogClassName={paymentStyles.customDialog} backdropClassName={paymentStyles.modalBackdrop}>
      <Modal.Header closeButton className={paymentStyles.modalHeader}>
        <Modal.Title className={paymentStyles.paymentModalTitle}>
          <div className={paymentStyles.serviceIcon}><LockIcon size={32} /></div>
          <div>
            <div className={paymentStyles.serviceTitle}>Pago conjunto</div>
            <div className={paymentStyles.serviceSubtitle}>Pago seguro con Stripe</div>
          </div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className={paymentStyles.modalBody}>
        <div className={paymentStyles.securitySection}>
          <div className={paymentStyles.securityBadge}>🔒 Pago 100% seguro</div>
        </div>

        {!services || services.length === 0 ? (
          <div className={cartStyles.empty}>No hay servicios seleccionados.</div>
        ) : (
          <>
            <div className={cartStyles.list}>
              {services.map((s) => (
                <div key={s.idTransact} className={cartStyles.row}>
                  <span className={cartStyles.rowName}>{s.name}</span>
                  <span className={cartStyles.rowAmount}>${(s.cashAdvance ?? s.cost ?? 0).toLocaleString('es-MX')} MXN</span>
                </div>
              ))}
            </div>
            <div className={cartStyles.totalRow}>
              <span className={cartStyles.totalLabel}>Total a pagar ahora</span>
              <span className={cartStyles.totalAmount}>${total.toLocaleString('es-MX')} MXN</span>
            </div>

            <Elements stripe={stripePromise}>
              <CartCheckoutForm
                services={services}
                totalAmount={total}
                userEmail={userEmail}
                userId={userId}
                onSuccess={onSuccess}
                onError={onError}
              />
            </Elements>
          </>
        )}

        <div className={paymentStyles.privacyNote}>Nunca almacenamos datos de tu tarjeta.</div>
      </Modal.Body>
    </Modal>
  );
}

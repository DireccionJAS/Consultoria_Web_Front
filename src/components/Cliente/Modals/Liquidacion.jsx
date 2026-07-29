import React, { useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Modal } from 'react-bootstrap';
import { LockIcon } from 'lucide-react';
import CheckoutForm from '../../Checkout.jsx';
import paymentStyles from '../../../styles/servicios/client/PaymentModal.module.css';
import PayPalScriptLoader from '../../PayPal/PayPalScriptLoader.jsx';
import PayPalButton from '../../PayPal/BottonTest.jsx';
import { actualizarTC } from '../../../api/api.js';
import apiClient from '../../../api/apiClient.js';

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

const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
const stripePromise = loadStripe(stripeKey);

export default function Liquidacion({ show, onHide, service, userEmail, userId, onSuccess, onError, COMPLETED }) {
    const [paypalStatus, setPaypalStatus] = useState(null);

    if (!show || !service) return null;

    const montoRestante = service.paidAll - service.paid;

    const executePaymentRequests = async () => {
        try {
     


            if (!service) {
                throw new Error('Service is undefined');
            }

            const nuevoPaid = service.paid + service.paidAll;
            await actualizarTC(service.idTransactProgress, {
                ...service,
                paid: service.paidAll,
                paidAll: 0
            });


            let idTransact;
            if (service.transact && service.transact.idTransact) {
                idTransact = parseInt(service.transact.idTransact);
            } else if (service.idTransact) {
                idTransact = parseInt(service.idTransact);
            } else {
                console.error('No se encontró idTransact en service:', service);
                throw new Error('idTransact no encontrado en service');
            }

            const paymentData = {
                total: montoRestante,
                status: 1,
                idUser: parseInt(userId),
                idTransact: idTransact,
            };

            await apiClient.post(`/payment`, paymentData);

            return true;
        } catch (error) {
            console.error('Error ejecutando peticiones:', error);
            throw error;
        }
    };

    const handleStripeSuccess = async (...args) => {
        try {
            await executePaymentRequests();
            if (onSuccess) onSuccess(...args);
        } catch (error) {
            console.error('Error actualizando TC:', error);
            if (onError) onError(error);
        }
    };

    const handlePayPalSuccess = async (...args) => {
        try {
            await executePaymentRequests();
            if (onSuccess) onSuccess(...args);
        } catch (error) {
            console.error('Error actualizando TC:', error);
            if (onError) onError(error);
        }
    };

    useEffect(() => {
        if (paypalStatus === "COMPLETED") {
            handlePayPalSuccess();
        }
    }, [paypalStatus]);

    useEffect(() => {
        if (COMPLETED === "COMPLETED") {
            handlePayPalSuccess();
        }
    }, [COMPLETED]);

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            dialogClassName={paymentStyles.customDialog}
            backdropClassName={paymentStyles.modalBackdrop}
        >
            <Modal.Header closeButton className={paymentStyles.modalHeader}>
                <Modal.Title className={paymentStyles.paymentModalTitle}>
                    <div className={paymentStyles.serviceIcon}>
                        <LockIcon size={32} />
                    </div>
                    <div>
                        <div className={paymentStyles.serviceTitle}>Liquidar Trámite</div>
                        <div className={paymentStyles.serviceSubtitle}>
                            Pago seguro con Stripe y PayPal
                        </div>
                    </div>
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className={paymentStyles.modalBody}>
                <div className={paymentStyles.securitySection}>
                    <div className={paymentStyles.securityBadge}>
                        <ShieldSVG />
                        Pago 100% seguro y encriptado
                    </div>
                    <div className={paymentStyles.securityFeatures}>
                        <div className={paymentStyles.securityFeature}>
                            Tus datos están protegidos
                        </div>
                    </div>
                </div>

                <div style={{
                    marginTop: '1rem',
                    marginBottom: '1rem',
                    padding: '14px 16px',
                    background: 'linear-gradient(135deg, #E4ECF0 0%, #B4C8D8 100%)',
                    borderRadius: 14,
                    fontFamily: '"Inter", system-ui, sans-serif',
                }}>
                    <div style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(0,0,42,0.55)', marginBottom: 4 }}>
                        Monto a liquidar
                    </div>
                    <div style={{ fontFamily: '"Bricolage Grotesque", system-ui, sans-serif', fontWeight: 700, fontSize: 26, color: '#00002A' }}>
                        ${montoRestante}<small style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 12, color: 'rgba(0,0,42,0.55)', marginLeft: 6 }}>MXN</small>
                    </div>
                </div>

                <Elements stripe={stripePromise}>
                    <CheckoutForm
                        amount={montoRestante}
                        description={`Liquidación de trámite`}
                        idProductoTransaccion={service.idTransact}
                        userEmail={userEmail}
                        customer={userId}
                        onSuccess={handleStripeSuccess}
                        onError={onError}
                        serviceName={"liquidacion"}
                    />
                </Elements>
           
                <div className={paymentStyles.paymentSeparator}>
                    <div className={paymentStyles.separatorLine} />
                    <span className={paymentStyles.separatorText}>o paga con</span>
                    <div className={paymentStyles.separatorLine} />
                </div>

                <div style={{ marginTop: 24, marginBottom: 12 }}>
                    <PayPalScriptLoader>
                        <PayPalButton
                            amount={montoRestante}
                            onSuccess={handlePayPalSuccess}
                            onError={onError}
                            userId={userId || 'N/A'}
                            service="hora_extra"
                            setPaypalStatus={setPaypalStatus}
                        />
                    </PayPalScriptLoader>
                </div>

                <div className={paymentStyles.paymentMethods} style={{ marginTop: '1.5rem' }}>
                    <VisaSVG />
                    <MastercardSVG />
                    <StripeSVG />
                </div>

                <div className={paymentStyles.privacyNote}>
                    Nunca almacenamos los datos de tu tarjeta. El pago es procesado de forma segura por Stripe.
                </div>

                
            </Modal.Body>
        </Modal>
    );
}
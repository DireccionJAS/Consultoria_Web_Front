import React, { useState } from 'react';
import { MessageIcon } from './Icons.jsx';
import InfoBox from './InfoBox.jsx';
import StripePaymentSection from './StripePaymentSection.jsx';

const DS160Section = ({ userEmail,userId, onSuccess, onError, onHide, service, paymentOptions, selectedPaymentType, onPaymentTypeChange, currentPaymentOption, quantity = 1, totalAmount, onQuantityChange }) => {
  return (
    <div>
      {/* Info Box */}
      <div style={{
        backgroundColor: '#DFF5E5',
        border: '1px solid rgba(40,160,82,0.25)',
        borderRadius: '14px',
        padding: '18px 20px',
        marginBottom: '20px',
        textAlign: 'center',
        fontFamily: '"Inter", system-ui, sans-serif',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          marginBottom: '12px'
        }}>
          <MessageIcon color="#1F7B3D" />
          <strong style={{ color: '#1F7B3D', fontSize: '16px', fontFamily: '"Bricolage Grotesque", system-ui, sans-serif', fontWeight: 600 }}>
            Formulario DS-160
          </strong>
        </div>

        <p style={{
          color: '#1F7B3D',
          margin: '0 0 12px 0',
          fontSize: '13px',
          lineHeight: '1.5'
        }}>
          Te enviaremos un correo personalizado a tu correo electrónico para completar
          el proceso del formulario DS-160 de manera segura.

        </p>

        <p style={{
          color: '#1F7B3D',
          margin: '0 0 12px 0',
          fontSize: '13px',
          lineHeight: '1.5'}}>
            Correo electrónico: <strong>{userEmail}</strong>
          </p>

        {quantity > 1 && (
          <p style={{
            color: '#1F7B3D',
            margin: '0',
            fontSize: '13px',
            lineHeight: '1.5',
            fontWeight: '600'
          }}>
            Cantidad de Solicitantes: <strong>{quantity}</strong>
          </p>
        )}
      </div>

      {/* Stripe Payment Section */}
      <StripePaymentSection
        service={service}
        paymentOptions={paymentOptions}
        selectedPaymentType={selectedPaymentType}
        onPaymentTypeChange={onPaymentTypeChange}
        currentPaymentOption={currentPaymentOption}
        userEmail={userEmail}
        quantity={quantity}
        userId={userId}
        totalAmount={totalAmount}
        onQuantityChange={onQuantityChange}
        onSuccess={onSuccess}
        onError={onError}
        onHide={onHide}
      />

      {/* Warning Box */}
      <InfoBox
        color="#1A3F75"
        backgroundColor="rgba(111, 174, 219, 0.10)"
        borderColor="rgba(111, 174, 219, 0.30)"
        title="Información importante"
        items={[
          'Formulario DS-160 para trámite de visa',
          'Pago 100% seguro con Stripe o PayPal',
          'Procesamiento inmediato del trámite',
          'Recibirás confirmación por correo'
        ]}
      />
    </div>
  );
};


export default DS160Section;
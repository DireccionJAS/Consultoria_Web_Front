import React from 'react';

const PaymentOption = ({ option, isSelected, onSelect, optionKey }) => {
  if (!option.amount || option.amount <= 0) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '10px',
        padding: '14px 16px',
        border: isSelected ? '2px solid #1A3F75' : '1px solid rgba(0,0,42,0.14)',
        borderRadius: '14px',
        cursor: 'pointer',
        backgroundColor: isSelected ? '#E4ECF0' : 'white',
        transition: 'all 0.2s ease',
        fontFamily: '"Inter", system-ui, sans-serif',
      }}
      onClick={() => onSelect(optionKey)}
    >
      <input
        type="radio"
        name="paymentType"
        value={optionKey}
        checked={isSelected}
        onChange={() => onSelect(optionKey)}
        style={{ marginRight: '12px', accentColor: '#1A3F75' }}
      />
      <div style={{ flex: 1 }}>
        <div style={{
          fontWeight: 600,
          color: '#00002A',
          marginBottom: '4px',
          fontSize: '13.5px'
        }}>
          {option.description}
          {option.isDeposit && (
            <span style={{
              color: '#1F7B3D',
              background: '#DFF5E5',
              fontWeight: 500,
              fontSize: '10.5px',
              padding: '2px 8px',
              borderRadius: 999,
              marginLeft: '8px',
            }}>
              Apartado
            </span>
          )}
        </div>
        <div style={{
          fontFamily: '"Bricolage Grotesque", system-ui, sans-serif',
          fontSize: '17px',
          color: '#00002A',
          marginBottom: '4px',
          fontWeight: 700
        }}>
          ${option.amount.toFixed(2)}<small style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 10, color: 'rgba(0,0,42,0.55)', fontWeight: 500, marginLeft: 4 }}>MXN</small>
        </div>
        <div style={{
          fontSize: '11.5px',
          color: 'rgba(0,0,42,0.55)',
          fontFamily: '"JetBrains Mono", ui-monospace, monospace',
          letterSpacing: '0.02em',
        }}>
          {option.processingTime}
        </div>
      </div>
    </div>
  );
};

const PaymentOptions = ({
  paymentOptions,
  selectedPaymentType,
  onPaymentTypeChange,
  isVisaAmericana
}) => {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{
        marginBottom: '12px',
        color: '#4E6A9C',
        fontSize: '10px',
        fontFamily: '"JetBrains Mono", ui-monospace, monospace',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
      }}>
        {isVisaAmericana
          ? 'Selecciona el tiempo de procesamiento'
          : 'Selecciona tu opción de pago'
        }
      </div>

      {Object.entries(paymentOptions).map(([key, option]) => (
        <PaymentOption
          key={key}
          option={option}
          optionKey={key}
          isSelected={selectedPaymentType === key}
          onSelect={onPaymentTypeChange}
        />
      ))}
    </div>
  );
};

export default PaymentOptions; 
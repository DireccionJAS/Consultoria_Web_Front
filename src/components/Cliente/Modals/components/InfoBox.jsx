import { InfoIcon } from 'lucide-react';
import React from 'react';

const InfoBox = ({
  backgroundColor,
  borderColor,
  color,
  title,
  items = [],
  children
}) => (
  <div style={{
    backgroundColor,
    border: `1px solid ${borderColor}`,
    borderRadius: '14px',
    padding: '16px 18px',
    marginBottom: '20px',
    fontFamily: '"Inter", system-ui, sans-serif',
  }}>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: '8px'
    }}>
      <InfoIcon color={color} size={17} />
      <strong style={{ color, fontFamily: '"Bricolage Grotesque", system-ui, sans-serif', fontWeight: 600, fontSize: 14 }}>{title}</strong>
    </div>
    {items.length > 0 ? (
      <ul style={{
        margin: 0,
        paddingLeft: '20px',
        color,
        fontSize: '13px',
        lineHeight: 1.6,
      }}>
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    ) : children}
  </div>
);

export default InfoBox;
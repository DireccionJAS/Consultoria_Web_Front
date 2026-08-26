import React from 'react';
import styles from './../../styles/GoogleAuthModal.module.css';

// Extraído 1:1 de "Modal Google (standalone).html". El mockup solo tiene
// el paso "elige Sí/No" y, si es No, las 3 alternativas (PDF/WhatsApp/
// Llamar) — el paso "phone" (cuando el correo de Google es nuevo y hace
// falta el teléfono para crear la cuenta) se agregó fuera del mockup
// porque `user.phone` es NOT NULL en la base de datos y Google no lo
// manda; ver GoogleAuthService.completeGoogleSignup en el backend.

function CloseIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 6l12 12M6 18L18 6"></path></svg>;
}
function GoogleGIcon({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z"></path>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"></path>
      <path fill="#FBBC05" d="M5.84 14.09a6.6 6.6 0 0 1 0-4.18V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84z"></path>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"></path>
    </svg>
  );
}
function CheckIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12l5 5L20 7"></path></svg>;
}
function XIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 6l12 12M6 18L18 6"></path></svg>;
}
function InfoIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4M12 8h.01"></path></svg>;
}
function PdfIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6M12 18v-6M9 15l3 3 3-3"></path></svg>;
}
function WhatsIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 17 0z"></path></svg>;
}
function CallIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>;
}
function DownloadArrowIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"></path></svg>;
}
function ExternalArrowIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M7 7h10v10"></path></svg>;
}
function BackIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"></path></svg>;
}
function UserIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="7" r="4" /><path d="M3 21v-1a7 7 0 0 1 14 0v1" /></svg>;
}
function PhoneFieldIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg>;
}

const WHATSAPP_URL = 'https://wa.me/527772193613?text=' + encodeURIComponent('Hola, no tengo cuenta de Google y quiero continuar mi trámite con Consultoría JAS.');
const TEL_URL = 'tel:+527773140099';
const FORMULARIO_URL = `${import.meta.env.VITE_API_URL}/pdf/download/formulario`;

export default function GoogleAuthModal({
  show, step, onClose, onChooseYes, onChooseNo, onBack,
  submitting, pendingName, pendingEmail, phone, onPhoneChange, onSubmitPhone,
}) {
  if (!show) return null;

  const handleDescargarFormulario = () => window.open(FORMULARIO_URL, '_blank', 'noopener,noreferrer');
  const handleWhatsapp = () => window.open(WHATSAPP_URL, '_blank', 'noopener,noreferrer');
  const handleLlamar = () => { window.location.href = TEL_URL; };

  return (
    <div className={styles.scrim} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal}>
        <div className={styles.modalTop}>
          <button className={styles.modalClose} onClick={onClose}><CloseIcon /></button>
          <div className={styles.gicon}><GoogleGIcon /></div>
          {step === 'phone' ? (
            <>
              <div className={styles.modalTitle}>Un último paso</div>
              <div className={styles.modalSub}>Hola{pendingName ? `, ${pendingName}` : ''}. Necesitamos tu teléfono para crear tu cuenta con {pendingEmail}.</div>
            </>
          ) : (
            <>
              <div className={styles.modalTitle}>¿Tienes una cuenta<br />de Google?</div>
              <div className={styles.modalSub}>Para acceder al portal y llenar tus formularios necesitas una cuenta de Google.</div>
            </>
          )}
        </div>

        <div className={styles.modalBody}>
          {step === 'choice' && (
            <div>
              <button type="button" className={`${styles.optBtn} ${styles.optYes}`} onClick={onChooseYes} disabled={submitting}>
                <span className={styles.optIcon}><CheckIcon /></span>
                {submitting ? 'Conectando…' : 'Sí, tengo cuenta de Google'}
              </button>
              <button type="button" className={`${styles.optBtn} ${styles.optNo}`} onClick={onChooseNo} disabled={submitting}>
                <span className={styles.optIcon}><XIcon /></span>
                No tengo cuenta de Google
              </button>
            </div>
          )}

          {step === 'alts' && (
            <div>
              <div className={styles.altsIntro}>
                <InfoIcon />
                <div className={styles.altsIntroText}>Sin problema. Te dejamos otras formas de continuar tu trámite con nosotros.</div>
              </div>
              <button type="button" className={styles.altCard} onClick={handleDescargarFormulario}>
                <div className={`${styles.altIc} ${styles.pdf}`}><PdfIcon /></div>
                <div><div className={styles.altName}>Descargar formulario en PDF</div><div className={styles.altSub}>Llénalo a mano y tráelo a la sucursal</div></div>
                <span className={styles.altArrow}><DownloadArrowIcon /></span>
              </button>
              <button type="button" className={styles.altCard} onClick={handleWhatsapp}>
                <div className={`${styles.altIc} ${styles.wa}`}><WhatsIcon /></div>
                <div><div className={styles.altName}>Contactar a un asesor por WhatsApp</div><div className={styles.altSub}>Te respondemos en menos de 30 min</div></div>
                <span className={styles.altArrow}><ExternalArrowIcon /></span>
              </button>
              <button type="button" className={styles.altCard} onClick={handleLlamar}>
                <div className={`${styles.altIc} ${styles.call}`}><CallIcon /></div>
                <div><div className={styles.altName}>Llamar a Consultoría JAS</div><div className={styles.altSub}>777 314 0099 · L–S 9:00–18:00</div></div>
                <span className={styles.altArrow}><ExternalArrowIcon /></span>
              </button>
              <button type="button" className={styles.backLink} onClick={onBack}><BackIcon /> Volver</button>
            </div>
          )}

          {step === 'phone' && (
            <form onSubmit={(e) => { e.preventDefault(); onSubmitPhone(); }}>
              <div className={styles.phoneIntro}>
                <UserIcon />
                <div className={styles.phoneIntroText}>Tu correo de Google es nuevo para nosotros — vamos a crear tu cuenta con él.</div>
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Teléfono <span className={styles.req}>*</span></label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}><PhoneFieldIcon /></span>
                  <input
                    className={styles.fieldInput}
                    type="tel"
                    placeholder="777 123 4567"
                    value={phone}
                    onChange={(e) => onPhoneChange(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    maxLength={10}
                    inputMode="numeric"
                    autoFocus
                  />
                </div>
              </div>
              <button type="submit" className={`${styles.optBtn} ${styles.optYes}`} disabled={submitting || phone.length !== 10}>
                <span className={styles.optIcon}><CheckIcon /></span>
                {submitting ? 'Creando cuenta…' : 'Crear mi cuenta'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

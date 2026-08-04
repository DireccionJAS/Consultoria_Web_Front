import React, { useState } from "react";
import Swal from 'sweetalert2';
import useReveal from "../../hooks/useReveal";
import { enviarCorreoConDatos } from "../../api/api.js";
import styles from '../../styles/landing/PracticasSection.module.css';

const DESTINO_PRACTICAS = 'consultoriacomercializacionjas@gmail.com';

const INSTITUTIONS = [
  { mark: 'U', color: '#1B6B3A', name: 'UTEZ', sub: 'Univ. Tecnológica Emiliano Zapata' },
  { mark: 'U', color: '#7A1F2B', name: 'UPEMOR', sub: 'Univ. Politécnica del Estado de Morelos' },
  { mark: 'U', color: '#2D6CDF', name: 'UAEM', sub: 'Univ. Autónoma del Estado de Morelos' },
  { mark: 'T', color: '#C68714', name: 'TecNM', sub: 'Tecnológico Nacional de México' },
];

function PersonIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="7" r="4" /><path d="M3 21v-1a7 7 0 0 1 14 0v1" /></svg>;
}
function WhatsIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 17 0z" /></svg>;
}
function SchoolIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>;
}
function MailIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 6l-10 7L2 6" /></svg>;
}
function PhoneIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg>;
}

export default function PracticasSection() {
  const [headerRef, headerIn] = useReveal();
  const [instRef, instIn] = useReveal();
  const [formRef, formIn] = useReveal();
  const [submitted, setSubmitted] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [nombre, setNombre] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [institucion, setInstitucion] = useState('');
  const [correoInstitucion, setCorreoInstitucion] = useState('');
  const [telefonoInstitucion, setTelefonoInstitucion] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    const asunto = `Nueva solicitud de prácticas profesionales — ${nombre}`;
    const mensaje = `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
        <h2 style="color: #2fbad6;">Nueva solicitud de prácticas profesionales</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 4px; font-weight: bold;">Nombre completo:</td><td style="padding: 4px;">${nombre}</td></tr>
          <tr><td style="padding: 4px; font-weight: bold;">WhatsApp:</td><td style="padding: 4px;">${whatsapp}</td></tr>
          <tr><td style="padding: 4px; font-weight: bold;">Institución educativa:</td><td style="padding: 4px;">${institucion}</td></tr>
          <tr><td style="padding: 4px; font-weight: bold;">Correo de la institución:</td><td style="padding: 4px;">${correoInstitucion}</td></tr>
          <tr><td style="padding: 4px; font-weight: bold;">Teléfono de la institución:</td><td style="padding: 4px;">${telefonoInstitucion}</td></tr>
        </table>
        <p style="font-size: 12px; color: #777; margin-top: 20px;">Solicitud generada desde el formulario de prácticas profesionales de la landing.</p>
      </div>`;

    try {
      await enviarCorreoConDatos(DESTINO_PRACTICAS, asunto, mensaje);
      setSubmitted(true);
    } catch (error) {
      console.error('Error al enviar solicitud de prácticas:', error);
      Swal.fire({
        icon: 'error',
        title: 'No se pudo enviar tu solicitud',
        text: 'Ocurrió un error al enviar tu solicitud. Intenta de nuevo o contáctanos por WhatsApp.',
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section className={styles.practicas} id="practicas">
      <div className="jas-container">
        <div ref={headerRef} className={`${styles.pracHeader} jas-reveal ${headerIn ? 'jas-in' : ''}`}>
          <div className="jas-label jas-label-tag" style={{ justifyContent: 'center', display: 'inline-flex', color: 'var(--accent)' }}>
            Prácticas profesionales
          </div>
          <h2 className="jas-display jas-light">
            ¿Quieres hacer tus<br />prácticas <em>con nosotros?</em>
          </h2>
          <p>Únete al equipo de Consultoría JAS y desarrolla tu experiencia profesional en el mundo migratorio.</p>
        </div>

        <div ref={instRef} className={`${styles.pracInstitutions} jas-reveal ${instIn ? 'jas-in' : ''}`}>
          <div className={styles.pracInstLabel}>— Instituciones que confían en nosotros</div>
          <div className={styles.pracLogos}>
            {INSTITUTIONS.map((inst) => (
              <div key={inst.name} className={styles.pracLogo}>
                <div className={styles.pracLogoMark} style={{ background: inst.color, color: '#fff' }}>{inst.mark}</div>
                <div>
                  <div className={styles.pracLogoName}>{inst.name}</div>
                  <div className={styles.pracLogoSub}>{inst.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div ref={formRef} className={`${styles.pracFormWrap} jas-reveal jas-delay-1 ${formIn ? 'jas-in' : ''}`}>
          {!submitted && (
            <form className={styles.pracForm} onSubmit={handleSubmit}>
              <div className={styles.pracFormHead}>
                <div className={styles.pracFormIcon}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
                </div>
                <div>
                  <div className={styles.pracFormTitle}>Solicitud de prácticas</div>
                  <div className={styles.pracFormSub}>Completa tus datos y los de tu institución</div>
                </div>
              </div>

              <div className={styles.pracGrid}>
                <div className={styles.pracField}>
                  <label className={styles.pracFlabel}>Nombre completo</label>
                  <div className={styles.pracInputWrap}>
                    <span className={styles.pracInputIcon}><PersonIcon /></span>
                    <input className={styles.pracInput} type="text" placeholder="Tu nombre completo" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                  </div>
                </div>
                <div className={styles.pracField}>
                  <label className={styles.pracFlabel}>WhatsApp</label>
                  <div className={styles.pracInputWrap}>
                    <span className={styles.pracInputIcon}><WhatsIcon /></span>
                    <input className={styles.pracInput} type="tel" placeholder="777 123 4567" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} required />
                  </div>
                </div>

                <div className={styles.pracDivider}>— Datos de la institución</div>

                <div className={`${styles.pracField} ${styles.full}`}>
                  <label className={styles.pracFlabel}>Nombre de la institución educativa</label>
                  <div className={styles.pracInputWrap}>
                    <span className={styles.pracInputIcon}><SchoolIcon /></span>
                    <input className={styles.pracInput} type="text" placeholder="Universidad / Instituto" value={institucion} onChange={(e) => setInstitucion(e.target.value)} required />
                  </div>
                </div>
                <div className={styles.pracField}>
                  <label className={styles.pracFlabel}>Correo de la institución</label>
                  <div className={styles.pracInputWrap}>
                    <span className={styles.pracInputIcon}><MailIcon /></span>
                    <input className={styles.pracInput} type="email" placeholder="vinculacion@institucion.edu.mx" value={correoInstitucion} onChange={(e) => setCorreoInstitucion(e.target.value)} required />
                  </div>
                </div>
                <div className={styles.pracField}>
                  <label className={styles.pracFlabel}>Teléfono de la institución</label>
                  <div className={styles.pracInputWrap}>
                    <span className={styles.pracInputIcon}><PhoneIcon /></span>
                    <input className={styles.pracInput} type="tel" placeholder="777 100 0000" value={telefonoInstitucion} onChange={(e) => setTelefonoInstitucion(e.target.value)} required />
                  </div>
                </div>
              </div>

              <button type="submit" className={styles.pracSubmit} disabled={enviando}>
                {enviando ? 'Enviando...' : 'Enviar solicitud'}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
              <p className={styles.pracNote}>
                Tus datos serán tratados conforme a nuestro <a href="#">Aviso de Privacidad</a>.
              </p>
            </form>
          )}

          {submitted && (
            <div className={`${styles.pracSuccess} ${styles.show}`}>
              <div className={styles.pracSuccessIcon}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
              </div>
              <div className={styles.pracSuccessTitle}>¡Tu solicitud fue enviada!</div>
              <p className={styles.pracSuccessSub}>Nos pondremos en contacto contigo pronto para coordinar tu proceso de prácticas profesionales.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

import React, { useState } from "react";
import Swal from 'sweetalert2';
import useReveal from "../../hooks/useReveal";
import { enviarCorreoConDatos, crearAsesoria } from "../../api/api.js";
import styles from '../../styles/landing/AgendaSection.module.css';

const DESTINO_AGENDA = 'direcciongeneral@consultoriajas.com';

function ArrowIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M7 17L17 7M7 7h10v10" />
    </svg>
  );
}

export default function AgendaSection() {
  const [cardRef, cardIn] = useReveal();
  const [type, setType] = useState('zoom');
  const [hora, setHora] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [fecha, setFecha] = useState('');
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre || !apellido || !telefono || !fecha || !hora) {
      Swal.fire({
        icon: 'warning',
        title: 'Faltan datos',
        text: 'Completa nombre, apellido, WhatsApp, fecha y hora para agendar tu cita.',
      });
      return;
    }
    setEnviando(true);
    const tipoLabel = type === 'zoom' ? 'Zoom' : 'Presencial';
    const asunto = `Nueva solicitud de asesoría gratuita — ${nombre} ${apellido}`;
    const mensaje = `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
        <h2 style="color: #2fbad6;">Nueva solicitud de asesoría gratuita</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 4px; font-weight: bold;">Nombre:</td><td style="padding: 4px;">${nombre} ${apellido}</td></tr>
          <tr><td style="padding: 4px; font-weight: bold;">WhatsApp / Teléfono:</td><td style="padding: 4px;">${telefono}</td></tr>
          <tr><td style="padding: 4px; font-weight: bold;">Fecha solicitada:</td><td style="padding: 4px;">${fecha}</td></tr>
          <tr><td style="padding: 4px; font-weight: bold;">Hora solicitada:</td><td style="padding: 4px;">${hora}</td></tr>
          <tr><td style="padding: 4px; font-weight: bold;">Tipo de atención:</td><td style="padding: 4px;">${tipoLabel}</td></tr>
        </table>
        <p style="font-size: 12px; color: #777; margin-top: 20px;">Solicitud generada desde el formulario de agenda de la landing.</p>
      </div>`;

    try {
      await enviarCorreoConDatos(DESTINO_AGENDA, asunto, mensaje);
      // Best-effort: si esto falla, no bloquea la solicitud — el correo de
      // arriba ya le avisó al equipo. Registra la solicitud para que
      // aparezca como notificación real y en el calendario de Empresa/Admin.
      crearAsesoria({ nombre, apellido, telefono, tipoAtencion: tipoLabel, fecha, hora })
        .catch((error) => console.error('Error al registrar la asesoría:', error));
      Swal.fire({
        icon: 'success',
        title: '¡Solicitud enviada!',
        text: 'Nos pondremos en contacto contigo pronto para confirmar tu cita.',
      });
      setNombre('');
      setApellido('');
      setTelefono('');
      setFecha('');
      setHora('');
      setType('zoom');
    } catch (error) {
      console.error('Error al enviar solicitud de agenda:', error);
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
    <section className={styles.agenda} id="agenda">
      <div className="jas-container">
        <div ref={cardRef} className={`${styles.agendaCard} jas-reveal ${cardIn ? 'jas-in' : ''}`}>
          <div className={styles.agendaAside}>
            <div className={styles.agendaEyebrow}>— Atención al cliente</div>
            <div className={styles.agendaTitle}>Agenda una <em>asesoría</em> gratuita</div>
            <div className={styles.agendaSub}>Habla con un consultor migratorio sin necesidad de crear cuenta. Resolvemos tus dudas sobre visas, pasaportes y más.</div>
            <div className={styles.agendaNote}>
              <ul>
                <li>Horario de atención: 9:00 AM – 6:00 PM</li>
                <li>Cada cita dura aproximadamente 1 hora</li>
                <li>Citas después de las 21:00 tienen un costo extra de $99 MXN</li>
              </ul>
            </div>
          </div>

          <form className={styles.agendaForm} onSubmit={handleSubmit}>
            <div className={styles.agGrid2}>
              <div className={styles.agField}>
                <label className={styles.agLabel}>Nombre <span className={styles.req}>*</span></label>
                <div className={styles.agInpWrap}><input className={styles.agInp} style={{ paddingLeft: '13px' }} placeholder="Tu nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required /></div>
              </div>
              <div className={styles.agField}>
                <label className={styles.agLabel}>Apellido <span className={styles.req}>*</span></label>
                <div className={styles.agInpWrap}><input className={styles.agInp} style={{ paddingLeft: '13px' }} placeholder="Tu apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} required /></div>
              </div>
            </div>

            <div className={styles.agField}>
              <label className={styles.agLabel}>WhatsApp / Teléfono <span className={styles.req}>*</span></label>
              <div className={styles.agInpWrap}>
                <span className={styles.agInpIcon}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 17 0z" /></svg>
                </span>
                <input className={styles.agInp} placeholder="777 123 4567" value={telefono} onChange={(e) => setTelefono(e.target.value)} required />
              </div>
            </div>

            <div className={styles.agGrid2}>
              <div className={styles.agField}>
                <label className={styles.agLabel}>Fecha <span className={styles.req}>*</span></label>
                <div className={styles.agInpWrap}>
                  <input className={`${styles.agInp} ${styles.agInpNoLeadIcon}`} type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
                </div>
              </div>
              <div className={styles.agField}>
                <label className={styles.agLabel}>Hora <span className={styles.req}>*</span></label>
                <div className={styles.agInpWrap}>
                  <span className={styles.agInpIcon}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                  </span>
                  <input
                    className={`${styles.agInp} ${!hora ? styles.agInpTimeEmpty : ''}`}
                    type="time"
                    value={hora}
                    onChange={(e) => setHora(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className={styles.agField}>
              <label className={styles.agLabel}>Tipo de atención <span className={styles.req}>*</span></label>
              <div className={styles.agTypes}>
                <div
                  className={`${styles.agType} ${type === 'zoom' ? styles.sel : ''}`}
                  onClick={() => setType('zoom')}
                >
                  <div className={styles.agTypeIcon}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 10l4.55-2.27A1 1 0 0 1 21 8.6v6.8a1 1 0 0 1-1.45.87L15 14M3 6h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" /></svg>
                  </div>
                  <div className={styles.agTypeName}>Zoom</div>
                </div>
                <div
                  className={`${styles.agType} ${type === 'presencial' ? styles.sel : ''}`}
                  onClick={() => setType('presencial')}
                >
                  <div className={styles.agTypeIcon}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                  </div>
                  <div className={styles.agTypeName}>Presencial</div>
                </div>
              </div>
            </div>

            <button type="submit" className={`jas-btn jas-btn-primary ${styles.agSubmit}`} disabled={enviando}>
              {enviando ? 'Enviando...' : 'Agendar cita'}
              <div className="jas-arrow-rev"><ArrowIcon /></div>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

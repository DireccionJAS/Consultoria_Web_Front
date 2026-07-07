import React, { useState } from "react";
import useReveal from "../../hooks/useReveal";
import styles from '../../styles/landing/AgendaSection.module.css';

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

          <div className={styles.agendaForm}>
            <div className={styles.agGrid2}>
              <div className={styles.agField}>
                <label className={styles.agLabel}>Nombre <span className={styles.req}>*</span></label>
                <div className={styles.agInpWrap}><input className={styles.agInp} style={{ paddingLeft: '13px' }} placeholder="Tu nombre" /></div>
              </div>
              <div className={styles.agField}>
                <label className={styles.agLabel}>Apellido <span className={styles.req}>*</span></label>
                <div className={styles.agInpWrap}><input className={styles.agInp} style={{ paddingLeft: '13px' }} placeholder="Tu apellido" /></div>
              </div>
            </div>

            <div className={styles.agField}>
              <label className={styles.agLabel}>WhatsApp / Teléfono <span className={styles.req}>*</span></label>
              <div className={styles.agInpWrap}>
                <span className={styles.agInpIcon}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 17 0z" /></svg>
                </span>
                <input className={styles.agInp} placeholder="777 123 4567" />
              </div>
            </div>

            <div className={styles.agGrid2}>
              <div className={styles.agField}>
                <label className={styles.agLabel}>Fecha <span className={styles.req}>*</span></label>
                <div className={styles.agInpWrap}>
                  <span className={styles.agInpIcon}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
                  </span>
                  <input className={styles.agInp} type="date" />
                </div>
              </div>
              <div className={styles.agField}>
                <label className={styles.agLabel}>Hora <span className={styles.req}>*</span></label>
                <div className={styles.agInpWrap}>
                  <span className={styles.agInpIcon}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                  </span>
                  <input className={styles.agInp} type="time" />
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

            <a href="#" className={`jas-btn jas-btn-primary ${styles.agSubmit}`}>
              Agendar cita
              <div className="jas-arrow-rev"><ArrowIcon /></div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

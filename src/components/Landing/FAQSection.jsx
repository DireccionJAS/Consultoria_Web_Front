import React from "react";
import useReveal from "../../hooks/useReveal";
import styles from '../../styles/landing/FAQSection.module.css';

const FAQ_DATA = [
  {
    question: "¿Cuánto tarda el proceso completo de visa americana?",
    answer: "En 2026, el promedio en CDMX es de 8–14 semanas entre el llenado del DS-160 y la entrevista consular. Con JAS conseguimos la primera cita disponible y reducimos el tiempo de espera al mínimo."
  },
  {
    question: "¿Qué documentos necesito para mi visa?",
    answer: "Pasaporte vigente con 6 meses, comprobante de domicilio, comprobante de ingresos, foto digital 5×5 cm con fondo blanco y, si aplica, documentos de arraigo familiar y laboral. Te enviamos una lista personalizada."
  },
  {
    question: "¿Tienen garantía de aprobación?",
    answer: "La decisión consular es soberana, así que ninguna consultoría seria puede garantizar al 100%. Lo que sí garantizamos es preparar tu caso con la máxima rigurosidad — nuestra tasa de aprobación es del 96%."
  },
  {
    question: "¿Qué pasa si mi visa es rechazada?",
    answer: "Analizamos las razones del rechazo y te asesoramos en la reapertura del caso sin costo adicional. Nuestro objetivo es que viajes — no cobrarte de nuevo."
  },
  {
    question: "¿Aceptan meses sin intereses?",
    answer: "Sí. Aceptamos efectivo, transferencia, débito y crédito. Para algunos servicios ofrecemos hasta 3 meses sin intereses con tarjetas participantes."
  },
  {
    question: "¿Atienden trámites urgentes?",
    answer: "Sí, tenemos un proceso expedito para emergencias médicas, familiares o de trabajo. Llámanos al 777 983 5782 y un consultor evalúa tu caso el mismo día."
  },
];

export default function FAQSection({ faqActiveIndex, handleFaqToggle }) {
  const [introRef, introIn] = useReveal();
  const [listRef, listIn] = useReveal();

  return (
    <section className={styles.faq} id="faq">
      <div className="jas-container">
        <div className={styles.faqGrid}>
          <div ref={introRef} className={`${styles.faqIntro} jas-reveal ${introIn ? 'jas-in' : ''}`}>
            <div className="jas-label jas-label-tag">Preguntas frecuentes</div>
            <h2 className="jas-display">
              Lo que la gente<br />siempre <em>pregunta.</em>
            </h2>
            <p>
              Respuestas claras a las dudas más comunes. ¿No encuentras la tuya?
              Escríbenos por WhatsApp — te respondemos en menos de 30 minutos.
            </p>
            <div className={styles.faqHelp}>
              <div className="jas-label" style={{ color: 'var(--accent)' }}>— Atención en línea</div>
              <h4>¿Aún tienes dudas?</h4>
              <a href="https://wa.me/527772193613" className="jas-btn jas-btn-accent jas-btn-sm" style={{ position: 'relative', zIndex: 1 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 17 0z" /></svg>
                WhatsApp directo
              </a>
            </div>
          </div>

          <ul ref={listRef} className={`${styles.faqList} jas-reveal jas-delay-1 ${listIn ? 'jas-in' : ''}`}>
            {FAQ_DATA.map((item, index) => {
              const isOpen = faqActiveIndex === index;
              return (
                <li
                  key={index}
                  className={`${styles.faqItem} ${isOpen ? styles.open : ''}`}
                  onClick={() => handleFaqToggle(index)}
                >
                  <div className={styles.faqQ}>
                    <span>{item.question}</span>
                    <div className={styles.faqToggle}>+</div>
                  </div>
                  <div className={styles.faqA}>
                    <p>{item.answer}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

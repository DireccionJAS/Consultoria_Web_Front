import React, { useEffect, useState } from "react";
import useReveal from "../../hooks/useReveal";
import { getPaginaPublicaConfig } from "../../api/api.js";
import styles from '../../styles/landing/FAQSection.module.css';

export default function FAQSection({ faqActiveIndex, handleFaqToggle }) {
  const [introRef, introIn] = useReveal();
  const [listRef, listIn] = useReveal();

  const [faqData, setFaqData] = useState([]);
  useEffect(() => {
    let activo = true;
    getPaginaPublicaConfig()
      .then((response) => {
        if (!activo || !response.success) return;
        const faqs = response.response?.config?.faqs;
        if (Array.isArray(faqs) && faqs.length > 0) setFaqData(faqs);
      })
      .catch((error) => console.error('Error al obtener configuración de página pública:', error));
    return () => { activo = false; };
  }, []);

  return (
    <section className={styles.faq} id="faq" style={faqData.length === 0 ? { display: 'none' } : undefined}>
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
            {faqData.map((item, index) => {
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

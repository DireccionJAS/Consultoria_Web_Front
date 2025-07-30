import React from "react";
import { HelpCircle } from "lucide-react";
import { Icon } from '@iconify/react';
import styles from '../../styles/landing/FAQSection.module.css';

export default function FAQSection({ faqActiveIndex, handleFaqToggle }) {
  const faqData = [
    {
      question: "¿Cuánto tiempo tarda el proceso de visa Americana y eTA Canadience?",
      answer: "El tiempo de procesamiento varía según el tipo de servicio solicitado, puede oscilar entre 2 y 6 meses, dependiendo de lo acordado en el contrato, en cuestión de la eTA, el proceso suele tomar entre 30 minutos y 72 horas. Cabe destacar que en CONSULTORÍA JAS siempre trabajamos para minimizar los tiempos de espera y agilizar cada trámite, buscando la mayor eficiencia posible para nuestros clientes."
    },
    {
      question: "¿Qué documentos necesito para solicitar una visa?",
      answer: "Los documentos requeridos varían según el tipo de visa y el país de destino. Por lo general, incluyen pasaporte vigente, fotografías, formularios completados, comprobantes financieros, carta de invitación (cuando sea necesario) y otros documentos específicos relacionados con el propósito del viaje. Nosotros te proporcionaremos una lista detallada y personalizada para que tengas toda la información clara y completa."
    },
    {
      question: "¿Ofrecen garantía de aprobación?",
      answer: "Aunque contamos con una alta tasa de éxito, no podemos garantizar la aprobación al 100%, ya que la decisión final recae en las autoridades consulares. No obstante, nos comprometemos a preparar tu solicitud con el máximo cuidado y profesionalismo, acompañándote en cada etapa del proceso para brindarte el mejor apoyo posible."
    },
    {
      question: "¿Cuáles son sus tarifas y métodos de pago?",
      answer: "Nuestras tarifas varían según el tipo de servicio, la complejidad del caso y la urgencia del trámite requerida por el solicitante. Ofrecemos precios competitivos, transparentes y con todos los costos incluidos, IVA incluido. Aceptamos pagos en efectivo, transferencias bancarias y tarjetas de crédito, además de ofrecer la opción de pago a meses sin intereses para mayor comodidad. Solicita una cotización gratuita y personalizada para conocer el costo específico de tu trámite."
    },
    {
      question: "¿Qué pasa si mi visa es rechazada?",
      answer: "En caso de que tu solicitud sea negada, puedes contactarnos para analizar tu caso a detalle y orientarte sobre las mejores alternativas para una segunda aplicación. En esta ocasión, solo deberás cubrir las cuotas arancelarias, y el pago de nuestros honorarios estará sujeto a la aprobación de tu documento. Nuestro equipo especializado en casos de rechazo estará contigo para brindarte todo el apoyo necesario y así aumentar las posibilidades de éxito en futuros intentos."
    },
    {
      question: "¿Atienden casos de emergencia o urgentes?",
      answer: "Sí, ofrecemos servicios de procesamiento urgente, incluso las 24 horas del día, los 7 días de la semana, siempre que sea posible. Evaluamos cada caso de manera personalizada y te informamos sobre las opciones de servicio rápido disponibles. Es importante considerar que estos trámites exprés pueden implicar costos adicionales, que en algunos casos pueden llegar hasta el doble del costo normal."
    }
  ];

  return (
    <section id="faq" className={styles.testimoniosSection}>
      <div className={styles.faqContainer}>
        <div className={styles.faqHeader}>
          <div className={styles.sectionIcon}>
            <HelpCircle size={40} color="#3B82F6" />
          </div>
          <h2 className={styles.testimoniosTitle}>Preguntas Frecuentes</h2>
          <p className={styles.testimoniosDescription}>
            Resolvemos tus dudas más comunes sobre nuestros servicios y procesos,
            para que tengas toda la información que necesitas.
          </p>
        </div>

        <div className={styles.faqList}>
          {faqData.map((faq, index) => (
            <div key={index} className={`${styles.faqItem} ${styles.fadeInUp}`}>
              <button
                className={`${styles.faqQuestion} ${faqActiveIndex === index ? 'active' : ''}`}
                onClick={() => handleFaqToggle(index)}
              >
                <span>{faq.question}</span>
                <Icon
                  icon="mdi:chevron-down"
                  className={`${styles.faqIcon} ${faqActiveIndex === index ? styles.active : ''}`}
                />
              </button>
              <div className={`${styles.faqAnswer} ${faqActiveIndex === index ? styles.active : ''}`}>
                <div className={styles.faqAnswerContent}>
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

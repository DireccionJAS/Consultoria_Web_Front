import React from "react";
import useReveal from "../../hooks/useReveal";
import styles from '../../styles/landing/ServicesSection.module.css';

function DocIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="6" y="4" width="20" height="28" rx="2" />
      <circle cx="16" cy="14" r="3.5" />
      <path d="M10 22h12M10 26h8" />
    </svg>
  );
}

function StepsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 6h13M8 12h13M8 18h13" />
      <circle cx="3.5" cy="6" r="1.2" />
      <circle cx="3.5" cy="12" r="1.2" />
      <circle cx="3.5" cy="18" r="1.2" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function CtaArrow({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function formatCost(cost) {
  if (cost === null || cost === undefined) return null;
  return new Intl.NumberFormat('es-MX').format(cost);
}

function cleanDescription(text) {
  if (!text) return text;
  return text.replace(/•/g, '').replace(/\s{2,}/g, ' ').trim();
}

export default function ServicesSection({ services, handleOpenDetailsModal, handleOpenStepsModal, singint }) {
  const [headerRef, headerIn] = useReveal();
  const [bentoRef, bentoIn] = useReveal();

  return (
    <section className={styles.services} id="servicios">
      <div className="jas-container">
        <div ref={headerRef} className={`${styles.servicesHeader} jas-reveal ${headerIn ? 'jas-in' : ''}`}>
          <h2 className="jas-display jas-light">
            Cada trámite,<br />
            su <em>propio camino.</em>
          </h2>
          <p>
            Diseñamos un proceso a la medida para cada cliente.
            Tu primera visa, una renovación o una autorización
            electrónica — te acompañamos paso a paso.
          </p>
        </div>

        <div ref={bentoRef} className={`${styles.bento} jas-reveal ${bentoIn ? 'jas-in' : ''}`}>
          {services.map((service, index) => {
            const isFeatured = index === 0;
            const price = formatCost(service.cost);
            return (
              <div
                key={service.idTransact}
                className={`${styles.bentoCard} ${isFeatured ? styles.featured : ''}`}
              >
                {isFeatured && <div className={styles.bentoImg}></div>}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isFeatured ? 'start' : undefined }}>
                  <div className={styles.bentoIcon}>
                    <DocIcon size={isFeatured ? 28 : 24} />
                  </div>
                  <span className={styles.bentoNum}>
                    {String(index + 1).padStart(2, '0')}{isFeatured ? ' / FLAGSHIP' : ''}
                  </span>
                </div>
                <div>
                  <h3>{service.name}</h3>
                  <p className={styles.bentoDesc}>{cleanDescription(service.description)}</p>
                </div>
                <div className={styles.bentoFoot}>
                  <div>
                    <div className={styles.bentoLinks}>
                      <a onClick={() => handleOpenStepsModal(service.idTransact)}>
                        <StepsIcon /> Ver pasos
                      </a>
                      <a onClick={() => handleOpenDetailsModal(service)}>
                        Ver más <MoreIcon />
                      </a>
                    </div>
                    {price && (
                      <div className={styles.bentoPrice}>
                        <span className={styles.bentoPriceLabel}>Desde</span>
                        <div className={styles.bentoPriceAmount}>${price}<small>MXN</small></div>
                      </div>
                    )}
                  </div>
                  <a className={styles.bentoCta} onClick={() => singint(service)}>
                    {isFeatured ? 'Contratar ahora' : 'Contratar'}
                    <CtaArrow size={isFeatured ? 14 : 12} />
                  </a>
                </div>
              </div>
            );
          })}

          <div className={`${styles.bentoCard} ${styles.bentoCtaCard}`}>
            <span className={styles.bentoNum} style={{ color: 'var(--c3)' }}>
              {String(services.length + 1).padStart(2, '0')} / CUSTOM
            </span>
            <div>
              <h3>¿Necesitas algo<br />diferente?</h3>
              <p className={styles.bentoDesc}>
                Atendemos casos urgentes, emergencias migratorias y procesos especiales. Habla con un consultor.
              </p>
            </div>
            <div className={styles.bentoFoot}>
              <div></div>
              <a href="tel:7773956677" className={styles.bentoCta}>
                Habla con asesor
                <CtaArrow />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

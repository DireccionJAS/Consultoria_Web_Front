import React from "react";
import useReveal from "../../hooks/useReveal";
import styles from '../../styles/landing/ServicesSection.module.css';
import { getServiceIcon } from '../../utils/serviceIcons.js';

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

// La portada solo muestra 4 servicios; el resto vive en /Servicios.
const MAX_VISIBLES = 4;

export default function ServicesSection({ services, handleOpenDetailsModal, handleOpenStepsModal, singint, highlightServiceId, destinoVisibleId, whatsapp }) {
  const [headerRef, headerIn] = useReveal();
  const [bentoRef, bentoIn] = useReveal();

  // Los botones de destino del Hero llevan a un servicio específico; si ese
  // servicio no está entre los 4 visibles, toma el lugar de la última
  // tarjeta para que el scroll tenga a dónde llegar (y se queda ahí aunque
  // el resaltado de 2.5 s ya se haya quitado).
  let visibles = services.slice(0, MAX_VISIBLES);
  if (destinoVisibleId != null && !visibles.some((s) => s.idTransact === destinoVisibleId)) {
    const destacado = services.find((s) => s.idTransact === destinoVisibleId);
    if (destacado) visibles = [...visibles.slice(0, MAX_VISIBLES - 1), destacado];
  }

  const whatsappHref = `https://wa.me/52${String(whatsapp || '777 219 3613').replace(/\D/g, '')}`;

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
          <div className={styles.bentoSide}>
            <div className={styles.bentoCtaCard}>
              <div className={styles.bentoImg}></div>
              <span className={styles.bentoCtaNum}>
                {String(services.length + 1).padStart(2, '0')} / {services.length} servicios más...
              </span>
              <h3>Ver mas<br />Servicios</h3>
              <p className={styles.bentoCtaDesc}>
                Más de {services.length} servicios migratorios diseñados para cubrir cada etapa de tu trámite.
              </p>
              <a href="/Servicios" className={styles.bentoCtaMore}>
                Ver más servicios
                <CtaArrow size={14} />
              </a>
            </div>
            <a className={styles.googleBar} href={whatsappHref} target="_blank" rel="noopener noreferrer">
              <span className={styles.googleBarIcon}>!</span>
              ¿No tienes cuenta de Google? Contáctanos
            </a>
          </div>

          {visibles.map((service, index) => {
            const price = formatCost(service.cost);
            const icon = getServiceIcon(service);
            return (
              <div
                key={service.idTransact}
                id={`servicio-${service.idTransact}`}
                className={`${styles.bentoCard} ${service.idTransact === highlightServiceId ? styles.highlighted : ''}`}
              >
                <div className={styles.bentoTop}>
                  <div className={styles.bentoIcon}>
                    {icon ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: icon.svg }} />
                    ) : (
                      <DocIcon size={20} />
                    )}
                  </div>
                  <span className={styles.bentoNum}>{String(index + 1).padStart(2, '0')}</span>
                </div>
                <h3>{service.name}</h3>
                <p className={styles.bentoDesc}>{cleanDescription(service.description)}</p>
                <div className={styles.bentoFoot}>
                  <div>
                    <div className={styles.bentoLinks}>
                      <a onClick={() => handleOpenStepsModal(service.idTransact)}>
                        <StepsIcon /> Ver pasos
                      </a>
                      <a onClick={() => handleOpenDetailsModal(service)}>
                        Ver mas <MoreIcon />
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
                    Contratar ahora
                    <CtaArrow />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

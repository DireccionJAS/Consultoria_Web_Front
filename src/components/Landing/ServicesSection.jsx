import React from "react";
import { Container } from "react-bootstrap";
import Slider from 'react-slick';
import { Icon } from '@iconify/react';
import styles from '../../styles/landing/ServicesSection.module.css';

export default function ServicesSection({ 
  services, 
  handleOpenDetailsModal, 
  handleOpenStepsModal, 
  singint 
}) {
  const truncateDescription = (text, max) =>
    text?.length > max ? `${text.slice(0, max)}...` : text || '';

  const PrevArrow = ({ onClick }) => (
    <button
      type="button"
      className={styles.slickArrowPrev}
      onClick={onClick}
      aria-label="Anterior"
      style={{
        background: 'rgba(59, 130, 246, 0.7)',
        border: 'none',
        borderRadius: '50%',
        width: 48,
        height: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(59,130,246,0.15)',
        transition: 'background 0.2s, transform 0.2s',
        position: 'absolute',
        zIndex: 2,
        left: -24,
        top: 'calc(50% - 24px)',
        cursor: 'pointer'
      }}
      onMouseOver={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 1)'}
      onMouseOut={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.7)'}
    >
      <Icon icon="mdi:chevron-left" width="50" height="50" color="#fff" />
    </button>
  );

  const NextArrow = ({ onClick }) => (
    <button
      type="button"
      className={styles.slickArrowNext}
      onClick={onClick}
      aria-label="Siguiente"
      style={{
        background: 'rgba(59, 130, 246, 0.7)',
        border: 'none',
        borderRadius: '50%',
        width: 48,
        height: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(59,130,246,0.15)',
        transition: 'background 0.2s, transform 0.2s',
        position: 'absolute',
        zIndex: 2,
        right: -24,
        top: 'calc(50% - 24px)',
        cursor: 'pointer'
      }}
      onMouseOver={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 1)'}
      onMouseOut={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.7)'}
    >
      <Icon icon="mdi:chevron-right" width="50" height="50" color="#fff" />
    </button>
  );

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 700,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 1 } }
    ],
    appendArrows: '.slider-arrows-container',
  };

  return (
    <section id="servicios" className={styles.seccion}>
      <Container>
        <h1 style={{ 
          fontSize: '3.5rem', 
          fontWeight: 'bold', 
          marginBottom: '60px', 
          color: '#0f172a', 
          textAlign: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Nuestros Servicios
        </h1>
        {services.length > 0 ? (
          <Slider {...sliderSettings}>
            {services.map((service) => (
              <div key={service.idTransact} className={styles.cardContainer}>
                <div className={styles.card}>
                  <img
                    src={service.image}
                    alt={service.name}
                    className={styles.cardImage}
                    onClick={() => handleOpenDetailsModal(service)}
                  />
                  <div className={styles.cardBody}>
                    <h5 className={styles.cardTitle}>{service.name}</h5>
                    <p className={styles.cardDescription}>
                      {truncateDescription(service.description, 100)}
                    </p>
                    <h4 className={styles.cardCost}> {service.cashAdvance} MX$</h4>
                    <div className={styles.cardButtons}>
                      <button
                        className={styles.cardButton}
                        onClick={() => {
                          handleOpenStepsModal(service.idTransact);
                        }}
                      >
                        Ver Pasos
                      </button>
                      <button
                        className={styles.cardButton}
                        onClick={() => {
                          handleOpenDetailsModal(service);
                        }}
                      >
                        Ver más
                      </button>
                      <button
                        className={styles.cardButton}
                        onClick={() => {
                          singint(service);
                        }}
                      >
                        Obtener
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        ) : (
          <p className="text-center" style={{ color: '#64748b', fontSize: '1.2rem' }}>Cargando servicios...</p>
        )}
      </Container>
    </section>
  );
}

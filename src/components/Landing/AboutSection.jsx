import React from "react";
import useReveal from "../../hooks/useReveal";
import Logo from "../../img/landing/logo.png";
import styles from '../../styles/landing/AboutSection.module.css';

export default function AboutSection() {
  const [imgRef, imgIn] = useReveal();
  const [contentRef, contentIn] = useReveal();

  return (
    <section className={styles.about} id="nosotros">
      <div className="jas-container">
        <div className={styles.aboutGrid}>
          <div ref={imgRef} className={`${styles.aboutImgwrap} jas-reveal ${imgIn ? 'jas-in' : ''}`}>
            <div className={styles.aboutImgMain}></div>
            <div className={styles.aboutLogoOverlay}>
              <img src={Logo} alt="Consultoría JAS" />
            </div>
            <div className={styles.aboutStatOverlay}>
              <div className={styles.num}>2011<em>.</em></div>
              <p>Nuestro primer trámite</p>
            </div>
          </div>

          <div ref={contentRef} className={`${styles.aboutContent} jas-reveal jas-delay-1 ${contentIn ? 'jas-in' : ''}`}>
            <div className="jas-label jas-label-tag">Sobre nosotros</div>
            <h2 className="jas-display">
              Más que trámites:<br /><em>certeza y respaldo.</em>
            </h2>
            <p>
              Consultoría JAS nació en Jiutepec con un objetivo claro:
              hacer del proceso migratorio una experiencia transparente,
              profesional y libre de ansiedad. Cada cliente recibe un asesor
              único que acompaña su caso de principio a fin.
            </p>

            <div className={styles.pillars}>
              <div className={styles.pillar}>
                <div className={styles.pillarLabel}>Misión</div>
                <h4>Tu trámite, sin sorpresas.</h4>
                <p>Brindar consultoría honesta y profesional que reduzca la incertidumbre y maximice la probabilidad de éxito.</p>
              </div>
              <div className={styles.pillar}>
                <div className={styles.pillarLabel}>Visión</div>
                <h4>Referencia del centro de México.</h4>
                <p>Ser la consultoría reconocida por su trato humano, su claridad y sus resultados sostenidos.</p>
              </div>
              <div className={styles.valuesStrip}>
                <div className={styles.valueChip}>Honestidad</div>
                <div className={styles.valueChip}>Confianza</div>
                <div className={styles.valueChip}>Equipo</div>
                <div className={styles.valueChip}>Innovación</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

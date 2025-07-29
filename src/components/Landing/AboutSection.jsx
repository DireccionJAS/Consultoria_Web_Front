import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Briefcase, Users, MessageSquare } from "lucide-react";
import { Icon } from '@iconify/react';
import styles from '../../styles/landing/AboutSection.module.css';

export default function AboutSection() {
  return (
    <section id="nosotros" className={styles.nosotrosSection}>
      {/* Efectos de fondo */}
      <div className={styles.backgroundEffect1}></div>
      <div className={styles.backgroundEffect2}></div>

      <Container>
        {/* Header de la sección */}
        <div className={styles.sectionHeader}>
          <Icon icon="teenyicons:users-solid" width="50" height="50" style={{ color: "#f0f0f0" }} />
          <h2 className={styles.sectionTitle}>
            Sobre Nosotros
          </h2>
          <div className={styles.sectionDivider}></div>
        </div>

        {/* Contenido principal */}
        <Row className="align-items-center">
          {/* Columna izquierda - Misión y Visión */}
          <Col lg={6} className="mb-5 mb-lg-0">
            {/* Misión */}
            <div className={`${styles.card} ${styles.cardMision}`}>
              <div className={styles.cardEffect1}></div>

              <div className={styles.cardHeader}>
                <div className={`${styles.cardIconContainer} ${styles.iconMision}`}>
                  <Briefcase size={24} color="#FFFFFF" />
                </div>
                <h3 className={styles.cardTitle}>
                  MISIÓN
                </h3>
              </div>

              <div className={styles.cardContent}>
                <p className={styles.cardText}>
                  "Ser una consultoría líder en servicios migratorios a nivel nacional e internacional, reconocida por la calidad, precisión y ética en cada gestión.
                  Aspiramos a transformar la experiencia del solicitante, facilitando sus trámites con información clara, asesoría profesional y atención personalizada, superando sus expectativas y generando confianza en cada etapa del proceso."                </p>
              </div>
            </div>

            {/* Visión */}
            <div className={`${styles.card} ${styles.cardVision}`}>
              <div className={styles.cardEffect2}></div>

              <div className={styles.cardHeader}>
                <div className={`${styles.cardIconContainer} ${styles.iconVision}`}>
                  <Users size={24} color="#FFFFFF" />
                </div>
                <h3 className={styles.cardTitle}>
                  VISIÓN
                </h3>
              </div>

              <div className={styles.cardContent}>
                <p className={styles.cardText}>
                  "Ser una empresa reconocida por su enfoque genuino en el servicio al cliente, su compromiso constante y su capacidad para ofrecer soluciones profesionales que respondan eficazmente a las necesidades de cada persona."
                </p>
              </div>
            </div>
          </Col>

          {/* Columna derecha - Valores */}
          <Col lg={6}>
            <div className={`${styles.card} ${styles.cardValores}`}>
              <div className={styles.cardEffect3}></div>

              <div className={styles.valoresHeader}>
                <div className={`${styles.cardIconContainer} ${styles.iconValores}`}>
                  <MessageSquare size={24} color="#FFFFFF" />
                </div>
                <h3 className={styles.cardTitle}>
                  VALORES
                </h3>
              </div>

              <div className={styles.valoresContainer}>
                {/* Trabajo en equipo */}
                <div className={styles.valorItem}>
                  <h4 className={`${styles.valorHeader} ${styles.colorTrabajoEquipo}`}>
                    <div className={styles.valorDot}></div>
                    Trabajo en equipo
                  </h4>
                  <p className={styles.valorText}>
                    Se demuestra con el apoyo, respeto, y confianza, compartiendo conocimientos y experiencias.
                  </p>
                </div>

                {/* Orientación al logro */}
                <div className={styles.valorItem}>
                  <h4 className={`${styles.valorHeader} ${styles.colorOrientacionLogro}`}>
                    <div className={styles.valorDot}></div>
                    Orientación al logro
                  </h4>
                  <p className={styles.valorText}>
                    Actuamos alineados con la visión, misión y objetivos de la organización, asumiendo con responsabilidad los resultados obtenidos.
                  </p>
                </div>

                {/* Innovación */}
                <div className={styles.valorItem}>
                  <h4 className={`${styles.valorHeader} ${styles.colorInnovacion}`}>
                    <div className={styles.valorDot}></div>
                    Innovación y creatividad
                  </h4>
                  <p className={styles.valorText}>
                    Impulsamos la generación y desarrollo constante de ideas y soluciones que aporten valor y mejoren nuestros procesos.                  </p>
                </div>

                {/* Honestidad */}
                <div className={styles.valorItem}>
                  <h4 className={`${styles.valorHeader} ${styles.colorHonestidad}`}>
                    <div className={styles.valorDot}></div>
                    Honestidad
                  </h4>
                  <p className={styles.valorText}>
                    Mantenemos una comunicación realista y transparente respecto a las expectativas y objetivos de cada cliente.                  </p>
                </div>

                {/* Confianza */}
                <div className={styles.valorItem}>
                  <h4 className={`${styles.valorHeader} ${styles.colorConfianza}`}>
                    <div className={styles.valorDot}></div>
                    Confianza
                  </h4>
                  <p className={styles.valorText}>
                    Respaldamos nuestro trabajo con experiencia demostrable y un enfoque profesional para abordar y resolver las necesidades de nuestros clientes.                  </p>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
}

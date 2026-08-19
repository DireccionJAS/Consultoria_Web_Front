import React from "react";
import useReveal from "../../hooks/useReveal";
import styles from '../../styles/landing/TestimonialsSection.module.css';

const TESTIMONIOS = [
  { tag: "Visa B1/B2", name: "Mariana S.", sub: "Visa aprobada · Marzo 2026" },
  { tag: "eTA Canadá", name: "Carlos R.", sub: "Aprobado en 48 horas" },
  { tag: "DS-160 × 4", name: "Familia López", sub: "4 visas el mismo día" },
  { tag: "Visa B1/B2 · Renovación", name: "Andrea V.", sub: "10 años de vigencia" },
  { tag: "Pasaporte SRE", name: "Patricia G.", sub: "Renovación sin filas" },
  { tag: "Simulación + Visa", name: "Roberto M.", sub: "Primera visa aprobada" },
  { tag: "eTA Canadá", name: "Lucía R.", sub: "Vacaciones familiares" },
  { tag: "Visa B1/B2", name: "Juan P.", sub: "Viaje de negocios" },
  { tag: "Familia · Múltiple", name: "Familia Ortiz", sub: "3 generaciones viajando" },
];

export default function TestimonialsSection() {
  const [headerRef, headerIn] = useReveal();
  const [gridRef, gridIn] = useReveal();

  return (
    <section className={styles.testimonials} id="testimonios">
      <div className="jas-container">
        <div ref={headerRef} className={`${styles.testimonialsHeader} jas-reveal ${headerIn ? 'jas-in' : ''}`}>
          <h2 className="jas-display jas-light">
            Mira las historias<br />de quienes ya <em>cruzaron.</em>
          </h2>
          <div className={styles.testimonialsMeta}>
            <p>
              Testimonios reales de nuestros clientes.
            </p>
            <div className={styles.testimonialsStats}>
              <div>
                <div className={styles.ts}>9</div>
                <div className={styles.tl}>Testimonios</div>
              </div>
              <div>
                <div className={styles.ts}>4.<em>9</em></div>
                <div className={styles.tl}>Calificación promedio</div>
              </div>
              <div>
                <div className={styles.ts}>100<em>%</em></div>
                <div className={styles.tl}>Reales · sin actores</div>
              </div>
            </div>
          </div>
        </div>

        <div ref={gridRef} className={`${styles.videoGrid} jas-reveal ${gridIn ? 'jas-in' : ''}`}>
          {TESTIMONIOS.map((v) => (
            <div key={v.name} className={styles.videoCard}>
              <div className={styles.vtInfo}>
                <span className={styles.vtTag}>{v.tag}</span>
                <div className={styles.vtName}>{v.name}</div>
                <div className={styles.vtSub}>{v.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

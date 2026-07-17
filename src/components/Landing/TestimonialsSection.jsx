import React, { useState } from "react";
import useReveal from "../../hooks/useReveal";
import t1 from "../../img/landing/testimonial-1.jpg";
import t2 from "../../img/landing/testimonial-2.jpg";
import t3 from "../../img/landing/testimonial-3.jpg";
import t4 from "../../img/landing/testimonial-4.jpg";
import t5 from "../../img/landing/testimonial-5.jpg";
import t6 from "../../img/landing/testimonial-6.jpg";
import t7 from "../../img/landing/testimonial-7.jpg";
import t8 from "../../img/landing/testimonial-8.jpg";
import t9 from "../../img/landing/testimonial-9.jpg";
import styles from '../../styles/landing/TestimonialsSection.module.css';

const TESTIMONIOS = [
  { img: t1, tag: "Visa B1/B2", name: "Mariana S.", sub: "Visa aprobada · Marzo 2026" },
  { img: t2, tag: "eTA Canadá", name: "Carlos R.", sub: "Aprobado en 48 horas" },
  { img: t3, tag: "DS-160 × 4", name: "Familia López", sub: "4 visas el mismo día" },
  { img: t4, tag: "Visa B1/B2 · Renovación", name: "Andrea V.", sub: "10 años de vigencia" },
  { img: t5, tag: "Pasaporte SRE", name: "Patricia G.", sub: "Renovación sin filas" },
  { img: t6, tag: "Simulación + Visa", name: "Roberto M.", sub: "Primera visa aprobada" },
  { img: t7, tag: "eTA Canadá", name: "Lucía R.", sub: "Vacaciones familiares" },
  { img: t8, tag: "Visa B1/B2", name: "Juan P.", sub: "Viaje de negocios" },
  { img: t9, tag: "Familia · Múltiple", name: "Familia Ortiz", sub: "3 generaciones viajando" },
];

function ZoomIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3M9 11h4M11 9v4" /></svg>
  );
}

export default function TestimonialsSection() {
  const [headerRef, headerIn] = useReveal();
  const [gridRef, gridIn] = useReveal();
  const [selected, setSelected] = useState(null);

  return (
    <section className={styles.testimonials} id="testimonios">
      <div className="jas-container">
        <div ref={headerRef} className={`${styles.testimonialsHeader} jas-reveal ${headerIn ? 'jas-in' : ''}`}>
          <h2 className="jas-display jas-light">
            Mira las historias<br />de quienes ya <em>cruzaron.</em>
          </h2>
          <div className={styles.testimonialsMeta}>
            <p>
              Testimonios reales de nuestros clientes. Toca cualquier tarjeta
              para ver la imagen completa.
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
            <div
              key={v.name}
              className={styles.videoCard}
              onClick={() => setSelected(v)}
            >
              <div className={styles.vtImg} style={{ backgroundImage: `url("${v.img}")` }}></div>
              <div className={styles.videoPlay}><ZoomIcon /></div>
              <div className={styles.vtInfo}>
                <span className={styles.vtTag}>{v.tag}</span>
                <div className={styles.vtName}>{v.name}</div>
                <div className={styles.vtSub}>{v.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <div className={styles.testimonialZoomOverlay} onClick={() => setSelected(null)}>
          <div className={styles.testimonialZoomHeader}>
            <span className={styles.testimonialZoomTitle}>{selected.name} — {selected.tag}</span>
            <button
              type="button"
              className={styles.testimonialZoomClose}
              onClick={(e) => { e.stopPropagation(); setSelected(null); }}
              aria-label="Cerrar"
            >
              &times;
            </button>
          </div>
          <img src={selected.img} alt={selected.name} className={styles.testimonialZoomImage} />
        </div>
      )}
    </section>
  );
}

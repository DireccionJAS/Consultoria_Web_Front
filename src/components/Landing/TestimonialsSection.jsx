import React from "react";
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

const VIDEOS = [
  { img: t1, duration: "1:24", tag: "Visa B1/B2", name: "Mariana S.", sub: "Visa aprobada · Marzo 2026" },
  { img: t2, duration: "0:58", tag: "eTA Canadá", name: "Carlos R.", sub: "Aprobado en 48 horas" },
  { img: t3, duration: "2:11", tag: "DS-160 × 4", name: "Familia López", sub: "4 visas el mismo día" },
  { img: t4, duration: "1:42", tag: "Visa B1/B2 · Renovación", name: "Andrea V.", sub: "10 años de vigencia" },
  { img: t5, duration: "1:18", tag: "Pasaporte SRE", name: "Patricia G.", sub: "Renovación sin filas" },
  { img: t6, duration: "2:34", tag: "Simulación + Visa", name: "Roberto M.", sub: "Primera visa aprobada" },
  { img: t7, duration: "0:47", tag: "eTA Canadá", name: "Lucía R.", sub: "Vacaciones familiares" },
  { img: t8, duration: "1:56", tag: "Visa B1/B2", name: "Juan P.", sub: "Viaje de negocios" },
  { img: t9, duration: "1:33", tag: "Familia · Múltiple", name: "Familia Ortiz", sub: "3 generaciones viajando" },
];

function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
  );
}

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
              Testimonios reales de nuestros clientes — videos cargados directamente
              desde nuestra biblioteca. Toca cualquier tarjeta para reproducir.
            </p>
            <div className={styles.testimonialsStats}>
              <div>
                <div className={styles.ts}>9</div>
                <div className={styles.tl}>Videos disponibles</div>
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
          {VIDEOS.map((v) => (
            <div
              key={v.name}
              className={styles.videoCard}
              onClick={() => console.log('Reproducir video:', v.name)}
            >
              <div className={styles.vtImg} style={{ backgroundImage: `url("${v.img}")` }}></div>
              <div className={styles.videoDuration}>{v.duration}</div>
              <div className={styles.videoPlay}><PlayIcon /></div>
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

import React, { useEffect, useRef, useState } from "react";
import useReveal from "../../hooks/useReveal";
import destNyc from "../../img/landing/dest-nyc.jpg";
import destParis from "../../img/landing/dest-paris.jpg";
import destToronto from "../../img/landing/dest-toronto.jpg";
import destLondon from "../../img/landing/dest-london.jpg";
import destRome from "../../img/landing/dest-rome.jpg";
import destTokyo from "../../img/landing/dest-tokyo.jpg";
import styles from '../../styles/landing/HeroSection.module.css';

const DESTINATIONS = [
  { img: destNyc, badge: "Visa Americana", name: "Nueva York", country: "Estados Unidos 🇺🇸" },
  { img: destParis, badge: "Visa Schengen", name: "París", country: "Francia 🇫🇷" },
  { img: destToronto, badge: "eTA Canadá", name: "Toronto", country: "Canadá 🇨🇦" },
  { img: destLondon, badge: "Visa UK", name: "Londres", country: "Reino Unido 🇬🇧" },
  { img: destRome, badge: "Visa Schengen", name: "Roma", country: "Italia 🇮🇹" },
  { img: destTokyo, badge: "Pasaporte", name: "Tokio", country: "Japón 🇯🇵" },
];

function getPerView() {
  if (typeof window === 'undefined') return 3;
  if (window.innerWidth <= 575.98) return 1;
  if (window.innerWidth <= 991.98) return 2;
  return 3;
}

function ArrowIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M7 17L17 7M7 7h10v10" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

export default function HeroSection() {
  const [topRowRef, topRowIn] = useReveal();
  const [headlineRef, headlineIn] = useReveal();
  const [destinosRef, destinosIn] = useReveal();

  const [time, setTime] = useState('— —:— hrs · MX');
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      setTime(`${h}:${m} hrs · MX`);
    };
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, []);

  const trackRef = useRef(null);
  const [idx, setIdx] = useState(0);
  const [step, setStep] = useState(0);
  const [maxIdx, setMaxIdx] = useState(DESTINATIONS.length - getPerView());
  const maxIdxRef = useRef(maxIdx);
  const timerRef = useRef(null);

  const measure = () => {
    const track = trackRef.current;
    if (!track || !track.firstElementChild) return;
    setStep(track.firstElementChild.offsetWidth + 20);
    const nextMaxIdx = DESTINATIONS.length - getPerView();
    maxIdxRef.current = nextMaxIdx;
    setMaxIdx(nextMaxIdx);
    setIdx((i) => Math.min(i, nextMaxIdx));
  };

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setIdx((i) => (i >= maxIdxRef.current ? 0 : i + 1));
    }, 4000);
  };

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, []);

  const move = (dir) => {
    setIdx((i) => Math.min(maxIdxRef.current, Math.max(0, i + dir)));
  };

  return (
    <section className={styles.hero} id="hero">
      <div className={styles.heroBg}></div>
      <div className={styles.heroGrid}></div>

      <div className={`jas-container ${styles.heroContent}`}>
        <div ref={topRowRef} className={`${styles.heroTopRow} jas-reveal ${topRowIn ? 'jas-in' : ''}`}>
          <div className={styles.heroLocator}>
            <div className={styles.heroLocatorPill}>
              <span className={styles.dot}></span>
              Operando en Jiutepec, Morelos
            </div>
            <span className={styles.heroLocatorTime}>{time}</span>
          </div>
          <div className={styles.heroLocatorTime}>
            <span style={{ opacity: 0.7 }}>CSULT/MX</span> · <em style={{ color: 'var(--accent)', fontStyle: 'normal' }}>●</em> 96% APROBACIÓN
          </div>
        </div>

        <div ref={headlineRef} className={`${styles.heroHeadline} jas-reveal ${headlineIn ? 'jas-in' : ''}`}>
          <h1 className={`mega display ${styles.headlineTitle}`}>
            Tu próximo <em>destino</em><br />
            empieza <em className={styles.gradientWord}>aquí.</em>
          </h1>
          <div className={styles.heroSub}>Trámites migratorios con confianza y excelencia.</div>
          <p className={styles.heroDesc}>
            En Consultoría JAS somos especialistas en trámites migratorios.
            Nuestro compromiso es brindarte un servicio de calidad, transparente
            y enfocado en tus necesidades — desde la primera consulta hasta el sello en tu pasaporte.
          </p>
          <div className={styles.heroActions}>
            <a href="#servicios" className="jas-btn jas-btn-light">
              Ver servicios
              <div className="jas-arrow-rev"><ArrowIcon /></div>
            </a>
            <a href="tel:7773956677" className="jas-btn jas-btn-outline-light">
              <PhoneIcon />
              777 395 6677
            </a>
          </div>
        </div>

        <div
          ref={destinosRef}
          className={`${styles.heroDestinos} jas-reveal jas-delay-1 ${destinosIn ? 'jas-in' : ''}`}
          onMouseEnter={() => clearInterval(timerRef.current)}
          onMouseLeave={startTimer}
        >
          <div className={styles.destinosHead}>
            <div>
              <h2 className="jas-display jas-light" style={{ fontSize: 'clamp(30px,3.5vw,48px)' }}>
                ¿A dónde quieres <em>viajar?</em>
              </h2>
              <p className={styles.destinosSub}>Con Consultoría JAS, el mundo está al alcance de tu mano.</p>
            </div>
            <div className={styles.destinosNav}>
              <button className={styles.dnavBtn} onClick={() => move(-1)} aria-label="Anterior">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
              <button className={styles.dnavBtn} onClick={() => move(1)} aria-label="Siguiente">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
              </button>
            </div>
          </div>

          <div className={styles.destinosViewport}>
            <div
              ref={trackRef}
              className={styles.destinosTrack}
              style={{ transform: `translateX(-${idx * step}px)` }}
            >
              {DESTINATIONS.map((d) => (
                <div key={d.name} className={styles.destCard}>
                  <div className={styles.destImg} style={{ backgroundImage: `url("${d.img}")` }}></div>
                  <div className={styles.destBadge}>{d.badge}</div>
                  <div className={styles.destName}>{d.name}</div>
                  <div className={styles.destCountry}>{d.country}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.destinosDots}>
            {Array.from({ length: maxIdx + 1 }).map((_, i) => (
              <div
                key={i}
                className={`${styles.ddot} ${i === idx ? styles.active : ''}`}
                onClick={() => setIdx(i)}
              />
            ))}
          </div>

          <div className={styles.destinosCta}>
            <a href="#servicios" className="jas-btn jas-btn-light">
              Ver servicios
              <div className="jas-arrow-rev"><ArrowIcon /></div>
            </a>
            <a href="tel:7779835782" className="jas-btn jas-btn-outline-light">
              <PhoneIcon />
              777 983 5782
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

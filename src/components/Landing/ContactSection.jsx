import React from "react";
import useReveal from "../../hooks/useReveal";
import styles from '../../styles/landing/ContactSection.module.css';

function ArrowIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M7 17L17 7M7 7h10v10" />
    </svg>
  );
}

const SOCIALS = [
  {
    key: 'fb', href: '#', label: 'Facebook', handle: '@ConsultoriaJAS', stat: '8.4k', statLabel: 'seguidores',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>,
  },
  {
    key: 'ig', href: '#', label: 'Instagram', handle: '@consultoria.jas', stat: '12.6k', statLabel: 'seguidores',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg>,
  },
  {
    key: 'tk', href: '#', label: 'TikTok', handle: '@consultoriajas', stat: '34k', statLabel: 'seguidores',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9a5 5 0 0 1-3-1v6.5a5.5 5.5 0 1 1-5.5-5.5V13a2.5 2.5 0 1 0 2.5 2.5V3h2.5a3 3 0 0 0 3.5 3z" /></svg>,
  },
  {
    key: 'wa', href: 'https://wa.me/527771008412', label: 'WhatsApp', handle: '777 100 8412', stat: '·30m', statLabel: 'de respuesta',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 17 0z" /></svg>,
  },
];

export default function ContactSection() {
  const [headerRef, headerIn] = useReveal();
  const [gridRef, gridIn] = useReveal();
  const [hoursRef, hoursIn] = useReveal();

  return (
    <section className={styles.contact} id="contacto">
      <div className="jas-container">
        <div ref={headerRef} className={`${styles.contactHeader} jas-reveal ${headerIn ? 'jas-in' : ''}`}>
          <div className="jas-label jas-label-tag" style={{ justifyContent: 'center', display: 'inline-flex' }}>Contacto</div>
          <h2 className="jas-display">
            Visítanos en<br />Jiutepec <em>o en línea.</em>
          </h2>
          <p>En persona en nuestra sucursal de Jiutepec, o atiéndete desde donde estés.</p>
        </div>

        <div ref={gridRef} className={`${styles.contactGrid} jas-reveal ${gridIn ? 'jas-in' : ''}`}>
          <div className={styles.location}>
            <div className={styles.locationMap}>
              <div className={styles.mapRoads}>
                <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
                  <path d="M0,120 Q120,80 200,100 T400,90" stroke="rgba(228,236,240,0.15)" strokeWidth="14" fill="none" />
                  <path d="M0,120 Q120,80 200,100 T400,90" stroke="rgba(228,236,240,0.35)" strokeWidth="2" fill="none" strokeDasharray="6 6" />
                  <path d="M150,0 L160,200" stroke="rgba(228,236,240,0.12)" strokeWidth="10" fill="none" />
                  <path d="M250,0 Q230,100 260,200" stroke="rgba(228,236,240,0.08)" strokeWidth="8" fill="none" />
                </svg>
              </div>
              <div className={styles.mapPinMod}></div>
            </div>
            <div className={styles.locationBody}>
              <div className={styles.locationHead}>
                <div>
                  <h3 className={styles.locationCity}>Jiutepec</h3>
                  <div className={styles.openBadge}><span className={styles.dot}></span>Abierto · cierra 18:00</div>
                </div>
                <button className="jas-btn jas-btn-outline jas-btn-sm" style={{ padding: '8px 14px' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l-6 3V6l6-3M9 18l6 3M9 18V3M15 21l6-3V3l-6 3M15 21V6" /></svg>
                  Cómo llegar
                </button>
              </div>
              <p className={styles.locationAddress} style={{ marginTop: '20px' }}>Calle Pablo Torres 18, Centro de Jiutepec, 62550</p>
              <div className={styles.locationContact}>
                <div className={styles.ccc}>
                  <div className={styles.cccIcon}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                  </div>
                  <div>
                    <div className={styles.lab}>Teléfono</div>
                    <div className={styles.val}>777 314 0099</div>
                  </div>
                </div>
                <div className={styles.ccc}>
                  <div className={styles.cccIcon} style={{ background: '#dff5e5', color: '#1F7B3D' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 17 0z" /></svg>
                  </div>
                  <div>
                    <div className={styles.lab}>WhatsApp</div>
                    <div className={styles.val}>777 220 7765</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.socialSpotlight}>
            <div className={styles.socialSpotlightHead}>
              <div className="jas-label jas-label-tag" style={{ color: 'var(--c4)' }}>Síguenos</div>
              <h3 className={styles.socialSpotlightTitle}>Te esperamos<br />en <em>redes sociales.</em></h3>
              <p className={styles.socialSpotlightDesc}>Contenido fresco, tips migratorios y videos de clientes que ya viajaron.</p>
            </div>
            <div className={styles.socialSpotlightGrid}>
              {SOCIALS.map((s) => (
                <a key={s.key} href={s.href} className={`${styles.socialTile} ${styles[s.key]}`} aria-label={s.label}>
                  {s.icon}
                  <div className={styles.socialTileInfo}>
                    <span className={styles.socialTileName}>{s.label}</span>
                    <span className={styles.socialTileHandle}>{s.handle}</span>
                  </div>
                  <div className={styles.socialTileStat}>
                    <span className={styles.socialTileNum}>{s.stat}</span>
                    <span className={styles.socialTileLab}>{s.statLabel}</span>
                  </div>
                  <svg className={styles.socialTileArrow} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 17L17 7M7 7h10v10" /></svg>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div ref={hoursRef} className={`${styles.hoursStrip} jas-reveal ${hoursIn ? 'jas-in' : ''}`}>
          <div>
            <div className={styles.hLab}>Presencial L–V</div>
            <div className={styles.hVal}>9:00 — 18:00</div>
          </div>
          <div>
            <div className={styles.hLab}>Presencial Sáb</div>
            <div className={styles.hVal}>10:00 — 14:00</div>
          </div>
          <div>
            <div className={styles.hLab}>En línea L–S</div>
            <div className={styles.hVal}>8:00 — 21:00</div>
          </div>
          <a href="mailto:contacto@consultoriajas.com" className="jas-btn jas-btn-accent">
            Escríbenos
            <div className="jas-arrow-rev"><ArrowIcon /></div>
          </a>
        </div>
      </div>
    </section>
  );
}

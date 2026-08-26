import React, { useEffect, useState } from "react";
import useReveal from "../../hooks/useReveal";
import { getPaginaPublicaConfig } from "../../api/api.js";
import styles from '../../styles/landing/ContactSection.module.css';

function ArrowIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M7 17L17 7M7 7h10v10" />
    </svg>
  );
}

const SOCIALS_BASE = [
  {
    key: 'fb', href: 'https://www.facebook.com/share/1C2Aw6H7vq/', label: 'Facebook', handle: '@ConsultoriaJAS', statLabel: 'seguidores',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>,
  },
  {
    key: 'ig', href: 'https://www.instagram.com/somosconsultoriajas', label: 'Instagram', handle: '@somosconsultoriajas', statLabel: 'seguidores',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg>,
  },
  {
    key: 'tk', href: 'https://www.tiktok.com/@consultoriajas', label: 'TikTok', handle: '@consultoriajas', statLabel: 'seguidores',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9a5 5 0 0 1-3-1v6.5a5.5 5.5 0 1 1-5.5-5.5V13a2.5 2.5 0 1 0 2.5 2.5V3h2.5a3 3 0 0 0 3.5 3z" /></svg>,
  },
  {
    key: 'wa', label: 'WhatsApp', statLabel: 'de respuesta',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 17 0z" /></svg>,
  },
];

const CONTACT_FALLBACK = {
  tituloLocalidad: 'Visítanos en Jiutepec o en línea',
  ubicaciones: [{ titulo: 'Jiutepec', direccion: 'Calle Pablo Torres 18, Centro de Jiutepec, 62550' }],
  telContacto: '777 983 5782',
  whatsapp: '777 219 3613',
  correo: 'contacto@consultoriajas.com',
  fbSeguidores: '8.4k',
  igSeguidores: '12.6k',
  ttSeguidores: '34k',
  horPresencialLV: '9:00 – 18:00',
  horLineaLV: '8:00 – 21:00',
  horLineaFinde: '9:00 – 14:00',
};

export default function ContactSection() {
  const [headerRef, headerIn] = useReveal();
  const [gridRef, gridIn] = useReveal();
  const [hoursRef, hoursIn] = useReveal();

  const [c, setC] = useState(CONTACT_FALLBACK);
  useEffect(() => {
    let activo = true;
    getPaginaPublicaConfig()
      .then((response) => {
        if (!activo || !response.success) return;
        const config = response.response?.config;
        if (!config) return;
        setC({
          tituloLocalidad: config.tituloLocalidad || CONTACT_FALLBACK.tituloLocalidad,
          ubicaciones: Array.isArray(config.ubicaciones) && config.ubicaciones.length > 0 ? config.ubicaciones : CONTACT_FALLBACK.ubicaciones,
          telContacto: config.telContacto || CONTACT_FALLBACK.telContacto,
          whatsapp: config.whatsapp || CONTACT_FALLBACK.whatsapp,
          correo: config.correo || CONTACT_FALLBACK.correo,
          fbSeguidores: config.fbSeguidores || CONTACT_FALLBACK.fbSeguidores,
          igSeguidores: config.igSeguidores || CONTACT_FALLBACK.igSeguidores,
          ttSeguidores: config.ttSeguidores || CONTACT_FALLBACK.ttSeguidores,
          horPresencialLV: config.horPresencialLV || CONTACT_FALLBACK.horPresencialLV,
          horLineaLV: config.horLineaLV || CONTACT_FALLBACK.horLineaLV,
          horLineaFinde: config.horLineaFinde || CONTACT_FALLBACK.horLineaFinde,
        });
      })
      .catch((error) => console.error('Error al obtener configuración de página pública:', error));
    return () => { activo = false; };
  }, []);

  const socials = SOCIALS_BASE.map((s) => {
    if (s.key === 'wa') return { ...s, href: `https://wa.me/52${c.whatsapp.replace(/\s/g, '')}`, handle: c.whatsapp, stat: '·30m' };
    if (s.key === 'fb') return { ...s, stat: c.fbSeguidores };
    if (s.key === 'ig') return { ...s, stat: c.igSeguidores };
    if (s.key === 'tk') return { ...s, stat: c.ttSeguidores };
    return s;
  });

  return (
    <section className={styles.contact} id="contacto">
      <div className="jas-container">
        <div ref={headerRef} className={`${styles.contactHeader} jas-reveal ${headerIn ? 'jas-in' : ''}`}>
          <div className="jas-label jas-label-tag" style={{ justifyContent: 'center', display: 'inline-flex' }}>Contacto</div>
          <h2 className="jas-display">{c.tituloLocalidad}</h2>
        </div>

        <div ref={gridRef} className={`${styles.contactGrid} jas-reveal ${gridIn ? 'jas-in' : ''}`}>
          {c.ubicaciones.map((u, i) => (
          <div className={styles.location} key={u.titulo + i}>
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
                  <h3 className={styles.locationCity}>{u.titulo}</h3>
                  <div className={styles.openBadge}><span className={styles.dot}></span>Abierto · cierra 18:00</div>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(u.direccion)}`}
                  target="_blank" rel="noreferrer"
                  className="jas-btn jas-btn-outline jas-btn-sm" style={{ padding: '8px 14px' }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l-6 3V6l6-3M9 18l6 3M9 18V3M15 21l6-3V3l-6 3M15 21V6" /></svg>
                  Cómo llegar
                </a>
              </div>
              <p className={styles.locationAddress} style={{ marginTop: '20px' }}>{u.direccion}</p>
              <div className={styles.locationContact}>
                <div className={styles.ccc}>
                  <div className={styles.cccIcon}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                  </div>
                  <div>
                    <div className={styles.lab}>Teléfono</div>
                    <div className={styles.val}>{c.telContacto}</div>
                  </div>
                </div>
                <div className={styles.ccc}>
                  <div className={styles.cccIcon} style={{ background: '#dff5e5', color: '#1F7B3D' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 17 0z" /></svg>
                  </div>
                  <div>
                    <div className={styles.lab}>WhatsApp</div>
                    <div className={styles.val}>{c.whatsapp}</div>
                  </div>
                </div>
                <div className={styles.ccc}>
                  <div className={styles.cccIcon} style={{ background: 'rgba(45,108,223,0.12)', color: '#2D6CDF' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 6l-10 7L2 6" /></svg>
                  </div>
                  <div>
                    <div className={styles.lab}>Correo</div>
                    <div className={styles.val}>{c.correo}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          ))}

          <div className={styles.socialSpotlight}>
            <div className={styles.socialSpotlightHead}>
              <div className="jas-label jas-label-tag" style={{ color: 'var(--c4)' }}>Síguenos</div>
              <h3 className={styles.socialSpotlightTitle}>Te esperamos<br />en <em>redes sociales.</em></h3>
              <p className={styles.socialSpotlightDesc}>Contenido fresco, tips migratorios y videos de clientes que ya viajaron.</p>
            </div>
            <div className={styles.socialSpotlightGrid}>
              {socials.map((s) => (
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
            <div className={styles.hVal}>{c.horPresencialLV}</div>
          </div>
          <div>
            <div className={styles.hLab}>En línea L–V</div>
            <div className={styles.hVal}>{c.horLineaLV}</div>
          </div>
          <div>
            <div className={styles.hLab}>En línea Sáb–Dom</div>
            <div className={styles.hVal}>{c.horLineaFinde}</div>
          </div>
          <a href={`mailto:${c.correo}`} className="jas-btn jas-btn-accent">
            Escríbenos
            <div className="jas-arrow-rev"><ArrowIcon /></div>
          </a>
        </div>
      </div>
    </section>
  );
}

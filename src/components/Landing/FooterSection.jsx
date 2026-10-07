import React, { useEffect, useState } from "react";
import Logo from "../../img/landing/logo.png";
import { getPdfLegalUrl, getPaginaPublicaConfig } from "../../api/api.js";
import { redesDesdeConfig, redesVisibles, tipoRed, IconoRed, urlRed } from "../../utils/redesSociales.jsx";
import styles from '../../styles/landing/FooterSection.module.css';

export default function FooterSection() {
  // Mismas redes que Contacto (Empresa > Página pública); mientras carga o si
  // falla, las 3 de siempre.
  const [redes, setRedes] = useState(() => redesDesdeConfig(null));

  useEffect(() => {
    let activo = true;
    getPaginaPublicaConfig()
      .then((response) => {
        const config = response?.success ? response.response?.config : null;
        if (activo && config) setRedes(redesDesdeConfig(config));
      })
      .catch(() => {});
    return () => { activo = false; };
  }, []);

  return (
    <>
      <footer className={styles.footer}>
        <div className="jas-container">
          <div className={styles.footerGrid}>
            <div className={styles.footerBrand}>
              <a href="#hero" className={styles.navLogo}>
                <img src={Logo} alt="JAS" />
                <span>Consultoría <em style={{ color: 'var(--accent)' }}>JAS</em></span>
              </a>
              <p>
                Consultoría migratoria personalizada en Jiutepec, Morelos.
                Visas, pasaportes, eTA y todo lo que necesitas para tu próximo vuelo.
              </p>
              <div className={styles.footerSocialLabel}>Síguenos</div>
              <div className={styles.footerSocial}>
                {redesVisibles(redes).map((r, i) => (
                  <a key={`${r.tipo}-${i}`} href={urlRed(r.url)} target="_blank" rel="noreferrer" className={styles[tipoRed(r.tipo).clase]} aria-label={r.nombre || tipoRed(r.tipo).label} title={r.nombre || tipoRed(r.tipo).label}><IconoRed tipo={r.tipo} /></a>
                ))}
                <a href="https://wa.me/527772193613" target="_blank" rel="noreferrer" className={styles.wa} aria-label="WhatsApp"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 17 0z" /></svg></a>
              </div>
            </div>

            <div className={styles.footerCol}>
              <div className={styles.footerColTitle}>— Empresa</div>
              <ul>
                <li><a href="#nosotros">Nosotros</a></li>
                <li><a href="#servicios">Servicios</a></li>
                <li><a href="#testimonios">Testimonios</a></li>
                <li><a href="#practicas">Prácticas profesionales</a></li>
                <li><a href="#contacto">Contacto</a></li>
              </ul>
            </div>
            <div className={styles.footerCol}>
              <div className={styles.footerColTitle}>— Recursos</div>
              <ul>
                <li><a href="#" target="_blank" rel="noreferrer">Manual de visado</a></li>
                <li><a href="#" target="_blank" rel="noreferrer">Tasa de aprobación</a></li>
                <li><a href="#faq">Preguntas frecuentes</a></li>
              </ul>
            </div>
            <div className={styles.footerCol}>
              <div className={styles.footerColTitle}>— Legal</div>
              <ul>
                <li><a href={getPdfLegalUrl('terminos')} target="_blank" rel="noreferrer">Términos y condiciones</a></li>
                <li><a href={getPdfLegalUrl('privacidad')} target="_blank" rel="noreferrer">Política de privacidad</a></li>
                <li><a href="#">Aviso de cookies</a></li>
                <li><a href="#">Protección de datos</a></li>
              </ul>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <div>© 2026 Consultoría JAS · Todos los derechos reservados</div>
            <div className={styles.right}>
              <span>www.consultoriajas.com</span>
              <span>Jiutepec, Morelos</span>
            </div>
          </div>
        </div>
      </footer>

      <a href="https://wa.me/527772193613" className="jas-wa-float">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.5-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.4.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4 0 1.4 1 2.8 1.2 3 .1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4 0-.1-.2-.2-.5-.3z" />
          <path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.4A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2z" />
        </svg>
      </a>
    </>
  );
}

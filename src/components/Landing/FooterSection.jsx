import React from "react";
import Logo from "../../img/landing/logo.png";
import styles from '../../styles/landing/FooterSection.module.css';

export default function FooterSection() {
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
                <a href="#" className={styles.fb} aria-label="Facebook"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg></a>
                <a href="#" className={styles.ig} aria-label="Instagram"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg></a>
                <a href="#" className={styles.tk} aria-label="TikTok"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9a5 5 0 0 1-3-1v6.5a5.5 5.5 0 1 1-5.5-5.5V13a2.5 2.5 0 1 0 2.5 2.5V3h2.5a3 3 0 0 0 3.5 3z" /></svg></a>
                <a href="#" className={styles.wa} aria-label="WhatsApp"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 17 0z" /></svg></a>
                <a href="#" className={styles.th} aria-label="Threads"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M8 12c0-3 1.5-5 4-5s4 1.5 4 4-2 4-4 4-3-1-3-2 1-2 3-2 4 1 4 3" /></svg></a>
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
                <li><a href="#">Blog migratorio</a></li>
                <li><a href="#">Calculadora de costos</a></li>
              </ul>
            </div>
            <div className={styles.footerCol}>
              <div className={styles.footerColTitle}>— Legal</div>
              <ul>
                <li><a href="#">Términos y condiciones</a></li>
                <li><a href="#">Política de privacidad</a></li>
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

      <a href="https://wa.me/527771008412" className="jas-wa-float">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.5-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.4.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4 0 1.4 1 2.8 1.2 3 .1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4 0-.1-.2-.2-.5-.3z" />
          <path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.4A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2z" />
        </svg>
      </a>
    </>
  );
}

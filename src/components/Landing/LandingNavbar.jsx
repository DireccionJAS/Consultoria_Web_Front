import React from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Home, Briefcase, Users, MessageSquare, HelpCircle, Mail, Phone, LogInIcon } from "lucide-react";
import Logo from "./../../img/logo.png";
import styles from '../../styles/landing/LandingNavbar.module.css';

export default function LandingNavbar({
  isScrolled,
  activeSection,
  navSections,
  handleNavClick,
  showNavbar
}) {
  return (
    <Navbar
      expand="lg"
      fixed="top"
      className={`${styles.modernNavbar} ${isScrolled ? styles.scrolled : ''}`}
      style={{ top: showNavbar ? '0' : '-120px' }}
    >
      <Container fluid className="px-3 px-lg-4">
        <Navbar.Brand href="#" className={styles.navbarBrand}>
          <div className={styles.logoContainer}>
            <img
              src={Logo}
              className={styles.navbarLogo}
              alt="Consultoría JAS Logo"
            />
          </div>
          <div className="d-none d-sm-block">
            <h1 className={styles.navbarTitle}>Consultoría JAS</h1>
            <p className={styles.navbarSubtitle}>JOHNRIC</p>
          </div>
        </Navbar.Brand>

        {/* Botones de acción para desktop */}
        <div className="d-none d-lg-flex align-items-center ms-auto order-lg-3">
          <Button
            className={`${styles.ctaButton} me-3`}
            onClick={() => window.location.href = 'tel:+527779835782'}
          >
            <Phone size={16} />
            <span className="d-none d-xl-inline">Cotizar</span>
            <span className="d-inline d-xl-none">Call</span>
          </Button>
          <Button
            className={styles.sessionButton}
            onClick={() => window.location.href = '/Login'}
          >
            <LogInIcon size={16} />
            <span className="d-none d-xl-inline">Iniciar sesión</span>
            <span className="d-inline d-xl-none">Login</span>
          </Button>
        </div>
        <div className="d-flex d-lg-none ms-auto align-items-center gap-2">
          <Button
            className={styles.ctaButton}
            style={{ height: "40px", padding: "0 16px", display: "flex", alignItems: "center" }}
            onClick={() => window.location.href = 'tel:+527779835782'}
          >
         
            Cotizar
          </Button>

          <Button
            className={styles.sessionButton}
            style={{ height: "40px", padding: "0 16px", display: "flex", alignItems: "center" }}
            onClick={() => window.location.href = '/Login'}
          >
        
            Iniciar sesión
          </Button>



          <Navbar.Toggle
            aria-controls="basic-navbar-nav"
            className={`${styles.navbarToggle} order-lg-2`}
          />
        </div>
        <Navbar.Collapse id="basic-navbar-nav" className="order-lg-1">
          <Nav className="me-auto">
            {navSections.map((section) => {
              const IconComponent = section.icon;
              const isActive = activeSection === section.id;

              return (
                <Nav.Link
                  key={section.id}
                  href={section.href}
                  onClick={() => handleNavClick(section.id)}
                  className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                >
                  <IconComponent size={16} className={styles.navIcon} />
                  <span className="d-inline d-lg-inline">{section.label}</span>
                </Nav.Link>
              );
            })}
          </Nav>

          {/* Botones de acción para mobile */}
          <div className="d-lg-none mt-3">
            <div className="d-flex flex-column gap-2">

            </div>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

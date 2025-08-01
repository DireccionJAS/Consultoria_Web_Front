import { Container, Row, Col } from "react-bootstrap";
import { Icon } from '@iconify/react';
import styles from '../../styles/landing/FooterSection.module.css';
import { redirect } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import React from "react";
import { useState, useEffect } from "react";
import { MdClose, MdOpenInNew, MdDownload } from 'react-icons/md';


export default function FooterSection() {
  const [pdfType, setPdfType] = useState(''); // Agregar esta línea


  const PdfModal = ({ showModal, pdfUrl, onClose, pdfType }) => {
    const [isMobile, setIsMobile] = useState(false);
    const [isAndroid, setIsAndroid] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const android = /android/i.test(userAgent);
      const ios = /iphone|ipad|ipod/i.test(userAgent);

      setIsMobile(mobile);
      setIsAndroid(android);
      setIsIOS(ios);
    }, []);

    const handleDownload = () => {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${pdfType || 'documento'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    const handleOpenInNewTab = () => {
      window.open(pdfUrl, '_blank');
    };

    if (!showModal) return null;

    return (
      <div style={stylesModal.overlay}>
        <div style={stylesModal.modal}>
          <div style={stylesModal.header}>
            <h3 style={stylesModal.title}>
              {pdfType === 'terminos' ? 'Términos y Condiciones' : 'Política de Privacidad'}
            </h3>
            <button onClick={onClose} style={stylesModal.closeButton}>
              <MdClose size={24} />
            </button>
          </div>

          <div style={stylesModal.content}>
            {isMobile ? (
              <div style={stylesModal.mobileContainer}>
                <div style={stylesModal.mobileIcon}>
                  📄
                </div>
                <h4 style={stylesModal.mobileTitle}>Visualizar documento PDF</h4>
                <p style={stylesModal.mobileText}>
                  {isIOS
                    ? "En iOS, los PDFs se abren mejor en una nueva pestaña o descargándolos."
                    : "En Android, recomendamos descargar el documento para una mejor visualización."
                  }
                </p>

                <div style={stylesModal.mobileActions}>
                  <button
                    onClick={handleOpenInNewTab}
                    style={stylesModal.actionButton}
                  >
                    <MdOpenInNew size={20} />
                    Abrir en nueva pestaña
                  </button>
                </div>


              </div>
            ) : (
              // Vista escritorio - iframe normal
              <div style={stylesModal.desktopContainer}>
                <div style={stylesModal.desktopActions}>
                  <button
                    onClick={handleOpenInNewTab}
                    style={stylesModal.actionButtonSmall}
                    title="Abrir en nueva pestaña"
                  >
                    <MdOpenInNew size={16} />
                  </button>
                </div>
                <iframe
                  src={pdfUrl}
                  title="PDF Viewer"
                  style={stylesModal.desktopIframe}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Estilos para el modal - AGREGAR ESTOS ESTILOS
  const stylesModal = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      padding: '10px',
    },
    modal: {
      position: 'relative',
      width: '90%',
      maxWidth: '900px',
      height: '90%',
      maxHeight: '800px',
      backgroundColor: '#fff',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '15px 20px',
      borderBottom: '1px solid #e5e5e5',
      backgroundColor: '#f8f9fa',
    },
    title: {
      margin: 0,
      fontSize: '18px',
      fontWeight: '600',
      color: '#333',
    },
    closeButton: {
      background: 'black',
      border: 'none',
      color: 'white',
      cursor: 'pointer',
      padding: '5px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background-color 0.2s',
    },
    content: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
    },
    mobileContainer: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      textAlign: 'center',
    },
    mobileIcon: {
      fontSize: '60px',
      marginBottom: '20px',
    },
    mobileTitle: {
      fontSize: '20px',
      fontWeight: '600',
      marginBottom: '10px',
      color: '#333',
    },
    mobileText: {
      fontSize: '14px',
      color: '#666',
      marginBottom: '25px',
      lineHeight: '1.5',
      maxWidth: '300px',
    },
    mobileActions: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      width: '100%',
      maxWidth: '280px',
    },
    actionButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: '12px 20px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    },
    downloadButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: '12px 20px',
      backgroundColor: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    },
    fallbackSection: {
      marginTop: '30px',
      width: '100%',
    },
    fallbackText: {
      fontSize: '12px',
      color: '#888',
      marginBottom: '10px',
    },
    iframeContainer: {
      width: '100%',
      height: '200px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      overflow: 'hidden',
    },
    mobileIframe: {
      width: '100%',
      height: '100%',
      border: 'none',
    },
    desktopContainer: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
    },
    desktopActions: {
      display: 'flex',
      gap: '8px',
      padding: '10px 15px',
      backgroundColor: '#f8f9fa',
      borderBottom: '1px solid #e5e5e5',
    },
    actionButtonSmall: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '6px',
      backgroundColor: '#6c757d',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    },
    desktopIframe: {
      flex: 1,
      border: 'none',
      width: '100%',
    },
  };

  // Mostrar cards solo en móvil
  const [isMobile, setIsMobile] = useState(window.innerWidth < 700);
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 700);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [showModal, setShowModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const navigate = useNavigate()
  const redirect = () => {
    navigate('/practicas');
  }
  const UrlApi = import.meta.env.VITE_API_URL;
  const handleViewPdf = async (tipo) => {
    try {
      const response = await fetch(`${UrlApi}/pdf/download/${tipo}`);
      if (!response.ok) throw new Error('Error al obtener PDF');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setPdfType(tipo); // Agregar esta línea
      setShowModal(true);
    } catch (error) {
      console.error(error);
      alert('No se pudo cargar el PDF');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    URL.revokeObjectURL(pdfUrl); // liberamos memoria
    setPdfUrl('');
  };

  return (
    <footer id="contacto" style={{
      width: '100vw',
      marginLeft: 'calc(-50vw + 50%)',
      overflowX: 'hidden',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      padding: '60px 0 40px 0',
      color: '#FFFFFF',
      overflow: 'hidden',
    }}>
      {/* Decorative background elements */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle at 20% 50%, rgba(14, 165, 233, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
        pointerEvents: 'none'
      }} />

      <Container style={{ position: 'relative', zIndex: 1 }}>
        {/* Header section */}
        <Row className="mb-5">
          <Col className="text-center">
            <h3 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '1rem'
            }}>
              Consultoría JAS
            </h3>
            <p style={{
              fontSize: '1.1rem',
              color: '#94A3B8',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              Tu socio de confianza en consultoría especializada y procesos de visado
            </p>
          </Col>
        </Row>

        <Row>
          {/* Contact Section */}
          <Col lg={6} className="mb-4">
            <div className={styles.socialContainer}>
              <h5 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                marginBottom: '25px',
                color: '#60A5FA',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }} className={styles.socialTitle}>
                <Icon icon="material-symbols:contact-phone" width="28" height="28" />
                Contacto
              </h5>

              {/* Phone numbers */}
              <div style={{ marginBottom: '25px' }}>
                {[
                  '(777) 983-57-82 Telefono fijo Jiutepec',
                  '(777) 219-36-13 Whatsapp Jiutepec',
                  '(777) 992-80-09 Telefono fijo Cuernavaca',
                  '(777) 301-34-99 Whatsapp Cuernavaca',
                ].map((phone, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '12px',
                    padding: '8px 0',
                    borderBottom: index < 4 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
                  }}>
                    <Icon icon="material-symbols:phone" width="18" height="18" style={{ color: '#60A5FA', marginRight: '12px' }} />
                    <span style={{ fontSize: '0.95rem', color: '#E2E8F0' }}>{phone}</span>
                  </div>
                ))}
              </div>

              {/* Email */}
              <div style={{ marginBottom: '25px' }}>
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=consultoriacomercializacionjas@gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    textDecoration: 'none',
                    color: '#60A5FA',
                    padding: '12px',
                    borderRadius: '10px',
                    background: 'rgba(96, 165, 250, 0.1)',
                    border: '1px solid rgba(96, 165, 250, 0.2)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = 'rgba(96, 165, 250, 0.2)';
                    e.target.style.transform = 'translateX(5px)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = 'rgba(96, 165, 250, 0.1)';
                    e.target.style.transform = 'translateX(0)';
                  }}
                >
                  <Icon icon="skill-icons:gmail-light" width="24" height="24" />
                  <span style={{ marginLeft: '12px', fontSize: '0.9rem' }}>
                    consultoriacomercializacionjas@gmail.com
                  </span>
                </a>
              </div>

              {/* Maps */}
              <div style={{ display: 'grid', gap: '20px' }}>
                <div style={{
                  borderRadius: '15px',
                  overflow: 'hidden',
                  border: '2px solid rgba(96, 165, 250, 0.3)'
                }}>
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d471.95396808502073!2d-99.175762!3d18.859035!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85ce77d2ecc4620f%3A0x4b24c3ee3c11823c!2sCONSULTOR%C3%8DA%20JAS!5e0!3m2!1ses!2sus!4v1749226877006!5m2!1ses!2sus"
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Ubicación Consultoría JAS"
                  />
                </div>
                <div style={{
                  borderRadius: '15px',
                  overflow: 'hidden',
                  border: '2px solid rgba(96, 165, 250, 0.3)'
                }}>
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d235.8978879221942!2d-99.18634366883958!3d18.915178042630195!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85ce756057cc2e47%3A0x1aba5bfb8855eb3e!2sCONSULTOR%C3%8DA%20JAS!5e0!3m2!1ses!2sus!4v1749487537955!5m2!1ses!2sus"
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Ubicación Plaza Novum"
                  />
                </div>
              </div>
            </div>
          </Col>

          {/* Social Media & Resources Section */}
          <Col lg={6} className="mb-4">
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: '30px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              height: '100%'
            }}>
              <h5 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                marginBottom: '25px',
                color: '#60A5FA',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <Icon icon="material-symbols:share" width="28" height="28" />
                Síguenos
              </h5>

              {/* Social Media Links */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
                <div className={styles.socialGrid}>
                  {[
                    { icon: 'logos:facebook', url: 'https://www.facebook.com/AsesoriaEspecializadaConsultoriaJAS', name: 'Facebook' },
                    { icon: 'skill-icons:instagram', url: 'https://www.instagram.com/somosconsultoriajas', name: 'Instagram' },
                    { icon: 'logos:tiktok-icon', url: 'https://www.tiktok.com/@consultoriajas', name: 'TikTok Principal' },
                    { icon: 'logos:tiktok-icon', url: 'https://www.tiktok.com/@consultoriajhonric', name: 'TikTok Secundario' },
                    { icon: 'logos:whatsapp-icon', url: 'https://wa.me/message/KXGI4YPWAQ3GC1', name: 'WhatsApp' },
                    { icon: 'bi:threads-fill', url: 'https://www.threads.net/@somosconsultoriajas', name: 'Threads' },
                  ].map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.socialLink}
                    >
                      <Icon icon={social.icon} width="24" height="24" style={{ marginRight: '12px' }} />
                      <span>{social.name}</span>
                    </a>
                  ))}
                  <button
                    onClick={redirect}
                    className={styles.practicasBtn}
                  >
                    ¿Estás interesado en realizar tus prácticas con nosotros?
                  </button>
                </div>
              </div>

              {/* Resources Section */}
              <div style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                paddingTop: '25px'
              }}>
                <h6 style={{
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  marginBottom: '20px',
                  color: '#60A5FA',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Icon icon="material-symbols:library-books" width="24" height="24" />
                  Recursos
                </h6>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <a
                    href="https://www.canva.com/design/DAGZeEd0ITA/XUMr9VAQxncvoI1_XiJFxg/view?utm_content=DAGZeEd0ITA&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h8c04945ce4"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '15px',
                      background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.1) 100%)',
                      borderRadius: '12px',
                      textDecoration: 'none',
                      color: '#E2E8F0',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(34, 197, 94, 0.3)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <Icon icon="material-symbols:monitoring" width="24" height="24" style={{ color: '#22C55E', marginRight: '12px' }} />
                    <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Porcentaje de Aprobación</span>
                  </a>

                  <a
                    href="https://www.canva.com/design/DAGbpOhHsh4/E0JuiDkBo7NEopyKalACEg/view?utm_content=DAGbpOhHsh4&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h13366f006e"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      padding: '15px',
                      background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
                      borderRadius: '12px',
                      textDecoration: 'none',
                      color: '#E2E8F0',
                      border: '1px solid rgba(168, 85, 247, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(168, 85, 247, 0.3)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <Icon icon="mingcute:paper-line" width="24" height="24" style={{ color: '#A855F7', marginRight: '12px', marginTop: '2px' }} />
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: '500', marginBottom: '4px' }}>Manual de Visado</div>
                      <div style={{ fontSize: '0.8rem', color: '#94A3B8', lineHeight: '1.4' }}>
                        "¿Cómo llevar un proceso de visado exitoso?"
                      </div>
                    </div>
                  </a>

                  {/* Tabla de horarios con estilos CSS módulo */}
                  <div className={styles.scheduleContainer}>
                    <h6 className={styles.scheduleTitle}>
                      <Icon icon="material-symbols:schedule" width="20" height="20" />
                      Horarios de Atención
                    </h6>
                    {isMobile ? (
                      <div className={styles.cardsWrapper}>
                        {[
                          { dia: 'Lunes', oficina: '9:00 am - 4:00 pm', online: '8:00 am - 11:00 pm' },
                          { dia: 'Martes', oficina: '8:00 am - 4:00 pm', online: '8:00 am - 11:00 pm' },
                          { dia: 'Miércoles', oficina: '8:00 am - 4:00 pm', online: '8:00 am - 11:00 pm' },
                          { dia: 'Jueves', oficina: '8:00 am - 4:00 pm', online: '8:00 am - 11:00 pm' },
                          { dia: 'Viernes', oficina: '8:00 am - 4:00 pm', online: '8:00 am - 11:00 pm' },
                          { dia: 'Sábado', oficina: '8:00 am - 12:00 pm', online: 'Cerrado' }
                        ].map((horario, index) => (
                          <div key={index} className={styles.dayCard}>
                            <div className={styles.dayCardHeader}>
                              <div className={horario.dia === 'Sábado' ? styles.dayIndicatorSpecial : styles.dayIndicatorActive}></div>
                              <span className={styles.dayCardTitle}>{horario.dia}</span>
                            </div>
                            <div className={styles.dayCardBody}>
                              <div className={styles.dayCardSection}>
                                <Icon icon="material-symbols:business" width="20" height="20" style={{ color: '#60A5FA', marginRight: '8px' }} />
                                <span className={styles.dayCardLabel}>Oficina:</span>
                                <span className={styles.dayCardTime}>{horario.oficina}</span>
                              </div>
                              <div className={styles.dayCardSection}>
                                {horario.online !== 'Cerrado' ? (
                                  <>
                                    <Icon icon="material-symbols:wifi" width="20" height="20" style={{ color: '#22C55E', marginRight: '8px' }} />
                                    <span className={styles.dayCardLabel}>Online:</span>
                                    <span className={styles.dayCardTimeOnline}>{horario.online}</span>
                                  </>
                                ) : (
                                  <>
                                    <Icon icon="material-symbols:close" width="20" height="20" style={{ color: '#EF4444', marginRight: '8px' }} />
                                    <span className={styles.dayCardLabel}>Online:</span>
                                    <span className={styles.dayCardTimeClosed}>Cerrado</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={styles.tableWrapper}>
                        <table className={styles.scheduleTable}>
                          <thead>
                            <tr className={styles.tableHeader}>
                              <th className={styles.headerCellLeft}>
                                Día
                              </th>
                              <th className={styles.headerCellCenter}>
                                Horario de Oficinas
                              </th>
                              <th className={styles.headerCellCenter}>
                                Horario Online
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { dia: 'Lunes', oficina: '9:00 am - 4:00 pm', online: '8:00 am - 11:00 pm' },
                              { dia: 'Martes', oficina: '8:00 am - 4:00 pm', online: '8:00 am - 11:00 pm' },
                              { dia: 'Miércoles', oficina: '8:00 am - 4:00 pm', online: '8:00 am - 11:00 pm' },
                              { dia: 'Jueves', oficina: '8:00 am - 4:00 pm', online: '8:00 am - 11:00 pm' },
                              { dia: 'Viernes', oficina: '8:00 am - 4:00 pm', online: '8:00 am - 11:00 pm' },
                              { dia: 'Sábado', oficina: '8:00 am - 12:00 pm', online: 'Cerrado' }
                            ].map((horario, index) => (
                              <tr key={index} className={styles.tableRow}>
                                <td className={styles.dayCell}>
                                  <div className={horario.dia === 'Sábado' ? styles.dayIndicatorSpecial : styles.dayIndicatorActive}></div>
                                  {horario.dia}
                                </td>
                                <td className={styles.timeCell}>
                                  <div className={styles.officeBadge}>
                                    <Icon icon="material-symbols:business" width="16" height="16" style={{ color: '#60A5FA' }} />
                                    {horario.oficina}
                                  </div>
                                </td>
                                <td className={styles.timeCell}>
                                  {horario.online !== 'Cerrado' ? (
                                    <div className={styles.onlineBadge}>
                                      <Icon icon="material-symbols:wifi" width="16" height="16" />
                                      {horario.online}
                                    </div>
                                  ) : (
                                    <div className={styles.closedBadge}>
                                      <Icon icon="material-symbols:close" width="16" height="16" />
                                      Cerrado
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Nota adicional */}
                    <div className={styles.infoNote}>
                      <Icon icon="material-symbols:info" width="20" height="20" className={styles.infoIcon} />
                      <p className={styles.infoText}>
                        Los horarios pueden variar en días festivos. Contáctanos para confirmar disponibilidad.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        {/* Footer Bottom */}
        <Row className="mt-5">
          <Col className="text-center">
            <div className={styles.foote}>
              <p className={styles.texto}>
                &copy; {new Date().getFullYear()} <span style={{ color: '#60A5FA', fontWeight: '600' }}>Consultoría JAS</span>.
                Todos los derechos reservados.

                <a href="#" onClick={(e) => { e.preventDefault(); handleViewPdf('terminos'); }}>
                  Términos y Condiciones
                </a>{' '}
                y la{' '}
                <a href="#" onClick={(e) => { e.preventDefault(); handleViewPdf('privacidad'); }}>
                  Política de Privacidad
                </a>

              </p>
            </div>
          </Col>
        </Row>
      </Container>
      {showModal && (
        <div style={stylesS.overlay}>
          <PdfModal
            showModal={showModal}
            pdfUrl={pdfUrl}
            pdfType={pdfType}
            onClose={closeModal}
          />
        </div>
      )}
    </footer>
  );
}

const stylesS = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  modal: {
    position: 'relative',
    width: '80%',
    height: '80%',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0,0,0,0.25)',
    display: 'flex',
    flexDirection: 'column',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    zIndex: 10000,
  },
  iframe: {
    flex: 1,
    border: 'none',
    borderRadius: '8px',
    width: '100%',
  },
};
import React, { useEffect, useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Navbar from '../NavbarAdmin';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export default function UploadPdf() {
  const navigate = useNavigate();
  const UrlApi = import.meta.env.VITE_API_URL;

  useEffect(() => {
    document.body.classList.add('home-admin-body');

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (decoded.role !== "ADMIN") {
        navigate("/");
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      localStorage.removeItem("token");
      navigate("/");
    }

    return () => {
      document.body.classList.remove('home-admin-body');
    };
  }, [navigate]);

  // Estados para archivos y mensajes
  const [filePrivacidad, setFilePrivacidad] = useState(null);
  const [fileTerminos, setFileTerminos] = useState(null);
  const [mensajePrivacidad, setMensajePrivacidad] = useState('');
  const [mensajeTerminos, setMensajeTerminos] = useState('');
  const [loadingPrivacidad, setLoadingPrivacidad] = useState(false);
  const [loadingTerminos, setLoadingTerminos] = useState(false);

  // Subida genérica para evitar repetir código
  const uploadPdf = async (file, tipo, setMensaje, setLoading) => {
    if (!file) {
      setMensaje('Por favor selecciona un archivo.');
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setMensaje('No autorizado');
      navigate("/");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${UrlApi}/pdf/upload/${tipo}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData,
      });

      if (response.ok) {
        const text = await response.text();
        setMensaje(text);
      } else {
        setMensaje(`Error al subir: ${response.status}`);
      }
    } catch (error) {
      console.error(error);
      setMensaje('Error de red');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e, setFile, setMensaje) => {
    const file = e.target.files[0];
    setFile(file);
    setMensaje('');
  };

  // Estilos CSS-in-JS (idénticos a los tuyos)
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    mainContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '32px 16px',
      paddingTop: '96px'
    },
    header: {
      textAlign: 'center',
      marginBottom: '48px'
    },
    title: {
      fontSize: '36px',
      fontWeight: 'bold',
      color: '#374151',
      marginBottom: '16px',
      margin: '0 0 16px 0'
    },
    subtitle: {
      fontSize: '18px',
      color: '#6b7280',
      maxWidth: '600px',
      margin: '0 auto',
      lineHeight: '1.6'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '32px'
    },
    card: {
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb',
      overflow: 'hidden',
      transition: 'box-shadow 0.3s ease'
    },
    cardHeader: {
      padding: '24px',
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    cardHeaderPrivacidad: {
      background: 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)'
    },
    cardHeaderTerminos: {
      background: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)'
    },
    cardTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      margin: 0
    },
    cardBody: {
      padding: '24px'
    },
    formGroup: {
      marginBottom: '24px'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '8px'
    },
    fileInput: {
      display: 'block',
      width: '100%',
      padding: '12px',
      fontSize: '14px',
      color: '#6b7280',
      backgroundColor: '#f9fafb',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    fileInputHover: {
      backgroundColor: '#f3f4f6'
    },
    fileInfo: {
      marginTop: '8px',
      fontSize: '14px',
      color: '#6b7280',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    button: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: '12px 16px',
      fontSize: '14px',
      fontWeight: '500',
      color: '#ffffff',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    buttonPrivacidad: {
      backgroundColor: '#4a5568'
    },
    buttonPrivacidadHover: {
      backgroundColor: '#2d3748'
    },
    buttonTerminos: {
      backgroundColor: '#374151'
    },
    buttonTerminosHover: {
      backgroundColor: '#1f2937'
    },
    buttonDisabled: {
      backgroundColor: '#d1d5db',
      cursor: 'not-allowed'
    },
    message: {
      marginTop: '16px',
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      fontSize: '14px'
    },
    messageSuccess: {
      color: '#065f46',
      backgroundColor: '#ecfdf5',
      borderColor: '#d1fae5'
    },
    messageError: {
      color: '#dc2626',
      backgroundColor: '#fef2f2',
      borderColor: '#fecaca'
    },
    footer: {
      marginTop: '48px',
      textAlign: 'center'
    },
    footerCard: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      padding: '24px',
      border: '1px solid #e5e7eb'
    },
    footerTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '12px',
      margin: '0 0 12px 0'
    },
    footerList: {
      fontSize: '14px',
      color: '#6b7280',
      lineHeight: '1.8',
      margin: 0,
      padding: 0,
      listStyle: 'none'
    },
    footerListItem: {
      marginBottom: '4px'
    }
  };

  return (
    <div style={styles.container}>
      <div className="fixed-top">
        <Navbar />
      </div>

      <div style={styles.mainContent}>
        <div style={styles.header}>
          <h1 style={styles.title}>Gestión de Documentos</h1>
          <p style={styles.subtitle}>Actualiza las políticas de privacidad y términos y condiciones de la plataforma</p>
        </div>

        <div style={styles.grid}>
          {/* Card Privacidad */}
          <div style={styles.card}>
            <div style={{ ...styles.cardHeader, ...styles.cardHeaderPrivacidad }}>
              <FileText size={32} color="#ffffff" />
              <h2 style={styles.cardTitle}>Políticas de Privacidad</h2>
            </div>
            <div style={styles.cardBody}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Seleccionar archivo PDF</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={e => handleFileChange(e, setFilePrivacidad, setMensajePrivacidad)}
                  style={styles.fileInput}
                  onMouseEnter={e => e.target.style.backgroundColor = styles.fileInputHover.backgroundColor}
                  onMouseLeave={e => e.target.style.backgroundColor = styles.fileInput.backgroundColor}
                />
                {filePrivacidad && (
                  <div style={styles.fileInfo}>
                    <FileText size={16} />
                    <span>Archivo seleccionado: {filePrivacidad.name}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => uploadPdf(filePrivacidad, 'privacidad', setMensajePrivacidad, setLoadingPrivacidad)}
                disabled={!filePrivacidad || loadingPrivacidad}
                style={{
                  ...styles.button,
                  ...((!filePrivacidad || loadingPrivacidad) ? styles.buttonDisabled : styles.buttonPrivacidad)
                }}
                onMouseEnter={e => {
                  if (!(!filePrivacidad || loadingPrivacidad)) {
                    e.target.style.backgroundColor = styles.buttonPrivacidadHover.backgroundColor;
                  }
                }}
                onMouseLeave={e => {
                  if (!(!filePrivacidad || loadingPrivacidad)) {
                    e.target.style.backgroundColor = styles.buttonPrivacidad.backgroundColor;
                  }
                }}
              >
                {loadingPrivacidad ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Subiendo...</span>
                  </>
                ) : (
                  <>
                    <Upload size={20} />
                    <span>Subir Archivo</span>
                  </>
                )}
              </button>

              {mensajePrivacidad && (
                <div style={{
                  ...styles.message,
                  ...(mensajePrivacidad.includes('Error') ? styles.messageError : styles.messageSuccess)
                }}>
                  {mensajePrivacidad.includes('Error') ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
                  <span>{mensajePrivacidad}</span>
                </div>
              )}
            </div>
          </div>

          {/* Card Términos */}
          <div style={styles.card}>
            <div style={{ ...styles.cardHeader, ...styles.cardHeaderTerminos }}>
              <FileText size={32} color="#ffffff" />
              <h2 style={styles.cardTitle}>Términos y Condiciones</h2>
            </div>
            <div style={styles.cardBody}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Seleccionar archivo PDF</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={e => handleFileChange(e, setFileTerminos, setMensajeTerminos)}
                  style={styles.fileInput}
                  onMouseEnter={e => e.target.style.backgroundColor = styles.fileInputHover.backgroundColor}
                  onMouseLeave={e => e.target.style.backgroundColor = styles.fileInput.backgroundColor}
                />
                {fileTerminos && (
                  <div style={styles.fileInfo}>
                    <FileText size={16} />
                    <span>Archivo seleccionado: {fileTerminos.name}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => uploadPdf(fileTerminos, 'terminos', setMensajeTerminos, setLoadingTerminos)}
                disabled={!fileTerminos || loadingTerminos}
                style={{
                  ...styles.button,
                  ...((!fileTerminos || loadingTerminos) ? styles.buttonDisabled : styles.buttonTerminos)
                }}
                onMouseEnter={e => {
                  if (!(!fileTerminos || loadingTerminos)) {
                    e.target.style.backgroundColor = styles.buttonTerminosHover.backgroundColor;
                  }
                }}
                onMouseLeave={e => {
                  if (!(!fileTerminos || loadingTerminos)) {
                    e.target.style.backgroundColor = styles.buttonTerminos.backgroundColor;
                  }
                }}
              >
                {loadingTerminos ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Subiendo...</span>
                  </>
                ) : (
                  <>
                    <Upload size={20} />
                    <span>Subir Archivo</span>
                  </>
                )}
              </button>

              {mensajeTerminos && (
                <div style={{
                  ...styles.message,
                  ...(mensajeTerminos.includes('Error') ? styles.messageError : styles.messageSuccess)
                }}>
                  {mensajeTerminos.includes('Error') ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
                  <span>{mensajeTerminos}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={styles.footer}>
          <div style={styles.footerCard}>
            <h3 style={styles.footerTitle}>Información Importante</h3>
            <ul style={styles.footerList}>
              <li style={styles.footerListItem}>• Solo se aceptan archivos en formato PDF</li>
              <li style={styles.footerListItem}>• Los archivos se actualizarán inmediatamente en la plataforma</li>
              <li style={styles.footerListItem}>• Asegúrate de que los documentos estén actualizados y sean válidos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

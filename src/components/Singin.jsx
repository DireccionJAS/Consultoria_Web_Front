import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Swal from 'sweetalert2';
import { RegistrarCliente, olvidarContraSin, enviarCorreoConDatos } from '../api/api.js';
import styles from './../styles/Signin.module.css';
import {
  FaEye, FaEyeSlash, FaCheck, FaUser, FaEnvelope, FaPhone,
  FaShieldAlt, FaChevronDown
} from 'react-icons/fa';
import { MdClose, MdArrowBack, MdOpenInNew, MdDownload } from 'react-icons/md';
import Logo from './../img/logo_letras_negras.png';
import { Icon } from '@iconify/react';

// ... (PdfModal y CountrySelect componentes permanecen igual)
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
                <button
                  onClick={handleDownload}
                  style={stylesModal.actionButtonSmall}
                  title="Descargar PDF"
                >
                  <MdDownload size={16} />
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

// Estilos para el modal (permanecen igual)
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
    cursor: 'pointer',
    color: 'white',
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

const countryOptions = [
  { value: "+54", label: "Argentina", flag: "🇦🇷" },
  { value: "+1", label: "Bahamas", flag: "🇧🇸" },
  { value: "+1", label: "Barbados", flag: "🇧🇧" },
  { value: "+501", label: "Belize", flag: "🇧🇿" },
  { value: "+55", label: "Brazil", flag: "🇧🇷" },
  { value: "+591", label: "Bolivia", flag: "🇧🇴" },
  { value: "+1", label: "Canada", flag: "🇨🇦" },
  { value: "+56", label: "Chile", flag: "🇨🇱" },
  { value: "+57", label: "Colombia", flag: "🇨🇴" },
  { value: "+506", label: "Costa Rica", flag: "🇨🇷" },
  { value: "+599", label: "Curacao", flag: "🇨🇼" },
  { value: "+1", label: "República Dominicana", flag: "🇩🇴" },
  { value: "+593", label: "Ecuador", flag: "🇪🇨" },
  { value: "+503", label: "El Salvador", flag: "🇸🇻" },
  { value: "+502", label: "Guatemala", flag: "🇬🇹" },
  { value: "+592", label: "Guyana", flag: "🇬🇾" },
  { value: "+509", label: "Haiti", flag: "🇭🇹" },
  { value: "+1", label: "Jamaica", flag: "🇯🇲" },
  { value: "+52", label: "México", flag: "🇲🇽" },
  { value: "+505", label: "Nicaragua", flag: "🇳🇮" },
  { value: "+507", label: "Panamá", flag: "🇵🇦" },
  { value: "+595", label: "Paraguay", flag: "🇵🇾" },
  { value: "+51", label: "Perú", flag: "🇵🇪" },
  { value: "+597", label: "Suriname", flag: "🇸🇷" },
  { value: "+1", label: "Trinidad y Tobago", flag: "🇹🇹" },
  { value: "+598", label: "Uruguay", flag: "🇺🇾" },
];

const CountrySelect = ({ value, onChange, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedCountry = countryOptions.find(option => option.value === value) || countryOptions.find(option => option.value === '+52');

  const filteredOptions = countryOptions.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.value.includes(searchTerm)
  );

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={styles.countrySelectContainer}>
      <div
        className={`${styles.countrySelectTrigger} ${error ? styles.inputError : ''} ${isOpen ? styles.countrySelectOpen : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={styles.countrySelectValue}>
          <span className={styles.countryFlag}>{selectedCountry.flag}</span>
          <span className={styles.countryCode}>{selectedCountry.value}</span>
          <span className={styles.countryName}>{selectedCountry.label}</span>
        </div>
        <FaChevronDown className={`${styles.countrySelectArrow} ${isOpen ? styles.countrySelectArrowUp : ''}`} />
      </div>

      {isOpen && (
        <div className={styles.countrySelectDropdown}>
          <div className={styles.countrySearchContainer}>
            <input
              type="text"
              placeholder="Buscar país..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.countrySearchInput}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className={styles.countryOptionsList}>
            {filteredOptions.map((option) => (
              <div
                key={option.value}
                className={`${styles.countryOption} ${selectedCountry?.value === option.value ? styles.countryOptionSelected : ''}`}
                onClick={() => handleSelect(option)}
              >
                <span className={styles.countryFlag}>{option.flag}</span>
                <span className={styles.countryLabel}>{option.label}</span>
                <span className={styles.countryCode}>({option.value})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const UrlApi = import.meta.env.VITE_API_URL;

const schema = yup.object().shape({
  email: yup.string().required('Correo requerido').email('Correo inválido'),
  name: yup.string().required('Nombre requerido'),
  password: yup.string().required('Contraseña requerida').min(8, 'Mínimo 8 caracteres'),
  confirmPassword: yup.string()
    .required('Confirma tu contraseña')
    .oneOf([yup.ref('password')], 'Las contraseñas no coinciden'),
  phone: yup.string()
    .required('Teléfono requerido')
    .matches(/^\d{10}$/, 'Debe tener exactamente 10 dígitos'),
});

export default function Signin({ onCancel }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [codigoEnviado, setCodigoEnviado] = useState(null);
  const [codigoIngresado, setCodigoIngresado] = useState('');
  const [paso, setPaso] = useState(1); // 1: Formulario, 2: Verificación, 3: Creación de cuenta
  const [phonePrefix, setPhonePrefix] = useState('+52');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfType, setPdfType] = useState('');
  const [intentos, setIntentos] = useState(0);
  const [tiempoRestante, setTiempoRestante] = useState(0);
  const [puedeReenviar, setPuedeReenviar] = useState(true);
  const [datosFormulario, setDatosFormulario] = useState(null); // Guardar datos del paso 1
  
  const MAX_INTENTOS = 3;
  const TIEMPO_ESPERA = 60; // 60 segundos

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  // Función para obtener título del paso
  const getTituloActual = () => {
    switch (paso) {
      case 1:
        return 'Crear cuenta';
      case 2:
        return 'Verificar correo';
      case 3:
        return 'Creando cuenta';
      default:
        return 'Registro';
    }
  };

  // Función para obtener subtítulo del paso
  const getSubtituloActual = () => {
    switch (paso) {
      case 1:
        return 'Bienvenido a Consultoría JAS. Completa tus datos para registrarte.';
      case 2:
        return 'Ingresa el código que enviamos a tu correo electrónico';
      case 3:
        return 'Procesando tu registro, por favor espera...';
      default:
        return '';
    }
  };

  // Función para enviar correo de notificación al administrador
  const enviarNotificacionAdministrador = async (data, motivo = 'Error en registro') => {
    const asuntoAdmin = 'Registro incompleto - Requiere atención manual';
    const mensajeAdmin = `
<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
  <h2 style="color: #d9534f; text-align: center;">Notificación de Registro Incompleto</h2>
  <p>Se ha detectado un intento de registro que no pudo completarse.</p>

  <h3 style="color: #5bc0de;">Motivo:</h3>
  <p>${motivo}</p>

  <h3 style="color: #5bc0de;">Paso del proceso:</h3>
  <p>Paso ${paso} de 3</p>

  <h3 style="color: #5bc0de;">Datos del Cliente:</h3>
  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 4px; font-weight: bold;">Nombre:</td>
      <td style="padding: 4px;">${data.name}</td>
    </tr>
    <tr>
      <td style="padding: 4px; font-weight: bold;">Correo:</td>
      <td style="padding: 4px;">${data.email}</td>
    </tr>
    <tr>
      <td style="padding: 4px; font-weight: bold;">Teléfono:</td>
      <td style="padding: 4px;">${phonePrefix}${data.phone}</td>
    </tr>
    <tr>
      <td style="padding: 4px; font-weight: bold;">Fecha de intento:</td>
      <td style="padding: 4px;">${new Date().toLocaleString('es-MX', {
        timeZone: 'America/Mexico_City',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}</td>
    </tr>
    <tr>
      <td style="padding: 4px; font-weight: bold;">Intentos realizados:</td>
      <td style="padding: 4px;">${intentos + 1}/${MAX_INTENTOS}</td>
    </tr>
  </table>

  <h3 style="color: #5bc0de;">Acciones Recomendadas:</h3>
  <ol>
    <li>Contactar al cliente vía WhatsApp: <a href="https://wa.me/${phonePrefix.replace('+', '')}${data.phone}" target="_blank">Enviar mensaje</a></li>
    <li>Enviar correo de seguimiento a: <a href="mailto:${data.email}">${data.email}</a></li>
    <li>Verificar manualmente la cuenta en el sistema</li>
    <li>Ayudar al cliente a completar el registro</li>
  </ol>

  <p style="font-size: 12px; color: #777; margin-top: 20px;">
    Este mensaje se genera automáticamente cuando un cliente no puede completar su registro.<br>
    ---<br>
    Sistema de Registro - Consultoría JAS
  </p>
</div>
`;

    try {
      await enviarCorreoConDatos('consultoriacomercializacionjas@gmail.com', asuntoAdmin, mensajeAdmin);
      console.log('Notificación enviada al administrador exitosamente');
      return true;
    } catch (error) {
      console.error('Error al enviar notificación al administrador:', error);
      return false;
    }
  };

  // Función para iniciar temporizador
  const iniciarTemporizador = () => {
    setTiempoRestante(TIEMPO_ESPERA);
    setPuedeReenviar(false);
    
    const interval = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setPuedeReenviar(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Función para reenviar código
  const reenviarCodigo = async () => {
    if (intentos >= MAX_INTENTOS || !datosFormulario) {
      await enviarNotificacionAdministrador(datosFormulario, 'Límite de intentos alcanzado en reenvío');
      
      await Swal.fire({
        title: 'Límite de intentos alcanzado',
        html: `
          <div style="text-align: left;">
            <p>Has alcanzado el número máximo de intentos (${MAX_INTENTOS}) para este correo.</p>
            <br>
            <p><strong>Nuestro equipo ha sido notificado y se comunicará contigo pronto para ayudarte a completar tu registro.</strong></p>
          </div>
        `,
        icon: 'warning',
        confirmButtonText: 'Entendido',
        customClass: { popup: 'swal-popup-custom' },
      });
      return;
    }

    try {
      const res = await olvidarContraSin(datosFormulario.email);
      const code = res?.response?.code;

      if (!code) {
        await enviarNotificacionAdministrador(datosFormulario, 'Código no recibido en reenvío');
        
        await Swal.fire({
          title: 'Problema persistente',
          html: `
            <div style="text-align: left;">
              <p>No se pudo reenviar el código de verificación.</p>
              <br>
              <p><strong>Nuestro equipo técnico ha sido notificado y te contactaremos pronto.</strong></p>
            </div>
          `,
          icon: 'warning',
          confirmButtonText: 'Entendido',
          customClass: { popup: 'swal-popup-custom' },
        });
        return;
      }

      setCodigoEnviado(code);
      setIntentos(prev => prev + 1);
      iniciarTemporizador();

      await Swal.fire({
        title: '¡Código reenviado!',
        text: `Código enviado nuevamente. Intentos restantes: ${MAX_INTENTOS - intentos - 1}`,
        icon: 'success',
        customClass: { popup: 'swal-popup-custom' },
      });
    } catch (error) {
      console.error('Error al reenviar código:', error);
      await enviarNotificacionAdministrador(datosFormulario, 'Error técnico en reenvío');
      
      await Swal.fire({
        title: 'Error al reenviar',
        text: 'Ocurrió un problema al reenviar el código. Nuestro equipo ha sido notificado.',
        icon: 'error',
        customClass: { popup: 'swal-popup-custom' },
      });
    }
  };

  const cancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      window.history.back();
    }
  };

  const handleViewPdf = async (tipo) => {
    try {
      const response = await fetch(`${UrlApi}/pdf/download/${tipo}`);
      if (!response.ok) throw new Error('Error al obtener PDF');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setPdfType(tipo);
      setShowModal(true);
    } catch (error) {
      console.error(error);
      alert('No se pudo cargar el PDF');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    URL.revokeObjectURL(pdfUrl);
    setPdfUrl('');
  };

  // PASO 1: Capturar datos del formulario y enviar código
  const handlePaso1 = async (data) => {
    if (!acceptTerms) {
      await Swal.fire({
        title: 'Debes aceptar los términos',
        text: 'Por favor, acepta los Términos y Condiciones y la Política de Privacidad para continuar.',
        icon: 'warning',
        customClass: { popup: 'swal-popup-custom' },
      });
      return;
    }

    // Verificar si ya se alcanzó el límite de intentos
    if (intentos >= MAX_INTENTOS) {
      await enviarNotificacionAdministrador(data, 'Límite de intentos alcanzado');
      
      await Swal.fire({
        title: 'Límite de intentos alcanzado',
        html: `
          <div style="text-align: left;">
            <p>Has alcanzado el número máximo de intentos (${MAX_INTENTOS}) para este correo.</p>
            <br>
            <p><strong>Nuestro equipo ha sido notificado y se comunicará contigo pronto.</strong></p>
          </div>
        `,
        icon: 'warning',
        confirmButtonText: 'Entendido',
        customClass: { popup: 'swal-popup-custom' },
      });
      return;
    }

    try {
      const res = await olvidarContraSin(data.email);
      const code = res?.response?.code;

      if (!code) {
        await enviarNotificacionAdministrador(data, 'Código de verificación no recibido en paso 1');
        
        await Swal.fire({
          title: 'Problema con el envío del código',
          html: `
            <div style="text-align: left;">
              <p><strong>No pudimos enviar el código de verificación a tu correo.</strong></p>
              <br>
              <p>📞 <strong>¿Qué puedes hacer?</strong></p>
              <ul style="text-align: left; margin-left: 20px;">
                <li>Revisa tu carpeta de <strong>spam</strong> o <strong>correo no deseado</strong></li>
                <li>Verifica que escribiste correctamente tu correo</li>
                <li>Intenta nuevamente en unos minutos</li>
              </ul>
              <br>
              <p>💬 <strong>Nuestro equipo se comunicará contigo pronto para ayudarte a completar tu registro.</strong></p>
            </div>
          `,
          icon: 'info',
          confirmButtonText: 'Entendido',
          customClass: { popup: 'swal-popup-custom' },
        });
        return;
      }

      // Guardar datos del formulario y código
      setDatosFormulario(data);
      setCodigoEnviado(code);
      setIntentos(prev => prev + 1);
      setPaso(2); // Ir al paso 2
      iniciarTemporizador();

      await Swal.fire({
        title: '¡Código enviado!',
        text: 'Revisa tu correo para el código de verificación.',
        icon: 'success',
        customClass: { popup: 'swal-popup-custom' },
      });

    } catch (error) {
      console.error('Error en paso 1:', error);
      await enviarNotificacionAdministrador(data, 'Error técnico en paso 1');
      
      await Swal.fire({
        title: 'Error técnico',
        html: `
          <div style="text-align: left;">
            <p>Ocurrió un problema técnico durante el envío del código.</p>
            <br>
            <p><strong>Nuestro equipo ha sido notificado y se comunicará contigo pronto.</strong></p>
          </div>
        `,
        icon: 'error',
        confirmButtonText: 'Entendido',
        customClass: { popup: 'swal-popup-custom' },
      });
    }
  };

  // PASO 2: Verificar código
  const handlePaso2 = async () => {
    if (codigoIngresado.trim() !== (codigoEnviado || '').toString().trim()) {
      await Swal.fire({
        title: 'Código incorrecto',
        text: 'El código ingresado no es válido',
        icon: 'error',
        customClass: { popup: 'swal-popup-custom' },
      });
      
      // Enviar notificación por código incorrecto
      await enviarNotificacionAdministrador(datosFormulario, 'Código de verificación incorrecto en paso 2');
      return;
    }

    // Código correcto, proceder al paso 3
    setPaso(3);
    
    // Automáticamente intentar crear la cuenta
    setTimeout(() => {
      handlePaso3();
    }, 1000);
  };

  // PASO 3: Crear cuenta
  const handlePaso3 = async () => {
    if (!datosFormulario) {
      await Swal.fire({
        title: 'Error',
        text: 'No se encontraron los datos del formulario.',
        icon: 'error',
        customClass: { popup: 'swal-popup-custom' },
      });
      setPaso(1);
      return;
    }

    try {
      const { confirmPassword, ...datosRegistro } = datosFormulario;
      const datos = {
        ...datosRegistro,
        phone: `${phonePrefix}${datosRegistro.phone}`,
        status: 1,
      };

      const resRegistrar = await RegistrarCliente(datos);

      if (resRegistrar?.success) {
        await Swal.fire({
          title: '¡Cuenta creada exitosamente!',
          text: 'Tu cuenta ha sido registrada exitosamente',
          icon: 'success',
          customClass: { popup: 'swal-popup-custom' },
        });
        window.location.href = '/login';
      } else {
        // CONDICIÓN MUY IMPORTANTE: Si falla la creación después de verificar código
        await enviarNotificacionAdministrador(datosFormulario, 'Error al crear cuenta en paso 3 - Código verificado correctamente pero falló la creación');
        
        await Swal.fire({
          title: 'Error al crear cuenta',
          html: `
            <div style="text-align: left;">
              <p>❌ <strong>Ocurrió un problema al crear tu cuenta</strong>, aunque el código de verificación era correcto.</p>
              <br>
              <p>📧 <strong>Nuestro equipo técnico ha sido notificado automáticamente y se comunicará contigo para resolver este problema.</strong></p>
              <br>
              <p><strong>Posibles causas:</strong></p>
              <ul style="text-align: left; margin-left: 20px;">
                <li>El correo electrónico ya está registrado</li>
                <li>Error temporal del servidor</li>
                <li>Problema de conexión</li>
              </ul>
              <br>
              <p>💬 <strong>Te contactaremos pronto para ayudarte a completar tu registro.</strong></p>
            </div>
          `,
          icon: 'error',
          confirmButtonText: 'Entendido',
          customClass: { popup: 'swal-popup-custom' },
        });

        // Volver al paso 1 para permitir reintentar
        setPaso(1);
        setDatosFormulario(null);
        setCodigoEnviado(null);
        setCodigoIngresado('');
      }
    } catch (error) {
      console.error('Error en paso 3:', error);
      
      // Enviar notificación por error técnico en paso 3
      await enviarNotificacionAdministrador(datosFormulario, 'Error técnico en paso 3 - Excepción durante creación de cuenta');
      
      await Swal.fire({
        title: 'Error técnico',
        html: `
          <div style="text-align: left;">
            <p>⚠️ <strong>Ocurrió un problema técnico al crear tu cuenta.</strong></p>
            <br>
            <p>📧 <strong>Nuestro equipo ha sido notificado y se comunicará contigo pronto para resolver este inconveniente.</strong></p>
            <br>
            <p>🔄 Puedes intentar nuevamente o esperar a que nos contactemos contigo.</p>
          </div>
        `,
        icon: 'error',
        confirmButtonText: 'Entendido',
        customClass: { popup: 'swal-popup-custom' },
      });

      // Volver al paso 1
      setPaso(1);
      setDatosFormulario(null);
      setCodigoEnviado(null);
      setCodigoIngresado('');
    }
  };

  const onSubmit = async (data) => {
    switch (paso) {
      case 1:
        await handlePaso1(data);
        break;
      case 2:
        await handlePaso2();
        break;
      case 3:
        // El paso 3 se ejecuta automáticamente
        break;
      default:
        break;
    }
  };

  const volverAtras = () => {
    if (paso === 2) {
      setPaso(1);
      setCodigoIngresado('');
      setDatosFormulario(null);
      setCodigoEnviado(null);
    } else if (paso === 3) {
      setPaso(2);
    }
  };

  const password = watch('password');
  const confirmPassword = watch('confirmPassword');
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  // Efecto para iniciar temporizador cuando llega al paso 2
  useEffect(() => {
    if (paso === 2 && tiempoRestante === 0 && !puedeReenviar) {
      iniciarTemporizador();
    }
  }, [paso]);

  return (
    <div className={styles.customContainer}>
      <div className={styles.bodySignin}>
        <div className={styles.card}>
          {/* Botón volver */}
          <button
            type="button"
            className={styles.volver}
            onClick={cancel}
            value="Volver"
          >
            <Icon icon="mdi:arrow-left" width="16" height="16" />
          </button>

          {/* Sección izquierda - Logo */}
          <div className={styles.cardLeft}>
            <img src={Logo} alt="Logo Consultoría JAS" className={styles.logoImg} />
          </div>

          {/* Línea divisoria */}
          <div className={styles.verticalLine}></div>

          {/* Sección derecha - Formulario */}
          <div className={styles.cardRight}>
            <div className={styles.header}>
              <h1 className={styles.title}>
                {getTituloActual()}
              </h1>
              <p className={styles.subtitle}>
                {getSubtituloActual()}
              </p>
              
              {/* Indicador de pasos */}
              <div className={styles.stepIndicator || 'step-indicator'} style={{ margin: '15px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: paso >= 1 ? '#007bff' : '#e0e0e0',
                    transition: 'all 0.3s ease'
                  }}></div>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: paso >= 2 ? '#007bff' : '#e0e0e0',
                    transition: 'all 0.3s ease'
                  }}></div>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: paso >= 3 ? '#007bff' : '#e0e0e0',
                    transition: 'all 0.3s ease'
                  }}></div>
                </div>
                <p style={{ textAlign: 'center', fontSize: '12px', color: '#666', margin: '5px 0 0 0' }}>
                  Paso {paso} de 3
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
              {/* PASO 1: Formulario de registro */}
              {paso === 1 && (
                <div className={styles.formGrid}>
                  {/* Nombre */}
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>
                      <FaUser className={styles.labelIcon} />
                      Nombre completo
                    </label>
                    <div className={styles.inputWrapper}>
                      <input
                        type="text"
                        placeholder="Ingresa tu nombre completo"
                        {...register('name')}
                        className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                        autoComplete="name"
                        defaultValue={datosFormulario?.name || ''}
                      />
                    </div>
                    {errors.name && (
                      <span className={styles.errorMessage}>{errors.name.message}</span>
                    )}
                  </div>

                  {/* Email */}
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>
                      <FaEnvelope className={styles.labelIcon} />
                      Correo electrónico
                    </label>
                    <div className={styles.inputWrapper}>
                      <input
                        type="email"
                        placeholder="ejemplo@correo.com"
                        {...register('email')}
                        className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                        autoComplete="email"
                        defaultValue={datosFormulario?.email || ''}
                      />
                    </div>
                    {errors.email && (
                      <span className={styles.errorMessage}>{errors.email.message}</span>
                    )}
                  </div>

                  {/* Contraseña */}
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>
                      <FaShieldAlt className={styles.labelIcon} />
                      Contraseña
                    </label>
                    <div className={styles.inputWrapper}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Crea una contraseña segura"
                        {...register('password')}
                        className={`${styles.input} ${styles.inputPassword} ${errors.password ? styles.inputError : ''}`}
                        autoComplete="new-password"
                        defaultValue={datosFormulario?.password || ''}
                      />
                      <button
                        type="button"
                        className={styles.passwordToggle}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {errors.password && (
                      <span className={styles.errorMessage}>{errors.password.message}</span>
                    )}
                  </div>

                  {/* Confirmar contraseña */}
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>
                      <FaShieldAlt className={styles.labelIcon} />
                      Confirmar contraseña
                      {passwordsMatch && (
                        <FaCheck className={styles.checkIcon} style={{ color: '#10b981', marginLeft: '8px' }} />
                      )}
                    </label>
                    <div className={styles.inputWrapper}>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirma tu contraseña"
                        {...register('confirmPassword')}
                        className={`${styles.input} ${styles.inputPassword} ${errors.confirmPassword ? styles.inputError : passwordsMatch ? styles.inputSuccess : ''}`}
                        autoComplete="new-password"
                        defaultValue={datosFormulario?.confirmPassword || ''}
                      />
                      <button
                        type="button"
                        className={styles.passwordToggle}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <span className={styles.errorMessage}>{errors.confirmPassword.message}</span>
                    )}
                    {!errors.confirmPassword && confirmPassword && passwordsMatch && (
                      <span className={styles.successMessage}>
                        <FaCheck style={{ marginRight: '4px' }} />
                        Las contraseñas coinciden
                      </span>
                    )}
                  </div>

                  {/* Teléfono */}
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>
                      <FaPhone className={styles.labelIcon} />
                      Teléfono
                    </label>
                    <div className={styles.phoneContainer}>
                      <CountrySelect
                        value={phonePrefix}
                        onChange={setPhonePrefix}
                        error={errors.phone}
                      />
                      <div className={styles.phoneInputWrapper}>
                        <input
                          type="tel"
                          placeholder="777 555 3344"
                          {...register('phone')}
                          className={`${styles.input} ${styles.phoneNumberInput} ${errors.phone ? styles.inputError : ''}`}
                          maxLength={10}
                          inputMode="numeric"
                          pattern="\d{10}"
                          defaultValue={datosFormulario?.phone || ''}
                        />
                      </div>
                    </div>
                    {errors.phone && (
                      <span className={styles.errorMessage}>{errors.phone.message}</span>
                    )}
                  </div>

                  {/* Términos y condiciones */}
                  <div className={styles.terms}>
                    <label>
                      <input
                        type="checkbox"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                      />{' '}
                      Acepto los{' '}
                      <a href="#" onClick={(e) => { e.preventDefault(); handleViewPdf('terminos'); }}>
                        Términos y Condiciones
                      </a>{' '}
                      y la{' '}
                      <a href="#" onClick={(e) => { e.preventDefault(); handleViewPdf('privacidad'); }}>
                        Política de Privacidad
                      </a>.
                    </label>
                  </div>
                </div>
              )}

              {/* PASO 2: Verificación de código */}
              {paso === 2 && (
                <div className={styles.verificationSection}>
                  <div className={styles.verificationCard}>
                    <div className={styles.verificationIcon}>
                      <FaEnvelope />
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Código de verificación</label>
                      <div className={styles.inputWrapper}>
                        <input
                          type="text"
                          placeholder="Ingresa el código de 6 dígitos"
                          value={codigoIngresado}
                          onChange={(e) => setCodigoIngresado(e.target.value)}
                          className={`${styles.input} ${styles.codeInput}`}
                          maxLength={6}
                          inputMode="numeric"
                          autoFocus
                        />
                      </div>
                      <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                        Código enviado a: <strong>{datosFormulario?.email}</strong>
                      </p>
                    </div>

                    {/* Sección de reenvío */}
                    <div className={styles.resendSection || 'resend-section'}>
                      {tiempoRestante > 0 ? (
                        <p className={styles.timerText || 'timer-text'}>
                          Puedes solicitar un nuevo código en {tiempoRestante} segundos
                        </p>
                      ) : (
                        <div className={styles.resendOptions || 'resend-options'}>
                          {intentos < MAX_INTENTOS && (
                            <button
                              type="button"
                              onClick={reenviarCodigo}
                              className={`${styles.button} ${styles.buttonSecondary} ${styles.resendButton || 'resend-button'}`}
                              disabled={!puedeReenviar}
                            >
                              Reenviar código 
                              {intentos > 0 && ` (${MAX_INTENTOS - intentos} intentos restantes)`}
                            </button>
                          )}
                          
                          {intentos >= MAX_INTENTOS && (
                            <div className={styles.maxAttemptsMessage || 'max-attempts-message'}>
                              <p style={{ color: '#f56565', fontSize: '14px', textAlign: 'center' }}>
                                Has alcanzado el límite de intentos. Nuestro equipo se comunicará contigo.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <p className={styles.helpText || 'help-text'} style={{ fontSize: '12px', color: '#888', textAlign: 'center', margin: '10px 0 0 0' }}>
                        ¿No encuentras el correo? Revisa tu carpeta de spam o correo no deseado.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* PASO 3: Procesando cuenta */}
              {paso === 3 && (
                <div className={styles.processingSection || 'processing-section'}>
                  <div style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '20px'
                  }}>
                    <div className={styles.spinner} style={{
                      width: '50px',
                      height: '50px',
                      border: '4px solid #f3f3f3',
                      borderTop: '4px solid #007bff',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    <h3 style={{ color: '#333', margin: '0' }}>Creando tu cuenta...</h3>
                    <p style={{ color: '#666', margin: '0', fontSize: '14px' }}>
                      Procesando tus datos, esto tomará unos segundos
                    </p>
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      ✓ Código verificado<br/>
                      ⏳ Creando cuenta...
                    </div>
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className={styles.actions}>
                {(paso === 2 || paso === 3) && (
                  <button
                    type="button"
                    className={`${styles.button} ${styles.buttonSecondary}`}
                    onClick={volverAtras}
                    disabled={paso === 3} // No permitir volver atrás durante el procesamiento
                  >
                    <MdArrowBack />
                    Volver
                  </button>
                )}
                <button
                  type="button"
                  className={`${styles.button} ${styles.buttonOutline}`}
                  onClick={cancel}
                  disabled={paso === 3} // No permitir cancelar durante el procesamiento
                >
                  <MdClose />
                  Cancelar
                </button>
                {paso !== 3 && (
                  <button
                    type="submit"
                    className={`${styles.button} ${styles.buttonPrimary}`}
                    disabled={isSubmitting || (paso === 1 && intentos >= MAX_INTENTOS)}
                  >
                    {isSubmitting ? (
                      <div className={styles.spinner}></div>
                    ) : (
                      <>
                        {paso === 1 ? 'Enviar código' : paso === 2 ? 'Verificar código' : ''}
                        <FaCheck />
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
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

      {/* Estilos para animación del spinner */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
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
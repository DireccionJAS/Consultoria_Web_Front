import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Swal from 'sweetalert2';
import { RegistrarCliente, olvidarContraSin, enviarCorreoConDatos } from '../../api/api.js';
import styles from './../../styles/Signin.module.css';
import { MdClose, MdOpenInNew, MdDownload } from 'react-icons/md';
import Logo from './../../img/logo_letras_negras.png';

/* ============ Iconos inline (mismo set visual que el diseño) ============ */
function BackIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>; }
function ArrowIcon() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 17L17 7M7 7h10v10" /></svg>; }
function UserIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="7" r="4" /><path d="M3 21v-1a7 7 0 0 1 14 0v1" /></svg>; }
function MailIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 6l-10 7L2 6" /></svg>; }
function LockIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>; }
function PhoneIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg>; }
function EyeIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>; }
function CheckIcon({ size = 12 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>; }
function ChevronDownIcon() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--muted)' }}><path d="M6 9l6 6 6-6" /></svg>; }
function AlertIcon() { return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>; }
function ClockIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>; }

/* ============ PDF Modal (sin cambios de diseño, ya funcional) ============ */
const PdfModal = ({ showModal, pdfUrl, onClose, pdfType }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    setIsMobile(/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent));
    setIsIOS(/iphone|ipad|ipod/i.test(userAgent));
  }, []);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${pdfType || 'documento'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = () => window.open(pdfUrl, '_blank');

  if (!showModal) return null;

  return (
    <div style={stylesModal.overlay}>
      <div style={stylesModal.modal}>
        <div style={stylesModal.header}>
          <h3 style={stylesModal.title}>{pdfType === 'terminos' ? 'Términos y Condiciones' : 'Política de Privacidad'}</h3>
          <button onClick={onClose} style={stylesModal.closeButton}><MdClose size={24} /></button>
        </div>
        <div style={stylesModal.content}>
          {isMobile ? (
            <div style={stylesModal.mobileContainer}>
              <div style={stylesModal.mobileIcon}>📄</div>
              <h4 style={stylesModal.mobileTitle}>Visualizar documento PDF</h4>
              <p style={stylesModal.mobileText}>
                {isIOS ? 'En iOS, los PDFs se abren mejor en una nueva pestaña o descargándolos.' : 'En Android, recomendamos descargar el documento para una mejor visualización.'}
              </p>
              <div style={stylesModal.mobileActions}>
                <button onClick={handleOpenInNewTab} style={stylesModal.actionButton}><MdOpenInNew size={20} />Abrir en nueva pestaña</button>
              </div>
            </div>
          ) : (
            <div style={stylesModal.desktopContainer}>
              <div style={stylesModal.desktopActions}>
                <button onClick={handleOpenInNewTab} style={stylesModal.actionButtonSmall} title="Abrir en nueva pestaña"><MdOpenInNew size={16} /></button>
                <button onClick={handleDownload} style={stylesModal.actionButtonSmall} title="Descargar PDF"><MdDownload size={16} /></button>
              </div>
              <iframe src={pdfUrl} title="PDF Viewer" style={stylesModal.desktopIframe} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const stylesModal = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '10px' },
  modal: { position: 'relative', width: '90%', maxWidth: '900px', height: '90%', maxHeight: '800px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid #e5e5e5', backgroundColor: '#f8f9fa' },
  title: { margin: 0, fontSize: '18px', fontWeight: '600', color: '#333' },
  closeButton: { background: 'black', border: 'none', cursor: 'pointer', color: 'white', padding: '5px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background-color 0.2s' },
  content: { flex: 1, display: 'flex', flexDirection: 'column' },
  mobileContainer: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' },
  mobileIcon: { fontSize: '60px', marginBottom: '20px' },
  mobileTitle: { fontSize: '20px', fontWeight: '600', marginBottom: '10px', color: '#333' },
  mobileText: { fontSize: '14px', color: '#666', marginBottom: '25px', lineHeight: '1.5', maxWidth: '300px' },
  mobileActions: { display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '280px' },
  actionButton: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '500', cursor: 'pointer', transition: 'background-color 0.2s' },
  desktopContainer: { flex: 1, display: 'flex', flexDirection: 'column' },
  desktopActions: { display: 'flex', gap: '8px', padding: '10px 15px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #e5e5e5' },
  actionButtonSmall: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', transition: 'background-color 0.2s' },
  desktopIframe: { flex: 1, border: 'none', width: '100%' },
};

const countryOptions = [
  { value: '+54', label: 'Argentina', flag: '🇦🇷' },
  { value: '+1', label: 'Bahamas', flag: '🇧🇸' },
  { value: '+1', label: 'Barbados', flag: '🇧🇧' },
  { value: '+501', label: 'Belize', flag: '🇧🇿' },
  { value: '+55', label: 'Brazil', flag: '🇧🇷' },
  { value: '+591', label: 'Bolivia', flag: '🇧🇴' },
  { value: '+1', label: 'Canada', flag: '🇨🇦' },
  { value: '+56', label: 'Chile', flag: '🇨🇱' },
  { value: '+57', label: 'Colombia', flag: '🇨🇴' },
  { value: '+506', label: 'Costa Rica', flag: '🇨🇷' },
  { value: '+599', label: 'Curacao', flag: '🇨🇼' },
  { value: '+1', label: 'República Dominicana', flag: '🇩🇴' },
  { value: '+593', label: 'Ecuador', flag: '🇪🇨' },
  { value: '+503', label: 'El Salvador', flag: '🇸🇻' },
  { value: '+502', label: 'Guatemala', flag: '🇬🇹' },
  { value: '+592', label: 'Guyana', flag: '🇬🇾' },
  { value: '+509', label: 'Haiti', flag: '🇭🇹' },
  { value: '+1', label: 'Jamaica', flag: '🇯🇲' },
  { value: '+52', label: 'México', flag: '🇲🇽' },
  { value: '+505', label: 'Nicaragua', flag: '🇳🇮' },
  { value: '+507', label: 'Panamá', flag: '🇵🇦' },
  { value: '+595', label: 'Paraguay', flag: '🇵🇾' },
  { value: '+51', label: 'Perú', flag: '🇵🇪' },
  { value: '+597', label: 'Suriname', flag: '🇸🇷' },
  { value: '+1', label: 'Trinidad y Tobago', flag: '🇹🇹' },
  { value: '+598', label: 'Uruguay', flag: '🇺🇾' },
];

const CountrySelect = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapRef = useRef(null);

  const selectedCountry = countryOptions.find((o) => o.value === value) || countryOptions.find((o) => o.value === '+52');
  const filteredOptions = countryOptions.filter((o) => o.label.toLowerCase().includes(searchTerm.toLowerCase()) || o.value.includes(searchTerm));

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
    setSearchTerm('');
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <div className={styles.countrySelect} onClick={() => setIsOpen((o) => !o)}>
        <span className={styles.countryFlag}>{selectedCountry.flag}</span>
        <span className={styles.countryCode}>{selectedCountry.value}</span>
        <ChevronDownIcon />
      </div>
      {isOpen && (
        <div className={styles.countryDropdown}>
          <input
            type="text"
            placeholder="Buscar país..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.countrySearch}
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
          <div className={styles.countryList}>
            {filteredOptions.map((option) => (
              <div
                key={option.label}
                className={`${styles.countryOption} ${selectedCountry?.value === option.value ? styles.selected : ''}`}
                onClick={() => handleSelect(option)}
              >
                <span className={styles.countryFlag}>{option.flag}</span>
                <span className={styles.countryOptionLabel}>{option.label}</span>
                <span className={styles.countryOptionCode}>({option.value})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

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

const MAX_INTENTOS = 3;
const TIEMPO_ESPERA = 60;

export default function Signin({ onCancel }) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [codigoEnviado, setCodigoEnviado] = useState(null);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState(false);
  const [paso, setPaso] = useState(1);
  const [phonePrefix, setPhonePrefix] = useState('+52');
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfType, setPdfType] = useState('');
  const [intentos, setIntentos] = useState(0);
  const [tiempoRestante, setTiempoRestante] = useState(0);
  const [puedeReenviar, setPuedeReenviar] = useState(true);
  const [datosFormulario, setDatosFormulario] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [registroExitoso, setRegistroExitoso] = useState(false);

  const otpRefs = useRef([]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

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
    <tr><td style="padding: 4px; font-weight: bold;">Nombre:</td><td style="padding: 4px;">${data.name}</td></tr>
    <tr><td style="padding: 4px; font-weight: bold;">Correo:</td><td style="padding: 4px;">${data.email}</td></tr>
    <tr><td style="padding: 4px; font-weight: bold;">Teléfono:</td><td style="padding: 4px;">${phonePrefix}${data.phone}</td></tr>
    <tr><td style="padding: 4px; font-weight: bold;">Fecha de intento:</td><td style="padding: 4px;">${new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td></tr>
    <tr><td style="padding: 4px; font-weight: bold;">Intentos realizados:</td><td style="padding: 4px;">${intentos + 1}/${MAX_INTENTOS}</td></tr>
  </table>
  <h3 style="color: #5bc0de;">Acciones Recomendadas:</h3>
  <ol>
    <li>Contactar al cliente vía WhatsApp: <a href="https://wa.me/${phonePrefix.replace('+', '')}${data.phone}" target="_blank">Enviar mensaje</a></li>
    <li>Enviar correo de seguimiento a: <a href="mailto:${data.email}">${data.email}</a></li>
    <li>Verificar manualmente la cuenta en el sistema</li>
    <li>Ayudar al cliente a completar el registro</li>
  </ol>
  <p style="font-size: 12px; color: #777; margin-top: 20px;">
    Este mensaje se genera automáticamente cuando un cliente no puede completar su registro.<br>---<br>Sistema de Registro - Consultoría JAS
  </p>
</div>`;

    try {
      await enviarCorreoConDatos('consultoriacomercializacionjas@gmail.com', asuntoAdmin, mensajeAdmin);
      return true;
    } catch (error) {
      console.error('Error al enviar notificación al administrador:', error);
      return false;
    }
  };

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

  const reenviarCodigo = async () => {
    if (intentos >= MAX_INTENTOS || !datosFormulario) {
      await enviarNotificacionAdministrador(datosFormulario, 'Límite de intentos alcanzado en reenvío');
      await Swal.fire({
        title: 'Límite de intentos alcanzado',
        html: `<div style="text-align: left;"><p>Has alcanzado el número máximo de intentos (${MAX_INTENTOS}) para este correo.</p><br><p><strong>Nuestro equipo ha sido notificado y se comunicará contigo pronto para ayudarte a completar tu registro.</strong></p></div>`,
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
          html: `<div style="text-align: left;"><p>No se pudo reenviar el código de verificación.</p><br><p><strong>Nuestro equipo técnico ha sido notificado y te contactaremos pronto.</strong></p></div>`,
          icon: 'warning',
          confirmButtonText: 'Entendido',
          customClass: { popup: 'swal-popup-custom' },
        });
        return;
      }

      setCodigoEnviado(code);
      setOtpDigits(['', '', '', '', '', '']);
      setOtpError(false);
      setIntentos((prev) => prev + 1);
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
    if (onCancel) onCancel();
    else window.history.back();
  };

  const handleViewPdf = async (tipo) => {
    try {
      const UrlApi = import.meta.env.VITE_API_URL;
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

    if (intentos >= MAX_INTENTOS) {
      await enviarNotificacionAdministrador(data, 'Límite de intentos alcanzado');
      await Swal.fire({
        title: 'Límite de intentos alcanzado',
        html: `<div style="text-align: left;"><p>Has alcanzado el número máximo de intentos (${MAX_INTENTOS}) para este correo.</p><br><p><strong>Nuestro equipo ha sido notificado y se comunicará contigo pronto.</strong></p></div>`,
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
          html: `<div style="text-align: left;"><p><strong>No pudimos enviar el código de verificación a tu correo.</strong></p><br><p>📞 <strong>¿Qué puedes hacer?</strong></p><ul style="text-align: left; margin-left: 20px;"><li>Revisa tu carpeta de <strong>spam</strong> o <strong>correo no deseado</strong></li><li>Verifica que escribiste correctamente tu correo</li><li>Intenta nuevamente en unos minutos</li></ul><br><p>💬 <strong>Nuestro equipo se comunicará contigo pronto para ayudarte a completar tu registro.</strong></p></div>`,
          icon: 'info',
          confirmButtonText: 'Entendido',
          customClass: { popup: 'swal-popup-custom' },
        });
        return;
      }

      setDatosFormulario(data);
      setCodigoEnviado(code);
      setOtpDigits(['', '', '', '', '', '']);
      setOtpError(false);
      setIntentos((prev) => prev + 1);
      setPaso(2);
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
        html: `<div style="text-align: left;"><p>Ocurrió un problema técnico durante el envío del código.</p><br><p><strong>Nuestro equipo ha sido notificado y se comunicará contigo pronto.</strong></p></div>`,
        icon: 'error',
        confirmButtonText: 'Entendido',
        customClass: { popup: 'swal-popup-custom' },
      });
    }
  };

  const handlePaso2 = async () => {
    const codigoIngresado = otpDigits.join('');
    if (codigoIngresado.length < 6 || codigoIngresado.trim() !== (codigoEnviado || '').toString().trim()) {
      setOtpError(true);
      await Swal.fire({
        title: 'Código incorrecto',
        text: 'El código ingresado no es válido',
        icon: 'error',
        customClass: { popup: 'swal-popup-custom' },
      });
      await enviarNotificacionAdministrador(datosFormulario, 'Código de verificación incorrecto en paso 2');
      return;
    }

    setOtpError(false);
    setPaso(3);
    setProcesando(true);
    setTimeout(() => { handlePaso3(); }, 1000);
  };

  const handlePaso3 = async () => {
    if (!datosFormulario) {
      await Swal.fire({ title: 'Error', text: 'No se encontraron los datos del formulario.', icon: 'error', customClass: { popup: 'swal-popup-custom' } });
      setPaso(1);
      setProcesando(false);
      return;
    }

    try {
      const { confirmPassword, ...datosRegistro } = datosFormulario;
      const datos = { ...datosRegistro, phone: `${phonePrefix}${datosRegistro.phone}`, status: 1 };
      const resRegistrar = await RegistrarCliente(datos);

      if (resRegistrar?.success) {
        setProcesando(false);
        setRegistroExitoso(true);
      } else {
        await enviarNotificacionAdministrador(datosFormulario, 'Error al crear cuenta en paso 3 - Código verificado correctamente pero falló la creación');
        await Swal.fire({
          title: 'Error al crear cuenta',
          html: `<div style="text-align: left;"><p>❌ <strong>Ocurrió un problema al crear tu cuenta</strong>, aunque el código de verificación era correcto.</p><br><p>📧 <strong>Nuestro equipo técnico ha sido notificado automáticamente y se comunicará contigo para resolver este problema.</strong></p><br><p><strong>Posibles causas:</strong></p><ul style="text-align: left; margin-left: 20px;"><li>El correo electrónico ya está registrado</li><li>Error temporal del servidor</li><li>Problema de conexión</li></ul><br><p>💬 <strong>Te contactaremos pronto para ayudarte a completar tu registro.</strong></p></div>`,
          icon: 'error',
          confirmButtonText: 'Entendido',
          customClass: { popup: 'swal-popup-custom' },
        });
        setPaso(1);
        setProcesando(false);
        setDatosFormulario(null);
        setCodigoEnviado(null);
        setOtpDigits(['', '', '', '', '', '']);
      }
    } catch (error) {
      console.error('Error en paso 3:', error);
      await enviarNotificacionAdministrador(datosFormulario, 'Error técnico en paso 3 - Excepción durante creación de cuenta');
      await Swal.fire({
        title: 'Error técnico',
        html: `<div style="text-align: left;"><p>⚠️ <strong>Ocurrió un problema técnico al crear tu cuenta.</strong></p><br><p>📧 <strong>Nuestro equipo ha sido notificado y se comunicará contigo pronto para resolver este inconveniente.</strong></p><br><p>🔄 Puedes intentar nuevamente o esperar a que nos contactemos contigo.</p></div>`,
        icon: 'error',
        confirmButtonText: 'Entendido',
        customClass: { popup: 'swal-popup-custom' },
      });
      setPaso(1);
      setProcesando(false);
      setDatosFormulario(null);
      setCodigoEnviado(null);
      setOtpDigits(['', '', '', '', '', '']);
    }
  };

  const onSubmit = async (data) => {
    if (paso === 1) await handlePaso1(data);
  };

  const volverAtras = () => {
    if (paso === 2) {
      setPaso(1);
      setOtpDigits(['', '', '', '', '', '']);
      setOtpError(false);
      setDatosFormulario(null);
      setCodigoEnviado(null);
    }
  };

  const handleOtpChange = (index, rawValue) => {
    const val = rawValue.replace(/\D/g, '').slice(-1);
    setOtpDigits((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
    setOtpError(false);
    if (val && otpRefs.current[index + 1]) otpRefs.current[index + 1].focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && otpRefs.current[index - 1]) {
      otpRefs.current[index - 1].focus();
    }
  };

  const password = watch('password');
  const confirmPassword = watch('confirmPassword');
  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const name = watch('name');

  useEffect(() => {
    if (paso === 2 && tiempoRestante === 0 && !puedeReenviar) {
      iniciarTemporizador();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paso]);

  const formatTimer = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const initials = (fullName) => {
    if (!fullName) return '';
    const parts = fullName.trim().split(/\s+/);
    return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
  };

  const progressLabel = paso === 1
    ? 'Paso 1 de 3 · Datos personales'
    : paso === 2
      ? 'Paso 2 de 3 · Verificación de correo'
      : 'Paso 3 de 3 · ¡Cuenta creada!';

  return (
    <div className={styles.registerPage}>
      {/* LEFT BRAND PANEL */}
      <section className={styles.brandPanel}>
        <div className={styles.brandBg}></div>
        <div className={styles.brandGrid}></div>

        <div className={styles.brandTop}>
          <button type="button" onClick={cancel} className={styles.backBtn}>
            <BackIcon />
            Volver al sitio
          </button>
          <div className={styles.brandMark}>
            <img src={Logo} alt="JAS" />
            <div>
              <div className={styles.brandMarkText}>Consultoría <em>JAS</em></div>
              <div className={styles.brandMarkTag}>Crear cuenta</div>
            </div>
          </div>
        </div>

        <div className={styles.brandHero}>
          <div className={styles.brandEyebrow}>— Únete a JAS</div>
          <h1 className={styles.brandTitle}>Crea tu cuenta<br />en <em>3 pasos.</em></h1>
          <p className={styles.brandSub}>
            Regístrate para contratar servicios, dar seguimiento a tus trámites y agendar tus citas — todo desde tu portal personal.
          </p>
        </div>

        <div className={styles.brandSteps}>
          {[
            { n: 1, title: 'Datos personales', sub: 'Tu información básica' },
            { n: 2, title: 'Verificación', sub: 'Confirma tu correo' },
            { n: 3, title: '¡Listo!', sub: 'Cuenta creada' },
          ].map((s) => (
            <div key={s.n} className={`${styles.bstep} ${paso === s.n ? styles.active : ''} ${paso > s.n ? styles.done : ''}`}>
              <div className={styles.bstepNum}>{paso > s.n ? <CheckIcon /> : s.n}</div>
              <div className={styles.bstepText}>
                <div className={styles.bstepTitle}>{s.title}</div>
                <div className={styles.bstepSub}>{s.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* RIGHT FORM PANEL */}
      <section className={styles.formPanel}>
        <div className={styles.formTop}>
          <span>¿Ya tienes cuenta?</span>
          <a href="/Login" className={styles.loginLink}>Iniciar sesión →</a>
        </div>

        <div className={styles.formCard}>
          <div className={styles.progressHead}>
            <div className={styles.progressTrack}>
              <div className={`${styles.ptrackDot} ${paso === 1 ? styles.active : ''} ${paso > 1 ? styles.done : ''}`}></div>
              <div className={styles.ptrackBar}><div className={styles.fill} style={{ width: paso >= 2 ? '100%' : '0' }}></div></div>
              <div className={`${styles.ptrackDot} ${paso === 2 ? styles.active : ''} ${paso > 2 ? styles.done : ''}`}></div>
              <div className={styles.ptrackBar}><div className={styles.fill} style={{ width: paso >= 3 ? '100%' : '0' }}></div></div>
              <div className={`${styles.ptrackDot} ${paso === 3 ? styles.active : ''}`}></div>
            </div>
            <div className={styles.progressLabel}>{progressLabel}</div>
          </div>

          {/* ===== PASO 1 ===== */}
          {paso === 1 && (
            <form className={styles.stepPane} onSubmit={handleSubmit(onSubmit)}>
              <h2 className={styles.formTitle}>Tus <em>datos.</em></h2>
              <p className={styles.formSub}>Completa tu información para crear tu cuenta en Consultoría JAS.</p>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Nombre completo <span className={styles.req}>*</span></label>
                <div className={`${styles.inputWrap} ${errors.name ? styles.error : name ? styles.valid : ''}`}>
                  <span className={styles.inputIcon}><UserIcon /></span>
                  <input type="text" placeholder="Tu nombre completo" {...register('name')} className={styles.fieldInput} autoComplete="name" defaultValue={datosFormulario?.name || ''} />
                </div>
                {errors.name && <div className={`${styles.fieldMsg} ${styles.error}`}><AlertIcon />{errors.name.message}</div>}
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Correo electrónico <span className={styles.req}>*</span></label>
                <div className={`${styles.inputWrap} ${errors.email ? styles.error : ''}`}>
                  <span className={styles.inputIcon}><MailIcon /></span>
                  <input type="email" placeholder="tu@correo.com" {...register('email')} className={styles.fieldInput} autoComplete="email" defaultValue={datosFormulario?.email || ''} />
                </div>
                {errors.email && <div className={`${styles.fieldMsg} ${styles.error}`}><AlertIcon />{errors.email.message}</div>}
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Contraseña <span className={styles.req}>*</span></label>
                  <div className={`${styles.inputWrap} ${errors.password ? styles.error : ''}`}>
                    <span className={styles.inputIcon}><LockIcon /></span>
                    <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" {...register('password')} className={styles.fieldInput} autoComplete="new-password" defaultValue={datosFormulario?.password || ''} />
                    <button type="button" className={styles.inputToggle} onClick={() => setShowPassword((s) => !s)}><EyeIcon /></button>
                  </div>
                  {errors.password && <div className={`${styles.fieldMsg} ${styles.error}`}><AlertIcon />{errors.password.message}</div>}
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Confirmar <span className={styles.req}>*</span></label>
                  <div className={`${styles.inputWrap} ${errors.confirmPassword ? styles.error : passwordsMatch ? styles.valid : ''}`}>
                    <span className={styles.inputIcon}><LockIcon /></span>
                    <input type={showConfirmPassword ? 'text' : 'password'} placeholder="••••••••" {...register('confirmPassword')} className={styles.fieldInput} autoComplete="new-password" defaultValue={datosFormulario?.confirmPassword || ''} />
                    <button type="button" className={styles.inputToggle} onClick={() => setShowConfirmPassword((s) => !s)}><EyeIcon /></button>
                  </div>
                  {errors.confirmPassword && <div className={`${styles.fieldMsg} ${styles.error}`}><AlertIcon />{errors.confirmPassword.message}</div>}
                  {!errors.confirmPassword && confirmPassword && passwordsMatch && (
                    <div className={`${styles.fieldMsg} ${styles.ok}`}><CheckIcon size={11} />Las contraseñas coinciden</div>
                  )}
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Teléfono <span className={styles.req}>*</span></label>
                <div className={styles.phoneWrap}>
                  <CountrySelect value={phonePrefix} onChange={setPhonePrefix} />
                  <div className={`${styles.inputWrap} ${errors.phone ? styles.error : ''}`} style={{ flex: 1 }}>
                    <span className={styles.inputIcon}><PhoneIcon /></span>
                    <input
                      type="tel"
                      placeholder="777 123 4567"
                      {...register('phone')}
                      className={styles.fieldInput}
                      maxLength={10}
                      inputMode="numeric"
                      defaultValue={datosFormulario?.phone || ''}
                    />
                  </div>
                </div>
                {errors.phone && <div className={`${styles.fieldMsg} ${styles.error}`}><AlertIcon />{errors.phone.message}</div>}
              </div>

              <label className={`${styles.termsRow} ${acceptTerms ? styles.on : ''}`} onClick={() => setAcceptTerms((t) => !t)}>
                <span className={styles.termsCheck}>{acceptTerms && <CheckIcon />}</span>
                <span className={styles.termsText}>
                  Acepto los{' '}
                  <a href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleViewPdf('terminos'); }}>Términos y Condiciones</a>{' '}
                  y la{' '}
                  <a href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleViewPdf('privacidad'); }}>Política de Privacidad</a> de Consultoría JAS.
                </span>
              </label>

              <div className={styles.btnRow}>
                <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={cancel}>Cancelar</button>
                <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isSubmitting || intentos >= MAX_INTENTOS}>
                  {isSubmitting ? 'Enviando…' : 'Enviar código'}
                  <div className={styles.arrowRev}><ArrowIcon /></div>
                </button>
              </div>
            </form>
          )}

          {/* ===== PASO 2: OTP ===== */}
          {paso === 2 && (
            <div className={styles.stepPane}>
              <h2 className={styles.formTitle}>Verifica tu <em>correo.</em></h2>
              <p className={styles.formSub}>Ingresa el código de 6 dígitos que enviamos a tu correo.</p>

              <div className={styles.otpInfo}>
                <div className={styles.otpInfoIcon}><MailIcon /></div>
                <div className={styles.otpInfoText}>
                  <div className={styles.otpInfoTitle}>Código enviado a:</div>
                  <div className={styles.otpInfoMail}>{datosFormulario?.email}</div>
                </div>
              </div>

              <label className={styles.fieldLabel}>Código de verificación <span className={styles.req}>*</span></label>
              <div className={styles.otpInputs}>
                {otpDigits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRefs.current[i] = el)}
                    className={`${styles.otpBox} ${digit ? styles.filled : ''} ${otpError ? styles.error : ''}`}
                    maxLength={1}
                    inputMode="numeric"
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              <div className={styles.otpTimer}>
                <div className={styles.otpTimerLeft}>
                  <div className={styles.otpTimerClock}><ClockIcon /></div>
                  <span>{tiempoRestante > 0 ? 'Puedes reenviar en' : 'Puedes reenviar el código'}</span>
                  {tiempoRestante > 0 && <span className={styles.otpTimerCount}>{formatTimer(tiempoRestante)}</span>}
                </div>
                <div className={styles.otpResend}>
                  ¿No llegó?{' '}
                  <button type="button" onClick={reenviarCodigo} disabled={!puedeReenviar || intentos >= MAX_INTENTOS}>
                    Reenviar
                  </button>
                </div>
              </div>

              <div className={styles.otpAttempts}>
                <div className={styles.attemptDots}>
                  {Array.from({ length: MAX_INTENTOS }).map((_, i) => (
                    <span key={i} className={`${styles.attemptDot} ${i < intentos ? styles.used : ''}`}></span>
                  ))}
                </div>
                {intentos >= MAX_INTENTOS
                  ? 'Has alcanzado el límite de intentos. Nuestro equipo se comunicará contigo.'
                  : `Tienes ${MAX_INTENTOS - intentos} intento${MAX_INTENTOS - intentos === 1 ? '' : 's'} disponible${MAX_INTENTOS - intentos === 1 ? '' : 's'}`}
              </div>

              <div className={styles.btnRow}>
                <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={volverAtras}>
                  <BackIcon />
                  Volver
                </button>
                <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={handlePaso2}>
                  Verificar código
                  <div className={styles.arrowRev}><ArrowIcon /></div>
                </button>
              </div>
            </div>
          )}

          {/* ===== PASO 3: PROCESANDO / ÉXITO ===== */}
          {paso === 3 && (
            <div className={styles.stepPane}>
              {procesando && !registroExitoso && (
                <div className={styles.processingWrap}>
                  <div className={styles.spinner}></div>
                  <h3 className={styles.processingTitle}>Creando tu cuenta…</h3>
                  <p className={styles.processingSub}>Procesando tus datos, esto tomará unos segundos.</p>
                </div>
              )}

              {registroExitoso && (
                <div className={styles.successWrap}>
                  <div className={styles.successIcon}><CheckIcon size={44} /></div>
                  <h2 className={styles.successTitle}>¡Bienvenido a<br /><em>Consultoría JAS!</em></h2>
                  <p className={styles.successSub}>Tu cuenta ha sido creada exitosamente. Ya puedes iniciar sesión y explorar nuestros servicios migratorios.</p>

                  <div className={styles.successCard}>
                    <div className={styles.successCardAvatar}>{initials(datosFormulario?.name)}</div>
                    <div>
                      <div className={styles.successCardName}>{datosFormulario?.name}</div>
                      <div className={styles.successCardMail}>{datosFormulario?.email}</div>
                    </div>
                    <span className={styles.successCardBadge}><CheckIcon size={11} />Verificada</span>
                  </div>

                  <div className={styles.btnRow}>
                    <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={() => navigate('/')}>Ir a la página principal</button>
                    <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => navigate('/Login')}>
                      Iniciar sesión
                      <div className={styles.arrowRev}><ArrowIcon /></div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className={styles.formFoot}>
            <span className={styles.copy}>© 2026 · Consultoría JAS</span>
            <div className={styles.links}>
              <a href="#">Privacidad</a>
              <a href="#">Términos</a>
              <a href="#">Ayuda</a>
            </div>
          </div>
        </div>
      </section>

      {showModal && (
        <PdfModal showModal={showModal} pdfUrl={pdfUrl} pdfType={pdfType} onClose={closeModal} />
      )}
    </div>
  );
}

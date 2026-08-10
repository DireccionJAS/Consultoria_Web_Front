import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import EmpresaSidebar from './EmpresaSidebar.jsx';
import { getAllProcess } from './../../api/api.js';
import styles from './../../styles/EmpresaPaginaPublica.module.css';
import HeaderLogoutButton from './../common/HeaderLogoutButton.jsx';
import aboutMainImg from './../../img/landing/about-main.jpg';
import t1 from './../../img/landing/testimonial-1.jpg';
import t2 from './../../img/landing/testimonial-2.jpg';
import t3 from './../../img/landing/testimonial-3.jpg';
import t4 from './../../img/landing/testimonial-4.jpg';
import t5 from './../../img/landing/testimonial-5.jpg';
import t6 from './../../img/landing/testimonial-6.jpg';
import t7 from './../../img/landing/testimonial-7.jpg';
import t8 from './../../img/landing/testimonial-8.jpg';
import t9 from './../../img/landing/testimonial-9.jpg';

// Extraído 1:1 de "13-ConfigPublica (standalone).html". La landing real
// (src/components/Landing/*.jsx) tiene todo su contenido hardcodeado en
// JSX/CSS — no existe backend (ni entidad Empresa, ni Faq, ni Testimonial,
// ni Sucursal, ni redes sociales, ni horario de atención general) para
// persistir nada de esto todavía. Por eso esta pantalla es UI 1:1 sin
// persistencia: los campos se precargan con los valores REALES que hoy
// están en la landing (no son datos inventados), pero "Publicar cambios"
// no guarda nada. "Vista previa" sí es real: abre la landing pública (/)
// en una pestaña nueva. El "servicio destacado" se calcula en la landing
// como el primer servicio activo del arreglo (ServicesSection.jsx,
// index === 0) — no existe una bandera "destacado" en el backend.

const TAB_KEYS = ['inicio', 'servicios', 'nosotros', 'testimonios', 'faq', 'contacto'];
const TAB_LABELS = { inicio: 'Inicio', servicios: 'Servicios', nosotros: 'Nosotros', testimonios: 'Testimonios', faq: 'FAQ', contacto: 'Contacto' };

const TESTIMONIOS_INICIALES = [
  { id: 1, img: t1, tag: 'Visa B1/B2' },
  { id: 2, img: t2, tag: 'eTA Canadá' },
  { id: 3, img: t3, tag: 'DS-160 × 4' },
  { id: 4, img: t4, tag: 'Visa B1/B2 · Renovación' },
  { id: 5, img: t5, tag: 'Pasaporte SRE' },
  { id: 6, img: t6, tag: 'Simulación + Visa' },
  { id: 7, img: t7, tag: 'eTA Canadá' },
  { id: 8, img: t8, tag: 'Visa B1/B2' },
  { id: 9, img: t9, tag: 'Familia · Múltiple' },
];

const FAQ_INICIALES = [
  { id: 1, question: '¿Cuánto tarda el proceso completo de visa americana?', answer: 'En 2026, el promedio en CDMX es de 8–14 semanas entre el llenado del DS-160 y la entrevista consular. Con JAS conseguimos la primera cita disponible y reducimos el tiempo de espera al mínimo.' },
  { id: 2, question: '¿Qué documentos necesito para mi visa?', answer: 'Pasaporte vigente con 6 meses, comprobante de domicilio, comprobante de ingresos, foto digital 5×5 cm con fondo blanco y, si aplica, documentos de arraigo familiar y laboral. Te enviamos una lista personalizada.' },
  { id: 3, question: '¿Tienen garantía de aprobación?', answer: 'La decisión consular es soberana, así que ninguna consultoría seria puede garantizar al 100%. Lo que sí garantizamos es preparar tu caso con la máxima rigurosidad — nuestra tasa de aprobación es del 96%.' },
  { id: 4, question: '¿Qué pasa si mi visa es rechazada?', answer: 'Analizamos las razones del rechazo y te asesoramos en la reapertura del caso sin costo adicional. Nuestro objetivo es que viajes — no cobrarte de nuevo.' },
  { id: 5, question: '¿Aceptan meses sin intereses?', answer: 'Sí. Aceptamos efectivo, transferencia, débito y crédito. Para algunos servicios ofrecemos hasta 3 meses sin intereses con tarjetas participantes.' },
  { id: 6, question: '¿Atienden trámites urgentes?', answer: 'Sí, tenemos un proceso expedito para emergencias médicas, familiares o de trabajo. Llámanos al 777 395 6677 y un consultor evalúa tu caso el mismo día.' },
];

const UBICACIONES_INICIALES = [
  { id: 1, titulo: 'Sucursal Jiutepec', direccion: 'Calle Pablo Torres 18 · Centro · 62550' },
];

// Ubicaciones del Hero: sin backend todavía (igual que el resto de esta
// pantalla), se persisten en localStorage para que HeroSection.jsx pinte
// un pill por cada una en la landing real. Si no hay nada guardado, tanto
// aquí como en HeroSection.jsx se cae a "Jiutepec, Morelos" (la única que
// existe hoy hardcodeada).
export const HERO_UBICACIONES_STORAGE_KEY = 'empresaHeroUbicacionesConfig';
const HERO_UBICACION_DEFAULT = 'Jiutepec, Morelos';

function cargarHeroUbicacionesGuardadas() {
  try {
    const raw = localStorage.getItem(HERO_UBICACIONES_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

function escapeAttr(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function IconHome() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 12L12 3l9 9v9a2 2 0 0 1-2 2h-4v-7H10v7H6a2 2 0 0 1-2-2v-9z"></path></svg>; }
function IconEye() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>; }
function IconCheck() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12l5 5L20 7"></path></svg>; }
function IconInfo({ size = 16 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4M12 8h.01"></path></svg>; }
function IconTrophy() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2l2.4 7.4H22l-6 4.5 2.3 7.1-6.3-4.6L5.7 21 8 13.9 2 9.4h7.6z"></path></svg>; }
function IconTrendUp() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><path d="M22 4L12 14.01l-3-3"></path></svg>; }
function IconUsers() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="8" r="4"></circle><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2M17 11l2 2 4-4"></path></svg>; }
function IconPlay() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="4" width="20" height="14" rx="2"></rect><polygon points="10 8 16 11 10 14 10 8" fill="currentColor"></polygon></svg>; }
function IconHelp() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"></circle><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01"></path></svg>; }
function IconPin({ size = 18 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>; }
function IconGlobe2() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"></circle><path d="M2 12h20"></path></svg>; }
function IconClock() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg>; }
function IconSwap() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"></path></svg>; }
function IconTrashSm({ size = 15 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path></svg>; }
function IconEditSm({ size = 14 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"></path></svg>; }
function IconPlus({ size = 14 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"></path></svg>; }
function IconClose({ size = 12 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 6l12 12M6 18L18 6"></path></svg>; }
function IconGrip() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="6" r="1"></circle><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="18" r="1"></circle><circle cx="15" cy="6" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="18" r="1"></circle></svg>; }
function IconFacebook() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>; }
function IconInstagram() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"></rect><circle cx="12" cy="12" r="4"></circle><circle cx="17.5" cy="6.5" r="1" fill="currentColor"></circle></svg>; }
function IconTiktok() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9a5 5 0 0 1-3-1v6.5a5.5 5.5 0 1 1-5.5-5.5V13a2.5 2.5 0 1 0 2.5 2.5V3h2.5a3 3 0 0 0 3.5 3z"></path></svg>; }
function IconCheckFaq() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"></path></svg>; }

function UploadRow({ thumbStyle, title, sub, onPick, onClear }) {
  const inputId = `upload-${title.replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <div className={styles.upload}>
      <div className={styles.uploadThumb} style={thumbStyle}></div>
      <div className={styles.uploadInfo}>
        <div className={styles.uploadTitle}>{title}</div>
        <div className={styles.uploadSub}>{sub}</div>
      </div>
      <div className={styles.uploadActions}>
        <input id={inputId} type="file" accept="image/*" hidden onChange={(e) => e.target.files[0] && onPick(e.target.files[0])} />
        <button type="button" className={styles.uaBtn} title="Cambiar" onClick={() => document.getElementById(inputId).click()}><IconSwap /></button>
        <button type="button" className={`${styles.uaBtn} ${styles.del}`} title="Quitar" onClick={onClear}><IconTrashSm /></button>
      </div>
    </div>
  );
}

export default function EmpresaPaginaPublica() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const tab = TAB_KEYS.includes(tabParam) ? tabParam : 'inicio';
  const setTab = (key) => setSearchParams({ tab: key });

  // Inicio (real: HeroSection.jsx)
  const heroUbicacionesGuardadas = useMemo(() => cargarHeroUbicacionesGuardadas(), []);
  const [heroUbicaciones, setHeroUbicaciones] = useState(
    (heroUbicacionesGuardadas || [HERO_UBICACION_DEFAULT]).map((texto, i) => ({ id: i + 1, texto }))
  );
  const [heroTelefono, setHeroTelefono] = useState('777 395 6677');

  useEffect(() => {
    localStorage.setItem(HERO_UBICACIONES_STORAGE_KEY, JSON.stringify(heroUbicaciones.map((u) => u.texto)));
  }, [heroUbicaciones]);

  const handleAgregarHeroUbicacion = async () => {
    const { value } = await Swal.fire({
      title: 'Nueva ubicación', input: 'text', inputPlaceholder: 'Ej. Cuernavaca, Morelos',
      showCancelButton: true, confirmButtonText: 'Agregar', cancelButtonText: 'Cancelar',
      inputValidator: (v) => !v.trim() && 'Escribe una ubicación',
    });
    if (!value) return;
    setHeroUbicaciones((prev) => [...prev, { id: Date.now(), texto: value.trim() }]);
  };

  const handleEditarHeroUbicacion = async (id, actual) => {
    const { value } = await Swal.fire({
      title: 'Editar ubicación', input: 'text', inputValue: actual.texto,
      showCancelButton: true, confirmButtonText: 'Guardar', cancelButtonText: 'Cancelar',
      inputValidator: (v) => !v.trim() && 'Escribe una ubicación',
    });
    if (!value) return;
    setHeroUbicaciones((prev) => prev.map((u) => (u.id === id ? { ...u, texto: value.trim() } : u)));
  };

  const handleEliminarHeroUbicacion = (id) => setHeroUbicaciones((prev) => prev.filter((u) => u.id !== id));

  // Servicios (real: ServicesSection.jsx / StatsSection.jsx)
  const [servicios, setServicios] = useState([]);
  const [servicioDestacadoId, setServicioDestacadoId] = useState('');
  const [imgServicioPreview, setImgServicioPreview] = useState(null);
  const [tasaAprobacion, setTasaAprobacion] = useState('96');
  const [telServicios, setTelServicios] = useState('777 100 8412');

  // Nosotros (real: AboutSection.jsx)
  const [imgNosotrosPreview, setImgNosotrosPreview] = useState(null);

  // Testimonios (real: TestimonialsSection.jsx)
  const [testimonios, setTestimonios] = useState(TESTIMONIOS_INICIALES);

  // FAQ (real: FAQSection.jsx)
  const [faqs, setFaqs] = useState(FAQ_INICIALES);
  const [faqModalAbierto, setFaqModalAbierto] = useState(false);
  const [faqEditandoId, setFaqEditandoId] = useState(null);
  const [faqDraftQuestion, setFaqDraftQuestion] = useState('');
  const [faqDraftAnswer, setFaqDraftAnswer] = useState('');

  // Contacto (real: ContactSection.jsx)
  const [tituloLocalidad, setTituloLocalidad] = useState('Visítanos en Jiutepec o en línea');
  const [ubicaciones, setUbicaciones] = useState(UBICACIONES_INICIALES);
  const [telContacto, setTelContacto] = useState('777 314 0099');
  const [whatsapp, setWhatsapp] = useState('777 220 7765');
  const [correo, setCorreo] = useState('contacto@consultoriajas.com');
  const [fbSeguidores, setFbSeguidores] = useState('8,400');
  const [igSeguidores, setIgSeguidores] = useState('12,600');
  const [ttSeguidores, setTtSeguidores] = useState('34,000');
  const [horPresencialLV, setHorPresencialLV] = useState('9:00 – 18:00');
  const [horLineaLV, setHorLineaLV] = useState('8:00 – 21:00');
  const [horLineaFinde, setHorLineaFinde] = useState('9:00 – 14:00');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/'); return; }
    try {
      const decoded = jwtDecode(token);
      if (decoded.role !== 'EMPRESA') { navigate('/'); return; }
    } catch (error) {
      console.error('Token inválido', error);
      localStorage.removeItem('token');
      navigate('/');
      return;
    }
    fetchServicios();
  }, [navigate]);

  const fetchServicios = async () => {
    try {
      const response = await getAllProcess();
      const lista = response.success && Array.isArray(response.response.Transacts) ? response.response.Transacts : [];
      const activos = lista.filter((s) => s.status === true);
      setServicios(activos);
      if (activos.length > 0) setServicioDestacadoId(String(activos[0].idTransact));
    } catch (error) {
      console.error('Error al obtener servicios:', error);
      setServicios([]);
    }
  };

  const handleNavigate = (key) => { console.log('Navegar a sección de sidebar:', key); };

  const handlePublicar = () => {
    Swal.fire({
      icon: 'info',
      title: 'Vista previa del diseño',
      text: 'Esta pantalla todavía no está conectada a un backend real: los cambios que hagas aquí no se guardan ni se reflejan en la página pública.',
      confirmButtonText: 'Entendido',
    });
  };

  const handleVistaPrevia = () => window.open('/', '_blank');

  const handlePickServicioImg = (file) => setImgServicioPreview(URL.createObjectURL(file));
  const handlePickNosotrosImg = (file) => setImgNosotrosPreview(URL.createObjectURL(file));

  const handleEliminarTestimonio = (id) => setTestimonios((prev) => prev.filter((t) => t.id !== id));

  const handleSubirTestimonio = async (file) => {
    const { value: tagVal } = await Swal.fire({
      title: 'Etiqueta del testimonio', input: 'text', inputPlaceholder: 'Ej. Visa B1/B2',
      showCancelButton: true, confirmButtonText: 'Agregar', cancelButtonText: 'Cancelar',
    });
    if (!tagVal) return;
    setTestimonios((prev) => [...prev, { id: Date.now(), img: URL.createObjectURL(file), tag: tagVal }]);
  };

  const abrirFaqModal = (item) => {
    setFaqEditandoId(item ? item.id : null);
    setFaqDraftQuestion(item ? item.question : '');
    setFaqDraftAnswer(item ? item.answer : '');
    setFaqModalAbierto(true);
  };

  const cerrarFaqModal = () => setFaqModalAbierto(false);

  const guardarFaq = () => {
    const question = faqDraftQuestion.trim();
    if (!question) return;
    const answer = faqDraftAnswer.trim();
    if (faqEditandoId != null) {
      setFaqs((prev) => prev.map((f) => (f.id === faqEditandoId ? { ...f, question, answer } : f)));
    } else {
      setFaqs((prev) => [...prev, { id: Date.now(), question, answer }]);
    }
    setFaqModalAbierto(false);
  };

  const handleEliminarFaq = (id) => setFaqs((prev) => prev.filter((f) => f.id !== id));

  const handleAgregarUbicacion = async () => {
    const { value } = await Swal.fire({
      title: 'Nueva ubicación',
      html: '<input id="swal-titulo" class="swal2-input" placeholder="Título (ej. Sucursal Cuernavaca)">'
        + '<input id="swal-direccion" class="swal2-input" placeholder="Dirección">',
      focusConfirm: false,
      showCancelButton: true, confirmButtonText: 'Agregar', cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const titulo = document.getElementById('swal-titulo').value.trim();
        const direccion = document.getElementById('swal-direccion').value.trim();
        if (!titulo) { Swal.showValidationMessage('El título es obligatorio'); return false; }
        return { titulo, direccion };
      },
    });
    if (!value) return;
    setUbicaciones((prev) => [...prev, { id: Date.now(), ...value }]);
  };

  const handleEditarUbicacion = async (id, actual) => {
    const { value } = await Swal.fire({
      title: 'Editar ubicación',
      html: `<input id="swal-titulo" class="swal2-input" value="${escapeAttr(actual.titulo)}">`
        + `<input id="swal-direccion" class="swal2-input" value="${escapeAttr(actual.direccion)}">`,
      focusConfirm: false,
      showCancelButton: true, confirmButtonText: 'Guardar', cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const titulo = document.getElementById('swal-titulo').value.trim();
        const direccion = document.getElementById('swal-direccion').value.trim();
        if (!titulo) { Swal.showValidationMessage('El título es obligatorio'); return false; }
        return { titulo, direccion };
      },
    });
    if (!value) return;
    setUbicaciones((prev) => prev.map((u) => (u.id === id ? { ...u, ...value } : u)));
  };

  const handleEliminarUbicacion = (id) => setUbicaciones((prev) => prev.filter((u) => u.id !== id));

  return (
    <div className={styles.page}>
      <EmpresaSidebar active={`pagina-publica:${tab}`} onNavigate={handleNavigate} />

      <main className={styles.main}>
        <header className={styles.topbar}>
          <div>
            <div className={styles.crumb}><span>Configuración</span> <span className={styles.crumbSep}>/</span> <span className={styles.accent}>Página pública</span></div>
            <div className={styles.pageTitle}>Configuración de página pública</div>
          </div>
          <div className={styles.topActions}>
            <span className={styles.liveBadge}><span className={styles.liveDot}></span>EN VIVO</span>
            <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} onClick={handleVistaPrevia}><IconEye /> Vista previa</button>
            <button className={`${styles.btn} ${styles.btnAccent}`} onClick={handlePublicar}><IconCheck /> Publicar cambios</button>
            <HeaderLogoutButton />
          </div>
        </header>

        <div className={styles.secTabs}>
          {TAB_KEYS.map((key) => (
            <button key={key} className={`${styles.secTab} ${tab === key ? styles.active : ''}`} onClick={() => setTab(key)}>
              {TAB_LABELS[key]}
            </button>
          ))}
        </div>

        <div className={styles.content}>

          {tab === 'inicio' && (
            <div className={styles.pane}>
              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <div className={styles.cardIcon}><IconHome /></div>
                  <div><div className={styles.cardTitle}>Sección Inicio (Hero)</div><div className={styles.cardSub}>Lo primero que ve el visitante</div></div>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Ubicaciones operativas <span className={styles.fieldHint}>— aparecen como pills en el hero superior</span></label>
                    {heroUbicaciones.map((u) => (
                      <div key={u.id} className={styles.repRow}>
                        <div className={styles.repIcon}><IconHome /></div>
                        <div className={styles.repMain}><div className={styles.repTitle}>{u.texto}</div></div>
                        <div className={styles.repActions}>
                          <button title="Editar" onClick={() => handleEditarHeroUbicacion(u.id, u)}><IconEditSm size={15} /></button>
                          <button className={styles.del} title="Eliminar" onClick={() => handleEliminarHeroUbicacion(u.id)}><IconTrashSm size={15} /></button>
                        </div>
                      </div>
                    ))}
                    <button className={styles.addBtn} onClick={handleAgregarHeroUbicacion}><IconPlus /> Agregar ubicación</button>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Número de teléfono principal <span className={styles.fieldHint}>— botón Cotizar y navbar</span></label>
                    <input className={styles.inp} style={{ fontFamily: 'var(--mono)' }} value={heroTelefono} onChange={(e) => setHeroTelefono(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'servicios' && (
            <div className={styles.pane}>
              <div className={styles.infoBanner}>
                <div className={styles.infoIcon}><IconInfo size={16} /></div>
                <div className={styles.infoText}>
                  Esto controla <strong>cómo se presenta</strong> la sección Servicios en la landing. Los precios, duración y pasos de cada servicio se editan en <Link to="/EmpresaServicios">Gestión › Servicios</Link>.
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <div className={styles.cardIcon}><IconTrophy /></div>
                  <div><div className={styles.cardTitle}>Servicio destacado</div><div className={styles.cardSub}>Elige cuál servicio aparece en grande en el hero</div></div>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Servicio a destacar <span className={styles.fieldHint}>— se muestra grande en la landing</span></label>
                    <select className={styles.inp} value={servicioDestacadoId} onChange={(e) => setServicioDestacadoId(e.target.value)}>
                      {servicios.length === 0 && <option value="">Cargando servicios...</option>}
                      {servicios.map((s) => (
                        <option key={s.idTransact} value={s.idTransact}>
                          {s.name}{s.cost != null ? ` — $${Number(s.cost).toLocaleString('es-MX')} MXN` : ''}
                        </option>
                      ))}
                    </select>
                    <div className={styles.fieldHint} style={{ marginTop: 7, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <IconInfo size={11} /> Sus datos (precio, duración, tasa de éxito, pasos) se toman automáticamente del catálogo.
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Imagen del servicio destacado <span className={styles.fieldHint}>— hero de la sección Servicios</span></label>
                    <UploadRow
                      thumbStyle={imgServicioPreview ? { backgroundImage: `url("${imgServicioPreview}")` } : { background: 'linear-gradient(135deg,#6b8db8,#2c4a7a)' }}
                      title="visa-americana-hero.jpg"
                      sub="Imagen de ejemplo — no existe un campo de imagen por servicio en el sistema todavía"
                      onPick={handlePickServicioImg}
                      onClear={() => setImgServicioPreview(null)}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <div className={styles.cardIcon}><IconTrendUp /></div>
                  <div><div className={styles.cardTitle}>Datos generales de la empresa</div><div className={styles.cardSub}>Cifras globales que aparecen en el hero</div></div>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.grid2}>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel}>Tasa de aprobación general <span className={styles.fieldHint}>— el 96% del hero</span></label>
                      <div className={styles.pctWrap}><input value={tasaAprobacion} onChange={(e) => setTasaAprobacion(e.target.value)} /><span className={styles.pctSuffix}>%</span></div>
                    </div>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel}>Teléfono / WhatsApp de la sección</label>
                      <input className={styles.inp} style={{ fontFamily: 'var(--mono)' }} value={telServicios} onChange={(e) => setTelServicios(e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'nosotros' && (
            <div className={styles.pane}>
              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <div className={styles.cardIcon}><IconUsers /></div>
                  <div><div className={styles.cardTitle}>Sección Nosotros</div><div className={styles.cardSub}>Imagen e identidad de la empresa</div></div>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Imagen principal de la sección</label>
                    <UploadRow
                      thumbStyle={{ backgroundImage: `url("${imgNosotrosPreview || aboutMainImg}")` }}
                      title="about-main.jpg"
                      sub="Imagen real usada hoy en la landing · ≈117 KB"
                      onPick={handlePickNosotrosImg}
                      onClear={() => setImgNosotrosPreview(null)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'testimonios' && (
            <div className={styles.pane}>
              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <div className={styles.cardIcon}><IconPlay /></div>
                  <div><div className={styles.cardTitle}>Galería de testimonios</div><div className={styles.cardSub}>Capturas y videos de clientes · {testimonios.length} visibles</div></div>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.testGrid}>
                    {testimonios.map((t) => (
                      <div key={t.id} className={styles.testItem} style={{ backgroundImage: `url("${t.img}")` }}>
                        <span className={styles.testTag}>{t.tag}</span>
                        <button className={styles.testDel} title="Eliminar" onClick={() => handleEliminarTestimonio(t.id)}><IconClose size={12} /></button>
                      </div>
                    ))}
                    <label className={styles.testAdd} htmlFor="upload-testimonio">
                      <IconPlus size={20} />
                      <span style={{ fontSize: 11, fontWeight: 600 }}>Subir</span>
                    </label>
                    <input
                      id="upload-testimonio" type="file" accept="image/*" hidden
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        e.target.value = '';
                        if (file) await handleSubirTestimonio(file);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'faq' && (
            <div className={styles.pane}>
              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <div className={styles.cardIcon}><IconHelp /></div>
                  <div><div className={styles.cardTitle}>Preguntas frecuentes</div><div className={styles.cardSub}>{faqs.length} preguntas activas · arrastra para reordenar</div></div>
                  <button className={`${styles.btn} ${styles.btnAccent} ${styles.btnSm}`} style={{ marginLeft: 'auto' }} onClick={() => abrirFaqModal(null)}>
                    <IconPlus size={12} /> Nueva
                  </button>
                </div>
                <div className={styles.cardBody}>
                  {faqs.map((f, i) => (
                    <div key={f.id} className={styles.faqItem}>
                      <div className={styles.faqItemHead}>
                        <span className={styles.faqGrip}><IconGrip /></span>
                        <span className={styles.faqNum}>{String(i + 1).padStart(2, '0')}</span>
                        <div className={styles.faqQ}>
                          <div>{f.question}</div>
                          <div className={styles.faqAPreview}>{f.answer || 'Sin respuesta todavía.'}</div>
                        </div>
                        <div className={styles.faqActions}>
                          <button title="Editar" onClick={() => abrirFaqModal(f)}><IconEditSm /></button>
                          <button className={styles.del} title="Eliminar" onClick={() => handleEliminarFaq(f.id)}><IconTrashSm /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {faqs.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '30px', fontSize: 12.5, color: 'var(--muted)' }}>No hay preguntas todavía.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {tab === 'contacto' && (
            <div className={styles.pane}>
              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <div className={styles.cardIcon}><IconPin /></div>
                  <div><div className={styles.cardTitle}>Ubicaciones</div><div className={styles.cardSub}>Sucursales que aparecen en Contacto</div></div>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Título de localidad</label>
                    <input className={styles.inp} value={tituloLocalidad} onChange={(e) => setTituloLocalidad(e.target.value)} />
                  </div>
                  {ubicaciones.map((u) => (
                    <div key={u.id} className={styles.repRow}>
                      <div className={styles.repIcon}><IconPin size={17} /></div>
                      <div className={styles.repMain}><div className={styles.repTitle}>{u.titulo}</div><div className={styles.repSub}>{u.direccion}</div></div>
                      <div className={styles.repActions}>
                        <button title="Editar" onClick={() => handleEditarUbicacion(u.id, u)}><IconEditSm size={15} /></button>
                        <button className={styles.del} title="Eliminar" onClick={() => handleEliminarUbicacion(u.id)}><IconTrashSm size={15} /></button>
                      </div>
                    </div>
                  ))}
                  <button className={styles.addBtn} onClick={handleAgregarUbicacion}><IconPlus /> Agregar ubicación</button>
                  <div className={styles.grid2} style={{ marginTop: 16 }}>
                    <div className={styles.field}><label className={styles.fieldLabel}>Teléfono</label><input className={styles.inp} style={{ fontFamily: 'var(--mono)' }} value={telContacto} onChange={(e) => setTelContacto(e.target.value)} /></div>
                    <div className={styles.field}><label className={styles.fieldLabel}>WhatsApp</label><input className={styles.inp} style={{ fontFamily: 'var(--mono)' }} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} /></div>
                    <div className={styles.field}><label className={styles.fieldLabel}>Correo electrónico</label><input className={styles.inp} style={{ fontFamily: 'var(--mono)' }} value={correo} onChange={(e) => setCorreo(e.target.value)} /></div>
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <div className={styles.cardIcon}><IconGlobe2 /></div>
                  <div><div className={styles.cardTitle}>Redes sociales</div><div className={styles.cardSub}>Número de seguidores mostrado</div></div>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.socRow}>
                    <div className={styles.socLogo} style={{ background: '#1877F2' }}><IconFacebook /></div>
                    <span className={styles.socName}>Facebook</span>
                    <div className={styles.socCount}><input value={fbSeguidores} onChange={(e) => setFbSeguidores(e.target.value)} /><span className={styles.socSfx}>seguidores</span></div>
                  </div>
                  <div className={styles.socRow}>
                    <div className={styles.socLogo} style={{ background: 'linear-gradient(135deg,#F58529,#DD2A7B,#8134AF)' }}><IconInstagram /></div>
                    <span className={styles.socName}>Instagram</span>
                    <div className={styles.socCount}><input value={igSeguidores} onChange={(e) => setIgSeguidores(e.target.value)} /><span className={styles.socSfx}>seguidores</span></div>
                  </div>
                  <div className={styles.socRow}>
                    <div className={styles.socLogo} style={{ background: '#000' }}><IconTiktok /></div>
                    <span className={styles.socName}>TikTok</span>
                    <div className={styles.socCount}><input value={ttSeguidores} onChange={(e) => setTtSeguidores(e.target.value)} /><span className={styles.socSfx}>seguidores</span></div>
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <div className={styles.cardIcon}><IconClock /></div>
                  <div><div className={styles.cardTitle}>Horarios de atención</div><div className={styles.cardSub}>Presencial y en línea</div></div>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.grid2}>
                    <div className={styles.field}><label className={styles.fieldLabel}>Presencial · Lunes a Viernes</label><input className={styles.inp} style={{ fontFamily: 'var(--mono)' }} value={horPresencialLV} onChange={(e) => setHorPresencialLV(e.target.value)} /></div>
                    <div className={styles.field}><label className={styles.fieldLabel}>En línea · Lunes a Viernes</label><input className={styles.inp} style={{ fontFamily: 'var(--mono)' }} value={horLineaLV} onChange={(e) => setHorLineaLV(e.target.value)} /></div>
                    <div className={styles.field} style={{ marginBottom: 0 }}><label className={styles.fieldLabel}>En línea · Sábado y Domingo</label><input className={styles.inp} style={{ fontFamily: 'var(--mono)' }} value={horLineaFinde} onChange={(e) => setHorLineaFinde(e.target.value)} /></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className={styles.saveFoot}>
            <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => window.location.reload()}>Descartar</button>
            <button className={`${styles.btn} ${styles.btnAccent}`} onClick={handlePublicar}><IconCheck /> Publicar cambios</button>
          </div>
        </div>
      </main>

      {faqModalAbierto && (
        <div className={styles.scrim} onMouseDown={(e) => { if (e.target === e.currentTarget) cerrarFaqModal(); }}>
          <div className={styles.fmodal}>
            <div className={styles.fmodalHead}>
              <div className={styles.fmodalIcon}><IconHelp /></div>
              <div>
                <div className={styles.fmodalTitleTxt}>{faqEditandoId != null ? 'Editar pregunta' : 'Agregar pregunta'}</div>
                <div className={styles.fmodalSub}>Se mostrará en la sección FAQ de la landing</div>
              </div>
              <button className={styles.fmodalClose} onClick={cerrarFaqModal}><IconClose size={13} /></button>
            </div>
            <div className={styles.fmodalBody}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Pregunta</label>
                <input className={styles.inp} placeholder="¿Cuánto tarda el trámite de...?" value={faqDraftQuestion} onChange={(e) => setFaqDraftQuestion(e.target.value)} />
              </div>
              <div className={styles.field} style={{ marginBottom: 0 }}>
                <label className={styles.fieldLabel}>Respuesta</label>
                <textarea className={styles.inp} rows={5} placeholder="Escribe la respuesta que verán tus clientes..." value={faqDraftAnswer} onChange={(e) => setFaqDraftAnswer(e.target.value)} />
              </div>
            </div>
            <div className={styles.fmodalFoot}>
              <button className={`${styles.btn} ${styles.btnGhost}`} onClick={cerrarFaqModal}>Cancelar</button>
              <button className={`${styles.btn} ${styles.btnAccent}`} onClick={guardarFaq}><IconCheckFaq /> Guardar pregunta</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

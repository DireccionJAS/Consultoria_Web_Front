import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import EmpresaSidebar from './EmpresaSidebar.jsx';
import { subirPdfLegal, getPdfLegalUrl } from './../../api/api.js';
import styles from './../../styles/EmpresaLegalidad.module.css';

// Extraído 1:1 de "19-Legalidad (standalone).html". Los 2 PDFs
// (Términos, Privacidad) SÍ tienen backend real: POST /api/pdf/upload/
// {tipo} y GET /api/pdf/download/{tipo} (ya usados antes por
// UploadPdf.jsx, la pantalla vieja de /PDF solo-Admin). Aquí "Ver
// actual" y "Subir nuevo" quedan conectados de verdad a esos endpoints.
// Los 2 bloques de texto (Aviso de Cookies, Protección de Datos) NO
// tienen backend (no existe campo/entidad para texto legal editable),
// así que quedan como UI 1:1 sin persistencia, con el mismo texto de
// ejemplo del mockup precargado. La barra de formato (B, I, link,
// lista) es decorativa también en el mockup original (sin onclick).

const PDF_CARDS = [
  { tipo: 'terminos', titulo: 'Términos y Condiciones', nombreDefault: 'Terminos-y-Condiciones-2026.pdf', metaDefault: '680 KB · Actualizado 03 jun 2026' },
  { tipo: 'privacidad', titulo: 'Política de Privacidad', nombreDefault: 'Politica-de-Privacidad-2026.pdf', metaDefault: '540 KB · Actualizado 03 jun 2026' },
  { tipo: 'formulario', titulo: 'Formulario DS-160', nombreDefault: 'Sin archivo subido', metaDefault: 'Descargable desde el Portal del Cliente' },
];

const COOKIES_TEXTO_INICIAL = 'En Consultoría JAS utilizamos cookies propias y de terceros para mejorar tu experiencia de navegación, analizar el uso del sitio y personalizar el contenido. Al continuar navegando, aceptas el uso de cookies conforme a nuestra Política de Privacidad. Puedes configurar o rechazar su uso en cualquier momento desde la configuración de tu navegador.';
const PROTECCION_TEXTO_INICIAL = 'Consultoría JAS, con domicilio en Jiutepec, Morelos, es responsable del tratamiento y protección de tus datos personales conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares. Los datos que nos proporciones serán utilizados únicamente para gestionar tu trámite migratorio, contactarte y darte seguimiento. No compartimos tu información con terceros sin tu consentimiento. Puedes ejercer tus derechos ARCO (Acceso, Rectificación, Cancelación y Oposición) escribiendo a contacto@consultoriajas.com.';

function IconCheck({ size = 13 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12l5 5L20 7"></path></svg>; }
function IconPdf({ size = 22 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6"></path></svg>; }
function IconShieldCheck({ size = 18 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"></path><path d="M9 12l2 2 4-4"></path></svg>; }
function IconEye() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>; }
function IconUpload() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"></path></svg>; }
function IconCookie() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5z"></path><circle cx="8.5" cy="10.5" r="1"></circle><circle cx="15.5" cy="13.5" r="1"></circle><circle cx="11" cy="15" r="1"></circle></svg>; }
function IconShieldLock() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path><circle cx="12" cy="16" r="1.5"></circle></svg>; }
function IconLink() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.5 1.5"></path><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.5-1.5"></path></svg>; }
function IconList() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>; }
function IconInfo() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4M12 8h.01"></path></svg>; }

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}
function formatFechaHoy() {
  return new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '');
}

function PdfCard({ tipo, titulo, nombreDefault, metaDefault }) {
  const [archivo, setArchivo] = useState({ nombre: nombreDefault, meta: metaDefault });
  const [subiendo, setSubiendo] = useState(false);
  const inputId = `pdf-upload-${tipo}`;

  const handleVerActual = () => window.open(getPdfLegalUrl(tipo), '_blank');

  const handleArchivoElegido = async (file) => {
    if (!file) return;
    setSubiendo(true);
    try {
      await subirPdfLegal(tipo, file);
      setArchivo({ nombre: file.name, meta: `${formatBytes(file.size)} · Actualizado ${formatFechaHoy()}` });
      Swal.fire({
        toast: true, position: 'top-end', icon: 'success', title: 'PDF actualizado',
        showConfirmButton: false, timer: 2500, timerProgressBar: true,
      });
    } catch (error) {
      console.error(`Error al subir ${tipo}`, error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo subir el PDF.' });
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <div className={styles.cardIcon}>{tipo === 'privacidad' ? <IconShieldCheck /> : <IconPdf size={18} />}</div>
        <div><div className={styles.cardTitle}>{titulo}</div><div className={styles.cardSub}>PDF con visor en la landing</div></div>
        <span className={styles.cardStatus}>Publicado</span>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.pdfRow}>
          <div className={styles.pdfThumb}><IconPdf /><span className={styles.pdfThumbLabel}>PDF</span></div>
          <div className={styles.pdfInfo}>
            <div className={styles.pdfName}>{archivo.nombre}</div>
            <div className={styles.pdfMeta}>{archivo.meta}</div>
          </div>
        </div>
        <div className={styles.pdfActions}>
          <button className={`${styles.pdfBtn} ${styles.view}`} onClick={handleVerActual}><IconEye /> Ver actual</button>
          <input id={inputId} type="file" accept="application/pdf" hidden onChange={(e) => { const f = e.target.files[0]; e.target.value = ''; handleArchivoElegido(f); }} />
          <button className={`${styles.pdfBtn} ${styles.upload}`} disabled={subiendo} onClick={() => document.getElementById(inputId).click()}>
            <IconUpload /> {subiendo ? 'Subiendo...' : 'Subir nuevo'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EmpresaLegalidad() {
  const navigate = useNavigate();
  const [cookiesTexto, setCookiesTexto] = useState(COOKIES_TEXTO_INICIAL);
  const [proteccionTexto, setProteccionTexto] = useState(PROTECCION_TEXTO_INICIAL);

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
    }
  }, [navigate]);

  const handleNavigate = (key) => { console.log('Navegar a sección de sidebar:', key); };

  const handleGuardarTodo = () => {
    Swal.fire({
      icon: 'info',
      title: 'Textos no persistidos',
      text: 'Los PDFs se suben de inmediato, pero los textos de Cookies y Protección de Datos todavía no tienen dónde guardarse en el servidor: este cambio no se conserva al recargar.',
      confirmButtonText: 'Entendido',
    });
  };

  return (
    <div className={styles.page}>
      <EmpresaSidebar active="legalidad" onNavigate={handleNavigate} />

      <main className={styles.main}>
        <header className={styles.topbar}>
          <div>
            <div className={styles.crumb}><span>Menú extendido</span> <span className={styles.crumbSep}>/</span> <span className={styles.accent}>Legalidad</span></div>
            <div className={styles.pageTitle}>Documentos legales</div>
          </div>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleGuardarTodo}><IconCheck /> Guardar todo</button>
        </header>

        <div className={styles.content}>
          <div className={styles.row2}>
            {PDF_CARDS.map((card) => <PdfCard key={card.tipo} {...card} />)}
          </div>

          <div className={styles.card}>
            <div className={styles.cardHead}>
              <div className={styles.cardIcon}><IconCookie /></div>
              <div><div className={styles.cardTitle}>Aviso de Cookies</div><div className={styles.cardSub}>Texto editable mostrado en el banner de la landing</div></div>
            </div>
            <div className={styles.cardBody}>
              <label className={styles.fieldLabel}>Contenido <span className={styles.fieldHint}>— admite formato básico</span></label>
              <div className={styles.editorBar}>
                <button type="button" style={{ fontWeight: 800 }}>B</button>
                <button type="button" style={{ fontStyle: 'italic' }}>I</button>
                <div className={styles.sep}></div>
                <button type="button"><IconLink /></button>
                <button type="button"><IconList /></button>
              </div>
              <textarea className={`${styles.inp} ${styles.withBar}`} maxLength={1000} value={cookiesTexto} onChange={(e) => setCookiesTexto(e.target.value)} />
              <div className={styles.charCount}>{cookiesTexto.length} / 1000 caracteres</div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHead}>
              <div className={styles.cardIcon}><IconShieldLock /></div>
              <div><div className={styles.cardTitle}>Protección de Datos</div><div className={styles.cardSub}>Texto editable del aviso de protección de datos personales</div></div>
            </div>
            <div className={styles.cardBody}>
              <label className={styles.fieldLabel}>Contenido</label>
              <div className={styles.editorBar}>
                <button type="button" style={{ fontWeight: 800 }}>B</button>
                <button type="button" style={{ fontStyle: 'italic' }}>I</button>
                <div className={styles.sep}></div>
                <button type="button"><IconLink /></button>
                <button type="button"><IconList /></button>
              </div>
              <textarea className={`${styles.inp} ${styles.withBar}`} maxLength={1500} value={proteccionTexto} onChange={(e) => setProteccionTexto(e.target.value)} />
              <div className={styles.charCount}>{proteccionTexto.length} / 1500 caracteres</div>
              <div className={styles.saveHint}><IconInfo /> Estos textos aparecen en el footer de la landing como enlaces.</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

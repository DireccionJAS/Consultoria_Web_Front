import React, { useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import { createService, updateService } from './../../api/api.js';
import { ICONOS, iconDataUri } from './../../utils/serviceIcons.js';
import styles from './../../styles/ModalesServicio.module.css';

// Extraído 1:1 de "15-ModalesServicio (standalone) (1).html". "Categoría",
// "Duración" y "Tasa de éxito" no existen en Transact — el usuario pidió
// (2026-07-17) mantenerlos como campos UI-only (se ven pero no se envían
// al guardar), en vez de omitirlos. El slot "Ícono" del mockup era un
// upload; a pedido del usuario se reemplazó por un combobox con un ícono
// fijo por tipo de trámite (visa/pasaporte/formulario/entrevista/citas/
// asesoría). El ícono elegido se guarda como SVG (data URI) en
// imageDetail — el único campo de imagen secundaria que existe en
// Transact — así que no requiere cambios de backend. El catálogo de
// íconos vive en utils/serviceIcons.js porque ServiciosPage.jsx (catálogo
// público) también lo usa para derivar la categoría de cada servicio.

const CATEGORIAS = ['Visa de no inmigrante', 'Visa de turista', 'Pasaporte', 'Formulario', 'Asesoría'];

function IconGlyph({ svg, size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: svg }} />
  );
}

function IconServiceHead() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>;
}
function IconClose() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 6l12 12M6 18L18 6"></path></svg>;
}
function IconUpload() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"></path></svg>;
}
function IconSwap() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"></path></svg>;
}
function IconTrash() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path></svg>;
}
function IconCheck() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12l5 5L20 7"></path></svg>;
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
}

function getImageDimensions(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function dataUriBytes(dataUri) {
  const idx = dataUri.indexOf(',');
  if (idx === -1 || !dataUri.startsWith('data:')) return null;
  const base64 = dataUri.slice(idx + 1);
  const padding = (base64.match(/=+$/) || [''])[0].length;
  return Math.floor((base64.length * 3) / 4) - padding;
}

function formatBytes(bytes) {
  if (bytes == null) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const CAMPOS_INICIALES = {
  name: '', description: '', cost: '', cashAdvance: '', nameOption: '', optionCost: '',
};

function IconoSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const seleccionado = ICONOS.find((ic) => ic.id === value) || null;

  useEffect(() => {
    function onDocClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  return (
    <div className={styles.iconSelect} ref={ref}>
      <label className={styles.fieldLabel}>Ícono <span className={styles.req}>*</span></label>
      <div className={`${styles.preview} ${styles.icon}`} onClick={() => setOpen((v) => !v)}>
        <div className={styles.phImg}>
          {seleccionado ? <IconGlyph svg={seleccionado.svg} size={40} /> : <IconServiceHead />}
        </div>
        <div className={styles.previewOverlay}>
          <button type="button" className={styles.pvBtn} onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}><IconSwap /></button>
        </div>
      </div>
      {open && (
        <div className={styles.iconMenu}>
          {ICONOS.map((ic) => (
            <div
              key={ic.id}
              className={`${styles.iconOption} ${value === ic.id ? styles.active : ''}`}
              onClick={() => { onChange(ic.id); setOpen(false); }}
            >
              <IconGlyph svg={ic.svg} size={18} />
              <span>{ic.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UploadField({ label, preview, meta, onPick, onClear }) {
  const inputId = `upload-${label.replace(/\s/g, '')}`;
  return (
    <div>
      <label className={styles.fieldLabel}>{label} <span className={styles.req}>*</span></label>
      <input id={inputId} type="file" accept="image/*" hidden onChange={(e) => e.target.files[0] && onPick(e.target.files[0])} />
      {preview ? (
        <div className={styles.preview}>
          <div className={styles.phImg} style={{ backgroundImage: `url("${preview}")` }}></div>
          <div className={styles.previewOverlay}>
            <button type="button" className={styles.pvBtn} onClick={() => document.getElementById(inputId).click()}><IconSwap /></button>
            <button type="button" className={`${styles.pvBtn} ${styles.del}`} onClick={onClear}><IconTrash /></button>
          </div>
          {meta && (
            <span className={styles.previewBadge}>
              {meta.width}×{meta.height}{meta.bytes != null ? ` · ${formatBytes(meta.bytes)}` : ''}
            </span>
          )}
        </div>
      ) : (
        <label htmlFor={inputId} className={styles.uploadZone}>
          <div className={styles.uploadIcon}><IconUpload /></div>
          <div className={styles.uploadTitle}>Subir imagen</div>
          <div className={styles.uploadSub}>PNG, JPG</div>
        </label>
      )}
    </div>
  );
}

export default function ModalServicio({ show, onHide, servicio, onGuardado }) {
  const esEdicion = !!servicio;
  const [campos, setCampos] = useState(CAMPOS_INICIALES);
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);
  const [duracion, setDuracion] = useState('');
  const [tasaExito, setTasaExito] = useState('');
  const [iconoId, setIconoId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imageMeta, setImageMeta] = useState(null);
  const [tieneAnticipo, setTieneAnticipo] = useState(false);
  const [tieneOtroCosto, setTieneOtroCosto] = useState(false);
  const [isDateService, setIsDateService] = useState(false);
  const [simulation, setSimulation] = useState(false);
  const [cas, setCas] = useState(false);
  const [con, setCon] = useState(false);
  const [status, setStatus] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!show) return;
    setCategoria(CATEGORIAS[0]);
    setDuracion('');
    setTasaExito('');
    if (servicio) {
      setCampos({
        name: servicio.name || '', description: servicio.description || '',
        cost: servicio.cost ?? '', cashAdvance: servicio.cashAdvance ?? '',
        nameOption: servicio.nameOption || '', optionCost: servicio.optionCost ?? '',
      });
      const iconoActual = ICONOS.find((ic) => servicio.imageDetail === iconDataUri(ic.svg));
      setIconoId(iconoActual ? iconoActual.id : null);
      setImagePreview(servicio.image || null);
      setImageFile(null);
      setImageMeta(null);
      if (servicio.image) {
        getImageDimensions(servicio.image).then((dim) => {
          if (!dim) return;
          setImageMeta({ ...dim, bytes: dataUriBytes(servicio.image) });
        });
      }
      setTieneAnticipo(servicio.cashAdvance != null && Number(servicio.cashAdvance) !== Number(servicio.cost));
      setTieneOtroCosto(!!servicio.nameOption);
      setIsDateService(!!servicio.isDateService);
      setSimulation(!!servicio.simulation);
      setCas(!!servicio.cas);
      setCon(!!servicio.con);
      setStatus(!!servicio.status);
    } else {
      setCampos(CAMPOS_INICIALES);
      setIconoId(null);
      setImagePreview(null);
      setImageFile(null);
      setImageMeta(null);
      setTieneAnticipo(false);
      setTieneOtroCosto(false);
      setIsDateService(false);
      setSimulation(false);
      setCas(false);
      setCon(false);
      setStatus(true);
    }
  }, [show, servicio]);

  if (!show) return null;

  const handleChange = (campo) => (e) => setCampos((prev) => ({ ...prev, [campo]: e.target.value }));

  const handlePickImage = (file) => {
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    getImageDimensions(url).then((dim) => setImageMeta(dim ? { ...dim, bytes: file.size } : null));
  };
  const handleClearImage = () => { setImageFile(null); setImagePreview(null); setImageMeta(null); };

  const handleGuardar = async () => {
    if (!campos.name || !campos.description || campos.cost === '' || (!esEdicion && (!imageFile || !iconoId))) {
      Swal.fire({ icon: 'warning', title: 'Faltan datos', text: 'Completa los campos obligatorios: nombre, descripción, ícono, precio e imagen principal.' });
      return;
    }

    setGuardando(true);
    try {
      const cost = parseFloat(campos.cost);
      const cashAdvance = tieneAnticipo ? parseFloat(campos.cashAdvance) : cost;
      const nameOption = tieneOtroCosto ? campos.nameOption : null;
      const optionCost = tieneOtroCosto && campos.optionCost !== '' ? parseFloat(campos.optionCost) : null;

      const image = imageFile ? await toBase64(imageFile) : servicio?.image;
      const iconoSeleccionado = ICONOS.find((ic) => ic.id === iconoId);
      const imageDetail = iconoSeleccionado ? iconDataUri(iconoSeleccionado.svg) : servicio?.imageDetail;

      const payload = {
        name: campos.name,
        description: campos.description,
        image,
        imageDetail,
        simulation: !isDateService && simulation,
        cas: !isDateService && cas,
        con: !isDateService && con,
        cost,
        totalPayment: cost,
        cashAdvance,
        nameOption,
        costOption: optionCost,
        optionCost,
        isDateService,
        status,
      };

      const res = esEdicion ? await updateService(servicio.idTransact, payload) : await createService(payload);
      if (!res?.success) throw new Error(res?.message || 'No se pudo guardar el servicio');

      Swal.fire({
        toast: true, position: 'top-end', icon: 'success',
        title: esEdicion ? 'Servicio actualizado' : 'Servicio registrado',
        showConfirmButton: false, timer: 2500, timerProgressBar: true,
      });
      onGuardado && onGuardado();
      onHide();
    } catch (error) {
      console.error('Error al guardar el servicio', error);
      Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'No se pudo guardar el servicio.' });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className={styles.scrim} onMouseDown={(e) => { if (e.target === e.currentTarget) onHide(); }}>
      <div className={`${styles.modal} ${styles.lg}`}>
        <div className={styles.modalHead}>
          <div className={styles.mhRow}>
            <div className={styles.mhIcon}><IconServiceHead /></div>
            <div>
              <div className={styles.mhEyebrow}>{esEdicion ? 'Editar servicio' : 'Nuevo servicio'}</div>
              <div className={styles.mhTitle}>{esEdicion ? servicio.name : 'Registrar servicio'}</div>
            </div>
          </div>
          <button className={styles.mhClose} onClick={onHide}><IconClose /></button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.fsec}>
            <div className={styles.fsecTitle}>Información básica</div>
            <div className={`${styles.field} ${styles.full}`}>
              <label className={styles.fieldLabel}>Nombre del servicio <span className={styles.req}>*</span></label>
              <input className={styles.inp} value={campos.name} onChange={handleChange('name')} />
            </div>
            <div className={`${styles.field} ${styles.full}`}>
              <label className={styles.fieldLabel}>Descripción <span className={styles.req}>*</span></label>
              <textarea className={styles.inp} value={campos.description} onChange={handleChange('description')}></textarea>
            </div>
            <div className={`${styles.field} ${styles.full}`}>
              <label className={styles.fieldLabel}>Categoría <span className={styles.req}>*</span></label>
              <select className={styles.inp} value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className={styles.fsec}>
            <div className={styles.fsecTitle}>Imágenes</div>
            <div className={styles.uploadsGrid}>
              <IconoSelect value={iconoId} onChange={setIconoId} />
              <UploadField label="Imagen principal" preview={imagePreview} meta={imageMeta} onPick={handlePickImage} onClear={handleClearImage} />
            </div>
          </div>

          <div className={styles.fsec}>
            <div className={styles.fsecTitle}>Precios y duración</div>
            <div className={styles.grid3}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Precio total <span className={styles.req}>*</span></label>
                <div className={styles.moneyWrap}><span className={styles.moneyPrefix}>$</span><input value={campos.cost} onChange={handleChange('cost')} /><span className={styles.moneySuffix}>MXN</span></div>
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Duración</label>
                <div className={styles.pctWrap}><input placeholder="Ej. 8-14" value={duracion} onChange={(e) => setDuracion(e.target.value)} /><span className={styles.pctSuffix}>semanas</span></div>
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Tasa de éxito</label>
                <div className={styles.pctWrap}><input placeholder="Ej. 96" value={tasaExito} onChange={(e) => setTasaExito(e.target.value)} /><span className={styles.pctSuffix}>%</span></div>
              </div>
            </div>
            <div className={styles.tgRow}>
              <div><div className={styles.tgLabel}>¿Requiere anticipo diferente?</div><div className={styles.tgSub}>Si el anticipo no es el total del servicio</div></div>
              <div className={`${styles.tg} ${tieneAnticipo ? styles.on : ''}`} onClick={() => setTieneAnticipo((v) => !v)}></div>
            </div>
            {tieneAnticipo && (
              <div className={styles.cond}>
                <div className={styles.field}><label className={styles.fieldLabel}>Monto del anticipo</label><div className={styles.moneyWrap}><span className={styles.moneyPrefix}>$</span><input value={campos.cashAdvance} onChange={handleChange('cashAdvance')} /><span className={styles.moneySuffix}>MXN</span></div></div>
              </div>
            )}
            <div className={styles.tgRow}>
              <div><div className={styles.tgLabel}>¿Tiene costo alternativo?</div><div className={styles.tgSub}>Ej. tarifa familiar o por persona</div></div>
              <div className={`${styles.tg} ${tieneOtroCosto ? styles.on : ''}`} onClick={() => setTieneOtroCosto((v) => !v)}></div>
            </div>
            {tieneOtroCosto && (
              <div className={styles.cond}>
                <div className={styles.grid2}>
                  <div className={styles.field}><label className={styles.fieldLabel}>Nombre del costo</label><input className={styles.inp} placeholder="Ej. Por persona adicional" value={campos.nameOption} onChange={handleChange('nameOption')} /></div>
                  <div className={styles.field}><label className={styles.fieldLabel}>Monto</label><div className={styles.moneyWrap}><span className={styles.moneyPrefix}>$</span><input placeholder="0" value={campos.optionCost} onChange={handleChange('optionCost')} /><span className={styles.moneySuffix}>MXN</span></div></div>
                </div>
              </div>
            )}
          </div>

          <div className={styles.fsec}>
            <div className={styles.fsecTitle}>Configuración del servicio</div>
            <div className={styles.tgRow}>
              <div><div className={styles.tgLabel}>¿Es servicio de cita?</div><div className={styles.tgSub}>Deshabilita CAS, CON y simulación automáticamente</div></div>
              <div className={`${styles.tg} ${isDateService ? styles.on : ''}`} onClick={() => setIsDateService((v) => !v)}></div>
            </div>
            <div className={`${styles.tgRow} ${isDateService ? styles.disabled : ''}`}>
              <div><div className={styles.tgLabel}>¿Requiere simulación?</div></div>
              <div className={`${styles.tg} ${simulation ? styles.on : ''}`} onClick={() => setSimulation((v) => !v)}></div>
            </div>
            <div className={`${styles.tgRow} ${isDateService ? styles.disabled : ''}`}>
              <div><div className={styles.tgLabel}>¿Aplica CAS?</div></div>
              <div className={`${styles.tg} ${cas ? styles.on : ''}`} onClick={() => setCas((v) => !v)}></div>
            </div>
            <div className={`${styles.tgRow} ${isDateService ? styles.disabled : ''}`}>
              <div><div className={styles.tgLabel}>¿Aplica CON?</div></div>
              <div className={`${styles.tg} ${con ? styles.on : ''}`} onClick={() => setCon((v) => !v)}></div>
            </div>
          </div>

          <div className={styles.fsec}>
            <div className={styles.fsecTitle}>Estado</div>
            <div className={styles.tgRow}>
              <div><div className={styles.tgLabel}>Servicio activo</div><div className={styles.tgSub}>Visible y disponible para contratar</div></div>
              <div className={`${styles.tg} ${status ? styles.on : ''}`} onClick={() => setStatus((v) => !v)}></div>
            </div>
          </div>
        </div>

        <div className={styles.modalFoot}>
          <button className={`${styles.btn} ${styles.btnGhost}`} onClick={onHide}>Cancelar</button>
          <button className={`${styles.btn} ${styles.btnPrimary}`} disabled={guardando} onClick={handleGuardar}>
            {guardando ? 'Guardando…' : 'Guardar servicio'} <IconCheck />
          </button>
        </div>
      </div>
    </div>
  );
}

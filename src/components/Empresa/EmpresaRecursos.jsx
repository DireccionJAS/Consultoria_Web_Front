import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import EmpresaSidebar from './EmpresaSidebar.jsx';
import styles from './../../styles/EmpresaRecursos.module.css';
import HeaderLogoutButton from './../common/HeaderLogoutButton.jsx';
import { getPaginaPublicaConfig, actualizarMapasRecursos } from './../../api/api.js';

// Extraído 1:1 de "18-Recursos (standalone).html". Las 3 tarjetas ya son
// reales: la tabla de trámites por mes se guarda en
// PaginaPublicaConfig.tramitesPorMes (JSON) y alimenta el line chart real
// de Landing/StatsSection.jsx (antes hardcodeado); los 2 mapas de México se
// reemplazaron por un campo real de subir imagen, guardados en
// mapaPresencia/mapaZonas (mismo patrón que imgNosotros) y son los que
// muestra esa misma sección pública en vez del SVG hardcodeado.

const MAX_IMG_BYTES = 5 * 1024 * 1024;

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function IconChart() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3v18h18M7 14l4-4 3 3 5-6"></path></svg>; }
function IconLayers() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 18l-6 3V6l6-3M9 18l6 3M9 18V3M15 21l6-3V3l-6 3M15 21V6"></path></svg>; }
function IconPin() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>; }
function IconCheck() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12l5 5L20 7"></path></svg>; }
function IconPlus({ size = 13 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"></path></svg>; }
function IconTrash({ size = 14 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path></svg>; }
function IconSwap() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"></path></svg>; }
function IconInfo() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4M12 8h.01"></path></svg>; }

const CHART_ROWS_INICIALES = [
  { id: 1, mes: 'Enero', total: '42', otraAgencia: '12' },
  { id: 2, mes: 'Marzo', total: '58', otraAgencia: '19' },
  { id: 3, mes: 'Mayo', total: '71', otraAgencia: '24' },
  { id: 4, mes: 'Junio', total: '96', otraAgencia: '31' },
];

function MapUploadRow({ id, preview, onPick, onClear }) {
  const inputId = `upload-mapa-${id}`;
  return (
    <div className={styles.upload}>
      <div className={styles.uploadThumb} style={preview ? { backgroundImage: `url("${preview}")` } : { background: 'linear-gradient(135deg,#6b8db8,#2c4a7a)' }}></div>
      <div className={styles.uploadInfo}>
        <div className={styles.uploadTitle}>{preview ? 'Imagen del mapa' : 'Sin imagen todavía'}</div>
        <div className={styles.uploadSub}>JPG o PNG, hasta 5 MB</div>
      </div>
      <div className={styles.uploadActions}>
        <input id={inputId} type="file" accept="image/*" hidden onChange={(e) => e.target.files[0] && onPick(e.target.files[0])} />
        <button type="button" className={styles.uaBtn} title="Cambiar" onClick={() => document.getElementById(inputId).click()}><IconSwap /></button>
        <button type="button" className={`${styles.uaBtn} ${styles.del}`} title="Quitar" onClick={onClear}><IconTrash size={15} /></button>
      </div>
    </div>
  );
}

export default function EmpresaRecursos() {
  const navigate = useNavigate();

  const [chartRows, setChartRows] = useState(CHART_ROWS_INICIALES);

  const [mapaPresencia, setMapaPresencia] = useState(null);
  const [mapaZonas, setMapaZonas] = useState(null);
  const [guardandoPresencia, setGuardandoPresencia] = useState(false);
  const [guardandoZonas, setGuardandoZonas] = useState(false);
  const [guardandoChart, setGuardandoChart] = useState(false);

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

  useEffect(() => {
    getPaginaPublicaConfig()
      .then((response) => {
        if (!response.success || !response.response?.config) return;
        const c = response.response.config;
        setMapaPresencia(c.mapaPresencia || null);
        setMapaZonas(c.mapaZonas || null);
        if (Array.isArray(c.tramitesPorMes) && c.tramitesPorMes.length > 0) {
          setChartRows(c.tramitesPorMes.map((r, i) => ({
            id: i + 1,
            mes: r.mes || '',
            total: r.total || '',
            otraAgencia: r.otraAgencia || '',
          })));
        }
      })
      .catch((error) => console.error('Error al obtener configuración de página pública:', error));
  }, []);

  const handleNavigate = (key) => { console.log('Navegar a sección de sidebar:', key); };

  const handleChartField = (id, field, value) => {
    setChartRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };
  const handleAddChartRow = () => setChartRows((prev) => [...prev, { id: Date.now(), mes: '', total: '', otraAgencia: '' }]);
  const handleDelChartRow = (id) => setChartRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  const handleGuardarChartInfo = async () => {
    setGuardandoChart(true);
    try {
      const response = await actualizarMapasRecursos({
        mapaPresencia,
        mapaZonas,
        tramitesPorMes: chartRows.map(({ mes, total, otraAgencia }) => ({ mes, total, otraAgencia })),
      });
      if (!response.success) {
        Swal.fire({ icon: 'error', title: 'Error', text: response.message || 'No se pudo guardar la tabla.' });
        return;
      }
      Swal.fire({ icon: 'success', title: 'Datos actualizados', text: 'La gráfica pública ya refleja estos números.', showConfirmButton: false, timer: 2500, timerProgressBar: true });
    } catch (error) {
      console.error('Error al guardar los trámites por mes:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron guardar los datos.' });
    } finally {
      setGuardandoChart(false);
    }
  };

  const handlePickImagen = async (file, setter) => {
    if (file.size > MAX_IMG_BYTES) {
      Swal.fire({ icon: 'error', title: 'Imagen muy pesada', text: 'El archivo no puede pesar más de 5 MB.' });
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    setter(dataUrl);
  };

  const guardarMapas = async (setGuardando) => {
    setGuardando(true);
    try {
      const response = await actualizarMapasRecursos({
        mapaPresencia,
        mapaZonas,
        tramitesPorMes: chartRows.map(({ mes, total, otraAgencia }) => ({ mes, total, otraAgencia })),
      });
      if (!response.success) {
        Swal.fire({ icon: 'error', title: 'Error', text: response.message || 'No se pudieron guardar los mapas.' });
        return;
      }
      Swal.fire({ icon: 'success', title: 'Mapas actualizados', showConfirmButton: false, timer: 2500, timerProgressBar: true });
    } catch (error) {
      console.error('Error al guardar los mapas:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron guardar los mapas.' });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className={styles.page}>
      <EmpresaSidebar active="recursos" onNavigate={handleNavigate} />

      <main className={styles.main}>
        <header className={styles.topbar}>
          <div>
            <div className={styles.crumb}><span>Menú extendido</span> <span className={styles.crumbSep}>/</span> <span className={styles.accent}>Recursos</span></div>
            <div className={styles.pageTitle}>Recursos</div>
          </div>
          <HeaderLogoutButton />
        </header>

        <div className={styles.content}>

          {/* EDITOR 1 — GRÁFICA */}
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <div className={styles.cardIcon}><IconChart /></div>
              <div><div className={styles.cardTitle}>Trámites completados por mes</div><div className={styles.cardSub}>Ingresa los datos por mes; la gráfica se actualiza abajo</div></div>
            </div>
            <div className={styles.cardBody}>
              <table className={styles.etable}>
                <thead>
                  <tr>
                    <th style={{ width: '34%' }}>Mes</th>
                    <th>Total de servicios brindados</th>
                    <th>Venían de otra agencia</th>
                    <th style={{ width: 44 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {chartRows.map((row) => (
                    <tr key={row.id}>
                      <td><input className={styles.etInp} value={row.mes} onChange={(e) => handleChartField(row.id, 'mes', e.target.value)} /></td>
                      <td><input className={styles.etInp} value={row.total} onChange={(e) => handleChartField(row.id, 'total', e.target.value)} /></td>
                      <td><input className={styles.etInp} value={row.otraAgencia} onChange={(e) => handleChartField(row.id, 'otraAgencia', e.target.value)} /></td>
                      <td><button className={styles.etDel} onClick={() => handleDelChartRow(row.id)}><IconTrash /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button className={styles.etAdd} onClick={handleAddChartRow}><IconPlus /> Agregar mes</button>

              <div className={styles.chartPrev}>
                <span className={styles.chartBadge}>↑ +38% anual</span>
                <div className={styles.chartPrevLbl}>Vista previa de la gráfica</div>
                <svg viewBox="0 0 440 180" preserveAspectRatio="none" style={{ width: '100%', height: 170, overflow: 'visible' }}>
                  <line x1="0" y1="36" x2="440" y2="36" stroke="var(--line)" strokeWidth="1"></line>
                  <line x1="0" y1="86" x2="440" y2="86" stroke="var(--line)" strokeWidth="1"></line>
                  <line x1="0" y1="136" x2="440" y2="136" stroke="var(--line)" strokeWidth="1"></line>
                  <path d="M0,140 L146,110 L293,80 L440,40 L440,180 L0,180 Z" fill="rgba(31,160,209,0.12)"></path>
                  <path d="M0,140 L146,110 L293,80 L440,40" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path>
                  <path d="M0,165 L146,150 L293,138 L440,124" fill="none" stroke="var(--c3)" strokeWidth="2" strokeDasharray="5 5" strokeLinecap="round"></path>
                  <circle cx="440" cy="40" r="4.5" fill="#fff" stroke="var(--primary)" strokeWidth="2.5"></circle>
                  <circle cx="440" cy="124" r="4.5" fill="#fff" stroke="var(--c3)" strokeWidth="2.5"></circle>
                </svg>
                <div className={styles.lcLegend}>
                  <div className={styles.lcLeg}><span className={styles.ln} style={{ background: 'var(--primary)' }}></span> Total de servicios brindados</div>
                  <div className={styles.lcLeg}><span className={`${styles.ln} ${styles.lnDashed}`}></span> Venían de otra agencia migratoria</div>
                </div>
              </div>
            </div>
            <div className={styles.secFoot}>
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleGuardarChartInfo} disabled={guardandoChart}>
                <IconCheck /> {guardandoChart ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>

          {/* EDITOR 2 — IMAGEN MAPA PRESENCIA */}
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <div className={styles.cardIcon}><IconLayers /></div>
              <div><div className={styles.cardTitle}>¿De dónde nos buscan?</div><div className={styles.cardSub}>Sube una imagen del mapa de presencia por estado</div></div>
            </div>
            <div className={styles.cardBody}>
              <MapUploadRow
                id="presencia"
                preview={mapaPresencia}
                onPick={(file) => handlePickImagen(file, setMapaPresencia)}
                onClear={() => setMapaPresencia(null)}
              />
              <div className={styles.hint}><IconInfo /> Esta imagen reemplaza el mapa de la sección "Nuestros números" en la página pública.</div>
            </div>
            <div className={styles.secFoot}>
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => guardarMapas(setGuardandoPresencia)} disabled={guardandoPresencia}>
                <IconCheck /> {guardandoPresencia ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>

          {/* EDITOR 3 — IMAGEN MAPA CAS/CONSULADO */}
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <div className={styles.cardIcon}><IconPin /></div>
              <div><div className={styles.cardTitle}>Ubicaciones CAS y Consulado</div><div className={styles.cardSub}>Sube una imagen del mapa de zonas/ubicaciones</div></div>
            </div>
            <div className={styles.cardBody}>
              <MapUploadRow
                id="zonas"
                preview={mapaZonas}
                onPick={(file) => handlePickImagen(file, setMapaZonas)}
                onClear={() => setMapaZonas(null)}
              />
              <div className={styles.hint}><IconInfo /> Esta imagen reemplaza el mapa de zonas de la sección "Nuestros números" en la página pública.</div>
            </div>
            <div className={styles.secFoot}>
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => guardarMapas(setGuardandoZonas)} disabled={guardandoZonas}>
                <IconCheck /> {guardandoZonas ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import EmpresaSidebar from './EmpresaSidebar.jsx';
import styles from './../../styles/EmpresaRecursos.module.css';

// Extraído 1:1 de "18-Recursos (standalone).html". Estos 3 editores
// alimentan visualmente la sección "Nuestros números" de la landing
// (StatsSection.jsx), pero esa sección tiene sus gráficas y mapas
// completamente hardcodeados en JSX/SVG — no hay backend (ni entidad
// Empresa/config) para persistir tabla, colores de mapa ni zonas. Por
// eso esto es UI 1:1 sin persistencia, igual que Página Pública: la
// interactividad (agregar/quitar fila, pintar estado, agregar/quitar
// zona) funciona en memoria tal como en el mockup original, pero
// "Guardar cambios" no persiste nada. Los datos de ejemplo son los
// mismos que trae el mockup (no hay una fuente real más granular que
// sustituirlos, ya que el mapa/tabla del mockup no coincide 1:1 con la
// estructura de datos ya hardcodeada en StatsSection.jsx).

const STATES = [
  { n: 'Baja California', x: 8, y: 16, w: 30, h: 44 },
  { n: 'Sonora', x: 40, y: 22, w: 38, h: 40 },
  { n: 'Chihuahua', x: 80, y: 26, w: 46, h: 42 },
  { n: 'Coahuila', x: 128, y: 44, w: 38, h: 34 },
  { n: 'Nuevo León', x: 150, y: 60, w: 30, h: 30 },
  { n: 'Sinaloa', x: 62, y: 64, w: 30, h: 42 },
  { n: 'Durango', x: 94, y: 72, w: 34, h: 32 },
  { n: 'Tamaulipas', x: 168, y: 78, w: 34, h: 38 },
  { n: 'Jalisco', x: 88, y: 106, w: 40, h: 36 },
  { n: 'Guanajuato', x: 130, y: 102, w: 28, h: 26 },
  { n: 'CDMX / Edomex', x: 150, y: 116, w: 34, h: 30 },
  { n: 'Morelos', x: 158, y: 148, w: 28, h: 24 },
  { n: 'Puebla', x: 188, y: 126, w: 30, h: 30 },
  { n: 'Veracruz', x: 204, y: 88, w: 30, h: 50 },
  { n: 'Michoacán', x: 118, y: 136, w: 36, h: 28 },
  { n: 'Guerrero', x: 128, y: 164, w: 40, h: 28 },
  { n: 'Oaxaca', x: 188, y: 164, w: 42, h: 30 },
  { n: 'Chiapas', x: 232, y: 168, w: 38, h: 30 },
  { n: 'Yucatán', x: 264, y: 116, w: 38, h: 28 },
];
const DEFAULT_FILL = '#EAEBED';

const PRESENCIA_SWATCHES = [
  { color: '#1FA0D1', name: 'Mucha presencia', sub: 'Estado con muchos clientes' },
  { color: '#28A052', name: 'Sí tenemos presencia', sub: 'Algunos clientes' },
  { color: '#B73E3E', name: 'No tenemos presencia', sub: 'Sin clientes aún' },
];

const CHART_ROWS_INICIALES = [
  { id: 1, mes: 'Enero', total: '42', otraAgencia: '12' },
  { id: 2, mes: 'Marzo', total: '58', otraAgencia: '19' },
  { id: 3, mes: 'Mayo', total: '71', otraAgencia: '24' },
  { id: 4, mes: 'Junio', total: '96', otraAgencia: '31' },
];

const ZONAS_INICIALES = [
  { id: 1, color: '#1FA0D1', nombre: 'CDMX — CAS Hamburgo' },
  { id: 2, color: '#28A052', nombre: 'Jalisco — CAS Guadalajara' },
  { id: 3, color: '#D9722E', nombre: 'Nuevo León — Consulado MTY' },
];

function IconChart() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3v18h18M7 14l4-4 3 3 5-6"></path></svg>; }
function IconLayers() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 18l-6 3V6l6-3M9 18l6 3M9 18V3M15 21l6-3V3l-6 3M15 21V6"></path></svg>; }
function IconPin() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>; }
function IconCheck() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12l5 5L20 7"></path></svg>; }
function IconPlus({ size = 13 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"></path></svg>; }
function IconTrash({ size = 14 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path></svg>; }
function IconClose({ size = 13 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M6 18L18 6"></path></svg>; }
function IconInfo() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4M12 8h.01"></path></svg>; }

function MexMap({ fills, onStateClick }) {
  return (
    <div className={styles.mxMap}>
      <svg viewBox="0 0 320 210">
        {STATES.map((s, i) => (
          <rect
            key={s.n}
            className={styles.mxSt}
            x={s.x} y={s.y} width={s.w} height={s.h} rx="6"
            fill={fills[i] ?? DEFAULT_FILL}
            onClick={() => onStateClick(i)}
          >
            <title>{s.n}</title>
          </rect>
        ))}
      </svg>
    </div>
  );
}

export default function EmpresaRecursos() {
  const navigate = useNavigate();

  const [chartRows, setChartRows] = useState(CHART_ROWS_INICIALES);

  const [presenciaFills, setPresenciaFills] = useState({});
  const [swatchSel, setSwatchSel] = useState(0);

  const [zonaFills, setZonaFills] = useState({});
  const [zoneColor, setZoneColor] = useState('#1FA0D1');
  const [zoneName, setZoneName] = useState('');
  const [zonas, setZonas] = useState(ZONAS_INICIALES);

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

  const handleChartField = (id, field, value) => {
    setChartRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };
  const handleAddChartRow = () => setChartRows((prev) => [...prev, { id: Date.now(), mes: '', total: '', otraAgencia: '' }]);
  const handleDelChartRow = (id) => setChartRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));

  const handlePresenciaClick = (idx) => {
    setPresenciaFills((prev) => ({ ...prev, [idx]: PRESENCIA_SWATCHES[swatchSel].color }));
  };

  const handleZonaMapClick = (idx) => {
    if (!zoneName.trim()) return;
    setZonaFills((prev) => ({ ...prev, [idx]: zoneColor }));
    setZonas((prev) => [...prev, { id: Date.now(), color: zoneColor, nombre: `${STATES[idx].n} — ${zoneName.trim()}` }]);
  };

  const handleAddZonaManual = () => {
    if (!zoneName.trim()) return;
    setZonas((prev) => [...prev, { id: Date.now(), color: zoneColor, nombre: zoneName.trim() }]);
    setZoneName('');
  };

  const handleDelZona = (id) => setZonas((prev) => prev.filter((z) => z.id !== id));

  return (
    <div className={styles.page}>
      <EmpresaSidebar active="recursos" onNavigate={handleNavigate} />

      <main className={styles.main}>
        <header className={styles.topbar}>
          <div>
            <div className={styles.crumb}><span>Menú extendido</span> <span className={styles.crumbSep}>/</span> <span className={styles.accent}>Recursos</span></div>
            <div className={styles.pageTitle}>Recursos</div>
          </div>
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
            <div className={styles.secFoot}><button className={`${styles.btn} ${styles.btnPrimary}`}><IconCheck /> Guardar cambios</button></div>
          </div>

          {/* EDITOR 2 — MAPA PRESENCIA */}
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <div className={styles.cardIcon}><IconLayers /></div>
              <div><div className={styles.cardTitle}>¿De dónde nos buscan?</div><div className={styles.cardSub}>Da clic en un estado y elige su nivel de presencia</div></div>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.mapLayout}>
                <MexMap fills={presenciaFills} onStateClick={handlePresenciaClick} />
                <div className={styles.mapSide}>
                  <div className={styles.paletteLbl}>Nivel de presencia</div>
                  <div className={styles.swatches}>
                    {PRESENCIA_SWATCHES.map((sw, i) => (
                      <div key={sw.color} className={`${styles.swatch} ${swatchSel === i ? styles.sel : ''}`} onClick={() => setSwatchSel(i)}>
                        <span className={styles.swDot} style={{ background: sw.color }}></span>
                        <div><div className={styles.swName}>{sw.name}</div><div className={styles.swSub}>{sw.sub}</div></div>
                      </div>
                    ))}
                  </div>
                  <div className={styles.hint}><IconInfo /> Clic en cualquier estado del mapa para colorearlo con el nivel elegido.</div>
                </div>
              </div>
            </div>
            <div className={styles.secFoot}><button className={`${styles.btn} ${styles.btnPrimary}`}><IconCheck /> Guardar cambios</button></div>
          </div>

          {/* EDITOR 3 — MAPA CAS/CONSULADO */}
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <div className={styles.cardIcon}><IconPin /></div>
              <div><div className={styles.cardTitle}>Ubicaciones CAS y Consulado</div><div className={styles.cardSub}>Clic en un estado, elige un color libre y nómbralo</div></div>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.mapLayout}>
                <MexMap fills={zonaFills} onStateClick={handleZonaMapClick} />
                <div className={styles.mapSide}>
                  <div className={styles.paletteLbl}>Color y nombre de zona</div>
                  <div className={styles.pickerBox}>
                    <div className={styles.pickerRow}>
                      <input type="color" value={zoneColor} onChange={(e) => setZoneColor(e.target.value)} />
                      <input type="text" placeholder="Ej. Hermosillo y Nogales" value={zoneName} onChange={(e) => setZoneName(e.target.value)} />
                    </div>
                    <button className={styles.pickerAdd} onClick={handleAddZonaManual}><IconPlus /> Agregar zona</button>
                    <div className={styles.hint}><IconInfo /> Elige color y nombre, luego da clic en un estado del mapa para asignarlo.</div>
                  </div>
                  <div className={styles.legend}>
                    <div className={styles.legendTitle}>Zonas asignadas</div>
                    <div className={styles.zoneList}>
                      {zonas.map((z) => (
                        <div key={z.id} className={styles.zoneItem}>
                          <span className={styles.zoneColor} style={{ background: z.color }}></span>
                          <span className={styles.zoneName}>{z.nombre}</span>
                          <button className={styles.zoneDel} onClick={() => handleDelZona(z.id)}><IconClose /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.secFoot}><button className={`${styles.btn} ${styles.btnPrimary}`}><IconCheck /> Guardar cambios</button></div>
          </div>

        </div>
      </main>
    </div>
  );
}

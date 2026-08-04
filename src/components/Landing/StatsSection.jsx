import React, { useState } from "react";
import useReveal from "../../hooks/useReveal";
import styles from '../../styles/landing/StatsSection.module.css';

const MX_STATES = [
  { name: "Baja California", val: 38, x: 8, y: 20, w: 34, h: 46, fill: "#B4C8D8" },
  { name: "Sonora / Chihuahua", val: 54, x: 46, y: 26, w: 56, h: 40, fill: "#9DB8CC" },
  { name: "Nuevo León", val: 121, x: 106, y: 40, w: 40, h: 34, fill: "#6FAEDB" },
  { name: "Jalisco", val: 276, x: 70, y: 92, w: 46, h: 40, fill: "#4E84C4" },
  { name: "CDMX / Edomex", val: 534, x: 138, y: 104, w: 42, h: 36, fill: "#2D6CDF" },
  { name: "Morelos", val: 842, x: 150, y: 142, w: 38, h: 34, fill: "#1B2A4A" },
  { name: "Puebla", val: 187, x: 186, y: 120, w: 36, h: 34, fill: "#6FAEDB" },
  { name: "Guerrero", val: 98, x: 120, y: 160, w: 40, h: 34, fill: "#9DB8CC" },
  { name: "Veracruz", val: 143, x: 200, y: 86, w: 34, h: 50, fill: "#6FAEDB" },
  { name: "Oaxaca / Chiapas", val: 76, x: 190, y: 166, w: 56, h: 34, fill: "#9DB8CC" },
  { name: "Yucatán", val: 44, x: 250, y: 120, w: 40, h: 30, fill: "#B4C8D8" },
];

const ZONE_STATES = [
  { x: 8, y: 20, w: 34, h: 46, fill: "#EAEBED" },
  { x: 46, y: 26, w: 56, h: 40, fill: "#8B5CF6" },
  { x: 106, y: 40, w: 40, h: 34, fill: "#F2C744" },
  { x: 70, y: 92, w: 46, h: 40, fill: "#EAEBED" },
  { x: 138, y: 104, w: 42, h: 36, fill: "#B73E3E" },
  { x: 150, y: 142, w: 38, h: 34, fill: "#B73E3E" },
  { x: 186, y: 120, w: 36, h: 34, fill: "#EAEBED" },
  { x: 120, y: 160, w: 40, h: 34, fill: "#EAEBED" },
  { x: 200, y: 86, w: 34, h: 50, fill: "#EAEBED" },
  { x: 190, y: 166, w: 56, h: 34, fill: "#EAEBED" },
  { x: 250, y: 120, w: 40, h: 30, fill: "#28A052" },
];

const ZONE_LEGEND = [
  { color: "#8B5CF6", label: "Hermosillo y Nogales" },
  { color: "#2D6CDF", label: "Mérida y Monterrey" },
  { color: "#28A052", label: "Matamoros y Nuevo Laredo" },
  { color: "#F2C744", label: "Tijuana y Ciudad Juárez" },
  { color: "#B73E3E", label: "CDMX y GDL" },
];

const RANKED = [
  { rank: '01', name: 'Morelos', val: 842, width: '100%', color: 'var(--c1)', valColor: 'var(--white)' },
  { rank: '02', name: 'CDMX', val: 534, width: '74%', color: 'var(--c2)' },
  { rank: '03', name: 'Jalisco', val: 276, width: '46%', color: 'var(--c3)' },
  { rank: '04', name: 'Puebla', val: 187, width: '32%', color: 'var(--accent)' },
  { rank: '05', name: 'Veracruz', val: 143, width: '25%', color: 'var(--c4)', nameColor: 'var(--c1)' },
];

export default function StatsSection() {
  const [headerRef, headerIn] = useReveal();
  const [donutRef, donutIn] = useReveal();
  const [lineRef, lineIn] = useReveal();
  const [mxRef, mxIn] = useReveal();
  const [zoneRef, zoneIn] = useReveal();

  const [tip, setTip] = useState(null);

  return (
    <section className={styles.datavis} id="numeros">
      <div className="jas-container">
        <div ref={headerRef} className={`${styles.datavisHeader} jas-reveal ${headerIn ? 'jas-in' : ''}`}>
          <h2 className="jas-display">
            Nuestros números<br /><em>hablan.</em>
          </h2>
          <p>Datos reales de nuestra operación. Transparencia que respalda cada trámite que acompañamos.</p>
        </div>

        <div className={styles.dvGrid}>
          {/* Donut aprobación */}
          <div ref={donutRef} className={`${styles.dvCard} ${styles.dark} jas-reveal ${donutIn ? 'jas-in' : ''}`}>
            <div className={styles.dvHead}>
              <div>
                <div className={styles.dvLabel}>Aprobación mensual</div>
                <div className={styles.dvTitle}>Tasa de aprobación<br />de visas 2026</div>
              </div>
              <span className={styles.dvBadge}>↑ +2% vs 2025</span>
            </div>
            <div className={styles.donutWrap}>
              <div className={styles.donut}>
                <svg width="180" height="180" viewBox="0 0 180 180">
                  <circle cx="90" cy="90" r="74" fill="none" stroke="rgba(228,236,240,0.12)" strokeWidth="20" />
                  <circle cx="90" cy="90" r="74" fill="none" stroke="var(--accent)" strokeWidth="20" strokeLinecap="round" strokeDasharray="446" strokeDashoffset="18" />
                </svg>
                <div className={styles.donutCenter}>
                  <div className={styles.donutPct}>96<small>%</small></div>
                  <div className={styles.donutSub}>aprobadas</div>
                </div>
              </div>
              <div className={styles.donutLegend}>
                <div className={styles.dlegItem}>
                  <span className={styles.dlegDot} style={{ background: 'var(--accent)' }}></span>
                  <div className={styles.dlegText}>
                    <div className={styles.dlegName}>Visas aprobadas</div>
                    <div className={styles.dlegVal}>96% · 1,247 trámites</div>
                  </div>
                </div>
                <div className={styles.dlegItem}>
                  <span className={styles.dlegDot} style={{ background: 'rgba(228,236,240,0.20)' }}></span>
                  <div className={styles.dlegText}>
                    <div className={styles.dlegName}>En revisión / reapertura</div>
                    <div className={styles.dlegVal}>4% · 52 trámites</div>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.donutFootnote}>
              Promedio sostenido en los últimos 12 meses de operación.
            </div>
          </div>

          {/* Line chart */}
          <div ref={lineRef} className={`${styles.dvCard} jas-reveal jas-delay-1 ${lineIn ? 'jas-in' : ''}`}>
            <div className={styles.dvHead}>
              <div>
                <div className={styles.dvLabel}>Servicios brindados</div>
                <div className={styles.dvTitle}>Trámites completados<br />por mes</div>
              </div>
              <span className={styles.dvBadge}>+38% anual</span>
            </div>
            <div className={styles.linechart}>
              <svg viewBox="0 0 440 200" preserveAspectRatio="none">
                <line x1="0" y1="40" x2="440" y2="40" stroke="var(--line)" strokeWidth="1" />
                <line x1="0" y1="90" x2="440" y2="90" stroke="var(--line)" strokeWidth="1" />
                <line x1="0" y1="140" x2="440" y2="140" stroke="var(--line)" strokeWidth="1" />
                <path d="M0,150 L73,130 L146,138 L220,100 L293,108 L366,70 L440,55 L440,200 L0,200 Z" fill="rgba(45,108,223,0.10)" />
                <path d="M0,150 L73,130 L146,138 L220,100 L293,108 L366,70 L440,55" fill="none" stroke="var(--c2)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M0,178 L73,170 L146,172 L220,155 L293,150 L366,138 L440,128" fill="none" stroke="var(--c3)" strokeWidth="2" strokeDasharray="5 5" strokeLinecap="round" />
                <circle cx="440" cy="55" r="4" fill="var(--white)" stroke="var(--c2)" strokeWidth="2.5" />
                <circle cx="366" cy="70" r="3" fill="var(--c2)" />
                <circle cx="440" cy="128" r="4" fill="var(--white)" stroke="var(--c3)" strokeWidth="2.5" />
              </svg>
              <svg viewBox="0 0 440 16" style={{ height: '16px', marginTop: '6px' }}>
                <text x="0" y="11" className={styles.lcAxis}>ENE</text>
                <text x="110" y="11" className={styles.lcAxis}>MAR</text>
                <text x="215" y="11" className={styles.lcAxis}>MAY</text>
                <text x="320" y="11" className={styles.lcAxis}>SEP</text>
                <text x="415" y="11" className={styles.lcAxis}>DIC</text>
              </svg>
            </div>
            <div className={styles.lcLegend}>
              <div className={styles.lcLeg}><span className={styles.ln} style={{ background: 'var(--c2)' }}></span> Total de servicios brindados</div>
              <div className={styles.lcLeg}><span className={`${styles.ln} ${styles.dashed}`}></span> Venían de otra agencia migratoria</div>
            </div>
          </div>

          {/* Mapa México con tooltip */}
          <div ref={mxRef} className={`${styles.dvCard} jas-reveal ${mxIn ? 'jas-in' : ''}`}>
            <div className={styles.dvHead}>
              <div>
                <div className={styles.dvLabel}>Servicios por estado</div>
                <div className={styles.dvTitle}>¿De dónde nos<br />buscan?</div>
              </div>
              <span className={styles.dvBadge}>14 estados</span>
            </div>
            <div className={styles.mxWrap}>
              <div className={styles.mxMap}>
                {tip && (
                  <div className={`${styles.mxTooltip} ${styles.show}`} style={{ left: tip.x, top: tip.y }}>
                    <b>{tip.name}</b> · {tip.val} clientes
                  </div>
                )}
                <svg viewBox="0 0 300 220">
                  {MX_STATES.map((s) => (
                    <rect
                      key={s.name}
                      className={styles.mxState}
                      x={s.x} y={s.y} width={s.w} height={s.h} rx="6" fill={s.fill}
                      onMouseMove={(e) => {
                        const rect = e.currentTarget.ownerSVGElement.parentElement.getBoundingClientRect();
                        setTip({ name: s.name, val: s.val, x: e.clientX - rect.left, y: e.clientY - rect.top });
                      }}
                      onMouseLeave={() => setTip(null)}
                    />
                  ))}
                </svg>
              </div>
              <div className={styles.mxSide}>
                {RANKED.map((r) => (
                  <div key={r.rank} className={styles.mxStatRow}>
                    <span className={styles.mxRank}>{r.rank}</span>
                    <div className={styles.mxBarWrap}>
                      <div className={styles.mxBar} style={{ width: r.width, background: r.color }}>
                        <span className={styles.mxBarName} style={r.nameColor ? { color: r.nameColor } : undefined}>{r.name}</span>
                        {r.valColor && <span className={styles.mxBarVal} style={{ color: r.valColor }}>{r.val}</span>}
                      </div>
                      {!r.valColor && <span className={styles.mxBarVal} style={{ color: 'var(--muted)' }}>{r.val}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mapa de zonas */}
          <div ref={zoneRef} className={`${styles.dvCard} jas-reveal jas-delay-1 ${zoneIn ? 'jas-in' : ''}`}>
            <div className={styles.dvHead}>
              <div>
                <div className={styles.dvLabel}>Servicios por estado</div>
                <div className={styles.dvTitle}>¿De dónde nos<br />buscan?</div>
              </div>
              <span className={styles.dvBadge}>Mapa</span>
            </div>
            <div className={styles.mxWrap}>
              <div className={styles.mxMap}>
                <svg viewBox="0 0 300 220">
                  {ZONE_STATES.map((s, i) => (
                    <rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} rx="6" fill={s.fill} />
                  ))}
                </svg>
              </div>
              <div className={styles.mxSide}>
                {ZONE_LEGEND.map((z) => (
                  <div key={z.label} className={styles.zoneLegendRow}>
                    <span className={styles.zoneLegendDot} style={{ background: z.color }}></span>
                    {z.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

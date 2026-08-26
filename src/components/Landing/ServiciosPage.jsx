import React, { useEffect, useMemo, useState } from 'react';
import { getAllProcess, getStepById } from './../../api/api.js';
import { getServiceIcon, getServiceCategory } from './../../utils/serviceIcons.js';
import ServiceDetailsModal from './../Cliente/Modals/ServiceDetailsModal.jsx';
import StepsModal from './../Cliente/Modals/StepsModal.jsx';
import PaymentModal from './../Cliente/Modals/PaymentModal.jsx';
import LandingNavbar from './LandingNavbar.jsx';
import FooterSection from './FooterSection.jsx';
import styles from './../../styles/landing/ServiciosPage.module.css';

// Extraído 1:1 de "Servicios (standalone).html" (catálogo público). El ícono
// por tarjeta y la categoría de los filtros/pills SÍ son reales: se derivan
// del ícono elegido en el modal de servicio (ver utils/serviceIcons.js) —
// Transact no tiene un campo de categoría. Duración ("4-8 semanas"),
// "Destacado" (solo la 1a tarjeta) y los stats 8 Destinos / 96% Aprobación
// del header son texto fijo igual que en el mockup (2026-07-17, el usuario
// pidió mantener la densidad visual del diseño en vez de omitirlos) — no
// son datos reales por servicio, Transact no los tiene. La bandera de país
// por servicio SÍ se omitió: a diferencia de duración/aprobación, no hay un
// valor genérico razonable (mostrar 🇺🇸 en un trámite que es de Canadá sería
// activamente incorrecto). El footer no estaba en este export standalone
// (solo mostraba la pantalla suelta); se agregó FooterSection porque toda
// página real del sitio lo tiene.

const NAV_SECTIONS = [
  { id: 'inicio', label: 'Inicio', href: '/' },
  { id: 'servicios', label: 'Servicios', href: '/Servicios' },
  { id: 'nosotros', label: 'Nosotros', href: '/#nosotros' },
  { id: 'testimonios', label: 'Testimonios', href: '/#testimonios' },
  { id: 'faq', label: 'Preguntas', href: '/#faq' },
  { id: 'contacto', label: 'Contacto', href: '/#contacto' },
];

const PILLS = [
  { id: 'todos', label: 'Todos' },
  { id: 'visa', label: 'Visas' },
  { id: 'pasaporte', label: 'Pasaportes' },
  { id: 'formulario', label: 'Formularios' },
  { id: 'citas', label: 'Citas' },
  { id: 'asesoria', label: 'Asesoría' },
];

function DefaultServiceIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="6" y="4" width="20" height="28" rx="2" /><circle cx="16" cy="14" r="3.5" /><path d="M10 22h12M10 26h8" />
    </svg>
  );
}
function IconGlyph({ svg, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: svg }} />
  );
}
function SearchIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.35-4.35"></path></svg>;
}
function GridViewIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect></svg>;
}
function ListViewIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>;
}
function ClockIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg>;
}
function StepsIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6h13M8 12h13M8 18h13"></path><circle cx="3.5" cy="6" r="1.2"></circle><circle cx="3.5" cy="12" r="1.2"></circle><circle cx="3.5" cy="18" r="1.2"></circle></svg>;
}
function MoreIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"></path></svg>;
}
function PhoneIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>;
}
function WhatsIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 17 0z"></path></svg>;
}

function formatCost(cost) {
  if (cost === null || cost === undefined) return null;
  return new Intl.NumberFormat('es-MX').format(cost);
}
function cleanDescription(text) {
  if (!text) return text;
  return text.replace(/•/g, '').replace(/\s{2,}/g, ' ').trim();
}

export default function ServiciosPage() {
  const [services, setServices] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [pasosCount, setPasosCount] = useState({});
  const [filtro, setFiltro] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [vista, setVista] = useState('grid');

  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [stepsModalOpen, setStepsModalOpen] = useState(false);
  const [stepsService, setStepsService] = useState(null);
  const [steps, setSteps] = useState([]);
  const [stepsLoading, setStepsLoading] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedServiceForPayment, setSelectedServiceForPayment] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setCargando(true);
      const response = await getAllProcess();
      const lista = response.success && Array.isArray(response.response.Transacts)
        ? response.response.Transacts.filter((s) => s.status === true)
        : [];
      setServices(lista);
      fetchPasosCount(lista);
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]);
    } finally {
      setCargando(false);
    }
  };

  const fetchPasosCount = async (lista) => {
    const entries = await Promise.all(lista.map(async (s) => {
      try {
        const res = await getStepById(s.idTransact);
        const n = res?.success && Array.isArray(res.response?.StepsTransacts) ? res.response.StepsTransacts.length : 0;
        return [s.idTransact, n];
      } catch {
        return [s.idTransact, 0];
      }
    }));
    setPasosCount(Object.fromEntries(entries));
  };

  const fetchStepsById = async (idTransact) => {
    setStepsLoading(true);
    try {
      const response = await getStepById(idTransact);
      setSteps(response?.success && Array.isArray(response.response?.StepsTransacts) ? response.response.StepsTransacts : []);
    } catch {
      setSteps([]);
    } finally {
      setStepsLoading(false);
    }
  };

  const handleOpenDetailsModal = async (service) => {
    setSelectedService(service);
    setDetailsModalOpen(true);
    await fetchStepsById(service.idTransact);
  };
  const handleCloseDetailsModal = () => {
    setSelectedService(null);
    setDetailsModalOpen(false);
    setSteps([]);
    setIsZoomed(false);
  };
  const handleOpenStepsModal = async (idTransact) => {
    setStepsService(services.find((s) => s.idTransact === idTransact) || null);
    await fetchStepsById(idTransact);
    setStepsModalOpen(true);
  };
  const handleCloseStepsModal = () => { setStepsModalOpen(false); setStepsService(null); setSteps([]); };

  const singint = (service) => {
    if (service) {
      const minimalService = {
        idTransact: service.idTransact, name: service.name, cost: service.cost,
        cashAdvance: service.cashAdvance, isDateService: service.isDateService,
        cas: service.cas, con: service.con, simulation: service.simulation, status: service.status,
      };
      sessionStorage.setItem('selectedService', JSON.stringify(minimalService));
    }
    window.location.href = '/Login';
  };
  const handleOpenPaymentModal = (service) => { setSelectedServiceForPayment(service); setPaymentModalOpen(true); };
  const handleClosePaymentModal = () => { setSelectedServiceForPayment(null); setPaymentModalOpen(false); };

  const categoryCounts = useMemo(() => {
    const counts = {};
    services.forEach((s) => {
      const cat = getServiceCategory(s);
      if (cat) counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [services]);

  const filteredServices = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return services.filter((s) => {
      const matchCategoria = filtro === 'todos' || getServiceCategory(s) === filtro;
      const matchBusqueda = !q || s.name?.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q);
      return matchCategoria && matchBusqueda;
    });
  }, [services, filtro, busqueda]);

  const scrollToGrid = () => {
    document.getElementById('servicios-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const handleCatCardClick = (categoryId) => { setFiltro(categoryId); scrollToGrid(); };

  return (
    <div className={styles.page}>
      <LandingNavbar activeSection="servicios" navSections={NAV_SECTIONS} handleNavClick={() => {}} />

      {/* HEAD */}
      <header className={styles.pageHead}>
        <div className="jas-container">
          <div className={styles.breadcrumb}>
            <a href="/">Inicio</a>
            <span className={styles.sep}>/</span>
            <span className={styles.current}>Servicios</span>
          </div>
          <div className={styles.headGrid}>
            <div>
              <div className="jas-label" style={{ color: 'var(--accent)', marginBottom: 16 }}>— CATÁLOGO COMPLETO</div>
              <h1 className={`jas-display ${styles.headTitle}`}>
                Todos nuestros<br /><em>servicios.</em>
              </h1>
              <p className={styles.headSub}>
                {services.length > 0
                  ? `${services.length} servicios migratorios diseñados para cubrir cada etapa de tu trámite. Filtra por categoría o busca por nombre para encontrar exactamente lo que necesitas.`
                  : 'Servicios migratorios diseñados para cubrir cada etapa de tu trámite. Filtra por categoría o busca por nombre para encontrar exactamente lo que necesitas.'}
              </p>
            </div>
            <div className={styles.headStats}>
              <div className={styles.headStat}>
                <div className={styles.num}>{services.length}</div>
                <div className={styles.lab}>Servicios</div>
              </div>
              <div className={styles.headStat}>
                <div className={styles.num}>8</div>
                <div className={styles.lab}>Destinos</div>
              </div>
              <div className={styles.headStat}>
                <div className={styles.num}>96<em>%</em></div>
                <div className={styles.lab}>Aprobación</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* TOOLBAR */}
      <section className={styles.toolbar}>
        <div className="jas-container">
          <div className={styles.toolbarInner}>
            <div className={styles.filterPills}>
              {PILLS.map((pill) => {
                const count = pill.id === 'todos' ? services.length : (categoryCounts[pill.id] || 0);
                return (
                  <button
                    key={pill.id}
                    type="button"
                    className={`${styles.filterPill} ${filtro === pill.id ? styles.active : ''}`}
                    onClick={() => setFiltro(pill.id)}
                  >
                    {pill.label} <span className={styles.count}>{count}</span>
                  </button>
                );
              })}
            </div>
            <div className={styles.searchBar}>
              <SearchIcon />
              <input
                type="text"
                placeholder="Buscar servicio..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <div className={styles.viewToggle}>
              <button type="button" className={vista === 'grid' ? styles.active : ''} onClick={() => setVista('grid')}><GridViewIcon /></button>
              <button type="button" className={vista === 'list' ? styles.active : ''} onClick={() => setVista('list')}><ListViewIcon /></button>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES GRID */}
      <section className={styles.servicesSection} id="servicios-grid">
        <div className="jas-container">
          {!cargando && filteredServices.length === 0 ? (
            <div className={styles.emptyState}>No encontramos servicios que coincidan con tu búsqueda.</div>
          ) : (
            <div className={styles.svcGrid}>
              {filteredServices.map((service, index) => {
                const icon = getServiceIcon(service);
                const price = formatCost(service.cost);
                const pasos = pasosCount[service.idTransact];
                return (
                  <div key={service.idTransact} className={styles.svcCard}>
                    <div className={styles.svcImg} style={service.image ? { backgroundImage: `url("${service.image}")` } : undefined}>
                      {index === 0 && <span className={styles.svcTag}>Destacado</span>}
                    </div>
                    <div className={styles.svcBody}>
                      <div className={styles.svcIconRow}>
                        <div className={styles.svcIcon}>
                          {icon ? <IconGlyph svg={icon.svg} /> : <DefaultServiceIcon />}
                        </div>
                        <span className={styles.svcNum}>{String(index + 1).padStart(2, '0')}</span>
                      </div>
                      <h3 className={styles.svcName}>{service.name}</h3>
                      <p className={styles.svcDesc}>{cleanDescription(service.description)}</p>
                      <div className={styles.svcMeta}>
                        <span className={styles.svcMetaItem}>
                          <ClockIcon />
                          4-8 semanas
                        </span>
                        <span className={styles.svcMetaItem}>
                          <StepsIcon />
                          {pasos ?? '—'} {pasos === 1 ? 'paso' : 'pasos'}
                        </span>
                      </div>
                    </div>
                    <div className={styles.svcFoot}>
                      <div className={styles.svcActions}>
                        <a className={styles.svcAction} onClick={() => handleOpenStepsModal(service.idTransact)}><StepsIcon />Pasos</a>
                        <a className={styles.svcAction} onClick={() => handleOpenDetailsModal(service)}>Ver más</a>
                      </div>
                      <div className={styles.svcPriceCta}>
                        {price && <div className={styles.svcPrice}>${price}<small>MXN</small></div>}
                        <a className={styles.svcContratar} onClick={() => handleOpenPaymentModal(service)}>
                          Contratar <MoreIcon />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className={styles.catSection}>
        <div className="jas-container">
          <div className={styles.catHead}>
            <div className="jas-label">— EXPLORA POR CATEGORÍA</div>
            <h2 className="jas-display">Encuentra rápido<br />lo que <em>necesitas.</em></h2>
            <p>Filtra nuestro catálogo según tu tipo de trámite.</p>
          </div>
          <div className={styles.catGrid}>
            <button type="button" className={styles.catCard} onClick={() => handleCatCardClick('visa')}>
              <div className={styles.catIcon}><IconGlyph size={22} svg='<rect x="6" y="4" width="20" height="28" rx="2"/><circle cx="16" cy="14" r="3.5"/><path d="M10 22h12M10 26h8"/>' /></div>
              <div className={styles.catName}>Visas</div>
              <div className={styles.catCount}>{categoryCounts.visa || 0} servicios · USA, CA, EU</div>
            </button>
            <button type="button" className={styles.catCard} onClick={() => handleCatCardClick('pasaporte')}>
              <div className={styles.catIcon}><IconGlyph size={22} svg='<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>' /></div>
              <div className={styles.catName}>Pasaportes</div>
              <div className={styles.catCount}>{categoryCounts.pasaporte || 0} servicios · México</div>
            </button>
            <button type="button" className={styles.catCard} onClick={() => handleCatCardClick('formulario')}>
              <div className={styles.catIcon}><IconGlyph size={22} svg='<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>' /></div>
              <div className={styles.catName}>Formularios</div>
              <div className={styles.catCount}>{categoryCounts.formulario || 0} servicios · DS-160 y más</div>
            </button>
            <div className={styles.catCard} style={{ cursor: 'default' }}>
              <div className={styles.catIcon}><IconGlyph size={22} svg='<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>' /></div>
              <div className={styles.catName}>Citas y Asesoría</div>
              <div className={styles.catCount}>{(categoryCounts.citas || 0) + (categoryCounts.asesoria || 0)} servicios · CAS y simulación</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className={styles.ctaBanner}>
        <div className={`jas-container ${styles.ctaBannerInner}`}>
          <div>
            <div className="jas-label" style={{ color: 'var(--accent)' }}>— ¿NO ENCUENTRAS TU TRÁMITE?</div>
            <h2 style={{ marginTop: 14 }}>Cuéntanos tu caso<br />y te <em>orientamos.</em></h2>
            <p>Algunos trámites requieren asesoría personalizada. Habla con un consultor sin compromiso y recibe una propuesta en menos de 24 horas.</p>
          </div>
          <div className={styles.ctaBannerActions}>
            <a href="tel:7779835782" className="jas-btn jas-btn-light">
              <PhoneIcon /> Llámanos: 777 983 5782
            </a>
            <a href="https://wa.me/527772193613" target="_blank" rel="noreferrer" className="jas-btn jas-btn-outline-light">
              <WhatsIcon /> Escríbenos por WhatsApp
            </a>
          </div>
        </div>
      </section>

      <FooterSection />

      {detailsModalOpen && selectedService && (
        <ServiceDetailsModal
          show={detailsModalOpen}
          onHide={handleCloseDetailsModal}
          service={selectedService}
          steps={steps}
          onShowSteps={handleOpenStepsModal}
          loading={stepsLoading}
          isZoomed={isZoomed}
          onToggleZoom={() => setIsZoomed((v) => !v)}
          isFeatured={services[0]?.idTransact === selectedService?.idTransact}
          onContratar={(service) => { handleCloseDetailsModal(); handleOpenPaymentModal(service); }}
        />
      )}
      {stepsModalOpen && (
        <StepsModal
          show={stepsModalOpen}
          onHide={handleCloseStepsModal}
          steps={steps}
          loading={stepsLoading}
          service={stepsService}
          onContratar={(service) => { handleCloseStepsModal(); handleOpenPaymentModal(service); }}
        />
      )}
      {paymentModalOpen && selectedServiceForPayment && (
        <PaymentModal
          show={paymentModalOpen}
          onHide={handleClosePaymentModal}
          service={selectedServiceForPayment}
          userEmail={null}
          userId={null}
          onSuccess={() => {}}
          onError={() => {}}
          isPreviewMode={true}
          onLoginRequired={() => singint(selectedServiceForPayment)}
        />
      )}
    </div>
  );
}

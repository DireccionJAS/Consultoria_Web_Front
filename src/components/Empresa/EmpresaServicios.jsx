


import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { Spinner } from 'react-bootstrap';
import EmpresaSidebar from './EmpresaSidebar.jsx';
import { getAllProcess, getStepById, updateService } from './../../api/api.js';
import ModalServicio from '../Administrador/ModalServicio.jsx';
import ModalPasos from '../Administrador/ModalPasos.jsx';
import styles from './../../styles/EmpresaServicios.module.css';

// Extraído 1:1 de "14-Servicios (standalone).html". El mockup incluye
// varios campos que no existen en el backend (Transact no tiene
// categoría, "flag" promocional, duración estimada ni % de éxito):
// se quitaron los chips de categoría, el flag y esas métricas. El
// conteo de "pasos" sí es real (se pide con getStepById por servicio).
// El botón "Vista previa" no está en el mockup, así que se quitó.
// El toggle activo/inactivo persiste de verdad contra updateService.
// Nota: por ahora NO filtra servicios por compañía (igual que
// EmpresaClientes.jsx/EmpresaTramites.jsx hoy) porque el backend no
// tiene todavía el concepto de Empresa/compañía en Transact.

function IconPlus() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"></path></svg>;
}
function IconSteps() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 6h13M8 12h13M8 18h13"></path><circle cx="3.5" cy="6" r="1.4"></circle><circle cx="3.5" cy="12" r="1.4"></circle><circle cx="3.5" cy="18" r="1.4"></circle></svg>;
}
function IconEdit() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"></path></svg>;
}
function IconServiceBadge() {
  return <svg width="22" height="22" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="6" y="4" width="20" height="28" rx="2"></rect><circle cx="16" cy="14" r="3.5"></circle><path d="M10 22h12M10 26h8"></path></svg>;
}
function IconEmpty() {
  return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>;
}

function formatPrice(price) {
  const n = Number(price) || 0;
  return n.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export default function EmpresaServicios() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState('todos');
  const [pasosCount, setPasosCount] = useState({});

  const [modalServicioAbierto, setModalServicioAbierto] = useState(false);
  const [servicioEditando, setServicioEditando] = useState(null);
  const [modalPasosAbierto, setModalPasosAbierto] = useState(false);
  const [servicioPasos, setServicioPasos] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/'); return; }
    try {
      const decoded = jwtDecode(token);
      if (decoded.role !== 'EMPRESA') { navigate('/'); return; }
      fetchServices();
    } catch (error) {
      console.error('Error decoding token:', error);
      localStorage.removeItem('token');
      navigate('/');
    }
  }, [navigate]);

  const handleNavigate = (key) => {
    console.log('Navegar a sección de sidebar:', key);
  };

  const fetchServices = async () => {
    try {
      setCargando(true);
      const response = await getAllProcess();
      const lista = response.success && Array.isArray(response.response.Transacts) ? response.response.Transacts : [];
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

  const abrirModalAgregar = () => { setServicioEditando(null); setModalServicioAbierto(true); };
  const abrirModalEditar = (service) => { setServicioEditando(service); setModalServicioAbierto(true); };
  const abrirModalPasos = (service) => { setServicioPasos(service); setModalPasosAbierto(true); };

  const handleToggleStatus = async (service) => {
    const payload = {
      name: service.name,
      description: service.description,
      image: service.image,
      imageDetail: service.imageDetail,
      simulation: service.simulation,
      cas: service.cas,
      con: service.con,
      totalPayment: service.totalPayment,
      status: !service.status,
      cashAdvance: service.cashAdvance,
      cost: service.cost,
      nameOption: service.nameOption,
      optionCost: service.optionCost,
      isDateService: service.isDateService,
    };
    try {
      const res = await updateService(service.idTransact, payload);
      if (!res?.success) throw new Error(res?.message || 'No se pudo actualizar el servicio');
      await fetchServices();
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'No se pudo cambiar el estado', text: error.message || 'Ocurrió un error al actualizar el servicio.' });
    }
  };

  const activos = useMemo(() => services.filter((s) => s.status).length, [services]);
  const inactivos = useMemo(() => services.filter((s) => !s.status).length, [services]);
  const serviciosFiltrados = useMemo(() => {
    if (filtro === 'activos') return services.filter((s) => s.status);
    if (filtro === 'inactivos') return services.filter((s) => !s.status);
    return services;
  }, [services, filtro]);

  return (
    <div className={styles.page}>
      <EmpresaSidebar active="servicios" onNavigate={handleNavigate} />

      <main className={styles.main}>
        <header className={styles.topbar}>
          <div>
            <div className={styles.crumb}><span className={styles.crumbLink} onClick={() => navigate('/HomeEmpresa')}>Empresa</span> <span className={styles.crumbSep}>/</span> <span className={styles.accent}>Servicios</span></div>
            <div className={styles.pageTitle}>Gestión de servicios</div>
          </div>
          <div className={styles.topActions}>
            <button className={`${styles.btn} ${styles.btnAccent}`} onClick={abrirModalAgregar}><IconPlus /> Agregar servicio</button>
          </div>
        </header>

        {cargando ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <div className={styles.content}>
            <div className={styles.filters}>
              <button className={`${styles.chip} ${filtro === 'todos' ? styles.active : ''}`} onClick={() => setFiltro('todos')}>Todos <span className={styles.cnt}>{services.length}</span></button>
              <button className={`${styles.chip} ${filtro === 'activos' ? styles.active : ''}`} style={{ marginLeft: 'auto' }} onClick={() => setFiltro('activos')}>Activos <span className={styles.cnt}>{activos}</span></button>
              <button className={`${styles.chip} ${filtro === 'inactivos' ? styles.active : ''}`} onClick={() => setFiltro('inactivos')}>Inactivos <span className={styles.cnt}>{inactivos}</span></button>
            </div>

            {serviciosFiltrados.length === 0 ? (
              <div className={`${styles.empty} ${styles.show}`}>
                <div className={styles.emptyIcon}><IconEmpty /></div>
                <div className={styles.emptyTitle}>No hay servicios registrados</div>
                <div className={styles.emptySub}>Comienza agregando tu primer servicio con el botón "Agregar servicio".</div>
              </div>
            ) : (
              <div className={styles.svcGrid}>
                {serviciosFiltrados.map((service) => (
                  <div key={service.idTransact} className={`${styles.svcCard} ${!service.status ? styles.inactive : ''}`}>
                    <div className={styles.svcImg} style={{ backgroundImage: `url("${service.image}")` }}>
                      <div className={styles.svcToggleWrap}>
                        <span className={`${styles.tg} ${service.status ? styles.on : ''}`} onClick={() => handleToggleStatus(service)}></span>
                      </div>
                      <div className={styles.svcIconBadge}><IconServiceBadge /></div>
                    </div>
                    <div className={styles.svcBody}>
                      <div className={styles.svcName}>{service.name}</div>
                      <div className={styles.svcStats}>
                        <div className={styles.svcStat}>
                          <div className={styles.svcStatVal}>{pasosCount[service.idTransact] ?? '—'}</div>
                          <div className={styles.svcStatLab}>{pasosCount[service.idTransact] === 1 ? 'paso' : 'pasos'}</div>
                        </div>
                      </div>
                      <div className={styles.svcPrice}>${formatPrice(service.cost)}<small>MXN</small></div>
                      <div className={styles.svcActions}>
                        <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} onClick={() => abrirModalPasos(service)}><IconSteps /> Ver pasos</button>
                        <button className={`${styles.btn} ${styles.btnAccent} ${styles.btnSm}`} onClick={() => abrirModalEditar(service)}><IconEdit /> Editar</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <ModalServicio
        show={modalServicioAbierto}
        onHide={() => setModalServicioAbierto(false)}
        servicio={servicioEditando}
        onGuardado={fetchServices}
      />
      <ModalPasos
        show={modalPasosAbierto}
        onHide={() => setModalPasosAbierto(false)}
        servicio={servicioPasos}
        onGuardado={fetchServices}
      />
    </div>
  );
}

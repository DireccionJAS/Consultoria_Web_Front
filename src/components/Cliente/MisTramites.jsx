import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import ClienteSidebar from './ClienteSidebar.jsx';
import ModalActualizarTramite from './ActualizarMiTramite.jsx';
import { clientePorId, tramitesPorId, getStepById } from './../../api/api.js';
import styles from './../../styles/ClienteMisTramites.module.css';

function ArrowIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>; }

const STATUS_META = {
  1: { label: 'En proceso', cls: 'tagProceso' },
  2: { label: 'En espera', cls: 'tagEspera' },
  3: { label: 'Falta de pago', cls: 'tagEspera' },
  4: { label: 'Terminado', cls: 'tagAprobado' },
  5: { label: 'Cancelado', cls: 'tagCancelado' },
  6: { label: 'En revisión', cls: 'tagEspera' },
  7: { label: 'Aprobado', cls: 'tagAprobado' },
};
const ACTIVO = new Set([1, 2, 3, 6]);

function TramiteCard({ tramite, totalPasos, onVerDetalle, onVerFormularios }) {
  const meta = STATUS_META[tramite.status] || { label: 'En proceso', cls: 'tagProceso' };
  const cerrado = tramite.status === 4 || tramite.status === 7;
  const cancelado = tramite.status === 5;
  const progresoPct = totalPasos ? Math.round(((tramite.stepProgress || 0) / totalPasos) * 100) : 0;
  const fill = cancelado ? 'var(--gray)' : cerrado ? 'var(--green)' : 'var(--primary)';
  const progLabel = cerrado
    ? `Completado · ${meta.label}`
    : cancelado
      ? 'Cancelado'
      : totalPasos
        ? `Paso ${tramite.stepProgress || 0} de ${totalPasos}`
        : 'Sin pasos registrados';
  const fechaInicio = tramite.dateStart ? new Date(tramite.dateStart).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Sin definir';

  return (
    <div className={styles.tcard}>
      <div className={styles.tcardImg} style={tramite.transact?.image ? { backgroundImage: `url("${tramite.transact.image}")` } : undefined}>
        <div className={styles.tcardFolio}>
          <div className={styles.tcardFolioLbl}>Folio</div>
          <div className={styles.tcardFolioNum}>#{String(tramite.idTransactProgress).padStart(6, '0')}</div>
        </div>
      </div>
      <div className={styles.tcardBody}>
        <div className={styles.tcardHead}>
          <div>
            <div className={styles.tcardName}>{tramite.transact?.description || 'Trámite'}</div>
            {tramite.transact?.name && <div className={styles.tcardCat}>{tramite.transact.name}</div>}
          </div>
          <span className={`${styles.tag} ${styles[meta.cls]}`}>{meta.label}</span>
        </div>

        <div className={styles.tcardMeta}>
          <div><div className={styles.tmLbl}>Fecha de inicio</div><div className={styles.tmVal}>{fechaInicio}</div></div>
          <div>
            <div className={styles.tmLbl}>Pago</div>
            <div className={styles.tmVal}>${(tramite.paid || 0).toLocaleString('es-MX')} <span style={{ color: 'var(--muted)', fontWeight: 500 }}>/ ${(tramite.paidAll || 0).toLocaleString('es-MX')}</span></div>
          </div>
          {tramite.personName && (
            <div><div className={styles.tmLbl}>Titular</div><div className={styles.tmVal}>{tramite.personName}</div></div>
          )}
        </div>

        <div className={styles.tcardProg}>
          <div className={styles.tpBar}><div className={styles.tpFill} style={{ width: `${cerrado ? 100 : progresoPct}%`, background: fill }}></div></div>
          <span className={styles.tpLbl}>{progLabel}</span>
        </div>

        <div className={styles.tcardFoot}>
          <button className={cerrado ? styles.btnGhost : styles.btnPrimary} onClick={() => onVerDetalle(tramite)}>Ver detalle <ArrowIcon /></button>
          {!cerrado && !cancelado && <button className={styles.btnGhost} onClick={onVerFormularios}>Ver formularios</button>}
        </div>
      </div>
    </div>
  );
}

export default function MisTramites() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [userId, setUserId] = useState('');
  const [datos, setDatos] = useState([]);
  const [pasosPorTransact, setPasosPorTransact] = useState({});
  const [cargando, setCargando] = useState(true);
  const [showModalA, setShowModalA] = useState(false);
  const [tramiteSeleccionado, setTramiteSeleccionado] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) navigate('/MisTramites-sm');
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/'); return; }
    try {
      const decoded = jwtDecode(token);
      setUserId(decoded.idUser);
      if (decoded.role !== 'USER') {
        Swal.fire({ icon: 'error', title: 'Acceso denegado', text: 'No tienes permiso para acceder a esta página.' });
        navigate('/');
        return;
      }
      clientePorId(decoded.idUser)
        .then((response) => {
          if (response.success && response.response.user) setNombre(response.response.user.name);
        })
        .catch((error) => console.error('Error al obtener datos del cliente:', error));
    } catch (error) {
      console.error('Token inválido', error);
      localStorage.removeItem('token');
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    if (userId) fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchServices = async () => {
    try {
      const response = await tramitesPorId(userId);
      if (!response.success || !Array.isArray(response.response.transactProgresses)) {
        setDatos([]);
        return;
      }
      const items = response.response.transactProgresses;
      setDatos(items);

      const idsTransact = [...new Set(items.map((t) => t.idTransact))];
      const entries = await Promise.all(idsTransact.map(async (idTransact) => {
        try {
          const stepsResponse = await getStepById(idTransact);
          return [idTransact, stepsResponse?.response?.StepsTransacts?.length || 0];
        } catch {
          return [idTransact, 0];
        }
      }));
      setPasosPorTransact(Object.fromEntries(entries));
    } catch (error) {
      console.error('Error al obtener los trámites:', error);
      setDatos([]);
    } finally {
      setCargando(false);
    }
  };

  const activos = datos.filter((t) => ACTIVO.has(t.status));
  const historial = datos.filter((t) => !ACTIVO.has(t.status));

  const verDetalle = (tramite) => { setTramiteSeleccionado(tramite); setShowModalA(true); };
  const verFormularios = () => Swal.fire({ icon: 'info', title: 'Próximamente', text: 'Formularios estará disponible aquí muy pronto.' });

  return (
    <div className={styles.page}>
      <ClienteSidebar active="tramites" userName={nombre || 'Cliente'} tramitesCount={datos.length || null} />

      <main className={styles.main}>
        <header className={styles.topbar}>
          <div>
            <div className={styles.crumb}><span>Portal</span> <span style={{ color: 'var(--muted-2)' }}>/</span> <span className={styles.accent}>Mis trámites</span></div>
            <div className={styles.pageTitleH}>Mis trámites</div>
          </div>
          <div className={styles.topAvatar}>{(nombre.trim().charAt(0) || 'C').toUpperCase()}</div>
        </header>

        <div className={styles.content}>
          {cargando ? null : datos.length === 0 ? (
            <div className={styles.empty}>Aún no tienes trámites registrados. Cuando tu asesor registre uno, aparecerá aquí.</div>
          ) : (
            <>
              {activos.length > 0 && (
                <>
                  <div className={styles.sectionLabel}>— Trámite activo</div>
                  {activos.map((t) => (
                    <TramiteCard key={t.idTransactProgress} tramite={t} totalPasos={pasosPorTransact[t.idTransact]} onVerDetalle={verDetalle} onVerFormularios={verFormularios} />
                  ))}
                </>
              )}
              {historial.length > 0 && (
                <>
                  <div className={styles.sectionLabel} style={{ marginTop: 14 }}>— Historial</div>
                  {historial.map((t) => (
                    <TramiteCard key={t.idTransactProgress} tramite={t} totalPasos={pasosPorTransact[t.idTransact]} onVerDetalle={verDetalle} onVerFormularios={verFormularios} />
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </main>

      <ModalActualizarTramite
        show={showModalA}
        onHide={() => setShowModalA(false)}
        onClienteRegistrado={fetchServices}
        cliente={tramiteSeleccionado}
      />
    </div>
  );
}

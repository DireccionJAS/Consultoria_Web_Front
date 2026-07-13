import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import esLocale from '@fullcalendar/core/locales/es';
import { tramitesPorId } from './../../api/api';
import Navbar from '../NavbarUser';

const CITA_META = {
    SIMULACION: { headClass: 'sim', badge: 'Simulación' },
    CAS: { headClass: 'cas', badge: 'CAS' },
    CONSULADO: { headClass: 'con', badge: 'Consulado' },
};

function IconCliClose() {
    return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 6l12 12M6 18L18 6"></path></svg>;
}
function IconCliSim() {
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="4" width="20" height="14" rx="2"></rect><path d="M8 22h8M12 18v4"></path><circle cx="9" cy="11" r="2"></circle></svg>;
}
function IconCliCas() {
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
}
function IconCliCon() {
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6"></path></svg>;
}
const CLI_ICONS = { SIMULACION: IconCliSim, CAS: IconCliCas, CONSULADO: IconCliCon };

export default function Calendario() {
    const navigate = useNavigate();
    const calendarRef = useRef(null);
    const [eventos, setEventos] = useState([]);
    const [citaDetalle, setCitaDetalle] = useState(null);
    const [usuario, setUsuario] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('');
    const [tiposUnicos, setTiposUnicos] = useState([]);
    const [coloresPorTramite, setColoresPorTramite] = useState({});
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebarCollapsed');
        return saved ? JSON.parse(saved) : true;
    });

    // Escuchar cambios en localStorage para el sidebar
    useEffect(() => {
        const handleStorageChange = () => {
            const saved = localStorage.getItem('sidebarCollapsed');
            setSidebarCollapsed(saved ? JSON.parse(saved) : true);
        };

        window.addEventListener('storage', handleStorageChange);

        // También escuchar cambios directos en el mismo tab
        const interval = setInterval(() => {
            const saved = localStorage.getItem('sidebarCollapsed');
            const newState = saved ? JSON.parse(saved) : true;
            if (newState !== sidebarCollapsed) {
                setSidebarCollapsed(newState);
            }
        }, 100);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, [sidebarCollapsed]);

    const obtenerColorPorId = (id) => {
        const coloresBase = [
            '#1E90FF', '#32CD32', '#FFA500', '#FF69B4', '#8A2BE2',
            '#00CED1', '#DC143C', '#FF8C00', '#20B2AA', '#9370DB'
        ];
        return coloresBase[id % coloresBase.length];
    };

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/");
            return;
        }

        try {
            const decoded = jwtDecode(token);
            if (decoded.role !== "USER") {
                Swal.fire({
                    icon: 'error',
                    title: 'Acceso denegado',
                    text: 'No tienes permiso para acceder a esta página.',
                });
                navigate("/");
            } else {
                setUsuario(decoded.idUser);
            }
        } catch (error) {
            console.error("Error decoding token:", error);
            localStorage.removeItem("token");
            navigate("/");
        }
    }, [navigate]);

    useEffect(() => {
        if (usuario) {
            fetchServices();
        }
    }, [usuario]);

    const fetchServices = async () => {
        try {
            const response = await tramitesPorId(usuario);
            if (response.success && Array.isArray(response.response.transactProgresses)) {
                const data = response.response.transactProgresses;

                const tipos = [...new Set(data.map(item => item.transact.description))];
                setTiposUnicos(tipos);

                const colores = {};
                data.forEach(item => {
                    const idReal = item.transact.idTransact;
                    if (!colores[idReal]) {
                        colores[idReal] = obtenerColorPorId(idReal);
                    }
                });
                setColoresPorTramite(colores);

                const eventosTransformados = data.flatMap((item) => {
                    const idReal = item.transact.idTransact;
                    const color = colores[idReal];

                    const baseProps = {
                        transactDesc: item.transact.description,
                        tramiteName: item.transact.description,
                        casCity: item.casCity,
                        conCity: item.conCity,
                        backgroundColor: color,
                        borderColor: color
                    };

                    return [
                        item.dateCas && {
                            title: `${item.transact.description} - CAS`,
                            start: item.dateCas,
                            end: item.dateCas,
                            description: 'Tienes una cita agendada en centro de atención a solicitantes (CAS)',
                            text: item.dateCas,
                            tipo: 'CAS',
                            ...baseProps
                        },
                        item.dateCon && {
                            title: `${item.transact.description} - CONSULADO`,
                            start: item.dateCon,
                            end: item.dateCon,
                            description: 'Tienes una cita agendada en el consulado',
                            text: item.dateCon,
                            tipo: 'CONSULADO',
                            ...baseProps
                        },
                        item.dateSimulation && {
                            title: `${item.transact.description} - SIMULACIÓN`,
                            start: item.dateSimulation,
                            end: item.dateSimulation,
                            description: 'Tienes una cita de simulación con el equipo de Consultoría JAS',
                            text: item.dateSimulation,
                            tipo: 'SIMULACION',
                            ...baseProps
                        }
                    ].filter(Boolean);
                });

                setEventos(eventosTransformados);
            } else {
                setEventos([]);
                setTiposUnicos([]);
            }
        } catch (error) {
            console.error("Error al obtener los trámites:", error);
            setEventos([]);
            setTiposUnicos([]);
        }
    };

    const eventosFiltrados = filtroTipo
        ? eventos.filter(e => e.transactDesc === filtroTipo)
        : eventos;

    const irAFechaMasCercana = (tipo) => {
        const hoy = new Date();
        const fechas = eventosFiltrados
            .filter(e => e.tipo === tipo)
            .map(e => new Date(e.start))
            .filter(fecha => fecha >= hoy)
            .sort((a, b) => a - b);

        if (fechas.length > 0 && calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            calendarApi.gotoDate(fechas[0]);
        } else {
            Swal.fire('Sin coincidencias', `No hay próximas fechas para ${tipo}`, 'info');
        }
    };

    return (
        <>
            <style jsx>{`
                .navbar-fixed {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    z-index: 1001; /* Más alto que el navbar original */
                    width: 100%;
                }

                .calendario-container {
                    padding-top: 120px; /* 100px navbar + 20px espacio */
                    min-height: 100vh;
                    padding-left: 20px;
                    padding-right: 20px;
                    padding-bottom: 20px;
                    margin-left: 280px; /* Espacio para sidebar en desktop */
                    transition: margin-left 0.3s ease;
                }

                .calendario-content {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: flex;
                    gap: 30px;
                    flex-wrap: wrap;
                }

                .calendario-main {
                    flex: 1;
                    min-width: 300px;
                }

                .calendario-sidebar {
                    flex: 0 0 280px;
                    min-width: 280px;
                }

                .filtro-select {
                    margin-bottom: 15px;
                    padding: 12px;
                    width: 100%;
                    background-color: white;
                    color: black;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    font-size: 14px;
                    box-sizing: border-box;
                }

                .botones-container {
                    margin-bottom: 15px;
                    display: flex;
                    gap: 8px;
                    justify-content: flex-end;
                    background-color: white;
                    padding: 12px;
                    border-radius: 4px;
                    flex-wrap: wrap;
                }

                .boton-fecha {
                    background-color: #f8f9fa;
                    color: #495057;
                    border: 1px solid #dee2e6;
                    padding: 8px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    transition: all 0.2s ease-in-out;
                    white-space: nowrap;
                    flex: 1;
                    min-width: 80px;
                }

                .boton-fecha:hover {
                    background-color: #e9ecef;
                    border-color: #adb5bd;
                }

                .calendario-wrapper {
                    background-color: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    border: 1px solid #e0e0e0;
                }

                .info-panel {
                    background-color: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    border: 1px solid #e0e0e0;
                }

                .info-titulo {
                    margin-top: 0;
                    margin-bottom: 15px;
                    color: #333;
                    font-size: 18px;
                }

                .info-lista {
                    list-style: none;
                    padding-left: 0;
                    margin: 0;
                }

                .info-item {
                    margin-bottom: 8px;
                    display: flex;
                    align-items: center;
                }

                .color-indicator {
                    display: inline-block;
                    width: 15px;
                    height: 15px;
                    margin-right: 10px;
                    border-radius: 3px;
                    border: 1px solid #ddd;
                    flex-shrink: 0;
                }

                .info-text {
                    font-size: 14px;
                    color: #555;
                    line-height: 1.3;
                }

                /* Media queries para responsividad */
                @media (max-width: 768px) {
                    .calendario-container {
                        padding-top: 90px; /* 70px navbar + 20px espacio */
                        padding-left: 15px;
                        padding-right: 15px;
                        padding-bottom: 15px;
                        margin-left: 0; /* Sin sidebar en móvil */
                    }

                    .calendario-content {
                        flex-direction: column;
                        gap: 20px;
                    }

                    .calendario-sidebar {
                        order: -1;
                        flex: none;
                        min-width: auto;
                    }

                    .botones-container {
                        justify-content: center;
                        gap: 6px;
                        flex-wrap: wrap;
                    }

                    .boton-fecha {
                        padding: 10px 8px;
                        font-size: 13px;
                        min-width: 70px;
                        flex: 0 1 auto;
                    }

                    .calendario-wrapper {
                        padding: 15px;
                    }

                    .info-panel {
                        padding: 15px;
                    }

                    .info-titulo {
                        font-size: 16px;
                    }

                    .filtro-select {
                        padding: 10px;
                    }
                }

                @media (max-width: 480px) {
                    .calendario-container {
                        padding-top: 80px; /* 60px navbar + 20px espacio */
                        padding-left: 10px;
                        padding-right: 10px;
                        padding-bottom: 10px;
                        margin-left: 0;
                    }

                    .botones-container {
                        padding: 10px;
                        gap: 4px;
                        justify-content: space-between;
                    }

                    .boton-fecha {
                        padding: 8px 6px;
                        font-size: 12px;
                        min-width: 60px;
                        flex: 1;
                    }

                    .calendario-wrapper {
                        padding: 10px;
                    }

                    .info-panel {
                        padding: 12px;
                    }

                    .info-titulo {
                        font-size: 15px;
                        margin-bottom: 12px;
                    }

                    .info-text {
                        font-size: 13px;
                    }

                    .color-indicator {
                        width: 12px;
                        height: 12px;
                        margin-right: 8px;
                    }

                    .filtro-select {
                        font-size: 14px;
                    }
                }

                @media (max-width: 360px) {
                    .calendario-container {
                        padding-top: 75px; /* 55px navbar + 20px espacio */
                        margin-left: 0;
                    }

                    .boton-fecha {
                        font-size: 11px;
                        padding: 6px 4px;
                        min-width: 55px;
                    }
                }

                @media (min-width: 1200px) {
                    .calendario-container {
                        padding-top: 120px;
                        padding-left: 30px;
                        padding-right: 30px;
                        padding-bottom: 30px;
                        margin-left: 280px; /* Sidebar completo en pantallas grandes */
                    }

                    .calendario-content {
                        gap: 40px;
                    }
                }

                /* Responsive para sidebar colapsado en desktop */
                @media (min-width: 769px) {
                    .calendario-container.sidebar-collapsed {
                        margin-left: 70px; /* Sidebar colapsado */
                    }
                }

                /* Asegurar que el FullCalendar sea responsivo */
                .fc {
                    font-size: 14px;
                }

                @media (max-width: 768px) {
                    .fc {
                        font-size: 12px;
                    }

                    .fc-toolbar {
                        flex-direction: column;
                        gap: 10px;
                    }

                    .fc-toolbar-chunk {
                        display: flex;
                        justify-content: center;
                    }

                    .fc-button {
                        padding: 6px 12px;
                        font-size: 12px;
                    }

                    .fc-daygrid-event {
                        font-size: 11px;
                        padding: 1px 2px;
                    }
                }

                @media (max-width: 480px) {
                    .fc {
                        font-size: 11px;
                    }

                    .fc-button {
                        padding: 4px 8px;
                        font-size: 11px;
                    }

                    .fc-toolbar-title {
                        font-size: 16px;
                    }

                    .fc-col-header-cell {
                        padding: 4px 2px;
                    }

                    .fc-daygrid-day-number {
                        font-size: 12px;
                        padding: 2px;
                    }
                }

                /* modal detalle de cita - extraído 1:1 de "Modales Cita (standalone).html" (vista cliente) */
                .cli-cita-overlay {
                    position: fixed; inset: 0; background: rgba(15,26,48,0.45); backdrop-filter: blur(3px);
                    display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px;
                }
                .cli-cita-modal {
                    width: 100%; max-width: 360px; background: #FFFFFF; border-radius: 22px; overflow: hidden;
                    box-shadow: 0 24px 60px -24px rgba(15,26,48,0.35), 0 0 0 1px rgba(15,26,48,0.05);
                    font-family: "Inter", system-ui, sans-serif; color: #1B2A4A;
                }
                .cli-cita-head { padding: 20px 22px; color: #fff; position: relative; overflow: hidden; }
                .cli-cita-head.sim { background: linear-gradient(135deg, #D9722E, #b85d22); }
                .cli-cita-head.cas { background: linear-gradient(135deg, #1FA0D1, #205C81); }
                .cli-cita-head.con { background: linear-gradient(135deg, #28A052, #1b6b3a); }
                .cli-cita-head::after {
                    content: ""; position: absolute; top: -55px; right: -45px; width: 170px; height: 170px;
                    border-radius: 50%; background: radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%);
                }
                .cli-cita-badge {
                    display: inline-flex; align-items: center; gap: 7px; padding: 5px 12px; background: rgba(255,255,255,0.2);
                    border-radius: 999px; font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 10px; font-weight: 700;
                    letter-spacing: 0.1em; text-transform: uppercase; position: relative; margin-bottom: 13px;
                }
                .cli-cita-badge .cli-cita-dot { width: 6px; height: 6px; border-radius: 50%; background: #fff; }
                .cli-cita-title { font-family: "Bricolage Grotesque", system-ui, sans-serif; font-weight: 600; font-size: 22px; letter-spacing: -0.02em; position: relative; line-height: 1.1; }
                .cli-cita-close {
                    position: absolute; top: 17px; right: 17px; width: 30px; height: 30px; border-radius: 50%;
                    background: rgba(255,255,255,0.18); color: #fff; border: 0; cursor: pointer;
                    display: flex; align-items: center; justify-content: center; transition: all 0.2s; z-index: 2;
                }
                .cli-cita-close:hover { background: rgba(255,255,255,0.3); transform: rotate(90deg); }
                .cli-cita-body { padding: 20px 22px; }
                .cli-cita-msg { display: flex; gap: 13px; align-items: flex-start; }
                .cli-cita-msg-icon { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .cli-cita-msg-icon.sim { background: #FBE5D4; color: #D9722E; }
                .cli-cita-msg-icon.cas { background: #C4E7F5; color: #205C81; }
                .cli-cita-msg-icon.con { background: #DFF5E5; color: #28A052; }
                .cli-cita-msg-text { font-size: 13.5px; line-height: 1.6; color: #1B2A4A; }
                .cli-cita-msg-text strong { font-weight: 600; }
                .cli-cita-hl-sim { color: #D9722E; font-weight: 600; }
                .cli-cita-hl-cas { color: #205C81; font-weight: 600; }
                .cli-cita-hl-con { color: #28A052; font-weight: 600; }
            `}</style>

            <div className="navbar-fixed">
                <Navbar title={"- Calendario"} />
            </div>

            {citaDetalle && (() => {
                const meta = CITA_META[citaDetalle.tipo];
                const CliIcon = CLI_ICONS[citaDetalle.tipo];
                return (
                    <div className="cli-cita-overlay" onClick={(e) => { if (e.target === e.currentTarget) setCitaDetalle(null); }}>
                        <div className="cli-cita-modal">
                            <div className={`cli-cita-head ${meta.headClass}`}>
                                <span className="cli-cita-badge"><span className="cli-cita-dot"></span> {meta.badge}</span>
                                <div className="cli-cita-title">{citaDetalle.tramiteName}</div>
                                <button className="cli-cita-close" onClick={() => setCitaDetalle(null)}><IconCliClose /></button>
                            </div>
                            <div className="cli-cita-body">
                                <div className="cli-cita-msg">
                                    <div className={`cli-cita-msg-icon ${meta.headClass}`}><CliIcon /></div>
                                    <div className="cli-cita-msg-text">
                                        {citaDetalle.tipo === 'SIMULACION' && (
                                            <>Tienes una cita de <strong>simulación</strong> con el equipo de Consultoría JAS el <span className="cli-cita-hl-sim">{citaDetalle.diaHora}</span> hrs.</>
                                        )}
                                        {citaDetalle.tipo === 'CAS' && (
                                            <>Tienes una cita <strong>CAS</strong> el <span className="cli-cita-hl-cas">{citaDetalle.diaHora}</span> en <strong>{citaDetalle.casCity || 'ubicación por confirmar'}</strong>.</>
                                        )}
                                        {citaDetalle.tipo === 'CONSULADO' && (
                                            <>Tienes una cita en el <strong>Consulado</strong> el <span className="cli-cita-hl-con">{citaDetalle.diaHora}</span> en <strong>{citaDetalle.conCity || 'ubicación por confirmar'}</strong>.</>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}

            <div className={`calendario-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
                <div className="calendario-content">
                    <div className="calendario-main">
                        <select
                            value={filtroTipo}
                            onChange={(e) => setFiltroTipo(e.target.value)}
                            className="filtro-select"
                        >
                            <option value="">Selecciona el trámite</option>
                            {tiposUnicos.map((tipo, idx) => (
                                <option key={idx} value={tipo}>{tipo}</option>
                            ))}
                        </select>

                        <div className="botones-container">
                            <button className="boton-fecha" onClick={() => irAFechaMasCercana('CAS')}>
                                CAS
                            </button>
                            <button className="boton-fecha" onClick={() => irAFechaMasCercana('CONSULADO')}>
                                Consulado
                            </button>
                            <button className="boton-fecha" onClick={() => irAFechaMasCercana('SIMULACION')}>
                                Simulación
                            </button>
                        </div>

                        <div className="calendario-wrapper">
                            <FullCalendar
                                ref={calendarRef}
                                plugins={[dayGridPlugin]}
                                initialView="dayGridMonth"
                                contentHeight="auto"
                                locale={esLocale}
                                events={eventosFiltrados}
                                eventClick={(info) => {
                                    const { tipo, tramiteName, casCity, conCity, text } = info.event.extendedProps;
                                    const fechaObj = new Date(text);

                                    const diaSemana = fechaObj.toLocaleDateString('es-MX', { weekday: 'long' });
                                    const fecha = fechaObj.toLocaleDateString('es-MX', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    });
                                    const hora = fechaObj.toLocaleTimeString('es-MX', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: false
                                    });

                                    setCitaDetalle({
                                        tipo,
                                        tramiteName: tramiteName || 'Trámite',
                                        casCity,
                                        conCity,
                                        diaHora: `${diaSemana}, ${fecha} a las ${hora}`
                                    });
                                }}


                                headerToolbar={{
                                    left: 'prev,next today',
                                    center: 'title',
                                    right: 'dayGridMonth'
                                }}
                                dayHeaderFormat={{ weekday: 'short' }}
                                height="auto"
                                aspectRatio={window.innerWidth < 768 ? 1.0 : 1.35}
                            />
                        </div>
                    </div>

                    <div className="calendario-sidebar">
                        <div className="info-panel">
                            <h4 className="info-titulo">Información</h4>
                            <ul className="info-lista">
                                {Object.entries(coloresPorTramite).map(([id, color]) => {
                                    const descripcion = eventos.find(e => e.backgroundColor === color)?.transactDesc;
                                    return (
                                        <li key={id} className="info-item">
                                            <span
                                                className="color-indicator"
                                                style={{ backgroundColor: color }}
                                            ></span>
                                            <span className="info-text">
                                                {descripcion || `No hay fechas #${id}`}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
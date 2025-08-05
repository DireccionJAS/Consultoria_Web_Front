import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import esLocale from '@fullcalendar/core/locales/es';
import { trasacciones } from './../../api/api';
import Navbar from '../NavbarAdmin';
import '../../styles/CalendarioAdmin.css';

export default function CalendarioAdmin() {
  const navigate = useNavigate();
  const calendarRef = useRef(null);
  const [eventos, setEventos] = useState([]);
  const [usuario, setUsuario] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [tiposUnicos, setTiposUnicos] = useState([]);
  const [coloresPorTramite, setColoresPorTramite] = useState({});
  const [contadorCitas, setContadorCitas] = useState({});
  const [dataServicios, setDataServicios] = useState([]);

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
      if (decoded.role !== "ADMIN") {
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
      const response = await trasacciones();
      if (response.success && Array.isArray(response.response.transactProgresses)) {
        const data = response.response.transactProgresses;
        setDataServicios(data);

        const tipos = [...new Set(data.map(item => item.transact?.name))];
        setTiposUnicos(tipos);

        // Log para ver la estructura real de los datos
        console.log('Estructura de data:', data);

        const colores = {};
        const contador = {}; // Contador para cada trámite

        data.forEach(item => {
          const idReal = item.transact?.idTransact;
          const nombreTramite = item.transact?.name;

          if (idReal !== undefined && !colores[idReal]) {
            colores[idReal] = obtenerColorPorId(idReal);
          }

          // Inicializar contador si no existe
          if (nombreTramite && !contador[nombreTramite]) {
            contador[nombreTramite] = 0;
          }

          if (nombreTramite) contador[nombreTramite]++; // Incrementar contador para el trámite correspondiente
        });

        setColoresPorTramite(colores);
        setContadorCitas(contador);

        // Mapear los datos a formato de eventos para FullCalendar
        const eventosCalendario = [];
        console.log("Datos de servicios:", data);
        data.forEach(item => {
          // CAS
          if (item.dateCas) {
            eventosCalendario.push({
              id: item.idTransactProgress + '-cas',
              title: item.transact?.name || '',
              tipo: 'CAS',
              date: item.dateCas,
              userName: item.user?.name,
              userPhone: item.user?.phone,
              text: 'CAS',
              backgroundColor: '#1E90FF',
              borderColor: '#1E90FF',
            });
          }
          // Consulado
          if (item.dateCon) {
            eventosCalendario.push({
              id: item.idTransactProgress + '-con',
              title: item.transact?.name || '',
              tipo: 'CONSULADO',
              date: item.dateCon,
              userName: item.user?.name,
              userPhone: item.user?.phone,
              text: 'CONSULADO',
              backgroundColor: '#32CD32',
              borderColor: '#32CD32',
            });
          }
          // Simulación
          if (item.dateSimulation) {
            eventosCalendario.push({
              id: item.idTransactProgress + '-sim',
              title: item.transact?.name || '',
              tipo: 'SIMULACION',
              date: item.dateSimulation,
              userName: item.user?.name,
              userPhone: item.user?.phone,
              text: 'SIMULACION',
              backgroundColor: '#FFA500',
              borderColor: '#FFA500',
            });
          }
        });

        // Log para depuración de eventos y fechas
        console.log("Eventos para FullCalendar:", eventosCalendario);

        setEventos(eventosCalendario);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const eventosFiltrados = filtroTipo ? eventos.filter(evento => evento.title === filtroTipo) : eventos;

  const irAFechaMasCercana = (tipo) => {
    const evento = eventos.find(evento => evento.title === tipo);
    if (evento) {
      const fecha = new Date(evento.date);
      calendarRef.current.getApi().gotoDate(fecha);
    }
  };

  return (
    <div className="calendario-admin-main">
      <Navbar title={"- Calendario"} />
      <div className="calendario-admin-container">
        <div className="calendario-admin-card">
          <select
            className="calendario-admin-select"
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
          >
            <option value="">Selecciona el trámite</option>
            {tiposUnicos.map((tipo, idx) => (
              <option key={idx} value={tipo}>{tipo}</option>
            ))}
          </select>
          <div className="calendario-admin-btns">
            <button className="calendario-admin-btn" onClick={() => irAFechaMasCercana('CAS')}>CAS</button>
            <button className="calendario-admin-btn" onClick={() => irAFechaMasCercana('CONSULADO')}>Consulado</button>
            <button className="calendario-admin-btn" onClick={() => irAFechaMasCercana('SIMULACION')}>Simulación</button>
          </div>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            contentHeight="auto"
            locale={esLocale}
            events={eventosFiltrados}
            eventClick={(info) => {
              const { userName, userPhone } = info.event.extendedProps;
              const fecha = info.event.start?.toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });

              Swal.fire({
                title: info.event.title,
                html: `
                    <strong>Cliente:</strong> ${userName || 'No disponible'}<br/>
                    <strong>Teléfono:</strong> ${userPhone || 'No disponible'}<br/>
                    <strong>Fecha:</strong> ${fecha}                  `,
                icon: 'info'
              });
            }}
          />
        </div>
        <div className="calendario-admin-info">
          <h4>Información</h4>
          <ul>
            {Object.entries(coloresPorTramite).map(([id, color]) => {
              // Buscar el nombre del trámite por id
              const tramiteNombre = (() => {
                const evento = eventos.find(e => {
                  const dataId = dataServicios && dataServicios.find(item => item.transact?.idTransact === Number(id));
                  return dataId && e.title === dataId.transact?.name;
                });
                if (evento) return evento.title;
                // fallback: buscar en dataServicios
                const dataItem = dataServicios && dataServicios.find(item => item.transact?.idTransact === Number(id));
                return dataItem?.transact?.name || `Trámite #${id}`;
              })();
              const cantidadCitas = eventos.filter(e => {
                const dataId = dataServicios && dataServicios.find(item => item.transact?.idTransact === Number(id));
                return dataId && e.title === dataId.transact?.name;
              }).length;
              return (
                <li key={id}>
                  <span className="color-box" style={{ backgroundColor: color }}></span>
                  {tramiteNombre}
                  <span className="citas-count">({cantidadCitas})</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

const buttonStyle = {
  backgroundColor: 'white',
  color: 'black',
  border: '1px solid #ccc',
  padding: '8px',
  borderRadius: '4px',
  cursor: 'pointer'
};
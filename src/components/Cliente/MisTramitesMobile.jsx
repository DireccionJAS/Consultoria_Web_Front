import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import Navbar from '../NavbarUser.jsx';
import { Button, Form, Spinner, Image } from 'react-bootstrap';
import { tramitesPorId } from './../../api/api.js';
import styles from './../../styles/MisTramitesMobile.module.css';
import ModalActualizarTramite from './ActualizarMiTramite.jsx';

export default function MisTramitesMobile() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [busqueda, setBusqueda] = useState("");
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [showModalA, setShowModalA] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("");
  const [usuario, setUsuario] = useState('');
  const itemsPorPagina = 5; // Reducido para mejor visualización en móvil

  // Efecto para manejar el cambio de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        navigate('/MisTramites');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    try {
      const decoded = jwtDecode(token);
      setUsuario(decoded.idUser);
      if (decoded.role !== "USER") {
        Swal.fire({
          icon: 'error',
          title: 'Acceso denegado',
          text: 'No tienes permiso para acceder a esta página.',
        });
        navigate("/");
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
        setDatos(response.response.transactProgresses);
      } else {
        console.error("Formato de respuesta inesperado:", response);
        setDatos([]);
      }
    } catch (error) {
      console.error("Error al obtener los tramites:", error);
      setDatos([]);
    } finally {
      setCargando(false);
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      1: 'En proceso',
      2: 'En espera',
      3: 'Falta de pago',
      4: 'Terminado',
      5: 'Cancelado',
      6: 'Revisar'
    };
    return statusMap[status] || 'Desconocido';
  };

  const getStatusClass = (status) => {
    const statusClassMap = {
      1: styles.statusProcess,
      2: styles.statusWaiting,
      3: styles.statusPayment,
      4: styles.statusCompleted,
      5: styles.statusCancelled,
      6: styles.statusReview
    };
    return statusClassMap[status] || '';
  };

  const filtrados = datos.filter(d => {
    const busquedaStr = busqueda.toLowerCase();
    const coincideBusqueda =
      d.transact?.name?.toLowerCase().includes(busquedaStr) ||
      d.emailAcces?.toLowerCase().includes(busquedaStr);
    const coincideEstado = estadoSeleccionado === "" || d.status.toString() === estadoSeleccionado;
    return coincideBusqueda && coincideEstado;
  });

  const totalPaginas = Math.ceil(filtrados.length / itemsPorPagina);
  const datosPaginados = filtrados.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  const cambiarPagina = (numero) => {
    if (numero >= 1 && numero <= totalPaginas) {
      setPaginaActual(numero);
    }
  };
      <style jsx>{`
                .navbar-fixed {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    z-index: 1001; /* Más alto que el navbar original */
                    width: 100%;
                }'
  `}</style>

  return (
    <div className={styles.container}>
      <div className='navbar-fixed'>
        <Navbar title={"- Trámites"} />
      </div>

      <div className={styles.contentContainer}>
        <div className={styles.filterContainer}>
          <Form.Control
            type="text"
            placeholder="Buscar trámite..."
            className={styles.searchInput}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <Form.Select
            value={estadoSeleccionado}
            className={styles.selectState}
            onChange={(e) => setEstadoSeleccionado(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="1">En proceso</option>
            <option value="2">En espera</option>
            <option value="3">Falta de pago</option>
            <option value="4">Terminado</option>
            <option value="5">Cancelado</option>
            <option value="6">Revisar</option>
          </Form.Select>
        </div>

        <ModalActualizarTramite
          show={showModalA}
          onHide={() => setShowModalA(false)}
          onClienteRegistrado={fetchServices}
          cliente={clienteSeleccionado}
        />

        {cargando ? (
          <div className={styles.loadingContainer}>
            <Spinner animation="border" />
          </div>
        ) : (
          <>
            <div className={styles.cardsContainer}>
              {datosPaginados.map((tramite) => (
                <div key={tramite.idTransactProgress} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <Image
                      src={tramite.transact.image}
                      className={styles.cardImage}
                      rounded
                    />
                    <div className={styles.cardTitle}>
                      <h3>{tramite.transact.description}</h3>
                      <span className={`${styles.statusBadge} ${getStatusClass(tramite.status)}`}>
                        {getStatusText(tramite.status)}
                      </span>
                    </div>
                  </div>
                  
                  <div className={styles.cardContent}>
                    <div className={styles.infoRow}>
                      <span className={styles.label}>Inicio:</span>
                      <span className={styles.value}>{tramite.dateStart}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.label}>Cita CAS:</span>
                      <span className={styles.value}>{tramite.dateCas || "No aplica/En espera"}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.label}>Cita CON:</span>
                      <span className={styles.value}>{tramite.dateCon || "No aplica/En espera"}</span>
                    </div>
                    <div className={styles.paymentInfo}>
                      <div className={styles.paymentRow}>
                        <span className={styles.paymentLabel}>Pagado:</span>
                        <span style={{ color: '#10b981', fontWeight: '600' }}>${tramite.paid}</span>
                      </div>
                      <div className={styles.paymentRow}>
                        <span className={styles.paymentLabel}>Restante:</span>
                        <span style={{ 
                          color: (tramite.paidAll - tramite.paid) === 0 ? '#10b981' : '#ef4444',
                          fontWeight: '600'
                        }}>
                          {(tramite.paidAll - tramite.paid) === 0 ? "Pagado" : `$${tramite.paidAll - tramite.paid}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.cardActions}>
                    <Button
                      variant="primary"
                      className={styles.actionButton}
                      onClick={() => {
                        setClienteSeleccionado(tramite);
                        setShowModalA(true);
                      }}
                    >
                      Ver detalles
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {totalPaginas > 1 && (
              <div className={styles.pagination}>
                <Button
                  variant="outline-primary"
                  onClick={() => cambiarPagina(paginaActual - 1)}
                  disabled={paginaActual === 1}
                >
                  ←
                </Button>
                <span className={styles.pageInfo}>
                  Página {paginaActual} de {totalPaginas}
                </span>
                <Button
                  variant="outline-primary"
                  onClick={() => cambiarPagina(paginaActual + 1)}
                  disabled={paginaActual === totalPaginas}
                >
                  →
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

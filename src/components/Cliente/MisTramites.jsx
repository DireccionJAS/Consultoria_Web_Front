import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import Navbar from '../NavbarUser.jsx';
import { Table, Button, Form, Spinner, Image } from 'react-bootstrap';
import { tramitesPorId, actualizarT } from './../../api/api.js';
import styles from './../../styles/MisTramites.module.css';
import ModalActualizarTramite from './ActualizarMiTramite.jsx';
import PaymentModal from './Modals/Liquidacion.jsx';

export default function MisTramites() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [busqueda, setBusqueda] = useState("");
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [showModalA, setShowModalA] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const itemsPorPagina = 7;
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [tramiteALiquidar, setTramiteALiquidar] = useState(null);
  const [serviceToPay, setServiceToPay] = useState(null);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUserId(decoded.idUser);
      setUserEmail(decoded.sub);
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

  // Efecto para manejar el cambio de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        navigate('/MisTramites-sm');
      }
    };

    handleResize(); // Checar tamaño inicial
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [navigate]);

  // ✅ CORRECCIÓN: Llamar fetchServices cuando userId esté disponible
  useEffect(() => {
    if (userId) {
      fetchServices();
    }
  }, [userId]);

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, estadoSeleccionado]);

  const handlePaymentSuccess = () => {
    handleClosePaymentModal();
    Swal.fire('¡Listo!', 'Tu pago se procesó correctamente.', 'success');
    // ✅ CORRECCIÓN: Refrescar datos después del pago exitoso
    fetchServices();
  };

  const handlePaymentError = (error) => {
    Swal.fire('Error', error.message || 'Falló el pago.', 'error');
  };

  // ✅ CORRECCIÓN: Usar userId en lugar de usuario
  const fetchServices = async () => {
    try {
      const response = await tramitesPorId(userId);
      if (response.success && Array.isArray(response.response.transactProgresses)) {
        console.log("Datos obtenidos:", response.response.transactProgresses);
        // Ordenar los datos por idTransactProgress de forma ascendente (más viejos primero)
        const sortedData = response.response.transactProgresses.sort((a, b) => {
          return a.idTransactProgress - b.idTransactProgress;
        });
        setDatos(sortedData);
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

  // ✅ CORRECCIÓN: Pasar el trámite completo al modal de pago
  const handleOpenPaymentModal = (datos) => {
    if (datos.idTransactProgress) {
      setServiceToPay(datos);
      setPaymentModalOpen(true);
    } else {
      Swal.fire('Error', 'No se pudo cargar la información del trámite.', 'error');
    }
  };

  const handleClosePaymentModal = () => {
    setServiceToPay(null);
    setPaymentModalOpen(false);
  };

  const handleStatusChange = async (idTransactProgress, nuevoEstado) => {
    try {
      await actualizarT(idTransactProgress, nuevoEstado);
      mensaje(nuevoEstado);
      fetchServices();
    } catch (error) {
      console.error("Error al actualizar el estado del tramite", error);
    }
  };

  const filtrados = datos.filter(d => {
    const busquedaStr = busqueda.toLowerCase();
    const coincideBusqueda =
      d.transact?.name?.toLowerCase().includes(busquedaStr) ||
      d.transact?.description?.toLowerCase().includes(busquedaStr) ||
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

  function mensaje(numero) {
    let valor = "";
    switch (numero) {
      case 1: valor = "En proceso"; break;
      case 2: valor = "En espera"; break;
      case 3: valor = "Falta de pago"; break;
      case 4: valor = "Terminado"; break;
      case 5: valor = "Cancelado"; break;
      case 6: valor = "Revisar"; break;
      case 7: valor = "Aprovado"; break;
      case 8: valor = "Rechazado"; break;
      default: valor = "Desconocido";
    }

    Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: `Estado actualizado: ${valor}`,
    });
  }

  // ✅ CORRECCIÓN: Usar handleOpenPaymentModal en lugar de setear variables separadas
  const handleLiquidar = (datos) => {
    const montoRestante = datos.paidAll - datos.paid;

    Swal.fire({
      title: '¿Deseas liquidar este trámite?',
      text: `Monto restante: $${montoRestante}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, liquidar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        handleOpenPaymentModal(datos);
      }
    });
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
        <Navbar title={"- Mis Tramites"} />
      </div>

      <div className={styles.searchContainer}>
        <div className={styles.searchSection}>
          <div className={styles.searchInputWrapper}>
            <span className={styles.searchIcon}>🔍</span>
            <Form.Control
              type="text"
              placeholder="Buscar por trámite, descripción o email..."
              className={styles.searchInput}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.filterSection}>
          <div className={styles.filterWrapper}>
            <span className={styles.filterIcon}>🏷️</span>
            <Form.Select
              value={estadoSeleccionado}
              className={styles.selectState}
              onChange={(e) => setEstadoSeleccionado(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="1">⏳ En proceso</option>
              <option value="2">⏸️ En espera</option>
              <option value="3">💳 Falta de pago</option>
              <option value="4">✅ Terminado</option>
              <option value="5">❌ Cancelado</option>
              <option value="6">🔍 Revisar</option>
              <option value="5">✅ Aceptado</option>
              <option value="6">❌ Rechazado</option>
            </Form.Select>
          </div>
        </div>

        <div className={styles.statsSection}>
          <div className={styles.statsCard}>
            <span className={styles.statsNumber}>{filtrados.length}</span>
            <span className={styles.statsLabel}>Trámites</span>
          </div>
        </div>
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
        <div className={styles.tableContainer}>
          <Table hover responsive className={styles.tablaDatos}>
            <thead className={styles.tableHeader}>
              <tr>
                <th className={styles.thNumber}>#</th>
                <th className={styles.thImage}>Imagen</th>
                <th className={styles.thDescription}>Trámite</th>
                <th className={styles.thDate}>Fecha Inicio</th>
                <th className={styles.thDate}>Cita CAS</th>
                <th className={styles.thDate}>Cita CON</th>
                <th className={styles.thAmount}>Pagado</th>
                <th className={styles.thAmount}>Restante</th>
                <th className={styles.thAction}>Liquidar</th>
                <th className={styles.thStatus}>Estado</th>
                <th className={styles.thAction}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {datosPaginados.map((cliente, index) => (
                <tr key={cliente.idTransactProgress} className={styles.tableRow}>
                  <td className={styles.tdNumber}>
                    <div className={styles.numberBadge}>
                      {(paginaActual - 1) * itemsPorPagina + index + 1}
                    </div>
                  </td>
                  <td className={styles.tdImage}>
                    <div className={styles.imageContainer}>
                      <Image
                        src={cliente.transact.image}
                        className={styles.tableImage}
                        rounded
                      />
                    </div>
                  </td>
                  <td className={styles.tdDescription}>
                    <div className={styles.tramiteInfo}>
                      <span className={styles.tramiteTitle}>{cliente.transact.description}</span>
                    </div>
                  </td>
                  <td className={styles.tdDate}>
                    <div className={styles.dateInfo}>
                      {new Date(cliente.dateStart).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </div>
                  </td>
                  <td className={styles.tdDate}>
                    <div className={styles.dateInfo}>
                      {cliente.dateCas ?
                        new Date(cliente.dateCas).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        }) :
                        <span className={styles.noDate}>No programada</span>
                      }
                    </div>
                  </td>
                  <td className={styles.tdDate}>
                    <div className={styles.dateInfo}>
                      {cliente.dateCon ?
                        new Date(cliente.dateCon).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        }) :
                        <span className={styles.noDate}>No programada</span>
                      }
                    </div>
                  </td>
                  <td className={styles.tdAmount}>
                    <div className={styles.amountBadge + ' ' + styles.paidAmount}>
                      ${cliente.paid.toLocaleString('es-ES')}
                    </div>
                  </td>
                  <td className={styles.tdAmount}>
                    <div className={`${styles.amountBadge} ${(cliente.paidAll - cliente.paid) === 0 ? styles.paidComplete : styles.pendingAmount
                      }`}>
                      {(cliente.paidAll) === 0 ? "$0" : `$${(cliente.paidAll - cliente.paid).toLocaleString('es-ES')}`}
                    </div>
                  </td>
                  <td className={styles.tdAction}>
                    {(cliente.paidAll - cliente.paid) > 0 ? (
                      <Button
                        variant="primary"
                        size="sm"
                        className={styles.liquidarButton}
                        onClick={() => handleLiquidar(cliente)}
                      >
                        💳 Liquidar
                      </Button>
                    ) : (
                      <div className={styles.paidBadge}>
                        ✅ Pagado
                      </div>
                    )}
                  </td>
                  <td className={styles.tdStatus}>
                    <div className={`${styles.statusBadge} ${cliente.status === 1 ? styles.statusProcess :
                        cliente.status === 2 ? styles.statusWaiting :
                          cliente.status === 3 ? styles.statusPayment :
                            cliente.status === 4 ? styles.statusComplete :
                              cliente.status === 5 ? styles.statusCancelled :
                              cliente.status === 7 ? styles.statusComplete :
                              cliente.status === 8 ? styles.statusPayment:
                                cliente.status === 6 ? styles.statusReview : styles.statusUnknown
                      }`}>
                      {cliente.status === 1 ? '⏳ En proceso' :
                        cliente.status === 2 ? '⏸️ En espera' :
                          cliente.status === 3 ? '💳 Falta de pago' :
                            cliente.status === 4 ? '✅ Terminado' :
                              cliente.status === 5 ? '❌ Cancelado' :
                                  cliente.status === 7 ? '✅ Aprovado' :
                              cliente.status === 8 ? '❌ Rechazado' :
                                cliente.status === 6 ? '🔍 Revisar' : '❓ Desconocido'}
                    </div>
                  </td>
                  <td className={styles.tdAction}>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className={styles.infoButton}
                      onClick={() => {
                        setClienteSeleccionado(cliente);
                        setShowModalA(true);
                      }}
                    >
                      📋 Detalles
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      <div className={styles.paginationContainer}>
        <div className={styles.paginationInfo}>
          <span className={styles.paginationText}>
            Mostrando {datosPaginados.length} de {filtrados.length} trámites
          </span>
        </div>

        <div className={styles.paginationControls}>
          <Button
            variant="outline-primary"
            className={styles.paginationButton}
            onClick={() => cambiarPagina(paginaActual - 1)}
            disabled={paginaActual === 1}
          >
            ← Anterior
          </Button>

          <div className={styles.pageNumbers}>
            {[...Array(totalPaginas)].map((_, i) => (
              <Button
                key={i}
                variant={paginaActual === i + 1 ? "primary" : "outline-primary"}
                className={`${styles.pageButton} ${paginaActual === i + 1 ? styles.pageButtonActive : ''
                  }`}
                onClick={() => cambiarPagina(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
          </div>

          <Button
            variant="outline-primary"
            className={styles.paginationButton}
            onClick={() => cambiarPagina(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
          >
            Siguiente →
          </Button>
        </div>
      </div>

      {/* ✅ CORRECCIÓN: Solo mostrar el modal cuando hay datos válidos */}
      {serviceToPay && (
        <PaymentModal
          show={paymentModalOpen}
          onHide={handleClosePaymentModal}
          service={serviceToPay}
          userEmail={userEmail}
          userId={userId}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      )}
    </div>
  );
}
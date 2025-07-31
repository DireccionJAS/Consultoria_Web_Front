import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import Navbar from '../NavbarAdmin.jsx';
import { Table, Button, Form, Spinner } from 'react-bootstrap';
import { FaInfo, FaPlus } from 'react-icons/fa';
import { trasacciones, actualizarT, clientes } from './../../api/api.js';
import './../../styles/Clientes.css'
import ModalRegistrarTramite from './RegistrarTramite.jsx';
import ModalActualizarTramite from './ActualizarTramite.jsx';

export default function AdministradorTramites() {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState("");
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showModalA, setShowModalA] = useState(false);
  const [showModalI, setShowModalI] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [Datitos, setDatitos] = useState(null);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("");
  let [numero, setNumero] = useState(0);

  const itemsPorPagina = 7;

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
        fetchServices();
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      localStorage.removeItem("token");
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda]);

  const fetchServices = async () => {
  try {
    const response = await trasacciones();

    if (response.success && Array.isArray(response.response.transactProgresses)) {
      const sortedData = response.response.transactProgresses.sort((a, b) => {
        return b.idTransactProgress - a.idTransactProgress; // ← Cambio aquí
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


  const handleStatusChange = async (idTransactProgress, nuevoEstado) => {
    try {
      const result = await actualizarT(idTransactProgress, nuevoEstado);
      setNumero(nuevoEstado);
      mensaje(nuevoEstado);
      fetchServices();
    } catch (error) {
      console.error("Error al actualizar el estado del tramite", error);
    }
  };

  const filtrados = datos.filter(d => {
    const busquedaStr = busqueda.toLowerCase();
    const coincideBusqueda =
      d.user?.name?.toLowerCase().includes(busquedaStr) ||
      d.user?.phone?.toLowerCase().includes(busquedaStr) ||
      d.emailAcces?.toLowerCase().includes(busquedaStr) ||
      d.transact?.name?.toLowerCase().includes(busquedaStr);

    const coincideEstado =
      estadoSeleccionado === "" || d.status === parseInt(estadoSeleccionado, 10);

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
      default: valor = "Desconocido";
    }

    Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: `Estado actualizado: ${valor}`,
    });
  }

  const getStatusText = (status) => {
    switch (status) {
      case 1: return "En proceso";
      case 2: return "En espera";
      case 3: return "Falta de pago";
      case 4: return "Terminado";
      case 5: return "Cancelado";
      case 6: return "Revisar";
      default: return "Desconocido";
    }
  };

  return (
    <div className="tramites-container">
      <div className='fixed-top'>
        <Navbar title={" - Tramites"} />
      </div>

      {/* Controles superiores */}
      <div className="controles-superiores">
        <Form.Control
          type="text"
          placeholder="Buscar por nombre, teléfono, email o trámite..."
          className="busqueda-input"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <Form.Select
          value={estadoSeleccionado}
          onChange={(e) => setEstadoSeleccionado(e.target.value)}
          className="estado-select"
        >
          <option value="">Todos los estados</option>
          <option value="1">En proceso</option>
          <option value="2">En espera</option>
          <option value="3">Falta de pago</option>
          <option value="4">Terminado</option>
          <option value="5">Cancelado</option>
          <option value="6">Revisar</option>
        </Form.Select>
        <Button
          className="btn-agregar"
          onClick={() => {
            setDatitos(datos);
            setShowModal(true);
          }}
        >
          <FaPlus className="me-2" />
          Agregar Trámite
        </Button>
      </div>

      <ModalRegistrarTramite
        show={showModal}
        onHide={() => setShowModal(false)}
        onClienteRegistrado={fetchServices}
      />
      <ModalActualizarTramite
        show={showModalA}
        onHide={() => setShowModalA(false)}
        onClienteRegistrado={fetchServices}
        cliente={clienteSeleccionado}
      />

      {cargando ? (
        <div className="spinner-container">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Cargando trámites...</p>
        </div>
      ) : (
        <>
          {/* Vista de tabla para escritorio y tablet */}
          <div className="tabla-responsiva">
            <Table className="tabla-tramites" striped hover responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Trámite</th>
                  <th>Cliente</th>
                  <th>Teléfono</th>
                  <th>Email</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {datosPaginados.map((cliente, index) => (
                  <tr key={cliente.idTransactProgress}>
                    <td>
                      <span className="numero-tramite">
                        {(paginaActual - 1) * itemsPorPagina + index + 1}
                      </span>
                    </td>
                    <td>
                      <strong>{cliente.transact.name}</strong>
                    </td>
                    <td>{cliente.user.name}</td>
                    <td>
                      <a href={`tel:${cliente.user.phone}`}>
                        {cliente.user.phone}
                      </a>
                    </td>
                    <td>
                      <a href={`mailto:${cliente.user.email}`} className="email-link">
                        {cliente.user?.email}
                      </a>
                    </td>
                    <td>
                      <Form.Select
                        value={cliente.status}
                        onChange={(e) =>
                          handleStatusChange(cliente.idTransactProgress, parseInt(e.target.value, 10))
                        }
                        className="status-select"
                      >
                        <option value={1}>En proceso</option>
                        <option value={2}>En espera</option>
                        <option value={3}>Falta de pago</option>
                        <option value={4}>Terminado</option>
                        <option value={5}>Cancelado</option>
                        <option value={6}>Revisar</option>
                      </Form.Select>
                    </td>
                    <td>
                      <Button
                        className="btn-editar"
                        onClick={() => {
                          setClienteSeleccionado(cliente);
                          setShowModalA(true);
                        }}
                      >
                        EDITAR
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {/* Vista de tarjetas para móviles */}
          <div className="vista-movil">
            {datosPaginados.map((cliente, index) => (
              <div key={cliente.idTransactProgress} className={`tarjeta-tramite status-${cliente.status}`}>
                <div className="tarjeta-header">
                  <span className="numero-tramite">
                    #{(paginaActual - 1) * itemsPorPagina + index + 1}
                  </span>
                  <h5 className="nombre-tramite">{cliente.transact.name}</h5>
                </div>
                
                <div className="tarjeta-body">
                  <div className="campo-movil">
                    <span className="label-movil">Cliente:</span>
                    <span className="valor-movil">{cliente.user.name}</span>
                  </div>
                  
                  <div className="campo-movil">
                    <span className="label-movil">Teléfono:</span>
                    <span className="valor-movil">
                      <a href={`tel:${cliente.user.phone}`}>
                        {cliente.user.phone}
                      </a>
                    </span>
                  </div>
                  
                  <div className="campo-movil">
                    <span className="label-movil">Email:</span>
                    <span className="valor-movil">
                      <a href={`mailto:${cliente.user.email}`} className="email-link">
                        {cliente.user.email}
                      </a>
                    </span>
                  </div>
                  
                  <div className="campo-movil">
                    <span className="label-movil">Estado actual:</span>
                    <span className="valor-movil">
                      <strong>{getStatusText(cliente.status)}</strong>
                    </span>
                  </div>
                  
                  <Form.Select
                    value={cliente.status}
                    onChange={(e) =>
                      handleStatusChange(cliente.idTransactProgress, parseInt(e.target.value, 10))
                    }
                    className="status-movil"
                  >
                    <option value={1}>En proceso</option>
                    <option value={2}>En espera</option>
                    <option value={3}>Falta de pago</option>
                    <option value={4}>Terminado</option>
                    <option value={5}>Cancelado</option>
                    <option value={6}>Revisar</option>
                  </Form.Select>
                </div>
                
                <div className="acciones-movil">
                  <Button
                    className="btn-editar-movil"
                    onClick={() => {
                      setClienteSeleccionado(cliente);
                      setShowModalA(true);
                    }}
                  >
                    EDITAR TRÁMITE
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Paginación */}
      <div className="paginacion-container">
        <Button
          variant="outline-primary"
          className="btn-paginacion"
          onClick={() => cambiarPagina(paginaActual - 1)}
          disabled={paginaActual === 1}
        >
          Anterior
        </Button>

        {[...Array(totalPaginas)].map((_, i) => (
          <Button
            key={i}
            variant={paginaActual === i + 1 ? "primary" : "outline-primary"}
            className="btn-paginacion"
            onClick={() => cambiarPagina(i + 1)}
          >
            {i + 1}
          </Button>
        ))}

        <Button
          variant="outline-primary"
          className="btn-paginacion"
          onClick={() => cambiarPagina(paginaActual + 1)}
          disabled={paginaActual === totalPaginas}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}
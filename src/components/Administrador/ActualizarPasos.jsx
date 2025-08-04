import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getStepById, updateSteps, getNameService , deleteStepById} from '../../api/api';
import Swal from 'sweetalert2';
import { jwtDecode } from 'jwt-decode';
import Navbar from './../NavbarAdmin.jsx';
import './../../styles/RegistrarPasos.css';

export default function ActualizarPasos() {
  const location = useLocation();
  const navigate = useNavigate();
  const idTransact = location.state?.serviceID;
  const [steps, setSteps] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

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
      } else if (!idTransact) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se recibió ID del servicio.',
        });
        navigate("/services");
      } else {
        fetchStepsById();
        fetchNameService();
      }
    } catch (error) {
      localStorage.removeItem("token");
      navigate("/");
    }
  }, [navigate, idTransact]);

  const fetchStepsById = async () => {
    try {
      const response = await getStepById(idTransact);

      if (response.success && Array.isArray(response.response.StepsTransacts)) {

        // Asegurarse de que todos los pasos tengan los campos necesarios
        const formattedSteps = response.response.StepsTransacts.map(step => {
          // Registrar cada paso para depuración          
          return {
            id: step.idStep, // ID del paso para actualización
            name: step.name || '',
            description: step.description || '',
            stepNumber: step.numStep || step.stepNumber,
            needCalendar: step.needCalendar === 1,
            // Guardar el ID del trámite relacionado si existe
            idTransact: step.idTransact || idTransact
          };
        });

        setSteps(formattedSteps);
      } else {
        setSteps([]);
        Swal.fire({
          icon: 'info',
          title: 'Información',
          text: 'No hay pasos registrados para este trámite.',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cargar los pasos existentes.',
      });
      setSteps([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchNameService = async () => {
    try {
      const response = await getNameService(idTransact);
      setName(response);
    } catch (error) {
      console.error(error);
    }
  };

  const handleStepChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    setSteps(prevSteps => {
      const newSteps = [...prevSteps];
      newSteps[index] = {
        ...newSteps[index],
        [name]: type === 'checkbox' ? checked : value
      };
      return newSteps;
    });
  };

  // Modificado: Añadir paso directamente en la interfaz
  const addNewStep = () => {
    setSteps(prevSteps => {
      // Determinar el número del siguiente paso
      const nextStepNumber = prevSteps.length > 0
        ? Math.max(...prevSteps.map(step => step.stepNumber)) + 1
        : 1;

      // Agregar un nuevo paso al arreglo
      return [
        ...prevSteps,
        {
          // No incluimos ID porque es un paso nuevo
          name: '',
          description: '',
          stepNumber: nextStepNumber,
          needCalendar: false,
          idTransact: idTransact,
          isNew: true // Marcador para identificar pasos nuevos
        }
      ];
    });
  };


const removeStep = async (index) => {
  const stepToDelete = steps[index];
  
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: "¡No podrás revertir esta acción!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  });

  if (result.isConfirmed){
    if (stepToDelete.id) {
      try {
        await deleteStepById(stepToDelete.id);

        // Mostrar alerta y esperar que el usuario cierre
        await Swal.fire('Eliminado', 'Paso eliminado correctamente.', 'success');

        // Ahora actualizamos la UI local
        setSteps(prevSteps => {
          const newSteps = prevSteps.filter((_, i) => i !== index);
          // Reordenar números de paso
          return newSteps.map((step, idx) => ({
            ...step,
            stepNumber: idx + 1
          }));
        });

      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar el paso.', 'error');
      }
    } else {
      // Paso nuevo (sin ID), solo eliminar localmente y mostrar alerta

      // Actualizar UI
      setSteps(prevSteps => {
        const newSteps = prevSteps.filter((_, i) => i !== index);
        return newSteps.map((step, idx) => ({
          ...step,
          stepNumber: idx + 1
        }));
      });

      // Mostrar alerta después de actualizar UI
      await Swal.fire('Eliminado', 'Paso eliminado correctamente.', 'success');
    }
  }
};



  const handleSubmit = async (e) => {
    e.preventDefault();

    if (steps.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'No hay pasos para actualizar.',
      });
      return;
    }

    try {
      // Formatear los pasos para la API de actualización/creación
      const formattedSteps = steps.map(step => ({
        id: step.id, // ID del paso individual (puede ser undefined para nuevos pasos)
        name: step.name,
        description: step.description,
        numStep: step.stepNumber,
        needCalendar: step.needCalendar ? 1 : 0,
        idTransact: idTransact // ID del trámite
      }));

      // Muestra un indicador de carga
      Swal.fire({
        title: 'Procesando...',
        text: 'Por favor espere mientras se procesan los pasos',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const response = await updateSteps(idTransact, formattedSteps);

      // Cerrar el indicador de carga
      Swal.close();

      if (!response.some(res => res.error)) {
        setMessage('✅ Todos los pasos fueron procesados exitosamente.');
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Todos los pasos fueron procesados exitosamente.',
        }).then(() => {
          navigate('/ServiciosAdmin'); // Redireccionar después de actualizar
        });
      } else {
        // Mostrar mensajes de error específicos
        const errores = response.filter(res => res.error).map(res => res.message).join('\n');
        setMessage('❌ Error al procesar algunos pasos.');
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al procesar algunos pasos.',
          footer: `Detalles: ${errores}`
        });
      }
    } catch (error) {
      setMessage('❌ Error al procesar los pasos.');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al procesar los pasos.',
        footer: error.message
      });
    }
  };

  if (loading) {
    return (
      <div style={{ marginTop: '90px', textAlign: 'center' }}>
        <div className='fixed-top'>
          <Navbar title={"-Actualizar Pasos"} />
        </div>
        <h3>Cargando pasos...</h3>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '90px' }}>
      <div className='fixed-top'>
        <Navbar title={"-Actualizar Pasos"} />
      </div>
      <div className="container-registrar-pasos">
        <div className="card-registrar-pasos">
          <h2>Actualizar pasos para el trámite: {name}</h2>

          {steps.length === 0 ? (
            <div>
              <p>No hay pasos registrados para este trámite.</p>
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button onClick={addNewStep} className="custom-file-button">
                  ➕ Agregar Paso Aquí
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="form-registrar-pasos">
              {steps.map((step, index) => (
                <div key={index} className="step-form" style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '20px',
                  backgroundColor: step.isNew ? '#f0fff4' : 'white' // Color de fondo verde claro para pasos nuevos
                }}>
                  <div className="form-group">
                    <p className='h4'>Paso número {step.stepNumber}</p>
                    {step.id ? (
                      <p className="text-xs text-gray-500">Paso a actualizar</p>
                    ) : (
                      <p className="text-xs text-green-500">★ Nuevo paso (se creará al guardar)</p>
                    )}
                    <input
                      type="hidden"
                      name="stepNumber"
                      value={step.stepNumber}
                      readOnly
                    />
                  </div>

                  <div className="form-group">
                    <label>Nombre del paso</label>
                    <input
                      type="text"
                      name="name"
                      value={step.name}
                      onChange={(e) => handleStepChange(index, e)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Descripción</label>
                    <textarea
                      name="description"
                      value={step.description}
                      onChange={(e) => handleStepChange(index, e)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <input
                        type="hidden"
                        name="needCalendar"
                        value={false}
                        checked={step.needCalendar}
                        onChange={(e) => handleStepChange(index, e)}
                      />
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeStep(index)}
                    style={{
                      backgroundColor: '#e53e3e',
                      color: 'white',
                      padding: '8px 16px',
                      border: 'none',
                      borderRadius: '6px',
                      marginTop: '10px',
                      cursor: 'pointer',
                    }}
                  >
                    Eliminar Paso
                  </button>
                </div>
              ))}

              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button type="button" onClick={addNewStep} className="custom-file-button">
                  ➕ Agregar Nuevo Paso
                </button>
              </div>

              <button type="submit" className="button-submit-service">
                Guardar Todos los Pasos
              </button>
            </form>
          )}

          {message && <p style={{ color: '#2c5282', marginTop: '16px' }}>{message}</p>}
        </div>
      </div>
    </div>
  );
}
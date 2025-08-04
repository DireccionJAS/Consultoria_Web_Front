import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate  } from 'react-router-dom';
import './../../styles/RegistrarPasos.css';
import { createSteps } from '../../api/api.js';
import Navbar from './../NavbarAdmin.jsx';
import { Icon } from '@iconify/react/dist/iconify.js';


export default function RegistrarPasos() {
  const location = useLocation();
  const idTransact = location.state.serviceID;
  const navigate = useNavigate();

  const [steps, setSteps] = useState([{
    name: '',
    description: '',
    stepNumber: 1,
    needCalendar: false,
    id: idTransact,
  }]);

  const [message, setMessage] = useState('');

  useEffect(() => {
    if (location.state?.serviceID) {
      setSteps((prevSteps) => prevSteps.map((step) => ({
        ...step,
        id: location.state.serviceID,
      })));
    } else {
      console.warn('No se recibió ningún ID en RegistrarPasos.');
    }
  }, [location.state]);

  const handleStepChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    setSteps((prevSteps) => {
      const updatedSteps = [...prevSteps];
      updatedSteps[index] = {
        ...updatedSteps[index],
        [name]: type === 'checkbox' ? checked : value,
      };
      return updatedSteps;
    });
  };

  const addStep = () => {
    setSteps((prevSteps) => [
      ...prevSteps,
      {
        name: '',
        description: '',
        stepNumber: prevSteps.length + 1, // Asignar número de paso automáticamente
        needCalendar: false,
        id: idTransact,
      },
    ]);
  };

  const removeStep = (index) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este paso?')) {
      setSteps((prevSteps) => {
        const updatedSteps = prevSteps.filter((_, i) => i !== index);
        return updatedSteps.map((step, idx) => ({
          ...step,
          stepNumber: idx + 1, // Reasignar los números de paso
        }));
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formattedSteps = steps.map((step) => ({
        name: step.name,
        description: step.description,
        numStep: step.stepNumber, // Ajuste para usar numStep
        id: idTransact,
        needCalendar: step.needCalendar ? 1 : 0, // Convertir booleano a 0 o 1
      }));


      const response = await createSteps(formattedSteps);
      if (!response.some((res) => res.error)) {
        setMessage('✅ Todos los pasos fueron registrados exitosamente.');
        setSteps([
          {
            name: '',
            description: '',
            stepNumber: '',
            needCalendar: false,
            id: idTransact,
          },
        ]);
      } else {
        setMessage('❌ Error al registrar algunos pasos.');
      }
    } catch (error) {
      console.error(error);
      setMessage('❌ Error al registrar los pasos.');
    }
  };
   const volver = () => {
    navigate('/ServiciosAdmin'); // Redireccionar a la lista de servicios
  }

  return (

    <div style={{ marginTop: '90px' }}>
      <div className='fixed-top'>
        <Navbar title={"- Registrar Servicios"} />
      </div>

      <div className="container-registrar-pasos">
        <div className="card-registrar-pasos">
          <h2>Registrar pasos para el trámite</h2>
          <form onSubmit={handleSubmit} className="form-registrar-pasos">
            {steps.map((step, index) => (
              <div key={index} className="step-form" style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>

                <div className="form-group">
                  <p className='h4'>Paso número {step.stepNumber}</p>
                  <input
                    type="hidden"
                    name="stepNumber"
                    value={step.stepNumber}
                    onChange={(e) => handleStepChange(index, e)}
                    required
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
            <button type="button" onClick={volver} className="custom-file-button" style={{ backgroundColor: '#2c5282', color: 'white' }}>
              <Icon icon="humbleicons:arrow-left" width="24" height="24" color='white' /> Volver
            </button>

            <button type="button" onClick={addStep} className="custom-file-button" style={{}}>
              ➕ Agregar Paso
            </button>

            <button type="submit" className="button-submit-service">
              Registrar Todos los Pasos
            </button>
          </form>

          {message && <p style={{ color: '#2c5282', marginTop: '16px' }}>{message}</p>}
        </div>
      </div>
    </div>
  );
}
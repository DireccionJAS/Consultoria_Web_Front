import axios from 'axios';
import dayjs from 'dayjs';
import apiClient from './apiClient';

// =============================================================================
// CONFIGURACIÓN DE URLS
// =============================================================================
const API_URL = import.meta.env.VITE_API_URL;
const API_URL_MAIL = import.meta.env.VITE_API_URL_MAIL
const URL_DS160 = import.meta.env.VITE_URL_DS160;

// =============================================================================
// AUTENTICACIÓN Y USUARIOS
// =============================================================================
export const Login = async (email, password) => {
  try {
    const response = await apiClient.post(`/login`, {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};
export const loginWithGoogle = async (accessToken) => {
  try {
    const response = await apiClient.post(`/auth/google`, { accessToken });
    return response.data;
  } catch (error) {
    console.error('Error during Google login:', error);
    throw error;
  }
};

export const completeGoogleSignup = async (accessToken, phone) => {
  try {
    const response = await apiClient.post(`/auth/google/complete`, { accessToken, phone });
    return response.data;
  } catch (error) {
    console.error('Error completing Google signup:', error);
    throw error;
  }
};

export const FindByID = async (id) => {
  try {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw error;
  }
};

export const forgetPassword = async (email) => {
  try {
    const response = await apiClient.post(`/forget-password`, { email });
    return response.data;
  } catch (error) {
    console.error('Error during password recovery:', error);
    throw error;
  }
};

export const obtenerUsuarioPorCorreo = async (email) => {
  try {
    const response = await apiClient.get(`/users/email/${email}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuario por correo', error);
    throw error;
  }
};

export const actualizarContra = async (id_user, data) => {
  try {
    const response = await apiClient.put(`/users/password/${id_user}`, { password: data });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar contraseña', error);
    throw error;
  }
};

// =============================================================================
// GESTIÓN DE CLIENTES (ADMINISTRADOR)
// =============================================================================

export const clientes = async () => {
  try {
    const response = await apiClient.get(`/users`);
    return response.data;
  } catch (error) {
    console.error('Error durante la peticion', error);
    throw error;
  }
};

export const clientePorId = async (id) => {
  try {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error durante la peticion', error);
    throw error;
  }
};

export const RegistrarCliente = async (data) => {
  try {
    const response = await apiClient.post(`/users`, data);
    return response.data;
  } catch (error) {
    console.error('Error al hacer el post', error);
    throw error;
  }
};

export const getEmpresas = async () => {
  try {
    const response = await apiClient.get(`/empresas`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener las empresas', error);
    throw error;
  }
};

export const createAdmin = async (data) => {
  try {
    const response = await apiClient.post(`/users/admin`, data);
    return response.data;
  } catch (error) {
    console.error('Error al crear el admin', error);
    throw error;
  }
};

export const actualizarStatusCliente = async (id_user, nuevoEstado) => {
  try {
    const response = await apiClient.put(`/users/${id_user}/status`, { status: nuevoEstado });
    return response.data;
  } catch (error) {
    console.error("Error al actualizar el estado del cliente", error);
    throw error;
  }
};

export const archivarCliente = async (id_user, archivado) => {
  try {
    const response = await apiClient.put(`/users/${id_user}/archive`, { archived: archivado });
    return response.data;
  } catch (error) {
    console.error("Error al archivar el cliente", error);
    throw error;
  }
};

export const actualizar = async (idUser, datosActualizados) => {
  try {
    const response = await apiClient.put(`/users/${idUser}`, {
      idUser,
      name: datosActualizados.name,
      email: datosActualizados.email,
      phone: datosActualizados.phone,
      status: datosActualizados.status
    });
    return response.data;
  } catch (error) {
    console.error("Error al actualizar el cliente", error);
    throw error;
  }
};

// =============================================================================
// GESTIÓN DE SERVICIOS/PROCESOS
// =============================================================================

export const getAllProcess = async () => {
  try {
    const response = await apiClient.get(`/transaction/web`);
    return response.data;
  } catch (error) {
    console.error('Error fetching processes:', error);
    console.error('Error details:', error.response?.data);
    throw error;
  }
};

export const subirPdfLegal = async (tipo, file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post(`/pdf/upload/${tipo}`, formData);
    return response.data;
  } catch (error) {
    console.error('Error al subir el PDF', error);
    throw error;
  }
};

export const getPdfLegalUrl = (tipo) => `${API_URL}/pdf/download/${tipo}`;

export const servicios = async () => {
  try {
    const response = await apiClient.get(`/transaction`);
    return response.data;
  } catch (error) {
    console.error('Error fetching processes:', error);
    throw error;
  }
};

export const createService = async (serviceData) => {
  try {

    const payload = {
      name: serviceData.name,
      description: serviceData.description,
      image: serviceData.image, // Base64 string
      imageDetail: serviceData.imageDetail, // Base64 string
      simulation: serviceData.simulation,
      cas: serviceData.cas,
      con: serviceData.con,
      cashAdvance: serviceData.cashAdvance,
      status: true,
      cost: serviceData.cost,
      nameOption: serviceData.nameOption,
      costOption: serviceData.costOption,
      isDateService: serviceData.isDateService ?? false
    };

    const response = await apiClient.post(`/transaction/web`, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error creating service:', error);
    throw error;
  }
};

export const getNameService = async (id) => {
  try {
    const response = await apiClient.get(`/transaction/${id}`);
    const name = response.data.response.Transact.name;
    return name;
  } catch (error) {
    console.error('Error fetching service by ID:', error);
    throw error;
  }
}

export const getServiceById = async (id) => {
  try {
    const response = await apiClient.get(`/transaction/${id}`)
    return response.data
  } catch (error) {
    console.error('Error fetching steps:', error);
    throw error;
  }
}

export const updateService = async (id, serviceData) => {
  const serviceId = Number.isInteger(id) ? id : parseInt(id, 10); // Ensure id is a valid integer
  if (isNaN(serviceId)) {
    throw new Error(`Invalid service ID: ${id}`);
  }

  try {
    const payload = {
      name: serviceData.name,
      totalPayment: serviceData.totalPayment,
      status: serviceData.status,
      simulation: serviceData.simulation,
      cas: serviceData.cas,
      con: serviceData.con,
      imageDetail: serviceData.imageDetail, // Base64 string
      cashAdvance: serviceData.cashAdvance,
      cost: serviceData.cost ?? null,
      nameOption: serviceData.nameOption ?? null,
      optionCost: serviceData.optionCost ?? null,
      description: serviceData.description,
      isDateService: serviceData.isDateService ?? false,
      image: serviceData.image, // Base64 string
    };

    const response = await apiClient.put(`/transaction/web/update/${serviceId}`, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error updating service:', error);
    throw error;
  }
}

export const getAllServices = async () => {
  const response = await apiClient.get(`/services`);
  return response.data;
};

// =============================================================================
// GESTIÓN DE PASOS
// =============================================================================

export const getSteps = async () => {
  try {
    const response = await apiClient.get(`/steps`);
    return response.data;
  } catch (error) {
    console.error('Error fetching steps:', error);
    throw error;
  }
};

export const deleteStepById = async (stepId) => {
  try {
    const response = await apiClient.delete(`/steps/${stepId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting step:', error);
    throw error;
  }
};

export const getStepById = async (id) => {
  try {
    const response = await apiClient.get(`/steps/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching step by ID:', error);
    throw error;
  }
};

export const obtenerLosPasos = async (id) => {
  try {
    const response = await apiClient.get(`/steps/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener los pasos', error);
    throw error;
  }
};

/**
 * Función para crear pasos para los procesos
 */
export const createSteps = async (stepsArray) => {
  if (!Array.isArray(stepsArray) || stepsArray.length === 0) {
    throw new Error('Debe proporcionar un arreglo de pasos para crear.');
  }

  const results = [];

  for (const stepData of stepsArray) {
    try {
      const payload = {
        name: stepData.name,
        description: stepData.description,
        numStep: stepData.numStep, // Cambiado de stepNumber a numStep
        id: stepData.id,
        needCalendar: 0
      };

      const response = await apiClient.post(`/steps`, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      results.push(response.data);
    } catch (error) {
      console.error('Error creating step:', stepData, error);
      results.push({ error: error.message, stepData });
    }
  }

  return results;
};

/**
 * Función para actualizar pasos existentes y crear nuevos si es necesario
 * @param {number} idTransact - ID del trámite
 * @param {Array} stepsArray - Arreglo de pasos a actualizar o crear
 * @returns {Array} - Resultados de las operaciones
 */
export const updateSteps = async (idTransact, stepsArray) => {
  if (!Array.isArray(stepsArray) || stepsArray.length === 0) {
    throw new Error('Debe proporcionar un arreglo de pasos para actualizar.');
  }

  console.table(stepsArray.map(s => ({
    id: s.id || 'NUEVO',
    name: s.name,
    numStep: s.numStep || s.stepNumber
  })));

  const results = [];

  for (const stepData of stepsArray) {
    try {
      // Comprobamos si es un paso nuevo o existente
      const isNewStep = !stepData.id;

      // Formato correcto según StepUpdateRequest o CreateRequest
      const payload = {
        name: stepData.name,
        description: stepData.description,
        numStep: stepData.numStep || stepData.stepNumber,
        needCalendar: stepData.needCalendar ? 1 : 0
      };

      const payloadCreate = {
        name: stepData.name,
        description: stepData.description,
        numStep: stepData.numStep || stepData.stepNumber,
        id: idTransact,
        needCalendar: stepData.needCalendar ? 1 : 0
      };

      // Para pasos nuevos, agregamos el idTransact en el payload
      if (isNewStep) {

        payloadCreate.id = idTransact;
      }

      let response;

      if (isNewStep) {
        // Creamos un nuevo paso

        response = await apiClient.post(`/steps`, payloadCreate, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        results.push({
          success: true,
          data: response.data,
          message: `Paso ${stepData.numStep || stepData.stepNumber} creado correctamente`
        });
      } else {
        // Actualizamos un paso existente
        response = await apiClient.put(`/steps/${stepData.id}`, payload, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        results.push({
          success: true,
          data: response.data,
          message: `Paso ${stepData.numStep || stepData.stepNumber} actualizado correctamente`
        });
      }

    } catch (error) {
      console.error(`Error en operación de paso:`, error);

      results.push({
        error: true,
        message: error.response?.data?.message || error.message || 'Error desconocido',
        stepData
      });
    }
  }

  return results;
}

// =============================================================================
// GESTIÓN DE PERSONAS / FORMULARIOS DS-160
// =============================================================================

export const getPersonasByProgress = async (idTransactProgress) => {
  try {
    const response = await apiClient.get(`/tramite-personas/progress/${idTransactProgress}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener las personas del trámite', error);
    throw error;
  }
};

export const createPersona = async (data) => {
  try {
    const response = await apiClient.post(`/tramite-personas`, data);
    return response.data;
  } catch (error) {
    console.error('Error al agregar la persona', error);
    throw error;
  }
};

export const updatePersona = async (id, data) => {
  try {
    const response = await apiClient.put(`/tramite-personas/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar la persona', error);
    throw error;
  }
};

export const deletePersona = async (id) => {
  try {
    const response = await apiClient.delete(`/tramite-personas/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar la persona', error);
    throw error;
  }
};

// =============================================================================
// GESTIÓN DE TRÁMITES/TRANSACCIONES
// =============================================================================

export const tramitesPorId = async (id) => {
  try {
    const response = await apiClient.get(`/progress/progressByUserIdWeb/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener las transacciones', error);
    throw error;
  }
};

export const deleteTRansactProgress = async (id) => {
  try {
    const response = await apiClient.delete(`/progress/delete/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const cancelarCita = async (id) => {
  try {
    const response = await apiClient.get(`/progress/cancelSimulation/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al cancelar la cita', error);
    throw error;
  }
}

export const trasacciones = async () => {
  try {
    const response = await apiClient.get(`/progress/transactWithDataUser`)
    return response.data;
  } catch (error) {
    console.error("Error obtener las trasacciones", error);
    throw error;
  }
};

export const trasaccionesPorCliente = async () => {
  try {
    const response = await apiClient.get(`/progress/transactWithDataUser`)
    return response.data;
  } catch (error) {
    console.error("Error obtener las trasacciones", error);
    throw error;
  }
};

export const actualizarT = async (idTransactProgress, nuevoEstado) => {
  try {
    const response = await apiClient.patch(
      `/progress/${idTransactProgress}/status`,
      { status: nuevoEstado }
    );
    return response.data;
  } catch (error) {
    console.error("Error al actualizar el estadO DEL TRAMITE", error);
    throw error;
  }
};

export const actualizarTC = async (idTransactProgress, datosActualizados) => {
  try {
    const response = await apiClient.put(`/progress/${idTransactProgress}`,
      {
        advance: datosActualizados.advance ? 1 : 0,
        dateCas: datosActualizados.dateCas ? dayjs(datosActualizados.dateCas).format('YYYY-MM-DD HH:mm:ss') : null,
        dateCon: datosActualizados.dateCon ? dayjs(datosActualizados.dateCon).format('YYYY-MM-DD HH:mm:ss') : null,
        dateSimulation: datosActualizados.dateSimulation ? dayjs(datosActualizados.dateSimulation).format('YYYY-MM-DD HH:mm:ss') : null,
        dateStart: datosActualizados.dateStart ? dayjs(datosActualizados.dateStart).format('YYYY-MM-DD') : null,
        emailAcces: datosActualizados.emailAcces,
        passwordAcces: datosActualizados.passwordAcces,
        haveSimulation: datosActualizados.haveSimulation ? 1 : 0,
        paid: datosActualizados.paid,
        paidAll: datosActualizados.paidAll,
        status: datosActualizados.status,
        stepProgress: datosActualizados.stepProgress,
        casCity: datosActualizados.casCity ?? null,
        conCity: datosActualizados.conCity ?? null,
        documentsDelivered: !!datosActualizados.documentsDelivered,
        visaIssued: datosActualizados.visaIssued ?? null,
        idEncargado: datosActualizados.idEncargado ?? null
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error al actualizar el trámite", error.response?.data || error.message);
    throw error;
  }
};

export const listarEncargados = async () => {
  try {
    const response = await apiClient.get(`/users/admins`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener los encargados", error);
    throw error;
  }
};

//PARA ACTUALIZAR LA SIMULACION SOLAMENTE UNA VEZ, ESTE ENDPOINT TIENE LA VALIDACION DE QUE SE ACTUALIZE UNA SOLA VEZ
export const actualizarTCS = async (idTransactProgress, datosActualizados) => {
  try {
    const response = await apiClient.put(`/progress/simulation/${idTransactProgress}`,
      {
        idTransactProgress,
        advance: datosActualizados.advance ? 1 : 0,
        dateCas: datosActualizados.dateCas ? dayjs(datosActualizados.dateCas).format('YYYY-MM-DD HH:mm:ss') : null,
        dateCon: datosActualizados.dateCon ? dayjs(datosActualizados.dateCon).format('YYYY-MM-DD HH:mm:ss') : null,
        dateSimulation: datosActualizados.dateSimulation ? dayjs(datosActualizados.dateSimulation).format('YYYY-MM-DD HH:mm:ss') : null,
        dateStart: datosActualizados.dateStart ? dayjs(datosActualizados.dateStart).format('YYYY-MM-DD') : null,
        emailAcces: datosActualizados.emailAcces,
        passwordAcces: datosActualizados.passwordAcces,
        haveSimulation: datosActualizados.haveSimulation ? 1 : 0,
        paid: datosActualizados.paid,
        paidAll: datosActualizados.paidAll,
        status: datosActualizados.status,
        stepProgress: datosActualizados.stepProgress

      }
    );
    return response.data;
  } catch (error) {
    console.error("Error al actualizar el trámite", error.response?.data || error.message);
    throw error;
  }
};

export const actualizarPaso = async (idTransactProgress, datosActualizados) => {
  try {
    const response = await apiClient.put(
      `/progress/${idTransactProgress}/stepProgress`,
      {
        idTransactProgress,
        stepProgress: datosActualizados.stepProgress

      }
    );
    return response.data;
  } catch (error) {
    console.error("Error al actualizar el trámite", error.response?.data || error.message);
    throw error;
  }
};

export const RegistrarTransaccion = async (data) => {
  try {
    const response = await apiClient.post(`/progress`, data);
    return response.data;
  } catch (error) {
    console.error('Error al crear el tramite', error);
    throw error;
  }
};

export const Obtenertrasacciones = async () => {
  try {
    const response = await apiClient.get(`/progress`)
    return response.data;
  } catch (error) {
    console.error("Error obtener las trasacciones", error);
    throw error;
  }
};

export const createProcessWithPayment = async (data) => {
  try {
    const response = await apiClient.post(`/progress/CreateProgressWithPay`, data);
    return response.data;
  } catch (error) {
    console.error("Error al crear proceso con pago:", error);
    const errorMessage = error.response?.data?.message || error.message || "Error desconocido";
    throw new Error(errorMessage);
  }
}

export const getAllDates = async () => {
  try {
    const response = await apiClient.get(`/progress/simulation`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener las fechas", error);
    throw error;
  }
}

// =============================================================================
// NOTIFICACIONES
// =============================================================================

export const getNotificaciones = async () => {
  try {
    const response = await apiClient.get(`/notificaciones`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener las notificaciones', error);
    throw error;
  }
};

export const marcarNotificacionLeida = async (idNotification) => {
  try {
    const response = await apiClient.put(`/notificaciones/${idNotification}/leer`);
    return response.data;
  } catch (error) {
    console.error('Error al marcar la notificación como leída', error);
    throw error;
  }
};

export const marcarTodasNotificacionesLeidas = async () => {
  try {
    const response = await apiClient.put(`/notificaciones/leer-todas`);
    return response.data;
  } catch (error) {
    console.error('Error al marcar las notificaciones como leídas', error);
    throw error;
  }
};

// =============================================================================
// TESTIMONIOS (galería pública)
// =============================================================================

export const getTestimonios = async () => {
  try {
    const response = await apiClient.get(`/testimonios`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener los testimonios', error);
    throw error;
  }
};

export const crearTestimonio = async (file, tag) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tag', tag);
    const response = await apiClient.post(`/testimonios`, formData);
    return response.data;
  } catch (error) {
    console.error('Error al subir el testimonio', error);
    throw error;
  }
};

export const eliminarTestimonio = async (idTestimonio) => {
  try {
    const response = await apiClient.delete(`/testimonios/${idTestimonio}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar el testimonio', error);
    throw error;
  }
};

// =============================================================================
// CONFIGURACIÓN DE PÁGINA PÚBLICA
// =============================================================================

export const getPaginaPublicaConfig = async () => {
  try {
    const response = await apiClient.get(`/pagina-publica`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener la configuración de página pública', error);
    throw error;
  }
};

export const actualizarPaginaPublicaConfig = async (config) => {
  try {
    const response = await apiClient.put(`/pagina-publica`, config);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar la configuración de página pública', error);
    throw error;
  }
};

// =============================================================================
// ASESORÍAS GRATUITAS (agenda pública, sin cuenta)
// =============================================================================

export const crearAsesoria = async (data) => {
  try {
    const response = await apiClient.post(`/asesorias`, data);
    return response.data;
  } catch (error) {
    console.error('Error al crear la asesoría', error);
    throw error;
  }
};

export const getAsesorias = async () => {
  try {
    const response = await apiClient.get(`/asesorias`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener las asesorías', error);
    throw error;
  }
};

// =============================================================================
// GESTIÓN DE HORARIOS / CITAS
// =============================================================================

export const getHorarios = async () => {
  try {
    const response = await apiClient.get(`/horarios`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener los horarios', error);
    throw error;
  }
};

export const guardarHorario = async (tipo, data) => {
  try {
    const response = await apiClient.put(`/horarios/${tipo}`, data);
    return response.data;
  } catch (error) {
    console.error('Error al guardar el horario', error);
    throw error;
  }
};

export const getMisCitas = async (idUser) => {
  try {
    const response = await apiClient.get(`/citas/user/${idUser}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener las citas', error);
    throw error;
  }
};

export const getHorasTomadas = async (tipo, fecha) => {
  try {
    const response = await apiClient.get(`/citas/disponibilidad`, { params: { tipo, fecha } });
    return response.data;
  } catch (error) {
    console.error('Error al obtener la disponibilidad', error);
    throw error;
  }
};

export const crearCita = async (data) => {
  try {
    const response = await apiClient.post(`/citas`, data);
    return response.data;
  } catch (error) {
    console.error('Error al agendar la cita', error);
    throw error;
  }
};

export const eliminarCita = async (id) => {
  try {
    const response = await apiClient.delete(`/citas/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al cancelar la cita', error);
    throw error;
  }
};

export const getCambiosCita = async (idUser) => {
  try {
    const response = await apiClient.get(`/citas/cambios/${idUser}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener los cambios de cita', error);
    throw error;
  }
};

// =============================================================================
// GESTIÓN DE PAGOS
// =============================================================================

export const getAllPayments = async () => {
  try {
    const response = await apiClient.get(`/payment`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener los pagos", error);
    throw error;
  }
};

export const registrarPagoEfectivo = async ({ idUser, idTransact, total, quantity = 1 }) => {
  try {
    const response = await apiClient.post(`/payment`, {
      idUser,
      idTransact,
      total,
      quantity,
      status: 1,
    });
    return response.data;
  } catch (error) {
    console.error("Error al registrar el pago en efectivo", error.response?.data || error.message);
    throw error;
  }
};

export const statusPayments = async (idPayment, datosActualizados) => {
  try {
    const response = await apiClient.put(`/payment/${idPayment}`, {
      idPayment,
      status: datosActualizados.status,
      total: datosActualizados.total
    });
    return response.data;
  } catch (error) {
    console.error("Error al actualizar el estado del pago", error.response?.data || error.message);
    throw error;
  }
};

export const createPaymentIntent = async (data) => {
  const response = await apiClient.post(`/stripe/payment-intent`, data);
  return response.data;
};

// =============================================================================
// GESTIÓN DE CORREOS ELECTRÓNICOS
// =============================================================================

export const olvidarContra = async (email) => {
  try {
    if (!email || !email.trim() || !email.includes('@')) {
      Swal.fire('Advertencia', 'Ingresa un correo electrónico válido.', 'warning');
      return;
    }

    const body = {
      subject: "Recuperación de contraseña",
      message: "Hola, aquí tienes tu código de recuperación de parte del equipo de Consultoría JAS: ",
    };

    const response = await axios.post(
      `${API_URL_MAIL}/send/${email.trim()}`,
      body,
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    return response.data;

  } catch (error) {
    console.error("Error al mandar el correo:", error);
    const errorMessage = error.response?.data?.message || error.message || "Error desconocido";
    throw new Error(errorMessage);
  }
};
export const envioCorreo = async (email, nombreCliente, nombreTramite) => {
  try {
    if (!email || !email.trim() || !email.includes('@')) {
      Swal.fire('Advertencia', 'Ingresa un correo electrónico válido.', 'warning');
      return;
    }

    const body = {
      subject: "Asignación de Trámite",
      message: `Hola <strong>${nombreCliente}</strong>, te notificamos que se te ha asignado correctamente el trámite: <strong>"${nombreTramite}"</strong>, de parte del equipo de Consultoría JAS.`,
    };

    const response = await axios.post(
      `${API_URL_MAIL}/send/web/${email.trim()}`,
      body,
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    return response.data;

  } catch (error) {
    console.error("Error al mandar el correo:", error);
    const errorMessage = error.response?.data?.message || error.message || "Error desconocido";
    throw new Error(errorMessage);
  }
};
export const envioCorreoActualizacion = async (email, nombreCliente, nombreTramite) => {
  try {
    if (!email || !email.trim() || !email.includes('@')) {
      Swal.fire('Advertencia', 'Ingresa un correo electrónico válido.', 'warning');
      return;
    }

    const body = {
      subject: "Actualización de Trámite",
      message: `Hola <strong>${nombreCliente}</strong>, te notificamos que se ha hecho una actualización a tu trámite de: <strong>"${nombreTramite}"</strong>, de parte del equipo de Consultoría JAS.`,
    };

    const response = await axios.post(
      `${API_URL_MAIL}/send/web/${email.trim()}`,
      body,
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    return response.data;

  } catch (error) {
    console.error("Error al mandar el correo:", error);
    const errorMessage = error.response?.data?.message || error.message || "Error desconocido";
    throw new Error(errorMessage);
  }
};



export const olvidarContraSin = async (email) => {
  try {
    if (!email || !email.trim() || !email.includes('@')) {
      Swal.fire('Advertencia', 'Ingresa un correo electrónico válido.', 'warning');
      return;
    }

    const body = {
      subject: "Verificación de contraseña",
      message: "Hola, aquí tienes tu código de verificacion de parte del equipo de Consultoría JAS: ",
    };

    const response = await axios.post(
      `${API_URL_MAIL}/send/sin/${email.trim()}`,
      body,
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    return response.data;

  } catch (error) {
    console.error("Error al mandar el correo:", error);
    const errorMessage = error.response?.data?.message || error.message || "Error desconocido";
    throw new Error(errorMessage);
  }
};
export const enviarCorreoConDatos = async (emailDestino, asunto, mensaje) => {
  try {
    if (!emailDestino || !emailDestino.includes('@')) {
      throw new Error('Correo destino inválido');
    }

    const body = {
      subject: asunto,
      message: mensaje,
    };

    const response = await axios.post(
      `${API_URL_MAIL}/send/prac/${emailDestino.trim()}`,
      body,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'El servidor no pudo enviar el correo');
    }

    return response.data;
  } catch (error) {
    console.error('Error al mandar el correo:', error);
    throw error;
  }
};

export const payDS160 = async (email) => {
  try {

    const data = {
      subject: "📄 Solicitud de Información - Formulario DS-160",
      message: `¡Hola! 👋\n\nTe compartimos el enlace para recopilar la información necesaria para el llenado de tu formulario *DS-160*. \nEste es un paso importante en tu proceso, y estamos aquí para ayudarte en cada etapa.\n\n🔗 Enlace para completar tu información:\n${URL_DS160}\n\nGracias por confiar en *Consultoría JAS*.\nSi tienes alguna duda, no dudes en escribirnos.\n\nSaludos cordiales,\nEquipo de Consultoría JAS 💼✨`
    };

    const response = await axios.post(
      `${API_URL_MAIL}/send/web/${email.trim()}`,
      data,
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
    return response.data;

  } catch (error) {

    console.error("Error al enviar el correo de pago DS-160:", error);
    const errorMessage = error.response?.data?.message || error.message || "Error desconocido";
    throw new Error(errorMessage);

  }
}

import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  RegistrarTransaccion as registrarTransaccionAPI,
  clientes,
  servicios,
  envioCorreo, // Importación agregada
} from './../../api/api.js';
import Swal from 'sweetalert2';
import '../../styles/RegistrarCliente.css';
import { FaCheck } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';

const schema = yup.object().shape({
  paid: yup
    .number()
    .typeError('Debe ser un número')
    .positive('Debe ser un número positivo')
    .required('Campo obligatorio'),
  paidAll: yup
    .number()
    .typeError('Debe ser un número')
    .positive('Debe ser un número positivo')
    .required('Campo obligatorio'),
  idUser: yup.number().required('Campo obligatorio'),
  idTransact: yup.number().required('Campo obligatorio'),
});

export default function RegistrarTramite({ show, onHide, onClienteRegistrado }) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  const [usuarios, setUsuarios] = useState([]);
  const [transacciones, setTransacciones] = useState([]);

  useEffect(() => {
    register('advance');
  }, [register]);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await clientes();
        if (response.success && Array.isArray(response.response.users)) {
          setUsuarios(response.response.users);
        } else {
          console.error("Formato de respuesta inesperado:", response);
          setUsuarios([]);
        }
      } catch (error) {
        console.error("Error al obtener los clientes:", error);
        setUsuarios([]);
      }
    };

    const fetchTransacciones = async () => {
      try {
        const response = await servicios();
        if (response.success && Array.isArray(response.response.Transacts)) {
          setTransacciones(response.response.Transacts);
        } else {
          console.error("Formato de respuesta inesperado:", response);
          setTransacciones([]);
        }
      } catch (error) {
        console.error("Error al obtener los servicios:", error);
        setTransacciones([]);
      }
    };

    if (show) {
      fetchClientes();
      fetchTransacciones();
    }
  }, [show]);

  const onSubmit = async (data) => {
    try {
      data.status = 1;
      data.stepProgress = 6;

      const usuarioSeleccionado = usuarios.find(u => u.idUser === data.idUser);
      const tramiteSeleccionado = transacciones.find(t => t.idTransact === data.idTransact);

      if (!usuarioSeleccionado || !tramiteSeleccionado) {
        Swal.fire('Error', 'No se encontró el usuario o trámite seleccionado', 'error');
        return;
      }

      await registrarTransaccionAPI(data);

      // Enviar correo personalizado
      await envioCorreo(
        usuarioSeleccionado.email,
        usuarioSeleccionado.name,
        tramiteSeleccionado.description
      );

      Swal.fire({
        icon: 'success',
        title: 'Trámite registrado y correo enviado',
        confirmButtonText: 'Aceptar',
      });

      reset();
      onHide();
      if (typeof onClienteRegistrado === 'function') {
        onClienteRegistrado();
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error durante el registro o envío del correo.',
      });
      console.error(error);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title className="Titulo">Iniciar nuevo trámite</Modal.Title>
      </Modal.Header>

      <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
        <Modal.Body>
          <div className="form-group">
            <label>Cliente:</label>
            <select {...register('idUser')} className={errors.idUser ? 'input-error' : ''}>
              <option value="">Selecciona un cliente</option>
              {usuarios.map((user) => (
                <option key={user.idUser} value={user.idUser}>{user.name}</option>
              ))}
            </select>
            <span className="error">{errors.idUser?.message}</span>
          </div>

          <div className="form-group">
            <label>Pago de adelanto:</label>
            <input
              type="number"
              step="0.01"
              {...register('paid')}
              className={errors.paid ? 'input-error' : ''}
            />
            <span className="error">{errors.paid?.message}</span>
          </div>

          <div className="form-group">
            <label>Costo total del trámite:</label>
            <input
              type="number"
              step="0.01"
              {...register('paidAll')}
              className={errors.paidAll ? 'input-error' : ''}
            />
            <span className="error">{errors.paidAll?.message}</span>
          </div>
          <div className="form-group">
            <label>Trámite:</label>
            <select {...register('idTransact')} className={errors.idTransact ? 'input-error' : ''}>
              <option value="">Selecciona un servicio</option>
              {transacciones.map((transact) => (
                <option key={transact.idTransact} value={transact.idTransact}>
                  {transact.description}
                </option>
              ))}
            </select>
            <span className="error">{errors.idTransact?.message}</span>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancelar <MdClose />
          </Button>
          <Button className="Guardar" variant="primary" type="submit" disabled={isSubmitting}>
            Guardar <FaCheck />
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}

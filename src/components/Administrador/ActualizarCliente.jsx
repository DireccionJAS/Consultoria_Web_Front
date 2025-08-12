import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Swal from 'sweetalert2';
import '../../styles/RegistrarCliente.css';
import { FaCheck } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
import { actualizar } from './../../api/api.js';

const schema = yup.object().shape({
  email: yup.string().email('Correo no válido').required('Campo obligatorio'),
    name: yup
    .string()
    .required('Campo obligatorio')
    .matches(/^[\p{L}\s]+$/u, 'Solo letras'),
  phone: yup
    .string()
    .required('Campo obligatorio')
});

export default function RegistrarCliente({ show, onHide, onClienteRegistrado, cliente }) {

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });
  useEffect(() => {
    if (cliente) {
      reset({
        name: cliente.name,
        email: cliente.email,
        phone: cliente.phone,
      });
    }
  }, [cliente, reset]);
 

  const onSubmit = async (data) => {
    try {
      data.status = 1;//Esto es solamente para usuarios, nos aseguramos que siempre sean USER
      data.idUser = cliente.idUser;
      await actualizar(cliente.idUser, data);
      Swal.fire({
        icon: 'success',
        title: 'Actualización exitosa',
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
        title: 'Error al actualizar',
        text: 'Error al actualizar'
      });
      console.error(error);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title className="Titulo">Actualizar Cliente</Modal.Title>
      </Modal.Header>

      <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
        <Modal.Body>
          <div className="form-group">
            <label>Email:</label>
            <input
              placeholder="cliente@correo.com"
              {...register('email')}
              className={errors.email ? 'input-error' : ''}
            />
            <span className="error">{errors.email?.message}</span>
          </div>

          <div className="form-group">
            <label>Nombre:</label>
            <input
              placeholder="Nombre completo"
              {...register('name')}
              className={errors.name ? 'input-error' : ''}
            />
            <span className="error">{errors.name?.message}</span>
          </div>
          <div className="form-group">
            <label>Teléfono:</label>
            <input
              placeholder="7771234567"
              {...register('phone')}
              className={errors.phone ? 'input-error' : ''}
            />
            <span className="error">{errors.phone?.message}</span>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancelar <MdClose />
          </Button>
          <Button
            className="Guardar"
            variant="primary"
            type="submit"
            disabled={isSubmitting}
          >
            Guardar <FaCheck />
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}

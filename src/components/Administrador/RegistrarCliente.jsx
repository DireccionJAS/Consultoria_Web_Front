import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { RegistrarCliente as registrarClienteAPI } from './../../api/api.js';
import Swal from 'sweetalert2';
import '../../styles/RegistrarCliente.css';
import { FaCheck } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
import { Icon } from '@iconify/react';

const schema = yup.object().shape({
  email: yup.string().required('Campo obligatorio').matches(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/, 'El correo debe estar en minúsculas').email('Correo no válido'),
  name: yup
  .string()
  .required('Campo obligatorio')
  .matches(/^[\p{L}\s]+$/u, 'Solo letras'),
  password: yup.string().required('Campo obligatorio'),
  phone: yup
    .string()
    .required('Campo obligatorio')
});

export default function RegistrarCliente({ show, onHide, onClienteRegistrado }) {

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  const onSubmit = async (data) => {
    try {
      data.status = 1;
      const response = await registrarClienteAPI(data);
  
      if (response.success) {
        Swal.fire({
          icon: 'success',
          title: 'Registro exitoso',
          confirmButtonText: 'Aceptar',
        });
        reset();
        onHide();
        if (typeof onClienteRegistrado === 'function') {
          onClienteRegistrado();
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error al registrar',
          text: 'El usuario ya existe',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al registrar',
        text: 'Ocurrió un error durante el registro.',
      });
      console.error(error);
    }
  };
  

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title className="Titulo">Registrar Cliente</Modal.Title>
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

          <div className="form-group password-group">
            <label>Contraseña:</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="********"
                {...register('password')}
                className={errors.password ? 'input-error' : ''}
              />
              <span
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                style={{ cursor: 'pointer' }}
              >
                <Icon icon={showPassword ? 'mdi:eye' : 'mdi:eye-off'} width="20" />
              </span>
            </div>
            <span className="error">{errors.password?.message}</span>
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

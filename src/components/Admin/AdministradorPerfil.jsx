import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { clientePorId, actualizarContra } from "../../api/api";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import './../../styles/Perfil.css'
import Navbar from "./../NavbarAdmin";
import * as yup from "yup";
import { FaEye, FaEyeSlash, FaCheck } from 'react-icons/fa';
import { Icon } from '@iconify/react';

const schema = yup.object().shape({
    password: yup.string().required('Campo obligatorio'),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref('password'), null], 'Las contraseñas deben coincidir')
        .required('Confirma tu contraseña'),
});

export default function AdministradorPerfil() {
    const navigate = useNavigate();
    const [datos, setDatos] = useState(null);
    const [usuario, setUsuario] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm({
        resolver: yupResolver(schema),
    });

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/");
            return;
        }

        try {
            const decoded = jwtDecode(token);
            setUsuario(decoded.idUser);
            if (decoded.role !== "ADMIN") {
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
        const fetchUsuario = async () => {
            try {
                const response = await clientePorId(usuario);
                if (response.success && response.response.user) {
                    setDatos(response.response.user);
                } else {
                    console.error("Formato inesperado:", response);
                }
            } catch (error) {
                console.error("Error al obtener datos del usuario:", error);
            }
        };

        if (usuario) {
            fetchUsuario();
        }
    }, [usuario]);

    const onSubmit = async (data) => {
        try {
            await actualizarContra(usuario, data.password);
            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Contraseña actualizada con éxito',
            });
            reset();
        } catch (error) {
            console.error("Error actualizando contraseña:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un error al actualizar la contraseña.',
            });
        }
    };

    if (!datos) {
        return <div>Cargando...</div>;
    }

    return (
        <div style={{ marginTop: '80px' }}>
            <div className='fixed-top'>
                <Navbar title={"- Perfil"} />
            </div>
            <div className="profile-container">
                <h1 className="profile-title">Mi Perfil</h1>

                <div className="form-group">
                    <label>Email:</label>
                    <input
                        value={datos.email}
                        disabled
                        className="profile-input"
                    />
                </div>

                <div className="form-group">
                    <label>Nombre:</label>
                    <input
                        value={datos.name}
                        disabled
                        className="profile-input"
                    />
                </div>

                <div className="form-group">
                    <label>Teléfono:</label>
                    <input
                        value={datos.phone}
                        disabled
                        className="profile-input"
                    />
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="password-form">
                    <h2 className="form-subtitle">Cambiar Contraseña</h2>

                    <div className="form-group password-group">
                        <label>Contraseña:</label>
                        <div className="password-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                {...register("password")}
                                placeholder="Ingrese su nueva contraseña"
                                className={`profile-input ${errors.password ? 'input-error' : ''}`}
                            />
                            <span
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <Icon icon={showPassword ? 'mdi:eye' : 'mdi:eye-off'} width="20" />
                            </span>
                        </div>
                        <span className="error">{errors.password?.message}</span>
                    </div>

                    <div className="form-group password-group">
                        <label>Confirmar Contraseña:</label>
                        <div className="password-wrapper">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                {...register("confirmPassword")}
                                 placeholder="Ingrese su nueva contraseña"
                                className={`profile-input ${errors.confirmPassword ? 'input-error' : ''}`}
                            />
                            <span
                                className="toggle-password"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                <Icon icon={showConfirmPassword ? 'mdi:eye' : 'mdi:eye-off'} width="20" />
                            </span>
                        </div>
                        <span className="error">{errors.confirmPassword?.message}</span>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="submit-button"
                    >
                        {isSubmitting ? 'Actualizando...' : 'Actualizar Contraseña'} <FaCheck />
                    </button>
                </form>
            </div>
        </div>
    );
}
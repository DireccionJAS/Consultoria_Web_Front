import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Swal from 'sweetalert2';
import '../../styles/ActualizarTramite.css';
import { FaCheck } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
import { actualizarTC, obtenerLosPasos, deleteTRansactProgress } from './../../api/api.js';

export default function ActualizarTramite({ show, onHide, onClienteRegistrado, cliente }) {
    const citaCas = cliente?.transact?.cas === true;
    const citaCon = cliente?.transact?.con === true;
    const citaSimulacion = cliente?.transact?.simulation === true;
    const [nombreDelPaso, setNombreDelPaso] = useState('');
    const [descripcionDelPaso, setDescripcionDelPaso] = useState('');
    const [showPassword, setShowPassword] = useState(false);


    const schema = yup.object().shape({
        advance: yup.boolean().nullable(),
        dateCas: yup
            .date()
            .nullable()
            .transform((curr, orig) => (orig === '' ? null : curr)),
        dateCon: yup
            .date()
            .nullable()
            .transform((curr, orig) => (orig === '' ? null : curr)),
        dateSimulation: yup
            .date()
            .nullable()
            .transform((curr, orig) => (orig === '' ? null : curr)),
        dateStart: yup
            .date()
            .nullable()
            .transform((curr, orig) => (orig === '' ? null : curr)),
        emailAcces: yup
            .string()
            .email('Correo inválido')
            .nullable()
            .notRequired(),
        haveSimulation: yup.number().nullable(),
        paid: yup
            .number()
            .nullable()
            .transform((curr, orig) => (orig === '' ? null : curr)),
        paidAll: yup
            .number()
            .nullable()
            .transform((curr, orig) => (orig === '' ? null : curr)),
        status: yup
            .number()
            .nullable(),
        stepProgress: yup
            .number()
            .nullable(),
        passwordAcces: yup
            .string()
            .nullable()
            .notRequired()
    });


    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: yupResolver(schema),
        mode: 'onChange',
    });



    useEffect(() => {
        if (cliente) {
            const formattedCas = cliente.dateCas
                ? cliente.dateCas.replace(' ', 'T').slice(0, 16)
                : '';
            const formattedCon = cliente.dateCon
                ? cliente.dateCon.replace(' ', 'T').slice(0, 16)
                : '';
            const formattedSimulacion = cliente.dateSimulation
                ? cliente.dateSimulation.replace(' ', 'T').slice(0, 16)
                : '';

            reset({
                advance: cliente.advance,
                dateCas: formattedCas,
                dateCon: formattedCon,
                dateSimulation: formattedSimulacion,
                dateStart: cliente.dateStart,
                emailAcces: cliente.emailAcces,
                haveSimulation: cliente.haveSimulation,
                paid: cliente.paid,
                paidAll: cliente.paidAll,
                status: cliente.status,
                passwordAcces: cliente.passwordAcces,
                stepProgress: cliente.stepProgress,
            });
        }
    }, [cliente, reset]);

    const [pasosDisponibles, setPasosDisponibles] = useState([]);

    useEffect(() => {
        const obtenerPasoActual = async () => {
            if (cliente?.transact?.idTransact && cliente?.stepProgress != null) {
                try {
                    const resultado = await obtenerLosPasos(cliente.transact.idTransact);
                    // Verificar si StepsTransacts es un array antes de actualizar el estado
                    const pasos = Array.isArray(resultado?.response?.StepsTransacts)
                        ? resultado.response.StepsTransacts
                        : [];
                    setPasosDisponibles(pasos);

                    const pasoActual = pasos.find(p => p.stepNumber === cliente.stepProgress);
                    setNombreDelPaso(pasoActual?.name?.trim() || 'Paso no encontrado');
                    setDescripcionDelPaso(pasoActual?.description?.trim() || 'Sin descripción');

                    // Preseleccionar paso actual
                    setValue('stepProgress', pasoActual?.stepNumber || null);
                } catch (error) {
                    console.error('Error al obtener el paso actual', error);
                    setNombreDelPaso('Error al cargar paso');
                    setDescripcionDelPaso('Error al cargar descripción');
                }
            }
        };
        obtenerPasoActual();
    }, [cliente, setValue]);



    const onSubmit = async (data) => {
        try {
            const formatDate = (date) => {
                if (!date) return null;
                const d = new Date(date);
                const yyyy = d.getFullYear();
                const MM = String(d.getMonth() + 1).padStart(2, '0');
                const dd = String(d.getDate()).padStart(2, '0');
                const hh = String(d.getHours()).padStart(2, '0');
                const mm = String(d.getMinutes()).padStart(2, '0');
                return `${yyyy}-${MM}-${dd} ${hh}:${mm}`;
            };

            const payload = {
                ...data,
                dateCas: formatDate(data.dateCas),
                dateCon: formatDate(data.dateCon),
                dateSimulation: formatDate(data.dateSimulation),
                dateStart: formatDate(data.dateStart),
                advance: data.advance ? 1 : 0,
                haveSimulation: Number(data.haveSimulation),
                paid: data.advance ? data.paid : null,
            };

            await actualizarTC(cliente.idTransactProgress, payload);

            Swal.fire({
                icon: 'success',
                title: 'Datos guardados',
                confirmButtonText: 'Aceptar',
            });

            if (typeof onClienteRegistrado === 'function') {
                onClienteRegistrado();
            }

            onHide();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error al actualizar',
                text: 'Error al actualizar',
            });
            console.error(error);
        }
    };
    const advanceValue = watch('advance');



    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title className="Titulo">Actualizar Trámite</Modal.Title>
            </Modal.Header>

            <form onSubmit={handleSubmit(onSubmit)} autoComplete="off" >
                <Modal.Body>
                    <div className="form-group">
                        <label>Trámite:</label>
                        <input type="text" className="form-control modern-input" value={cliente?.transact?.name || ''} disabled />
                    </div>

                    <div className="form-group">
                        <label>Cliente:</label>
                        <input type="text" className="form-control modern-input" value={cliente?.user?.name || ''} disabled />
                    </div>

                    <div className="form-group">
                        <label>Correo de acceso:</label>
                        <input type="email" {...register('emailAcces')} className={`modern-input ${errors.emailAcces ? 'input-error' : ''}`} />
                        <span className="error">{errors.emailAcces?.message}</span>
                    </div>
                    <div className="form-group" style={{ position: 'relative' }}>
                        <label>Contraseña:</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            {...register('passwordAcces')}
                            className={`modern-input ${errors.passwordAcces ? 'input-error' : ''}`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                position: 'absolute',
                                right: '10px',
                                top: '38px',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 0
                            }}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                        <span className="error">{errors.passwordAcces?.message}</span>
                    </div>

                    <div className="form-group">
                        <label>Selecciona el paso del trámite:</label>
                        <select
                            className="form-control modern-input"
                            value={watch('stepProgress') || ''}
                            onChange={(e) => {
                                const selectedStep = Number(e.target.value);
                                setValue('stepProgress', selectedStep);
                                const pasoSeleccionado = pasosDisponibles.find(p => p.stepNumber === selectedStep);
                                setDescripcionDelPaso(pasoSeleccionado?.description?.trim() || 'Sin descripción');
                            }}
                        >
                            <option value="">Selecciona un paso</option>
                            {pasosDisponibles.map((paso) => (
                                <option key={paso.stepNumber} value={paso.stepNumber}>
                                    {paso.name}
                                </option>
                            ))}
                        </select>

                        <span className="error">{errors.stepProgress?.message}</span>
                    </div>



                    <div className="form-group">
                        <label>Descripción del paso actual:</label>
                        <textarea
                            className="form-control"
                            value={descripcionDelPaso}
                            rows={3}
                            disabled
                        />
                    </div>

                    <div className="form-group">
                        <label>Progreso:</label>
                        <input type="text" className="form-control modern-input" value={
                            cliente?.status === 1 ? 'En proceso' :
                                cliente?.status === 2 ? 'En espera' :
                                    cliente?.status === 3 ? 'Falta de pago' :
                                        cliente?.status === 4 ? 'Terminado' :
                                            cliente?.status === 5 ? 'Cancelado' :
                                                cliente?.status === 6 ? 'Revisar' : ''
                        } disabled />
                    </div>

                    <div className="form-group">
                        <label>Pago total:</label>
                        <input type="number" step="0.01" {...register('paidAll')} className={`modern-input ${errors.paidAll ? 'input-error' : ''}`} />
                        <span className="error">{errors.paidAll?.message}</span>
                    </div>

                    <div className="form-group">
                        <label>Adelanto:</label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <label><input type="radio" name="advance" checked={advanceValue === true} onChange={() => setValue('advance', true)} /> Sí</label>
                            <label><input type="radio" name="advance" checked={advanceValue === false} onChange={() => setValue('advance', false)} /> No</label>
                        </div>
                        <span className="error">{errors.advance?.message}</span>
                    </div>

                    {advanceValue && (
                        <div className="form-group">
                            <label>Monto de Pago:</label>
                            <input type="number" step="0.01" {...register('paid')} className={`modern-input ${errors.paid ? 'input-error' : ''}`} />
                            <span className="error">{errors.paid?.message}</span>
                        </div>
                    )}

                    {citaCas && (
                        <div className="form-group">
                            <label>Cita CAS:</label>
                            <input type="datetime-local" {...register('dateCas')} className={`modern-input ${errors.dateCas ? 'input-error' : ''}`} />
                            <span className="error">{errors.dateCas?.message}</span>
                        </div>
                    )}

                    {citaCon && (
                        <div className="form-group">
                            <label>Cita CON:</label>
                            <input type="datetime-local" {...register('dateCon')} className={`modern-input ${errors.dateCon ? 'input-error' : ''}`} />
                            <span className="error">{errors.dateCon?.message}</span>
                        </div>
                    )}

                    <div className="form-group">
                        <label>Fecha inicio:</label>
                        <input type="date" {...register('dateStart')} className={`modern-input ${errors.dateStart ? 'input-error' : ''}`} />
                        <span className="error">{errors.dateStart?.message}</span>
                    </div>

                    {citaSimulacion && (
                        <div className="form-group">
                            <label>Fecha y Hora Simulación:</label>
                            <input type="datetime-local" {...register('dateSimulation')} className={`modern-input ${errors.dateSimulation ? 'input-error' : ''}`} />
                            <span className="error">{errors.dateSimulation?.message}</span>
                        </div>
                    )}

                    {citaSimulacion && (
                        <div className="form-group">
                            <label>Simulación realizada:</label>
                            <div className="checkbox-group">
                                <label><input type="checkbox" checked={watch('haveSimulation') === 1} onChange={() => setValue('haveSimulation', 1)} /> Sí</label>
                                <label><input type="checkbox" checked={watch('haveSimulation') === 0} onChange={() => setValue('haveSimulation', 0)} /> No</label>
                            </div>
                            <span className="error">{errors.haveSimulation?.message}</span>
                        </div>
                    )}

                </Modal.Body>

                <Modal.Footer>
                    <Button variant="danger" onClick={() => {
                        Swal.fire({
                            title: '¿Estás seguro?',
                            text: "Esta acción no se puede deshacer",
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#d33',
                            cancelButtonColor: '#3085d6',
                            confirmButtonText: 'Sí, eliminar',
                            cancelButtonText: 'Cancelar'
                        }).then(async (result) => {
                            if (result.isConfirmed) {
                                try {
                                    await deleteTRansactProgress(cliente.idTransactProgress);

                                    Swal.fire(
                                        'Eliminado!',
                                        'El trámite ha sido eliminado.',
                                        'success'
                                    );

                                    // Actualizar la lista después de eliminar
                                    if (typeof onClienteRegistrado === 'function') {
                                        onClienteRegistrado();
                                    }

                                    onHide();
                                } catch (error) {
                                    console.error('Error al eliminar el trámite:', error);
                                    Swal.fire({
                                        icon: 'error',
                                        title: 'Error al eliminar',
                                        text: 'No se pudo eliminar el trámite. Inténtalo de nuevo.',
                                    });
                                }
                            }
                        });
                    }}>
                        Eliminar
                    </Button>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
                        <Button variant="secondary" onClick={onHide}>Cancelar <MdClose /></Button>
                        <Button className="Guardar" variant="primary" type="submit" disabled={isSubmitting}>Guardar <FaCheck /></Button>
                    </div>
                </Modal.Footer>
            </form>
        </Modal>
    );
}

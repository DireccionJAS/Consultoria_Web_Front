import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import Swal from 'sweetalert2';
import '../../styles/ActualizarTramite.css';
import { obtenerLosPasos, cancelarCita } from './../../api/api.js';
import { TRAMITE_STATUS_LABELS } from './../../utils/tramiteStatus.js';
import { MdClose } from 'react-icons/md';

// Detalle de un trámite del cliente: solo lectura. La cita de Simulación la
// agenda/cambia Empresa o Admin; el cliente solo puede cancelarla una vez
// (con cargo de $99 si la cita es futura, lo calcula el servidor).
export default function ActualizarMiTramite({ show, onHide, onClienteRegistrado, cliente }) {
    const [nombreDelPaso, setNombreDelPaso] = useState('');
    const [descripcionDelPaso, setDescripcionDelPaso] = useState('');

    useEffect(() => {
        const obtenerPasoActual = async () => {
            if (cliente?.transact?.idTransact && cliente?.stepProgress != null) {
                try {
                    const resultado = await obtenerLosPasos(cliente.transact.idTransact);
                    const pasos = resultado?.response?.StepsTransacts || [];
                    const pasoActual = pasos.find(p => p.stepNumber === cliente.stepProgress);

                    setNombreDelPaso(pasoActual?.name?.trim() || 'Paso no encontrado');
                    setDescripcionDelPaso(pasoActual?.description?.trim() || 'Sin descripción');
                } catch (error) {
                    console.error('Error al obtener el paso actual', error);
                    setNombreDelPaso('Error al cargar paso');
                    setDescripcionDelPaso('Error al cargar descripción');
                }
            }
        };
        obtenerPasoActual();
    }, [cliente]);

    async function eliminarCita(cliente) {
        const result = await Swal.fire({
            icon: 'warning',
            title: '¿Estás seguro que quieres cancelar la cita?',
            text: 'Solamente puedes cancelar la cita una vez. Si la cita aún no ha pasado, se generará un cargo de $99 MXN por la cancelación. El pago anterior no será reembolsado, en caso de que la cita ya haya sido pagada.',
            showCancelButton: true,
            confirmButtonText: 'Sí, cancelar cita',
            cancelButtonText: 'No',
        });

        if (result.isConfirmed) {
            try {
                const fechaActual = new Date();
                const fechaCita = new Date(cliente.dateSimulation);

                if (fechaCita < fechaActual) {
                    Swal.fire({
                        icon: 'error',
                        title: 'No se puede cancelar la cita',
                        text: 'La cita ya ha pasado',
                    });
                    return;
                }
                const response = await cancelarCita(cliente.idTransactProgress);
                if (response.success) {
                    if (response.response?.comisionGenerada) {
                        Swal.fire({
                            icon: 'info',
                            title: 'Cita cancelada, se generó un cargo',
                            text: 'Esta cancelación generó una comisión de $99 MXN, la verás reflejada en Pagos.',
                            confirmButtonText: 'Aceptar',
                        });
                    } else {
                        Swal.fire({
                            icon: 'success',
                            title: 'Cita cancelada exitosamente',
                            showConfirmButton: false,
                            timer: 2500,
                            timerProgressBar: true,
                        });
                    }
                    if (typeof onClienteRegistrado === 'function') {
                        onClienteRegistrado();
                    }
                    onHide();
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al cancelar la cita',
                        text: response.message,
                    });
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al cancelar',
                    text: 'No se pudo cancelar la cita',
                });
                console.error(error);
            }
        }
    }

    const puedeCancelarSimulacion = !!cliente?.dateSimulation && !cliente?.cancelDate
        && new Date(cliente.dateSimulation.replace(' ', 'T')) > new Date();

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title className="Titulo" style={{ marginLeft: "350px" }}>
                    {cliente?.transact?.description}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="form-group">
                    <label>Imagen:</label>
                    {cliente?.transact?.image ? (
                        <img src={cliente.transact.image} alt="Imagen" style={{ maxWidth: '100%', height: 'auto' }} />
                    ) : (
                        <p>Sin imagen</p>
                    )}
                </div>

                <div className="form-group">
                    <label>Cita CAS:</label>
                    <p>
                        {cliente?.dateCas
                            ? "Ya cuentas con una cita agendada"
                            : "No cuentas con cita agendada"}
                    </p>
                    <input type="text" className="form-control" value={cliente?.dateCas ?? ''} disabled />
                </div>

                <div className="form-group">
                    <label>Cita CON:</label>
                    <p>
                        {cliente?.dateCon
                            ? "Ya cuentas con una cita agendada"
                            : "No cuentas con cita agendada"}
                    </p>
                    <input type="text" className="form-control" value={cliente?.dateCon ?? ''} disabled />
                </div>


                <div className="form-group">
                    <label>Pago Adelantado:</label>
                    <input type="text" className="form-control" value={cliente?.paid ?? ''} disabled />
                </div>

                <div className="form-group">
                    <label>Pago Total:</label>
                    <input type="text" className="form-control" value={cliente?.paidAll ?? ''} disabled />
                </div>

                <div className="form-group">
                    <label>Estado:</label>
                    <input type="text" className="form-control" value={TRAMITE_STATUS_LABELS[cliente?.status] || ''} disabled />
                </div>

                <div className="form-group">
                    <label>Paso del trámite actual:</label>
                    <input type="text" className="form-control" value={nombreDelPaso} disabled />
                </div>

                <div className="form-group">
                    <label>Descripción del paso:</label>
                    <input type="text" className="form-control" value={descripcionDelPaso} disabled />
                </div>



                {(cliente?.transact?.simulation || cliente?.dateSimulation) && (
                    <div className="form-group">
                        <label>Cita de Simulación:</label>
                        <p>
                            {cliente?.dateSimulation
                                ? "Ya cuentas con una cita agendada"
                                : "No cuentas con cita agendada. Tu asesor la agendará contigo."}
                        </p>
                        <input type="text" className="form-control" value={cliente?.dateSimulation ?? ''} disabled />

                        {puedeCancelarSimulacion && (
                            <button
                                type="button"
                                className="btn btn-danger mt-2"
                                onClick={() => eliminarCita(cliente)}
                            >
                                Cancelar cita
                            </button>
                        )}
                    </div>
                )}

            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Cerrar <MdClose /></Button>
            </Modal.Footer>
        </Modal>
    );
}

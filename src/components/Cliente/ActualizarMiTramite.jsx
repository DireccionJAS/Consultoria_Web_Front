import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import '../../styles/ActualizarTramite.css';
import { FaCreditCard } from 'react-icons/fa';
import { actualizarTC, actualizarTCS, obtenerLosPasos, cancelarCita, getAllDates } from './../../api/api.js';
import CheckoutForm from '../Pagos.jsx';
import PayPalScriptLoader from '../PayPal/PayPalScriptLoader.jsx';
import PayPalButton from '../PayPal/BottonTest.jsx';
import * as yup from 'yup';
import { LockIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller } from 'react-hook-form';
import { MdClose } from 'react-icons/md';
import { FaCheck } from 'react-icons/fa';
import paymentStyles from './../../styles/servicios/client/PaymentModal.module.css';


const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
const stripePromise = loadStripe(stripeKey);
const VisaSVG = () => (
    <svg width="40" height="14" viewBox="0 0 40 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="14" rx="2" fill="#fff" />
        <text x="7" y="11" fontSize="10" fontWeight="bold" fill="#1a1f71">VISA</text>
    </svg>
);
const MastercardSVG = () => (
    <svg width="40" height="14" viewBox="0 0 40 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="15" cy="7" r="6" fill="#eb001b" />
        <circle cx="25" cy="7" r="6" fill="#f79e1b" />
        <text x="5" y="12" fontSize="7" fontWeight="bold" fill="#222">MC</text>
    </svg>
);
const StripeSVG = () => (
    <svg width="40" height="14" viewBox="0 0 40 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="14" rx="2" fill="#635bff" />
        <text x="6" y="11" fontSize="10" fontWeight="bold" fill="#fff">Stripe</text>
    </svg>
);
const ShieldSVG = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L20 6V12C20 17 16 21 12 22C8 21 4 17 4 12V6L12 2Z" fill="#2563eb" stroke="#2563eb" strokeWidth="1.5" />
        <path d="M9 12L11 14L15 10" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);



const StripePaymentModal = ({ show, onHide, onPaymentSuccess, amount = 99, clienteInfo, pendingDateTime }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [decoded, setDecoded] = useState({ sub: '', idUser: '' });

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            Swal.fire({
                icon: 'error',
                title: 'No estás autenticado',
                text: 'Por favor, inicia sesión para continuar.',
                confirmButtonText: 'Iniciar sesión'
            }).then(() => {
                window.location.href = '/Login';
            });
        } else {
            try {
                const decodedToken = jwtDecode(token);
                setDecoded(decodedToken);
            } catch (error) {
                console.error("Error al decodificar el token:", error);
            }
        }
    }, []);

    const handlePaymentSuccess = (paymentResult) => {
        setIsProcessing(false);
        onHide();

        // Solo pasamos la información del pago exitoso al componente padre
        if (onPaymentSuccess) {
            onPaymentSuccess(paymentResult, pendingDateTime);
        }
    };

    const handlePaymentError = (error) => {
        console.error('Error en el pago:', error);
        setIsProcessing(false);
    };

    return (
        <Modal show={show} onHide={onHide} centered dialogClassName={paymentStyles.customDialog} backdropClassName={paymentStyles.modalBackdrop}>
            <Modal.Header closeButton className={paymentStyles.modalHeader}>
                <Modal.Title className={paymentStyles.paymentModalTitle}>
                    <div className={paymentStyles.serviceIcon}><LockIcon size={32} /></div>
                    <div>
                        <div className={paymentStyles.serviceTitle}>Cobro extra - Cita despues de las 21:00</div>
                        <div className={paymentStyles.serviceSubtitle}>
                            Pago seguro con Stripe y PayPal
                        </div>
                    </div>
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className={paymentStyles.modalBody}>
                <div className={paymentStyles.securitySection}>
                    <div className={paymentStyles.securityBadge}><ShieldSVG /> Pago 100% seguro</div>
                </div>
                <div className="alert alert-info">
                    <strong>Cobro adicional:</strong> $99 MXN por cita programada después de las 21:00 horas.
                </div>
                {pendingDateTime && (
                    <div className="alert alert-secondary">
                        <strong>Fecha y hora seleccionada:</strong> {new Date(pendingDateTime).toLocaleString('es-MX')}
                    </div>
                )}

                <Elements stripe={stripePromise}>
                    <CheckoutForm
                        amount={amount}
                        description={`Cobro Extra - Cita después de las 21:00`}
                        idProductoTransaccion={clienteInfo?.idTransact || clienteInfo?.tramite_id}
                        userEmail={decoded.sub || 'nohaycorreo@gmail.com'}
                        customer={decoded.idUser || 'N/A'}
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                        serviceName={`Cobro Extra - Cliente: ${decoded.sub || 'N/A'}`}
                        disabled={isProcessing}
                        selectedDate={pendingDateTime}
                        service="hora_extra"
                        idTransactProgress={clienteInfo?.idTransactProgress || 'N/A'}
                    />
                </Elements>
                <div className={paymentStyles.paymentSeparator}>
                    <div className={paymentStyles.separatorLine} />
                    <span className={paymentStyles.separatorText}>o paga con</span>
                    <div className={paymentStyles.separatorLine} />
                </div>

                <div style={{ marginTop: 24, marginBottom: 12 }}>
                    <PayPalScriptLoader>
                        <PayPalButton
                            amount={99}
                            onSuccess={handlePaymentSuccess}
                            onError={handlePaymentError}
                            userId={decoded.idUser || 'N/A'}
                            service="hora_extra"
                        />
                    </PayPalScriptLoader>
                </div>

                {/* Logos */}
                <div className={paymentStyles.paymentMethods}>
                    <VisaSVG />
                    <MastercardSVG />
                    <StripeSVG />
                </div>

                {/* Nota */}
                <div className={paymentStyles.privacyNote}>
                    Nunca almacenamos datos de tu tarjeta.
                </div>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onHide} disabled={isProcessing}>
                    Cancelar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

const DateTimeSelector = ({ value, onChange, fechasOcupadas, className, error, onExtraChargeRequired, disabled }) => {
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [availableHours, setAvailableHours] = useState([]);
    const [allHours, setAllHours] = useState([]);

    useEffect(() => {
        if (value) {
            if (typeof value === 'string' && value.includes('T')) {
                const [datePart, timePart] = value.split('T');
                const timeOnly = timePart.split(':').slice(0, 2).join(':');
                setSelectedDate(datePart);
                setSelectedTime(timeOnly);
            } else {
                const date = new Date(value);
                const dateStr = date.getFullYear() + '-' +
                    String(date.getMonth() + 1).padStart(2, '0') + '-' +
                    String(date.getDate()).padStart(2, '0');
                const timeStr = String(date.getHours()).padStart(2, '0') + ':' +
                    String(date.getMinutes()).padStart(2, '0');
                setSelectedDate(dateStr);
                setSelectedTime(timeStr);
            }
        }
    }, [value]);

    const generateAllPossibleHours = (selectedDateStr) => {
        if (!selectedDateStr) return [];

        const today = new Date();
        const selectedDateObj = new Date(selectedDateStr + 'T00:00:00');
        const isToday = selectedDateObj.toDateString() === today.toDateString();

        const startHour = isToday ? Math.max(9, today.getHours() + 1) : 9;
        const endHour = 24;

        const hours = [];
        for (let hour = startHour; hour < endHour; hour++) {
            for (let minute = 0; minute < 60; minute += 60) {
                hours.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
            }
        }
        return hours;
    };

    const generateAvailableHours = (selectedDateStr) => {
        if (!selectedDateStr) {
            setAvailableHours([]);
            setAllHours([]);
            return;
        }

        const possibleHours = generateAllPossibleHours(selectedDateStr);
        setAllHours(possibleHours);

        const occupiedTimes = new Set();

        fechasOcupadas.forEach(fechaOcupada => {
            if (!fechaOcupada) return;

            let fechaOcupadaDate, fechaOcupadaHour;

            if (typeof fechaOcupada === 'string' && fechaOcupada.includes('T')) {
                const [datePart, timePart] = fechaOcupada.split('T');
                fechaOcupadaDate = datePart;
                fechaOcupadaHour = timePart.split(':').slice(0, 2).join(':');
            } else if (typeof fechaOcupada === 'string' && fechaOcupada.includes(' ')) {
                const [datePart, timePart] = fechaOcupada.split(' ');
                fechaOcupadaDate = datePart;
                fechaOcupadaHour = timePart.split(':').slice(0, 2).join(':');
            } else {
                const fechaObj = new Date(fechaOcupada);
                fechaOcupadaDate = fechaObj.getFullYear() + '-' +
                    String(fechaObj.getMonth() + 1).padStart(2, '0') + '-' +
                    String(fechaObj.getDate()).padStart(2, '0');
                fechaOcupadaHour = String(fechaObj.getHours()).padStart(2, '0') + ':' +
                    String(fechaObj.getMinutes()).padStart(2, '0');
            }

            if (fechaOcupadaDate === selectedDateStr) {
                occupiedTimes.add(fechaOcupadaHour);
            }
        });

        const available = possibleHours.filter(hour => !occupiedTimes.has(hour));
        setAvailableHours(available);
    };

    useEffect(() => {
        generateAvailableHours(selectedDate);
    }, [selectedDate, fechasOcupadas]);

    const handleDateChange = (e) => {
        const newDate = e.target.value;
        const today = new Date().toISOString().split('T')[0];

        if (newDate < today) {
            Swal.fire({
                icon: 'error',
                title: 'Fecha inválida',
                text: 'Por favor, selecciona una fecha actual o posterior.',
            });
            return;
        }

        setSelectedDate(newDate);
        setSelectedTime('');
        onChange('');
    };

    const handleTimeChange = (e) => {
        const newTime = e.target.value;

        if (!selectedDate) {
            Swal.fire({
                icon: 'warning',
                title: 'Selecciona una fecha',
                text: 'Primero debes seleccionar una fecha válida.',
            });
            return;
        }

        setSelectedTime(newTime);

        if (selectedDate && newTime) {
            const dateTime = `${selectedDate}T${newTime}:00`;

            const hourNumber = parseInt(newTime.split(':')[0]);
            if (hourNumber >= 21) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Cobro Extra',
                    text: 'Si la hora excede de las 21:00 (9:00 PM) se aplicará un costo extra de $99 MXN.',
                    showCancelButton: true,
                    confirmButtonText: 'Cancelar selección',
                    cancelButtonText: 'Acepto el cobro extra',
                    reverseButtons: true
                }).then((result) => {
                    if (result.isConfirmed) {
                        setSelectedTime('');
                        onChange('');
                    } else if (result.dismiss === Swal.DismissReason.cancel) {
                        if (onExtraChargeRequired) {
                            onExtraChargeRequired(dateTime);
                        }
                        onChange(dateTime);
                    }
                });
            } else {
                onChange(dateTime);
            }
        }
    };

    const getMinDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const isHourAvailable = (hour) => {
        return availableHours.includes(hour);
    };

    const allHoursOccupied = selectedDate && allHours.length > 0 && availableHours.length === 0;

    return (
        <div>
            <div className="row">
                <div className="col-md-6">
                    <label>Fecha:</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={handleDateChange}
                        min={getMinDate()}
                        className={`form-control ${error ? 'is-invalid' : ''}`}
                        disabled={disabled}
                    />
                </div>
                <div className="col-md-6">
                    <label>Hora:</label>
                    <select
                        value={selectedTime}
                        onChange={handleTimeChange}
                        className={`form-control ${error ? 'is-invalid' : ''}`}
                        disabled={disabled || !selectedDate || allHoursOccupied}
                    >
                        <option value="">Selecciona una hora</option>
                        {allHours.map(hour => {
                            const hourNumber = parseInt(hour.split(':')[0]);
                            const isExtraCharge = hourNumber >= 21;
                            return (
                                <option
                                    key={hour}
                                    value={hour}
                                    disabled={!isHourAvailable(hour)}
                                    style={{
                                        color: isExtraCharge ? '#ff6b35' : (isHourAvailable(hour) ? 'inherit' : '#999'),
                                        backgroundColor: isExtraCharge ? '#fff3e0' : (isHourAvailable(hour) ? 'white' : '#f2f2f2'),
                                        fontWeight: isExtraCharge ? 'bold' : 'normal'
                                    }}
                                >
                                    {hour}
                                    {!isHourAvailable(hour) && ' (Ocupado)'}
                                    {isExtraCharge && isHourAvailable(hour) && ' (+$99 MXN)'}
                                </option>
                            );
                        })}
                    </select>
                </div>
            </div>

            {allHoursOccupied && (
                <div className="mt-2">
                    <small className="text-danger">
                        No hay horarios disponibles para esta fecha.
                    </small>
                </div>
            )}

            <div className="mt-2">
                <small className="text-info">
                    <strong>ℹ️ Información:</strong>
                    <br />
                    • Horario de atención: 9:00 AM - 12:00 AM
                    <br />
                    • Cada cita dura aproximadamente 1 hora
                    <br />
                    • <span className="text-warning"><strong>Citas después de las 21:00 tienen un costo extra de $99 MXN</strong></span>
                    <br />
                    {selectedDate && (
                        <small className="text-info">
                            Fecha: {selectedDate} |
                            Horas totales: {allHours.length} |
                            Horas disponibles: {availableHours.length} |
                            Horas ocupadas: {allHours.length - availableHours.length}
                        </small>
                    )}
                </small>
            </div>
        </div>
    );
};

export default function ActualizarMiTramite({ show, onHide, onClienteRegistrado, cliente }) {
    const [nombreDelPaso, setNombreDelPaso] = useState('');
    const [descripcionDelPaso, setDescripcionDelPaso] = useState('');
    const [fechasOcupadas, setFechasOcupadas] = useState([]);

    const [showStripeModal, setShowStripeModal] = useState(false);
    const [pendingDateTime, setPendingDateTime] = useState(null);
    const [extraChargeClientInfo, setExtraChargeClientInfo] = useState(null);
    const [isPaymentRequired, setIsPaymentRequired] = useState(false);

    const schema = yup.object().shape({
        dateSimulation: yup
            .string()
            .nullable()
            .required('Debes seleccionar una fecha y hora')
            .test('valid-datetime', 'Fecha y hora no válidas', (value) => {
                if (!value) return false;
                const date = new Date(value);
                return date > new Date();
            })
    });

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        control,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: yupResolver(schema),
        mode: 'onChange',
    });

    const advanceValue = watch('advance');
    const currentDateSimulation = watch('dateSimulation');

    useEffect(() => {
        const obtenerFechasOcupadas = async () => {
            try {
                const response = await getAllDates();
                if (response.success && response.response?.transactProgresses) {
                    const fechas = response.response.transactProgresses
                        .map(item => item.dateSimulation)
                        .filter(fecha => fecha !== null && fecha !== undefined);

                    setFechasOcupadas(fechas);
                }
            } catch (error) {
                console.error('Error al obtener fechas ocupadas:', error);
                Swal.fire({
                    icon: 'warning',
                    title: 'Advertencia',
                    text: 'No se pudieron cargar las fechas ocupadas. Verifica manualmente los horarios.',
                });
            }
        };

        if (show) {
            obtenerFechasOcupadas();
        }
    }, [show]);

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

            setIsPaymentRequired(false);
            setPendingDateTime(null);
        }
    }, [cliente, reset]);

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

    const handleExtraChargeRequired = (dateTime) => {
        setPendingDateTime(dateTime);
        setIsPaymentRequired(true);

        const clienteInfo = {
            id: cliente?.idTransactProgress,
            idTransactProgress: cliente?.idTransactProgress,
            name: cliente?.name || 'Cliente',
            email: cliente?.emailAcces || '',
            idTransact: cliente?.transact?.idTransact,
            tramite_id: cliente?.transact?.idTransact,
        };

        setExtraChargeClientInfo(clienteInfo);
        setShowStripeModal(true);
    };

    // FUNCIÓN CORREGIDA: Actualizar trámite después del pago exitoso
    const handlePaymentSuccess = async (paymentResult, confirmedDateTime) => {
        try {
            // Actualizar el formulario con la nueva fecha
            if (confirmedDateTime) {
                setValue('dateSimulation', confirmedDateTime, { shouldValidate: true });
            }

            // Preparar los datos actuales del formulario para la actualización
            const currentFormData = watch(); // Obtener todos los datos actuales del formulario

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
                advance: currentFormData.advance,
                dateCas: formatDate(currentFormData.dateCas),
                dateCon: formatDate(currentFormData.dateCon),
                dateSimulation: formatDate(confirmedDateTime || currentFormData.dateSimulation),
                dateStart: currentFormData.dateStart,
                emailAcces: currentFormData.emailAcces,
                haveSimulation: currentFormData.haveSimulation,
                paid: currentFormData.paid,
                paidAll: currentFormData.paidAll,
                status: currentFormData.status,
                passwordAcces: currentFormData.passwordAcces,
                stepProgress: currentFormData.stepProgress,
            };


            // Realizar la actualización del trámite
            const response = await actualizarTCS(cliente.idTransactProgress, payload);


            if (response.success) {
                // Resetear estados de pago
                setIsPaymentRequired(false);
                setPendingDateTime(null);
                setExtraChargeClientInfo(null);
                setShowStripeModal(false);

                // Mostrar mensaje de éxito
                Swal.fire({
                    icon: 'success',
                    title: 'Pago y actualización exitosos',
                    text: 'El cobro extra ha sido procesado y tu cita ha sido agendada exitosamente.',
                    confirmButtonText: 'Aceptar'
                }).then(() => {
                    // Llamar callback si existe
                    if (typeof onClienteRegistrado === 'function') {
                        onClienteRegistrado();
                    }
                    // Cerrar modal
                    onHide();
                });

            } else {
                throw new Error(response.message || 'Error al actualizar el trámite');
            }

        } catch (error) {
            console.error('❌ Error al actualizar el trámite después del pago:', error);

            // Cerrar modal de pago pero mostrar error
            setShowStripeModal(false);

            Swal.fire({
                icon: 'error',
                title: 'Error al actualizar',
                text: 'El pago se procesó correctamente, pero hubo un error al actualizar el trámite. Por favor contacta soporte.',
                confirmButtonText: 'Aceptar'
            });
        }
    };

    const formatDate = (date, maintainLocalTime = false) => {
        if (!date) return null;

        let d;
        if (maintainLocalTime && typeof date === 'string') {
            d = new Date(date + (date.includes('T') ? '' : 'T00:00:00'));
        } else {
            d = new Date(date);
        }

        const yyyy = d.getFullYear();
        const MM = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        return `${yyyy}-${MM}-${dd} ${hh}:${mm}`;
    };

    const onSubmit = async (data) => {
        // Verificar si se requiere pago y no se ha completado
        if (data.dateSimulation && isPaymentRequired) {
            const selectedHour = new Date(data.dateSimulation).getHours();
            if (selectedHour >= 21) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Pago requerido',
                    text: 'Debes completar el pago del cobro extra antes de continuar.',
                    confirmButtonText: 'Aceptar'
                });
                return;
            }
        }

        // Validación de fechas ocupadas (código existente)
        if (data.dateSimulation) {
            const nuevaFecha = new Date(data.dateSimulation);

            const ocupadasMismaFecha = fechasOcupadas
                .filter(f => {
                    if (!f) return false;
                    const ocupada = new Date(f);
                    return ocupada.toDateString() === nuevaFecha.toDateString() &&
                        ocupada.getTime() !== new Date(cliente.dateSimulation || '').getTime();
                })
                .map(f => new Date(f));

            const cumpleSeparacion = ocupadasMismaFecha.every(ocupada => {
                const diffMinutos = Math.abs((nuevaFecha - ocupada) / 60000);
                return diffMinutos >= 60;
            });

            if (!cumpleSeparacion) {
                const startHour = 9;
                const endHour = 24;
                let hayPosibleHora = false;

                for (let hour = startHour; hour < endHour; hour++) {
                    const posibleHora = new Date(nuevaFecha);
                    posibleHora.setHours(hour, 0, 0, 0);
                    const esValida = ocupadasMismaFecha.every(ocupada => {
                        const diffMinutos = Math.abs((posibleHora - ocupada) / 60000);
                        return diffMinutos >= 60;
                    });
                    if (esValida) {
                        hayPosibleHora = true;
                        break;
                    }
                }

                if (!hayPosibleHora) {
                    Swal.fire('Fecha no disponible', 'No hay horarios disponibles para esta fecha', 'error');
                } else {
                    Swal.fire('Hora no disponible', 'La hora seleccionada ya está ocupada. Por favor, elige otra.', 'error');
                }
                return;
            }
        }

        // Actualización normal del trámite (sin cobro extra)
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
                advance: data.advance,
                dateCas: formatDate(data.dateCas),
                dateCon: formatDate(data.dateCon),
                dateSimulation: formatDate(data.dateSimulation),
                dateStart: data.dateStart,
                emailAcces: data.emailAcces,
                haveSimulation: data.haveSimulation,
                paid: data.paid,
                paidAll: data.paidAll,
                status: data.status,
                passwordAcces: data.passwordAcces,
                stepProgress: data.stepProgress,
            };

            const response = await actualizarTCS(cliente.idTransactProgress, payload);


            if (response.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Actualización exitosa',
                    confirmButtonText: 'Aceptar',
                });

                if (typeof onClienteRegistrado === 'function') {
                    onClienteRegistrado();
                }

                setIsPaymentRequired(false);
                setPendingDateTime(null);

                onHide();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al actualizar',
                    text: response.message || 'No se pudo actualizar el trámite',
                });
            }
        } catch (error) {
            console.error('Error al actualizar el trámite:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error al actualizar',
                text: 'No se pudo actualizar el trámite. Por favor, inténtalo de nuevo más tarde.',
            });
        }
    };

    async function eliminarCita(cliente) {
        const result = await Swal.fire({
            icon: 'warning',
            title: '¿Estás seguro que quieres cancelar la cita?',
            text: 'Solamente puedes cancelar la cita una vez, el pago anterior no será reembolsado, en caso de que la cita ya haya sido pagada. -',
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
                    Swal.fire({
                        icon: 'success',
                        title: 'Cita cancelada exitosamente',
                        confirmButtonText: 'Aceptar',
                    });
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

    const handleModalHide = () => {
        setIsPaymentRequired(false);
        setPendingDateTime(null);
        setShowStripeModal(false);
        onHide();
    };


    return (
        <>
            <Modal show={show} onHide={handleModalHide} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title className="Titulo" style={{ marginLeft: "350px" }}>
                        {cliente?.transact?.description}
                    </Modal.Title>
                </Modal.Header>
                <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
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
                            <input type="text" className="form-control" value={
                                cliente?.status === 1 ? 'En proceso' :
                                    cliente?.status === 2 ? 'En espera' :
                                        cliente?.status === 3 ? 'Falta de pago' :
                                            cliente?.status === 4 ? 'Terminado' :
                                                cliente?.status === 5 ? 'Cancelado' :
                                                    cliente?.status === 6 ? 'Revisar' : ''
                            } disabled />
                        </div>

                        <div className="form-group">
                            <label>Paso del trámite actual:</label>
                            <input type="text" className="form-control" value={nombreDelPaso} disabled />
                        </div>

                        <div className="form-group">
                            <label>Descripción del paso:</label>
                            <input type="text" className="form-control" value={descripcionDelPaso} disabled />
                        </div>



                        <div className="form-group">
                            <p>
                                {cliente?.dateSimulation
                                    ? "Ya cuentas con una cita agendada"
                                    : "No cuentas con cita agendada"}
                            </p>

                            {(cliente?.transact?.simulation || cliente?.dateSimulation) && (
                                <div className="form-group">
                                    <label>Cita de Simulación:</label>
                                    <Controller
                                        name="dateSimulation"
                                        control={control}
                                        render={({ field }) => (
                                            <DateTimeSelector
                                                value={field.value}
                                                onChange={field.onChange}
                                                fechasOcupadas={fechasOcupadas}
                                                error={errors.dateSimulation}
                                                onExtraChargeRequired={handleExtraChargeRequired}
                                                // ✅ Deshabilitar si NO es una cita de simulación
                                                disabled={!cliente?.transact?.simulation || cliente?.wasUpdated}
                                            />
                                        )}
                                    />
                                    {errors.dateSimulation && (
                                        <span className="text-danger">{errors.dateSimulation.message}</span>
                                    )}
                                </div>
                            )}

                            {/* ✅ Mostrar botón Cancelar solo si es una cita de simulación y se puede editar */}
                            {cliente?.transact?.simulation && cliente?.wasUpdated && (
                                <button
                                    type="button"
                                    className="btn btn-danger mt-2"
                                    onClick={() => eliminarCita(cliente)}
                                >
                                    Cancelar cita
                                </button>
                            )}
                        </div>

                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant="secondary" onClick={onHide}>Cerrar <MdClose /></Button>
                        <Button className="Guardar" variant="primary" type="submit" disabled={isSubmitting}>
                            Guardar <FaCheck />
                        </Button>
                    </Modal.Footer>
                </form>
            </Modal>

            <StripePaymentModal
                show={showStripeModal}
                onHide={() => setShowStripeModal(false)}
                onPaymentSuccess={handlePaymentSuccess}
                amount={99}
                clienteInfo={extraChargeClientInfo}
                pendingDateTime={pendingDateTime}
            />


        </>
    );
}
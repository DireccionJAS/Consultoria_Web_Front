import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getHorarios } from './../../../../api/api.js';

// Días/horas reales de disponibilidad: se reutiliza el horario configurado
// para SIMULACION (Empresa > Horarios) porque este flujo guarda la fecha en
// el mismo campo TransactProgress.dateSimulation (ver
// TransactProgressServiceImp.createProgressWithPayment). Si todavía no hay
// nada configurado, se cae a un fallback con los mismos horarios de antes.
const HORAS_FALLBACK = Array.from({ length: 15 }, (_, i) => `${String(i + 9).padStart(2, '0')}:00`);

const CalendarBooking = ({ onDateSelected, disabledDates = [], minDate }) => {
  const [selectedDate, setSelectedDate] = useState(null); // Date object
  const [selectedTime, setSelectedTime] = useState('');
  const [diasDisponibles, setDiasDisponibles] = useState(null); // null = aún no cargado, sin restringir
  const [horasDisponibles, setHorasDisponibles] = useState(HORAS_FALLBACK);

  useEffect(() => {
    getHorarios()
      .then((response) => {
        const sim = response?.response?.horarios?.SIMULACION;
        if (sim?.dias?.length) setDiasDisponibles(sim.dias);
        if (sim?.horas?.length) {
          setHorasDisponibles(sim.horas.map((h) => (h.length === 4 ? `0${h}` : h)));
        }
      })
      .catch((error) => console.error('Error al obtener horarios:', error));
  }, []);

  const availableHours = horasDisponibles;

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedTime('');
    if (onDateSelected) onDateSelected(null); // Reset
  };

  const handleTimeChange = (e) => {
    setSelectedTime(e.target.value);
    if (selectedDate && e.target.value && onDateSelected) {
      // Formato: yyyy-mm-ddTHH:MM
      const dateStr = selectedDate.toISOString().split('T')[0];
      onDateSelected(`${dateStr}T${e.target.value}`);
    }
  };

  // Deshabilitar fechas ocupadas (prop) y días fuera del horario configurado
  const isDateDisabled = date => {
    const dateStr = date.toISOString().split('T')[0];
    if (disabledDates.some(d => d.startsWith(dateStr))) return true;
    if (diasDisponibles && !diasDisponibles.includes(date.getDay())) return true;
    return false;
  };

  return (
    <div style={{ margin: '16px 0', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <DatePicker
        selected={selectedDate}
        onChange={handleDateChange}
        minDate={minDate ? new Date(minDate) : new Date()}
        filterDate={date => !isDateDisabled(date)}
        dateFormat="dd/MM/yyyy"
        placeholderText="Selecciona una fecha"
        className="form-control"
        inline
      />
      <div style={{ marginTop: 1, width: 220, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <label style={{ fontWeight: 500, marginBottom: 8 }}>Hora:</label>
        <select
          value={selectedTime}
          onChange={handleTimeChange}
          className="form-control"
          disabled={!selectedDate}
          style={{ minWidth: 140 }}
        >
          <option value="">Selecciona una hora</option>
          {availableHours.map(hour => (
            <option key={hour} value={hour} disabled={disabledDates.includes(`${selectedDate ? selectedDate.toISOString().split('T')[0] : ''}T${hour}`)}>
              {hour}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default CalendarBooking;

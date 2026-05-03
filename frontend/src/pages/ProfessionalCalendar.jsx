import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import CalendarGrid from "../components/CalendarGrid";

const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const ProfessionalCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [appointmentDuration, setAppointmentDuration] = useState(30);
  const [availability, setAvailability] = useState([]);

  const dayOfWeek = useMemo(() => new Date(selectedDate).getDay(), [selectedDate]);
  const daySlots = availability.filter((a) => a.dayOfWeek === dayOfWeek);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/professionals/me/availability");
        setAppointmentDuration(res.data.appointmentDuration || 30);
        setAvailability(res.data.availability || []);
      } catch (_) {}
    };
    load();
  }, []);

  const addSlot = () => setAvailability((prev) => [...prev, { dayOfWeek, startTime: "09:00", endTime: "12:00" }]);
  const updateSlot = (idx, patch) => setAvailability((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  const removeSlot = (idx) => setAvailability((prev) => prev.filter((_, i) => i !== idx));

  const save = async () => {
    await api.put("/professionals/me/availability", { appointmentDuration, availability });
    alert("Disponibilidad guardada");
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Calendario profesional</h2>
      <CalendarGrid selectedDate={selectedDate} onSelectDate={setSelectedDate} />
      <h3>{days[dayOfWeek]}</h3>
      <label>Duración por turno (min): </label>
      <input type="number" value={appointmentDuration} onChange={(e) => setAppointmentDuration(Number(e.target.value))} />
      <div>
        <button onClick={addSlot}>Agregar slot al día</button>
      </div>
      {daySlots.map((slot, idx) => (
        <div key={idx} style={{ marginTop: 8 }}>
          <input type="time" value={slot.startTime} onChange={(e) => updateSlot(availability.indexOf(slot), { startTime: e.target.value })} />
          <input type="time" value={slot.endTime} onChange={(e) => updateSlot(availability.indexOf(slot), { endTime: e.target.value })} />
          <button onClick={() => removeSlot(availability.indexOf(slot))}>Eliminar</button>
        </div>
      ))}
      <div style={{ marginTop: 16 }}>
        <button onClick={save}>Guardar disponibilidad</button>
      </div>
    </div>
  );
};

export default ProfessionalCalendar;

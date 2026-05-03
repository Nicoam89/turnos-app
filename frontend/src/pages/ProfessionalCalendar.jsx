import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import CalendarGrid from "../components/CalendarGrid";

const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const ProfessionalCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [appointmentDuration, setAppointmentDuration] = useState(30);
  const [availability, setAvailability] = useState([]);
  const [recurringRules, setRecurringRules] = useState([]);
  const [defaultMeetLink, setDefaultMeetLink] = useState("");
  const [officeAddress, setOfficeAddress] = useState("");

  const dayOfWeek = useMemo(() => new Date(selectedDate).getDay(), [selectedDate]);
  const daySlots = availability.filter((a) => a.dayOfWeek === dayOfWeek);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/professionals/me/availability");
        setAppointmentDuration(res.data.appointmentDuration || 30);
        setAvailability(res.data.availability || []);
        setRecurringRules(res.data.recurringRules || []);
        setDefaultMeetLink(res.data.defaultMeetLink || "");
        setOfficeAddress(res.data.officeAddress || "");
      } catch (_) {}
    };
    load();
  }, []);

  const addSlot = () => setAvailability((prev) => [...prev, { dayOfWeek, startTime: "09:00", endTime: "12:00" }]);
  const updateSlot = (idx, patch) => setAvailability((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  const removeSlot = (idx) => setAvailability((prev) => prev.filter((_, i) => i !== idx));

  const addRule = () => setRecurringRules((prev) => [...prev, { frequency: "weekly", interval: 1, dayOfWeek: dayOfWeek, startTime: "09:00", endTime: "12:00" }]);
  const updateRule = (idx, patch) => setRecurringRules((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  const removeRule = (idx) => setRecurringRules((prev) => prev.filter((_, i) => i !== idx));

  const save = async () => {
    await api.put("/professionals/me/availability", {
      appointmentDuration,
      availability,
      recurringRules,
      defaultMeetLink,
      officeAddress
    });
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

      <h3 style={{ marginTop: 16 }}>Turnos recurrentes</h3>
      <button onClick={addRule}>Agregar regla recurrente</button>
      {recurringRules.map((rule, idx) => (
        <div key={idx} style={{ marginTop: 8, border: "1px solid #eee", padding: 8 }}>
          <select value={rule.frequency} onChange={(e) => updateRule(idx, { frequency: e.target.value })}>
            <option value="weekly">Semanal</option>
            <option value="monthly">Mensual</option>
          </select>
          <input type="number" min="1" value={rule.interval || 1} onChange={(e) => updateRule(idx, { interval: Number(e.target.value) })} />
          {rule.frequency === "weekly" ? (
            <select value={rule.dayOfWeek ?? 0} onChange={(e) => updateRule(idx, { dayOfWeek: Number(e.target.value) })}>
              {days.map((d, i) => <option key={d} value={i}>{d}</option>)}
            </select>
          ) : (
            <input type="number" min="1" max="31" value={rule.dayOfMonth ?? 1} onChange={(e) => updateRule(idx, { dayOfMonth: Number(e.target.value) })} />
          )}
          <input type="time" value={rule.startTime} onChange={(e) => updateRule(idx, { startTime: e.target.value })} />
          <input type="time" value={rule.endTime} onChange={(e) => updateRule(idx, { endTime: e.target.value })} />
          <button onClick={() => removeRule(idx)}>Eliminar</button>
        </div>
      ))}

      <div style={{ marginTop: 12 }}>
        <label>Link Meet por defecto: </label>
        <input type="url" placeholder="https://meet.google.com/..." value={defaultMeetLink} onChange={(e) => setDefaultMeetLink(e.target.value)} />
      </div>
      <div style={{ marginTop: 12 }}>
        <label>Dirección consultorio: </label>
        <input type="text" placeholder="Calle 123, Ciudad" value={officeAddress} onChange={(e) => setOfficeAddress(e.target.value)} />
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

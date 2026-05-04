import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import CalendarGrid from "../components/CalendarGrid";
import Layout from "../components/Layout";

const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const ProfessionalCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [appointmentDuration, setAppointmentDuration] = useState(30);
  const [availability, setAvailability] = useState([]);
  const dayOfWeek = useMemo(() => new Date(selectedDate).getDay(), [selectedDate]);
  const daySlots = availability.filter((a) => a.dayOfWeek === dayOfWeek);

  useEffect(() => { (async () => { try { const res = await api.get("/professionals/me/availability"); setAppointmentDuration(res.data.appointmentDuration || 30); setAvailability(res.data.availability || []);} catch (_) {} })(); }, []);
  const addSlot = () => setAvailability((prev) => [...prev, { dayOfWeek, startTime: "09:00", endTime: "12:00" }]);
  const updateSlot = (idx, patch) => setAvailability((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  const removeSlot = (idx) => setAvailability((prev) => prev.filter((_, i) => i !== idx));
  const save = async () => { await api.put("/professionals/me/availability", { appointmentDuration, availability }); alert("Disponibilidad guardada"); };

  return (
    <Layout title="Turnos App">
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <h2 className="text-2xl font-semibold">Calendario profesional</h2>
        <CalendarGrid selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        <h3 className="text-lg font-semibold">{days[dayOfWeek]}</h3>
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-slate-700">Duración (min):</label>
          <input className="rounded-lg border border-slate-300 px-3 py-2 w-24" type="number" value={appointmentDuration} onChange={(e) => setAppointmentDuration(Number(e.target.value))} />
          <button className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-2" onClick={addSlot}>Agregar slot</button>
        </div>
        {daySlots.map((slot, idx) => (
          <div key={idx} className="flex flex-wrap gap-2 items-center">
            <input className="rounded-lg border border-slate-300 px-3 py-2" type="time" value={slot.startTime} onChange={(e) => updateSlot(availability.indexOf(slot), { startTime: e.target.value })} />
            <input className="rounded-lg border border-slate-300 px-3 py-2" type="time" value={slot.endTime} onChange={(e) => updateSlot(availability.indexOf(slot), { endTime: e.target.value })} />
            <button className="rounded-lg border border-rose-200 px-4 py-2 bg-rose-50 text-rose-700" onClick={() => removeSlot(availability.indexOf(slot))}>Eliminar</button>
          </div>
        ))}
        <button className="rounded-lg bg-brand text-white px-4 py-2 font-semibold" onClick={save}>Guardar disponibilidad</button>
      </section>
    </Layout>
  );
};

export default ProfessionalCalendar;


import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import CalendarGrid from "../components/CalendarGrid";
import Layout from "../components/Layout";

const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const ProfessionalCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [appointmentDuration, setAppointmentDuration] = useState(30);
  const [availability, setAvailability] = useState([]);
  const [recurringRules, setRecurringRules] = useState([]);
  const dayOfWeek = useMemo(() => new Date(selectedDate).getDay(), [selectedDate]);
  const daySlots = availability.filter((a) => a.dayOfWeek === dayOfWeek);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/professionals/me/availability");
        setAppointmentDuration(res.data.appointmentDuration || 30);
        setAvailability(res.data.availability || []);
        setRecurringRules(res.data.recurringRules || []);
      } catch (_) {}
    })();
  }, []);

  const addSlot = () => setAvailability((prev) => [...prev, { dayOfWeek, startTime: "09:00", endTime: "12:00" }]);
  const updateSlot = (idx, patch) => setAvailability((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  const removeSlot = (idx) => setAvailability((prev) => prev.filter((_, i) => i !== idx));

  const addRecurringRule = () =>
    setRecurringRules((prev) => [
      ...prev,
      { frequency: "weekly", interval: 1, dayOfWeek, startTime: "09:00", endTime: "12:00" }
    ]);
  const updateRecurringRule = (idx, patch) =>
    setRecurringRules((prev) => prev.map((rule, i) => (i === idx ? { ...rule, ...patch } : rule)));
  const removeRecurringRule = (idx) => setRecurringRules((prev) => prev.filter((_, i) => i !== idx));

  const save = async () => {
    await api.put("/professionals/me/availability", { appointmentDuration, availability, recurringRules });
    alert("Disponibilidad guardada");
  };

  return (
    <Layout title="Agenda iQ">
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <h2 className="text-2xl font-semibold">Calendario profesional</h2>
        <CalendarGrid selectedDate={selectedDate} onSelectDate={setSelectedDate} />

        <h3 className="text-lg font-semibold">Disponibilidad semanal base - {days[dayOfWeek]}</h3>
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-slate-700">Duración (min):</label>
          <input className="rounded-lg border border-slate-300 px-3 py-2 w-24" type="number" min={5} value={appointmentDuration} onChange={(e) => setAppointmentDuration(Number(e.target.value))} />
          <button className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-2" onClick={addSlot}>Agregar slot</button>
        </div>
        {daySlots.map((slot, idx) => (
          <div key={idx} className="flex flex-wrap gap-2 items-center">
            <input className="rounded-lg border border-slate-300 px-3 py-2" type="time" value={slot.startTime} onChange={(e) => updateSlot(availability.indexOf(slot), { startTime: e.target.value })} />
            <input className="rounded-lg border border-slate-300 px-3 py-2" type="time" value={slot.endTime} onChange={(e) => updateSlot(availability.indexOf(slot), { endTime: e.target.value })} />
            <button className="rounded-lg border border-rose-200 px-4 py-2 bg-rose-50 text-rose-700" onClick={() => removeSlot(availability.indexOf(slot))}>Eliminar</button>
          </div>
        ))}

        <hr className="border-slate-200" />
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Reglas recurrentes (sobrescriben disponibilidad base)</h3>
          <button className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-2" onClick={addRecurringRule}>Agregar regla recurrente</button>
          {recurringRules.length === 0 && <p className="text-slate-500">Sin reglas recurrentes configuradas.</p>}

          {recurringRules.map((rule, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-6 gap-2 items-center rounded-lg border border-slate-200 p-3">
              <select className="rounded-lg border border-slate-300 px-3 py-2" value={rule.frequency} onChange={(e) => updateRecurringRule(idx, { frequency: e.target.value })}>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
              </select>

              <input className="rounded-lg border border-slate-300 px-3 py-2" type="number" min={1} value={rule.interval || 1} onChange={(e) => updateRecurringRule(idx, { interval: Number(e.target.value) || 1 })} />

              {rule.frequency === "weekly" ? (
                <select className="rounded-lg border border-slate-300 px-3 py-2" value={rule.dayOfWeek ?? 0} onChange={(e) => updateRecurringRule(idx, { dayOfWeek: Number(e.target.value), dayOfMonth: undefined })}>
                  {days.map((d, dayIndex) => <option key={dayIndex} value={dayIndex}>{d}</option>)}
                </select>
              ) : (
                <input className="rounded-lg border border-slate-300 px-3 py-2" type="number" min={1} max={31} value={rule.dayOfMonth || 1} onChange={(e) => updateRecurringRule(idx, { dayOfMonth: Number(e.target.value), dayOfWeek: undefined })} />
              )}

              <input className="rounded-lg border border-slate-300 px-3 py-2" type="time" value={rule.startTime} onChange={(e) => updateRecurringRule(idx, { startTime: e.target.value })} />
              <input className="rounded-lg border border-slate-300 px-3 py-2" type="time" value={rule.endTime} onChange={(e) => updateRecurringRule(idx, { endTime: e.target.value })} />
              <button className="rounded-lg border border-rose-200 px-4 py-2 bg-rose-50 text-rose-700" onClick={() => removeRecurringRule(idx)}>Eliminar</button>
            </div>
          ))}
        </div>

        <button className="rounded-lg bg-brand text-white px-4 py-2 font-semibold" onClick={save}>Guardar disponibilidad</button>
      </section>
    </Layout>
  );
};

export default ProfessionalCalendar;

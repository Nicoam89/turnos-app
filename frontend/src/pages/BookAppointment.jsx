import { useState } from "react";
import CalendarGrid from "../components/CalendarGrid";
import api from "../api/axios";
import Layout from "../components/Layout";

const BookAppointment = () => {
  const [professionalId, setProfessionalId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [slots, setSlots] = useState([]);
  const [modality, setModality] = useState("offline");
  const [attachments, setAttachments] = useState([]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState("weekly");
  const [occurrences, setOccurrences] = useState(4);
  const toAttachmentPayload = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ originalName: file.name, mimeType: file.type, size: file.size, dataUrl: reader.result });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const getSlots = async () => { try { const res = await api.get(`/appointments/available-slots?professionalId=${professionalId}&date=${date}`); setSlots(res.data.availableSlots || []);} catch (error) { console.log(error); alert("Error al buscar horarios"); } };
  const bookAppointment = async (startTime) => {
    try {
      const attachmentsPayload = await Promise.all(Array.from(attachments).map(toAttachmentPayload));
      if (isRecurring) {
        await api.post("/appointments/recurring", { professionalId, startDate: date, startTime, modality, frequency, occurrences });
        alert("Solicitud de turnos recurrentes enviada ✅ (requiere aprobación del profesional)");
      } else {
        await api.post("/appointments", { professionalId, date, startTime, modality, attachments: attachmentsPayload });
        alert("Turno reservado correctamente 🎉");
      }
      setAttachments([]);
      getSlots();
    } catch (error) { alert(error.response?.data?.msg || "Error al reservar"); }
  };

  return (
    <Layout title="Turnos iQ">
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <h2 className="text-2xl font-semibold">Reservar turno</h2>
        <input className="w-full rounded-lg border border-slate-300 px-3 py-2" type="text" placeholder="Professional ID" value={professionalId} onChange={(e) => setProfessionalId(e.target.value)} />
        <select className="w-full rounded-lg border border-slate-300 px-3 py-2" value={modality} onChange={(e) => setModality(e.target.value)}>
          <option value="offline">Presencial</option>
          <option value="online">Online</option>
        </select>
        <input className="w-full rounded-lg border border-slate-300 px-3 py-2" type="file" multiple onChange={(e) => setAttachments(e.target.files || [])} />
        <label className="flex items-center gap-2"><input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} /> Solicitar turno recurrente</label>
        {isRecurring && <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <select className="rounded-lg border border-slate-300 px-3 py-2" value={frequency} onChange={(e)=>setFrequency(e.target.value)}><option value="weekly">Semanal</option><option value="biweekly">Quincenal</option><option value="monthly">Mensual</option></select>
          <input className="rounded-lg border border-slate-300 px-3 py-2" type="number" min={2} max={24} value={occurrences} onChange={(e)=>setOccurrences(Number(e.target.value) || 4)} />
        </div>}
        <CalendarGrid selectedDate={date} onSelectDate={setDate} markedDates={new Set()} />
        <button className="rounded-lg bg-brand text-white px-4 py-2 font-semibold" onClick={getSlots}>Buscar horarios</button>
        <h3 className="text-lg font-semibold">Horarios disponibles</h3>
        {slots.length === 0 ? <p className="text-slate-500">No hay horarios</p> : <div className="flex flex-wrap gap-2">{slots.map((slot) => <button className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2" key={slot.start} onClick={() => bookAppointment(slot.start)}>{slot.start} - {slot.end}</button>)}</div>}
      </section>
    </Layout>
  );
};

export default BookAppointment;

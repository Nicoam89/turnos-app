import { useEffect, useState } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const fetchAppointments = async () => { try { const res = await api.get("/appointments/my"); setAppointments(res.data);} catch (error) { console.log(error); alert("Error al cargar turnos"); } };
  useEffect(() => { fetchAppointments(); }, []);
  const cancelAppointment = async (id) => { try { await api.patch(`/appointments/${id}/cancel`); alert("Turno cancelado"); fetchAppointments(); } catch { alert("Error al cancelar"); } };

  return (
    <Layout title="Agenda iQ">
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <h2 className="text-2xl font-semibold">Mis turnos</h2>
        {appointments.length === 0 ? <p className="text-slate-500">No hay turnos cargados.</p> : appointments.map((appt) => (
          <div key={appt._id} className="rounded-lg border border-slate-200 p-4 space-y-2 bg-slate-50">
            <p className="text-slate-700"><strong>Fecha:</strong> {appt.date?.slice(0, 10)} {appt.startTime} - {appt.endTime}</p>
            <p className="text-slate-700"><strong>Estado:</strong> {appt.status}</p>
            {appt.status !== "cancelled" && <button className="rounded-lg border border-rose-200 px-4 py-2 bg-rose-50 text-rose-700" onClick={() => cancelAppointment(appt._id)}>Cancelar turno</button>}
          </div>
        ))}
      </section>
    </Layout>
  );
};

export default MyAppointments;

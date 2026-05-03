import { useEffect, useState } from "react";
import api from "../api/axios";

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newStartTime, setNewStartTime] = useState("");

  const fetchAppointments = async () => {
    try {
      const res = await api.get("/appointments/my");
      setAppointments(res.data);
    } catch (error) {
      console.log(error);
      alert("Error al cargar turnos");
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const cancelAppointment = async (id) => {
    try {
      await api.patch(`/appointments/${id}/cancel`);
      alert("Turno cancelado");
      fetchAppointments();
    } catch {
      alert("Error al cancelar");
    }
  };

  const rescheduleAppointment = async (id) => {
    try {
      await api.patch(`/appointments/${id}/reschedule`, {
        newDate,
        newStartTime
      });

      alert("Turno reprogramado");
      setEditingId(null);
      fetchAppointments();
    } catch (error) {
      alert(error.response?.data?.msg || "Error");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Mis turnos</h2>

      {appointments.length === 0 && <p>No tenés turnos aún.</p>}

      {appointments.map((appt) => (
        <div
          key={appt._id}
          style={{ border: "1px solid #ddd", padding: "1rem", marginBottom: "1rem" }}
        >
          <p><strong>Fecha:</strong> {new Date(appt.date).toLocaleDateString()}</p>
          <p><strong>Horario:</strong> {appt.startTime} - {appt.endTime}</p>
          <p><strong>Estado:</strong> {appt.status}</p>
          <p><strong>Modalidad:</strong> {appt.modality === "online" ? "Online" : "Presencial"}</p>
          {appt.modality === "online" && appt.meetLink && (
            <p><strong>Meet:</strong> <a href={appt.meetLink} target="_blank" rel="noreferrer">{appt.meetLink}</a></p>
          )}
          {appt.modality === "offline" && appt.address && (
            <p><strong>Dirección:</strong> {appt.address}</p>
          )}

          {appt.status === "booked" && (
            <>
              <button onClick={() => cancelAppointment(appt._id)}>Cancelar</button>{" "}
              <button onClick={() => setEditingId(appt._id)}>Reprogramar</button>
            </>
          )}

          {editingId === appt._id && (
            <div style={{ marginTop: "1rem" }}>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
              <input
                type="time"
                value={newStartTime}
                onChange={(e) => setNewStartTime(e.target.value)}
              />
              <button onClick={() => rescheduleAppointment(appt._id)}>
                Confirmar
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MyAppointments;



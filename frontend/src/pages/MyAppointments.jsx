import { useEffect, useState } from "react";
import api from "../api/axios";

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newStartTime, setNewStartTime] = useState("");

  // 🔄 traer turnos del usuario
  const fetchAppointments = async () => {
    try {
      const res = await api.get("/appointments/my"); // 👈 endpoint que vamos a usar
      setAppointments(res.data);
    } catch (error) {
      console.log(error);
      alert("Error al cargar turnos");
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // ❌ cancelar turno
  const cancelAppointment = async (id) => {
    try {
      await api.patch(`/appointments/${id}/cancel`);
      alert("Turno cancelado");
      fetchAppointments();
    } catch (error) {
      alert("Error al cancelar");
    }
  };

  // 🔄 reprogramar
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

      {appointments.length === 0 && <p>No tenés turnos</p>}

      {appointments.map((appt) => (
        <div
          key={appt._id}
          style={{
            border: "1px solid #ccc",
            padding: "1rem",
            marginBottom: "1rem"
          }}
        >
          <p><b>Fecha:</b> {appt.date?.slice(0, 10)}</p>
          <p><b>Hora:</b> {appt.startTime} - {appt.endTime}</p>
          <p><b>Estado:</b> {appt.status}</p>

          {appt.status === "booked" && (
            <>
              <button onClick={() => cancelAppointment(appt._id)}>
                Cancelar
              </button>

              <button onClick={() => setEditingId(appt._id)}>
                Reprogramar
              </button>
            </>
          )}

          {/* 🔄 Form de reprogramación */}
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
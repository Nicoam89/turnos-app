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
      const res = await api.get("/appointments/my");
      setAppointments(res.data);
    } catch (error) {
      console.log(error);
      alert("Error al cargar turnos");
    }
  };

  useEffect(() => {
    let active = true;

    const loadAppointments = async () => {
      try {
        const res = await api.get("/appointments/my");
        if (active) {
          setAppointments(res.data);
        }
      } catch (error) {
        if (active) {
          console.log(error);
          alert("Error al cargar turnos");
        }
      }
    };

    loadAppointments();

    return () => {
      active = false;
    };
  }, []);

  // ❌ cancelar turno
  const cancelAppointment = async (id) => {
    try {
      await api.patch(`/appointments/${id}/cancel`);
      alert("Turno cancelado");
      fetchAppointments();
    } catch {
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
      )};


export default MyAppointments;


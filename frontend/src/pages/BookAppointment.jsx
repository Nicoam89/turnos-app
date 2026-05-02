import { useState } from "react";
import api from "../api/axios";

const BookAppointment = () => {
  const [professionalId, setProfessionalId] = useState("");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);

  // traer horarios disponibles
  const getSlots = async () => {
    try {
      const res = await api.get(
        `/appointments/available-slots?professionalId=${professionalId}&date=${date}`
      );

      setSlots(res.data.availableSlots || []);
    } catch (error) {
      console.log(error);
      alert("Error al buscar horarios");
    }
  };

  // reservar turno
  const bookAppointment = async (startTime) => {
    try {
      await api.post("/appointments", {
        professionalId,
        date,
        startTime
      });

      alert("Turno reservado correctamente 🎉");

      // refrescar slots
      getSlots();
    } catch (error) {
      alert(error.response?.data?.msg || "Error al reservar");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Reservar turno</h2>

      <input
        type="text"
        placeholder="Professional ID"
        value={professionalId}
        onChange={(e) => setProfessionalId(e.target.value)}
      />

      <br /><br />

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <br /><br />

      <button onClick={getSlots}>Buscar horarios</button>

      <hr />

      <h3>Horarios disponibles</h3>

      {slots.length === 0 && <p>No hay horarios</p>}

      {slots.map((slot) => (
        <div key={slot.start} style={{ marginBottom: "10px" }}>
          <button onClick={() => bookAppointment(slot.start)}>
            {slot.start} - {slot.end}
          </button>
        </div>
      ))}
    </div>
  );
};

export default BookAppointment;
import mongoose from "mongoose";
import Appointment from "../models/Appointment.js";
import ProfessionalProfile from "../models/ProfessionalProfile.js";
import User from "../models/User.js";
import { createCalendarEvent } from "../services/googleCalendarService.js";

export const createAppointment = async (req, res) => {
  try {
    const { professionalId, date, startTime } = req.body;

    const patientId = req.user.userId; // viene del JWT

    // 🔒 validar ObjectId
    if (!mongoose.Types.ObjectId.isValid(professionalId)) {
      return res.status(400).json({ msg: "ID inválido" });
    }

    // 1. obtener perfil profesional
    const profile = await ProfessionalProfile.findOne({
      userId: professionalId
    });

    if (!profile) {
      return res.status(404).json({ msg: "Profesional no encontrado" });
    }

    // 2. calcular endTime
    const startDate = new Date(`${date}T${startTime}:00`);
    const endDate = new Date(
      startDate.getTime() + profile.appointmentDuration * 60000
    );

    const endTime = endDate.toTimeString().slice(0, 5);

    // 3. validar disponibilidad (día)
    const dayOfWeek = new Date(date).getDay();

    const availability = profile.availability.find(
      (a) => a.dayOfWeek === dayOfWeek
    );

    if (!availability) {
      return res.status(400).json({ msg: "No hay disponibilidad ese día" });
    }

    // 4. validar que esté dentro del rango horario
    if (
      startTime < availability.startTime ||
      endTime > availability.endTime
    ) {
      return res.status(400).json({ msg: "Horario fuera de disponibilidad" });
    }

    // 🔴 5. VALIDACIÓN ANTI DOBLE BOOKING (CLAVE)
    const existing = await Appointment.findOne({
      professionalId,
      date: {
        $gte: new Date(date + "T00:00:00.000Z"),
        $lte: new Date(date + "T23:59:59.999Z")
      },
      startTime,
      status: "booked"
    });

    if (existing) {
      return res.status(400).json({ msg: "Turno ya reservado" });
    }

    // 6. crear turno
    const appointment = await Appointment.create({
      patientId,
      professionalId,
      date,
      startTime,
      endTime
    });

    // 🟡 7. Google Calendar (opcional pero listo)
    const professional = await User.findById(professionalId);

    if (professional?.googleRefreshToken) {
      try {
        await createCalendarEvent({
          accessToken: professional.googleRefreshToken,
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          summary: "Turno médico"
        });
      } catch (err) {
        console.log("Error Google Calendar:", err.message);
      }
    }

    res.status(201).json({
      msg: "Turno creado correctamente",
      appointment
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// helper
const generateSlots = (start, end, duration) => {
  const slots = [];

  let current = new Date(`1970-01-01T${start}:00`);
  const endTime = new Date(`1970-01-01T${end}:00`);

  while (current < endTime) {
    const next = new Date(current.getTime() + duration * 60000);

    slots.push({
      start: current.toTimeString().slice(0, 5),
      end: next.toTimeString().slice(0, 5)
    });

    current = next;
  }

  return slots;
};

export const getAvailableSlots = async (req, res) => {
  try {
    const { professionalId, date } = req.query;

    if (!professionalId || !date) {
      return res.status(400).json({ msg: "Faltan parámetros" });
    }

    const profile = await ProfessionalProfile.findOne({
      userId: professionalId
    });

    if (!profile) {
      return res.status(404).json({ msg: "Profesional no encontrado" });
    }

    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();

    const availability = profile.availability.find(
      (a) => a.dayOfWeek === dayOfWeek
    );

    if (!availability) {
      return res.json({ slots: [] });
    }

    const allSlots = generateSlots(
      availability.startTime,
      availability.endTime,
      profile.appointmentDuration
    );

    const appointments = await Appointment.find({
      professionalId,
      date: {
        $gte: new Date(date + "T00:00:00.000Z"),
        $lte: new Date(date + "T23:59:59.999Z")
      },
      status: "booked"
    });

    const bookedTimes = appointments.map((a) => a.startTime);

    const availableSlots = allSlots.filter(
      (slot) => !bookedTimes.includes(slot.start)
    );

    res.json({
      date,
      totalSlots: allSlots.length,
      availableSlots
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({ msg: "Turno no encontrado" });
    }

    // 🔒 seguridad: solo paciente dueño o profesional
    if (
      appointment.patientId.toString() !== req.user.userId &&
      appointment.professionalId.toString() !== req.user.userId
    ) {
      return res.status(403).json({ msg: "No autorizado" });
    }

    appointment.status = "cancelled";
    appointment.cancelledAt = new Date();

    await appointment.save();

    res.json({ msg: "Turno cancelado correctamente" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const rescheduleAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { newDate, newStartTime } = req.body;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({ msg: "Turno no encontrado" });
    }

    // 🔒 validar permisos
    if (appointment.patientId.toString() !== req.user.userId) {
      return res.status(403).json({ msg: "No autorizado" });
    }

    const profile = await ProfessionalProfile.findOne({
      userId: appointment.professionalId
    });

    // 1. calcular nuevo horario
    const startDate = new Date(`${newDate}T${newStartTime}:00`);
    const endDate = new Date(
      startDate.getTime() + profile.appointmentDuration * 60000
    );

    const newEndTime = endDate.toTimeString().slice(0, 5);

    // 2. validar disponibilidad
    const dayOfWeek = new Date(newDate).getDay();

    const availability = profile.availability.find(
      (a) => a.dayOfWeek === dayOfWeek
    );

    if (!availability) {
      return res.status(400).json({ msg: "No disponible ese día" });
    }

    if (
      newStartTime < availability.startTime ||
      newEndTime > availability.endTime
    ) {
      return res.status(400).json({ msg: "Horario inválido" });
    }

    // 🔴 3. VALIDACIÓN ANTI DOBLE BOOKING
    const existing = await Appointment.findOne({
      professionalId: appointment.professionalId,
      date: {
        $gte: new Date(newDate + "T00:00:00.000Z"),
        $lte: new Date(newDate + "T23:59:59.999Z")
      },
      startTime: newStartTime,
      status: "booked",
      _id: { $ne: id } // 👈 excluir el actual
    });

    if (existing) {
      return res.status(400).json({ msg: "Ese horario ya está ocupado" });
    }

    // 4. actualizar turno
    appointment.date = newDate;
    appointment.startTime = newStartTime;
    appointment.endTime = newEndTime;

    await appointment.save();

    res.json({
      msg: "Turno reprogramado correctamente",
      appointment
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getMyAppointments = async (req, res) => {
  try {
    const userId = req.user.userId;

    const appointments = await Appointment.find({
      patientId: userId
    }).sort({ date: 1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
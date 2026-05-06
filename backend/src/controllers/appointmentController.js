import mongoose from "mongoose";
import Appointment from "../models/Appointment.js";
import ProfessionalProfile from "../models/ProfessionalProfile.js";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { createCalendarEvent } from "../services/googleCalendarService.js";

const getAvailabilityForDate = (profile, selectedDate) => {
  const dayOfWeek = selectedDate.getDay();
  const dayOfMonth = selectedDate.getDate();
  const weekOfMonth = Math.ceil(dayOfMonth / 7);

  const matchedRule = (profile.recurringRules || []).find((rule) => {
    const interval = Math.max(1, Number(rule.interval) || 1);

    if (rule.frequency === "weekly") {
      if (rule.dayOfWeek !== dayOfWeek) return false;
      return ((weekOfMonth - 1) % interval) === 0;
    }

    if (rule.frequency === "monthly") {
      if (rule.dayOfMonth !== dayOfMonth) return false;
      const month = selectedDate.getMonth();
      return (month % interval) === 0;
    }
    return false;
  });

  if (matchedRule) return { startTime: matchedRule.startTime, endTime: matchedRule.endTime };
  return profile.availability.find((a) => a.dayOfWeek === dayOfWeek);
};

const generateSlots = (start, end, duration) => {
  const slots = [];
  let current = new Date(`1970-01-01T${start}:00`);
  const endTime = new Date(`1970-01-01T${end}:00`);
  while (current < endTime) {
    const next = new Date(current.getTime() + duration * 60000);
    slots.push({ start: current.toTimeString().slice(0, 5), end: next.toTimeString().slice(0, 5) });
    current = next;
  }
  return slots;
};

const canBookSlot = async ({ professionalId, date, startTime, endTime }) => {
  const existing = await Appointment.findOne({
    professionalId,
    date: { $gte: new Date(`${date}T00:00:00.000Z`), $lte: new Date(`${date}T23:59:59.999Z`) },
    startTime,
    status: { $in: ["booked", "pending_approval"] }
  });
  if (existing) throw new AppError("Turno ya reservado", 400);
  return { date, startTime, endTime };
};

export const createAppointment = async (req, res) => {
  const { professionalId, date, startTime, modality } = req.body;
  const patientId = req.user.userId;

  if (!mongoose.Types.ObjectId.isValid(professionalId)) throw new AppError("ID inválido", 400);
  if (!["online", "offline"].includes(modality)) throw new AppError("Modalidad inválida", 400);

  const profile = await ProfessionalProfile.findOne({ userId: professionalId });
  if (!profile) throw new AppError("Profesional no encontrado", 404);

  const startDate = new Date(`${date}T${startTime}:00`);
  const endDate = new Date(startDate.getTime() + profile.appointmentDuration * 60000);
  const endTime = endDate.toTimeString().slice(0, 5);

  const availability = getAvailabilityForDate(profile, new Date(date));
  if (!availability) throw new AppError("No hay disponibilidad ese día", 400);
  if (startTime < availability.startTime || endTime > availability.endTime) throw new AppError("Horario fuera de disponibilidad", 400);

  await canBookSlot({ professionalId, date, startTime, endTime });

  const appointment = await Appointment.create({
    patientId,
    professionalId,
    date,
    startTime,
    endTime,
    modality,
    meetLink: modality === "online" ? profile.defaultMeetLink : "",
    address: modality === "offline" ? profile.officeAddress : "",
    status: "booked",
    attachments: profile.featureFlags?.appointmentAttachmentsEnabled && Array.isArray(req.body.attachments) ? req.body.attachments : []
  });

  return sendSuccess(res, { statusCode: 201, message: "Turno creado correctamente", data: appointment });
};

export const createRecurringAppointmentRequest = async (req, res) => {
  const { professionalId, startDate, startTime, modality, frequency = "weekly", occurrences = 4 } = req.body;
  const patientId = req.user.userId;

  if (!mongoose.Types.ObjectId.isValid(professionalId)) throw new AppError("ID inválido", 400);
  if (!["online", "offline"].includes(modality)) throw new AppError("Modalidad inválida", 400);
  if (!["weekly", "biweekly", "monthly"].includes(frequency)) throw new AppError("Frecuencia inválida", 400);
  if (occurrences < 2 || occurrences > 24) throw new AppError("occurrences debe estar entre 2 y 24", 400);

  const profile = await ProfessionalProfile.findOne({ userId: professionalId });
  if (!profile) throw new AppError("Profesional no encontrado", 404);
  if (!profile.featureFlags?.recurringAppointmentsEnabled) throw new AppError("Este profesional no acepta citas recurrentes", 400);
 
  const dayIncrement = frequency === "weekly" ? 7 : frequency === "biweekly" ? 14 : 30;
  const recurringGroupId = new mongoose.Types.ObjectId().toString();
  const created = [];

  for (let i = 0; i < occurrences; i += 1) {
    const currentDate = new Date(`${startDate}T00:00:00`);
    currentDate.setDate(currentDate.getDate() + (dayIncrement * i));
    const date = currentDate.toISOString().slice(0, 10);

    const slotStart = new Date(`${date}T${startTime}:00`);
    const slotEnd = new Date(slotStart.getTime() + profile.appointmentDuration * 60000);
    const endTime = slotEnd.toTimeString().slice(0, 5);

    const availability = getAvailabilityForDate(profile, new Date(date));
    if (!availability || startTime < availability.startTime || endTime > availability.endTime) continue;

    try {
      await canBookSlot({ professionalId, date, startTime, endTime });
      const appt = await Appointment.create({
        patientId,
        professionalId,
        date,
        startTime,
        endTime,
        modality,
        meetLink: modality === "online" ? profile.defaultMeetLink : "",
        address: modality === "offline" ? profile.officeAddress : "",
        status: "pending_approval",
        recurringGroupId,
        recurrence: { frequency, occurrences, sequence: i + 1 }
      });
      created.push(appt);
    } catch {
      // si choca un slot, lo omitimos
    }
  }

  if (created.length === 0) throw new AppError("No se pudo crear ninguna solicitud recurrente", 400);

  return sendSuccess(res, { statusCode: 201, message: "Solicitud recurrente creada. Pendiente de aprobación profesional", data: created });
};

export const approveRecurringRequest = async (req, res) => {
  const { recurringGroupId } = req.params;
  const { action = "approve" } = req.body;

  const appointments = await Appointment.find({ recurringGroupId, professionalId: req.user.userId, status: "pending_approval" });
  if (appointments.length === 0) throw new AppError("No hay solicitudes pendientes para este grupo", 404);

  const nextStatus = action === "reject" ? "cancelled" : "booked";
  await Appointment.updateMany({ _id: { $in: appointments.map((a) => a._id) } }, { $set: { status: nextStatus } });

  return sendSuccess(res, { message: nextStatus === "booked" ? "Solicitudes aprobadas" : "Solicitudes rechazadas" });
};

export const getPendingRecurringRequests = async (req, res) => {
  const items = await Appointment.find({ professionalId: req.user.userId, status: "pending_approval" }).sort({ date: 1 });
  return sendSuccess(res, { message: "Solicitudes pendientes", data: items });
};

export const getAvailableSlots = async (req, res) => { /* unchanged */
  const { professionalId, date } = req.query;
  const profile = await ProfessionalProfile.findOne({ userId: professionalId });
  if (!profile) throw new AppError("Profesional no encontrado", 404);
  const availability = getAvailabilityForDate(profile, new Date(date));
  if (!availability) return sendSuccess(res, { message: "Disponibilidad obtenida", data: { date, totalSlots: 0, availableSlots: [] } });
  const allSlots = generateSlots(availability.startTime, availability.endTime, profile.appointmentDuration);
  const appointments = await Appointment.find({ professionalId, date: { $gte: new Date(`${date}T00:00:00.000Z`), $lte: new Date(`${date}T23:59:59.999Z`) }, status: { $in: ["booked", "pending_approval"] } });
  const bookedTimes = appointments.map((a) => a.startTime);
  const availableSlots = allSlots.filter((slot) => !bookedTimes.includes(slot.start));
  return sendSuccess(res, { message: "Disponibilidad obtenida", data: { date, totalSlots: allSlots.length, availableSlots } });
};

export const cancelAppointment = async (req, res) => { const appointment = await Appointment.findById(req.params.id); if (!appointment) throw new AppError("Turno no encontrado", 404); if (appointment.patientId.toString() !== req.user.userId && appointment.professionalId.toString() !== req.user.userId) throw new AppError("No autorizado", 403); appointment.status = "cancelled"; appointment.cancelledAt = new Date(); await appointment.save(); return sendSuccess(res, { message: "Turno cancelado correctamente", data: appointment }); };
export const rescheduleAppointment = async (req, res) => { return sendSuccess(res, { message: "Reprogramación disponible próximamente" }); };
export const getMyAppointments = async (req, res) => { const appointments = await Appointment.find({ patientId: req.user.userId }).sort({ date: 1 }); return sendSuccess(res, { message: "Turnos obtenidos", data: appointments }); };

export const searchProfessionalPatients = async (req, res) => {
  const query = (req.query.q || "").trim();

  const professionalAppointments = await Appointment.find({ professionalId: req.user.userId }).distinct("patientId");
  if (professionalAppointments.length === 0) {
    return sendSuccess(res, { message: "Pacientes obtenidos", data: [] });
  }

  const filter = { _id: { $in: professionalAppointments } };
  if (query) {
    filter.$or = [
      { name: { $regex: query, $options: "i" } },
      { email: { $regex: query, $options: "i" } }
    ];
  }

  const patients = await User.find(filter)
    .select("name email profile.phone")
    .sort({ name: 1 })
    .limit(30);

  return sendSuccess(res, { message: "Pacientes obtenidos", data: patients });
};

export const getProfessionalPatientHistory = async (req, res) => {
  const { patientId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(patientId)) throw new AppError("ID de paciente inválido", 400);

  const hasRelationship = await Appointment.exists({ professionalId: req.user.userId, patientId });
  if (!hasRelationship) throw new AppError("No autorizado para ver este historial", 403);

  const history = await Appointment.find({ professionalId: req.user.userId, patientId })
    .sort({ date: -1, startTime: -1 })
    .select("date startTime endTime modality status cancellationReason attachments createdAt");

  return sendSuccess(res, { message: "Historial obtenido", data: history });
};

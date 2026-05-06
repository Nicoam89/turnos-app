import Appointment from "../models/Appointment.js";
import { isEmailReminderEnabled, sendReminderEmail } from "./emailService.js";

const REMINDER_INTERVAL_MS = Number(process.env.REMINDER_POLL_MS || 60_000);
const WINDOW_MS = Number(process.env.REMINDER_WINDOW_MS || 15 * 60 * 1000);

const nowUtc = () => new Date();

const withinWindow = (targetDate, hoursBefore) => {
  const now = nowUtc().getTime();
  const reminderTime = targetDate.getTime() - (hoursBefore * 60 * 60 * 1000);
  return reminderTime >= now - WINDOW_MS && reminderTime <= now + WINDOW_MS;
};

const sendPendingReminders = async () => {
  if (!isEmailReminderEnabled()) return;

  const now = nowUtc();
  const lowerBound = new Date(now.getTime() - (24 * 60 * 60 * 1000));
  const upperBound = new Date(now.getTime() + (26 * 60 * 60 * 1000));

  const appointments = await Appointment.find({
    status: "booked",
    date: { $gte: lowerBound, $lte: upperBound }
  })
    .populate("patientId", "name email")
    .populate("professionalId", "name");

  for (const appointment of appointments) {
    if (!appointment?.patientId?.email || !appointment?.professionalId?.name) continue;

    const appointmentDatePart = new Date(appointment.date).toISOString().slice(0, 10);
    const appointmentDateTime = new Date(`${appointmentDatePart}T${appointment.startTime}:00`);

    if (withinWindow(appointmentDateTime, 24) && !appointment?.reminders?.email24hSentAt) {
      const sent = await sendReminderEmail({
        to: appointment.patientId.email,
        patientName: appointment.patientId.name,
        professionalName: appointment.professionalId.name,
        date: appointment.date,
        startTime: appointment.startTime,
        hoursBefore: 24
      });

      if (sent) {
        appointment.reminders = appointment.reminders || {};
        appointment.reminders.email24hSentAt = new Date();
      }
    }

    if (withinWindow(appointmentDateTime, 2) && !appointment?.reminders?.email2hSentAt) {
      const sent = await sendReminderEmail({
        to: appointment.patientId.email,
        patientName: appointment.patientId.name,
        professionalName: appointment.professionalId.name,
        date: appointment.date,
        startTime: appointment.startTime,
        hoursBefore: 2
      });

      if (sent) {
        appointment.reminders = appointment.reminders || {};
        appointment.reminders.email2hSentAt = new Date();
      }
    }

    if (appointment.isModified("reminders")) {
      await appointment.save();
    }
  }
};

export const startReminderWorker = () => {
  if (!isEmailReminderEnabled()) {
    console.log("[reminders] Worker inactivo. Configurá REMINDER_EMAIL_ENDPOINT para activarlo.");
    return;
  }

  console.log(`[reminders] Worker activo. Poll cada ${REMINDER_INTERVAL_MS}ms`);
  setInterval(() => {
    sendPendingReminders().catch((error) => {
      console.error("[reminders] Error enviando recordatorios:", error.message);
    });
  }, REMINDER_INTERVAL_MS);
};

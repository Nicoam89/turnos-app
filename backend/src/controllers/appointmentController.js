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

export const createAppointment = async (req, res) => {
  const { professionalId, date, startTime, modality } = req.body;
  const patientId = req.user.userId;

  if (!mongoose.Types.ObjectId.isValid(professionalId)) throw new AppError("ID inválido", 400);
  if (!["online", "offline"].includes(modality)) throw new AppError("Modalidad inválida", 400);

  const profile = await ProfessionalProfile.findOne({ userId: professionalId });
  if (!profile) throw new AppError("Profesional no encontrado", 404);
  if (modality === "online" && !profile.defaultMeetLink) throw new AppError("El profesional no configuró link de Meet", 400);
  if (modality === "offline" && !profile.officeAddress) throw new AppError("El profesional no configuró dirección", 400);

  const startDate = new Date(`${date}T${startTime}:00`);
  const endDate = new Date(startDate.getTime() + profile.appointmentDuration * 60000);
  const endTime = endDate.toTimeString().slice(0, 5);

  const availability = getAvailabilityForDate(profile, new Date(date));
  if (!availability) throw new AppError("No hay disponibilidad ese día", 400);
  if (startTime < availability.startTime || endTime > availability.endTime) throw new AppError("Horario fuera de disponibilidad", 400);

  const existing = await Appointment.findOne({
    professionalId,
    date: { $gte: new Date(`${date}T00:00:00.000Z`), $lte: new Date(`${date}T23:59:59.999Z`) },
    startTime,
    status: "booked"
  });
  if (existing) throw new AppError("Turno ya reservado", 400);

const attachments = Array.isArray(req.body.attachments) ? req.body.attachments : [];
  if (attachments.length > 5) throw new AppError("Máximo 5 archivos por turno", 400);
  attachments.forEach((file) => {
    if (!file?.originalName || !file?.mimeType || !file?.dataUrl || !file?.size) {
      throw new AppError("Formato inválido en archivos adjuntos", 400);
    }
    if (file.size > 5 * 1024 * 1024) throw new AppError("Cada archivo debe pesar hasta 5MB", 400);
  });

  const appointment = await Appointment.create({
    patientId,
    professionalId,
    date,
    startTime,
    endTime,
    modality,
    meetLink: modality === "online" ? profile.defaultMeetLink : "", attachments,
    address: modality === "offline" ? profile.officeAddress : "", attachments
  });

  

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

  return sendSuccess(res, { statusCode: 201, message: "Turno creado correctamente", data: appointment });
};

export const getAvailableSlots = async (req, res) => {
  const { professionalId, date } = req.query;
  const profile = await ProfessionalProfile.findOne({ userId: professionalId });
  if (!profile) throw new AppError("Profesional no encontrado", 404);

  const availability = getAvailabilityForDate(profile, new Date(date));
  if (!availability) return sendSuccess(res, { message: "Disponibilidad obtenida", data: { date, totalSlots: 0, availableSlots: [] } });

  const allSlots = generateSlots(availability.startTime, availability.endTime, profile.appointmentDuration);
  const appointments = await Appointment.find({
    professionalId,
    date: { $gte: new Date(`${date}T00:00:00.000Z`), $lte: new Date(`${date}T23:59:59.999Z`) },
    status: "booked"
  });

  const bookedTimes = appointments.map((a) => a.startTime);
  const availableSlots = allSlots.filter((slot) => !bookedTimes.includes(slot.start));

  return sendSuccess(res, { message: "Disponibilidad obtenida", data: { date, totalSlots: allSlots.length, availableSlots } });
};

export const cancelAppointment = async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) throw new AppError("Turno no encontrado", 404);
  if (appointment.patientId.toString() !== req.user.userId && appointment.professionalId.toString() !== req.user.userId) {
    throw new AppError("No autorizado", 403);
  }

  appointment.status = "cancelled";
  appointment.cancelledAt = new Date();
  await appointment.save();

  return sendSuccess(res, { message: "Turno cancelado correctamente", data: appointment });
};

export const rescheduleAppointment = async (req, res) => {
  const { id } = req.params;
  const { newDate, newStartTime } = req.body;

  const appointment = await Appointment.findById(id);
  if (!appointment) throw new AppError("Turno no encontrado", 404);
  if (appointment.patientId.toString() !== req.user.userId) throw new AppError("No autorizado", 403);

  const profile = await ProfessionalProfile.findOne({ userId: appointment.professionalId });
  const startDate = new Date(`${newDate}T${newStartTime}:00`);
  const endDate = new Date(startDate.getTime() + profile.appointmentDuration * 60000);
  const newEndTime = endDate.toTimeString().slice(0, 5);

  const availability = getAvailabilityForDate(profile, new Date(newDate));
  if (!availability) throw new AppError("No disponible ese día", 400);
  if (newStartTime < availability.startTime || newEndTime > availability.endTime) throw new AppError("Horario inválido", 400);

  const existing = await Appointment.findOne({
    professionalId: appointment.professionalId,
    date: { $gte: new Date(`${newDate}T00:00:00.000Z`), $lte: new Date(`${newDate}T23:59:59.999Z`) },
    startTime: newStartTime,
    status: "booked",
    _id: { $ne: id }
  });
  if (existing) throw new AppError("Ese horario ya está ocupado", 400);

  appointment.date = newDate;
  appointment.startTime = newStartTime;
  appointment.endTime = newEndTime;
  await appointment.save();

  return sendSuccess(res, { message: "Turno reprogramado correctamente", data: appointment });
};

export const getMyAppointments = async (req, res) => {
  const appointments = await Appointment.find({ patientId: req.user.userId }).sort({ date: 1 });
  return sendSuccess(res, { message: "Turnos obtenidos", data: appointments });
};

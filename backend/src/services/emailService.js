const canSendEmails = () => Boolean(process.env.REMINDER_EMAIL_ENDPOINT);

export const sendReminderEmail = async ({ to, patientName, professionalName, date, startTime, hoursBefore }) => {
  if (!canSendEmails()) return false;

  const appointmentDate = new Date(date).toLocaleDateString("es-AR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const payload = {
    to,
    subject: `Recordatorio de turno: faltan ${hoursBefore} horas`,
    text: [
      `Hola ${patientName},`,
      "",
      `Te recordamos tu turno con ${professionalName}.`,
      `Fecha: ${appointmentDate}`,
      `Horario: ${startTime}`,
      `Faltan ${hoursBefore} horas para tu turno.`,
      "",
      "Si necesitás reprogramarlo o cancelarlo, hacelo desde la app."
    ].join("\n")
  };

  const response = await fetch(process.env.REMINDER_EMAIL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.REMINDER_EMAIL_TOKEN ? { Authorization: `Bearer ${process.env.REMINDER_EMAIL_TOKEN}` } : {})
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Falló envío de mail (${response.status})`);
  }

  return true;
};

export const isEmailReminderEnabled = () => canSendEmails();

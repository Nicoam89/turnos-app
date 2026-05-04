import AppError from "../utils/AppError.js";

const isTime = (value) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
const isDate = (value) => !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime());

export const validateRegister = (req, _res, next) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return next(new AppError("Faltan campos obligatorios", 400));
  }
  if (!["patient", "professional", "admin"].includes(role)) {
    return next(new AppError("Rol inválido", 400));
  }
  next();
};

export const validateLogin = (req, _res, next) => {
  const { email, password } = req.body;
  if (!email || !password) return next(new AppError("Email y password son obligatorios", 400));
  next();
};

export const validateCreateAppointment = (req, _res, next) => {
  const { professionalId, date, startTime, modality } = req.body;
  if (!professionalId || !date || !startTime || !modality) {
    return next(new AppError("Faltan campos obligatorios para crear turno", 400));
  }
  if (!isDate(date)) return next(new AppError("Fecha inválida", 400));
  if (!isTime(startTime)) return next(new AppError("Hora inválida. Formato HH:mm", 400));
  next();
};

export const validateRescheduleAppointment = (req, _res, next) => {
  const { newDate, newStartTime } = req.body;
  if (!newDate || !newStartTime) return next(new AppError("newDate y newStartTime son obligatorios", 400));
  if (!isDate(newDate)) return next(new AppError("Fecha inválida", 400));
  if (!isTime(newStartTime)) return next(new AppError("Hora inválida. Formato HH:mm", 400));
  next();
};

export const validateAvailableSlots = (req, _res, next) => {
  const { professionalId, date } = req.query;
  if (!professionalId || !date) return next(new AppError("professionalId y date son obligatorios", 400));
  if (!isDate(date)) return next(new AppError("Fecha inválida", 400));
  next();
};

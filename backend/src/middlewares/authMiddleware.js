import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";

export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("No autorizado, token faltante", 401));
  }

  const token = authHeader.split(" ")[1];

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    return next(new AppError("Token inválido", 401));
  }
};

export const authorize = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user.role)) return next(new AppError("Acceso denegado", 403));
  return next();
};

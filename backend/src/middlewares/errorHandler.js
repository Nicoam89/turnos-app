import { sendError } from "../utils/apiResponse.js";

export const notFoundHandler = (req, res) =>
  sendError(res, {
    statusCode: 404,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  return sendError(res, {
    statusCode: err.statusCode || 500,
    message: err.message || "Error interno",
    details: err.details || null
  });
};

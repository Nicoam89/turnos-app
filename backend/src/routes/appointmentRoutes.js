import express from "express";
const router = express.Router();

import {
  getAvailableSlots,
  createAppointment,
  cancelAppointment,
  rescheduleAppointment,
  getMyAppointments,
  createRecurringAppointmentRequest,
  getPendingRecurringRequests,
  approveRecurringRequest,
  searchProfessionalPatients,
  getProfessionalPatientHistory
} from "../controllers/appointmentController.js";

import { protect } from "../middlewares/authMiddleware.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import {
  validateAvailableSlots,
  validateCreateAppointment,
  validateRescheduleAppointment,
  validateRecurringAppointment
} from "../middlewares/validateRequest.js";

router.get("/available-slots", validateAvailableSlots, asyncHandler(getAvailableSlots));
router.post("/", protect, validateCreateAppointment, asyncHandler(createAppointment));
router.post("/recurring", protect, validateRecurringAppointment, asyncHandler(createRecurringAppointmentRequest));
router.patch("/:id/cancel", protect, asyncHandler(cancelAppointment));
router.patch("/:id/reschedule", protect, validateRescheduleAppointment, asyncHandler(rescheduleAppointment));
router.get("/my", protect, asyncHandler(getMyAppointments));
router.get("/professional/pending-recurring", protect, asyncHandler(getPendingRecurringRequests));
router.patch("/professional/recurring/:recurringGroupId", protect, asyncHandler(approveRecurringRequest));

router.get("/professional/patients", protect, asyncHandler(searchProfessionalPatients));
router.get("/professional/patients/:patientId/history", protect, asyncHandler(getProfessionalPatientHistory));

export default router;

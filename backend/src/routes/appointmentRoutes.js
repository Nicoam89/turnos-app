import express from "express";
const router = express.Router();

import {
  getAvailableSlots,
  createAppointment,
  cancelAppointment,
  rescheduleAppointment,
  getMyAppointments
} from "../controllers/appointmentController.js";

import { protect } from "../middlewares/authMiddleware.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import {
  validateAvailableSlots,
  validateCreateAppointment,
  validateRescheduleAppointment
} from "../middlewares/validateRequest.js";

router.get("/available-slots", validateAvailableSlots, asyncHandler(getAvailableSlots));
router.post("/", protect, validateCreateAppointment, asyncHandler(createAppointment));
router.patch("/:id/cancel", protect, asyncHandler(cancelAppointment));
router.patch("/:id/reschedule", protect, validateRescheduleAppointment, asyncHandler(rescheduleAppointment));
router.get("/my", protect, asyncHandler(getMyAppointments));

export default router;

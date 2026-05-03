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

router.get("/available-slots", getAvailableSlots);

router.post("/", protect, createAppointment);

// ❌ cancelar
router.patch("/:id/cancel", protect, cancelAppointment);

// 🔄 reprogramar
router.patch("/:id/reschedule", protect, rescheduleAppointment);

router.get("/my", protect, getMyAppointments);

export default router;

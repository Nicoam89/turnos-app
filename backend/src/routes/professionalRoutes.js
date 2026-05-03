import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import {
  getMyAvailability,
  upsertMyAvailability
} from "../controllers/professionalController.js";

const router = express.Router();

router.get("/me/availability", protect, authorize("professional"), getMyAvailability);
router.put("/me/availability", protect, authorize("professional"), upsertMyAvailability);

export default router;

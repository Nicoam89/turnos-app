import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import { getMyAvailability, upsertMyAvailability } from "../controllers/professionalController.js";
import asyncHandler from "../middlewares/asyncHandler.js";

const router = express.Router();

router.get("/me/availability", protect, authorize("professional"), asyncHandler(getMyAvailability));
router.put("/me/availability", protect, authorize("professional"), asyncHandler(upsertMyAvailability));

export default router;

import express from "express";
import { getMyProfile, upsertMyProfile } from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";
import asyncHandler from "../middlewares/asyncHandler.js";

const router = express.Router();

router.get("/me", protect, asyncHandler(getMyProfile));
router.put("/me", protect, asyncHandler(upsertMyProfile));

export default router;

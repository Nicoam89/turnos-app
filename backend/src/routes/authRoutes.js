import express from "express";
import { register, login } from "../controllers/authController.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import { validateLogin, validateRegister } from "../middlewares/validateRequest.js";

const router = express.Router();

router.post("/register", validateRegister, asyncHandler(register));
router.post("/login", validateLogin, asyncHandler(login));

export default router;

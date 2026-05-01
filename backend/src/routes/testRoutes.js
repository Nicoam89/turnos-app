import express from "express";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// 🔐 Ruta protegida
router.get("/profile", protect, (req, res) => {
  res.json({
    msg: "Acceso permitido ✅",
    user: req.user
  });
});

export default router;
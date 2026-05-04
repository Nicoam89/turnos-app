import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import professionalRoutes from "./routes/professionalRoutes.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/test", testRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/professionals", professionalRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

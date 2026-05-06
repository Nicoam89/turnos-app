import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";
import { startReminderWorker } from "./services/reminderService.js";

dotenv.config();

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  // conectar DB antes de levantar servidor
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
  });

  startReminderWorker();
};

startServer();

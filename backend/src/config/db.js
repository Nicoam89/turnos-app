import mongoose from "mongoose";

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error("Falta la variable de entorno MONGO_URI");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error("Error conectando a MongoDB:", error.message);
    process.exit(1);
  }
};

export default connectDB;

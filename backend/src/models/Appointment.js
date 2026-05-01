import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    professionalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    date: {
      type: Date,
      required: true
    },

    startTime: String,
    endTime: String,

    status: {
      type: String,
      enum: ["booked", "cancelled", "completed"],
      default: "booked"
    },

    cancelledAt: Date,
cancellationReason: String
  },
  { timestamps: true }
);

export default mongoose.model("Appointment", appointmentSchema);
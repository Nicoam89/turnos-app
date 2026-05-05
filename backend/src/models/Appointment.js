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

    modality: {
      type: String,
      enum: ["online", "offline"],
      required: true,
      default: "offline"
    },

    meetLink: String,
    address: String,

    status: {
      type: String,
      enum: ["booked", "pending_approval", "cancelled", "completed"],
      default: "booked"
    },

    cancelledAt: Date,

    recurringGroupId: String,
    recurrence: {
      frequency: { type: String, enum: ["weekly", "biweekly", "monthly"] },
      occurrences: Number,
      sequence: Number
    },
    cancellationReason: String,
    attachments: [
      {
        originalName: { type: String, required: true },
        mimeType: { type: String, required: true },
        size: { type: Number, required: true },
        dataUrl: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Appointment", appointmentSchema);


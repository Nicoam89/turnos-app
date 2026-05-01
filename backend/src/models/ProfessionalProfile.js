import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema(
  {
    dayOfWeek: {
      type: Number, // 0 = domingo, 6 = sábado
      required: true
    },
    startTime: {
      type: String, // "09:00"
      required: true
    },
    endTime: {
      type: String, // "18:00"
      required: true
    }
  },
  { _id: false }
);

const professionalProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    centerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Center",
      default: null
    },

    specialty: {
      type: String,
      required: true
    },

    appointmentDuration: {
      type: Number, // en minutos
      default: 30
    },

    availability: [availabilitySchema]
  },
  {
    timestamps: true
  }
);

const ProfessionalProfile = mongoose.model(
  "ProfessionalProfile",
  professionalProfileSchema
);

export default ProfessionalProfile;
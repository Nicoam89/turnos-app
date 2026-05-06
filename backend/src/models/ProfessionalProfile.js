import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema(
  {
    dayOfWeek: {
      type: Number,
      required: true
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    }
  },
  { _id: false }
);

const recurringRuleSchema = new mongoose.Schema(
  {
    frequency: {
      type: String,
      enum: ["weekly", "monthly"],
      required: true
    },
    interval: {
      type: Number,
      default: 1
    },
    dayOfWeek: Number,
    dayOfMonth: Number,
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
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
      type: Number,
      default: 30
    },
    availability: [availabilitySchema],
    recurringRules: [recurringRuleSchema],
    defaultMeetLink: { type: String, default: "" },
    officeAddress: { type: String, default: "" },
    customProfileSlug: { type: String, default: "" },
    featureFlags: {
      recurringAppointmentsEnabled: { type: Boolean, default: true },
      customProfileLinkEnabled: { type: Boolean, default: true },
      appointmentAttachmentsEnabled: { type: Boolean, default: true }
    }
  },
  { timestamps: true }
);

const ProfessionalProfile = mongoose.model("ProfessionalProfile", professionalProfileSchema);

export default ProfessionalProfile;

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    password: {
      type: String,
      required: function () {
        // solo requerido si NO usa Google
        return !this.googleId;
      }
    },

    role: {
      type: String,
      enum: ["patient", "professional", "center_admin"],
      default: "patient"
    },

    // 🔗 Relación con centro (para profesionales/admins)
    centerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Center",
      default: null
    },

    // 🔐 Google OAuth (para más adelante)
    googleId: {
      type: String,
      default: null
    },

    googleRefreshToken: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

const User = mongoose.model("User", userSchema);

export default User;
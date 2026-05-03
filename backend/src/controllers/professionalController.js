import ProfessionalProfile from "../models/ProfessionalProfile.js";

export const getMyAvailability = async (req, res) => {
  try {
    const userId = req.user.userId;
    const profile = await ProfessionalProfile.findOne({ userId });

    if (!profile) return res.status(404).json({ msg: "Perfil profesional no encontrado" });

    return res.json({
      appointmentDuration: profile.appointmentDuration,
      availability: profile.availability
    });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

export const upsertMyAvailability = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { appointmentDuration = 30, availability = [] } = req.body;

    const normalized = availability
      .filter((a) => a && a.startTime && a.endTime)
      .map((a) => ({
        dayOfWeek: Number(a.dayOfWeek),
        startTime: a.startTime,
        endTime: a.endTime
      }));

    const profile = await ProfessionalProfile.findOneAndUpdate(
      { userId },
      {
        $set: {
          appointmentDuration,
          availability: normalized,
          specialty: "General"
        }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.json({
      msg: "Disponibilidad guardada",
      appointmentDuration: profile.appointmentDuration,
      availability: profile.availability
    });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

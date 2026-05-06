import ProfessionalProfile from "../models/ProfessionalProfile.js";

export const getMyAvailability = async (req, res) => {
  try {
    const userId = req.user.userId;
    const profile = await ProfessionalProfile.findOne({ userId });

    if (!profile) return res.status(404).json({ msg: "Perfil profesional no encontrado" });

    return res.json({
      appointmentDuration: profile.appointmentDuration,
      availability: profile.availability,
      recurringRules: profile.recurringRules,
      defaultMeetLink: profile.defaultMeetLink,
      officeAddress: profile.officeAddress,
      customProfileSlug: profile.customProfileSlug,
      featureFlags: profile.featureFlags
    });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

export const upsertMyAvailability = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      appointmentDuration = 30,
      availability = [],
      recurringRules = [],
      defaultMeetLink = "",
      officeAddress = "",
      customProfileSlug = "",
      featureFlags = {}

    } = req.body;

    const normalized = availability
      .filter((a) => a && a.startTime && a.endTime)
      .map((a) => ({
        dayOfWeek: Number(a.dayOfWeek),
        startTime: a.startTime,
        endTime: a.endTime
      }));

    const normalizedRules = recurringRules
      .filter((r) => r && r.frequency && r.startTime && r.endTime)
      .map((r) => ({
        frequency: r.frequency,
        interval: Number(r.interval) || 1,
        dayOfWeek: r.dayOfWeek !== undefined ? Number(r.dayOfWeek) : undefined,
        dayOfMonth: r.dayOfMonth !== undefined ? Number(r.dayOfMonth) : undefined,
        startTime: r.startTime,
        endTime: r.endTime
      }));

    const profile = await ProfessionalProfile.findOneAndUpdate(
      { userId },
      {
        $set: {
          appointmentDuration,
          availability: normalized,
          recurringRules: normalizedRules,
          specialty: "General",
          defaultMeetLink,
          officeAddress,
          customProfileSlug,
          featureFlags: {
            recurringAppointmentsEnabled: Boolean(featureFlags.recurringAppointmentsEnabled ?? true),
            customProfileLinkEnabled: Boolean(featureFlags.customProfileLinkEnabled ?? true),
            appointmentAttachmentsEnabled: Boolean(featureFlags.appointmentAttachmentsEnabled ?? true)
          }

        }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.json({
      msg: "Disponibilidad guardada",
      appointmentDuration: profile.appointmentDuration,
      availability: profile.availability,
      recurringRules: profile.recurringRules,
      defaultMeetLink: profile.defaultMeetLink,
      officeAddress: profile.officeAddress,
      customProfileSlug: profile.customProfileSlug,
      featureFlags: profile.featureFlags
    });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

export const getMyDashboardStats = async (req, res) => {
  const professionalId = req.user.userId;
  const now = new Date();
  const from = new Date(now.getFullYear(), 0, 1);

  const rows = await Appointment.aggregate([
    {
      $match: {
        professionalId: profileToObjectId(professionalId),
        status: { $in: ["booked", "completed"] },
        date: { $gte: from, $lte: now }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
        totalAppointments: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return res.json({ months: rows });
};

const profileToObjectId = (id) => new mongoose.Types.ObjectId(id);

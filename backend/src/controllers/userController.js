import User from "../models/User.js";

export const getMyProfile = async (req, res) => {
  const user = await User.findById(req.user.userId).select("name email role profile");
  if (!user) return res.status(404).json({ msg: "Usuario no encontrado" });

  return res.json(user);
};

export const upsertMyProfile = async (req, res) => {
  const profile = {
    phone: req.body?.phone || "",
    birthDate: req.body?.birthDate || "",
    address: req.body?.address || "",
    bio: req.body?.bio || ""
  };

  const user = await User.findByIdAndUpdate(
    req.user.userId,
    { $set: { profile } },
    { new: true }
  ).select("name email role profile");

  if (!user) return res.status(404).json({ msg: "Usuario no encontrado" });

  return res.json({ msg: "Perfil actualizado", user });
};

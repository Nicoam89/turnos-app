import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";

const generateToken = (user) =>
  jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });

const authPayload = (user, token) => ({
  token,
  user: { id: user._id, name: user.name, email: user.email, role: user.role }
});

export const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new AppError("El usuario ya existe", 400);

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({ name, email, password: hashedPassword, role });
  const token = generateToken(user);
  const payload = authPayload(user, token);

  return res.status(201).json({
    success: true,
    message: "Usuario registrado",
    data: payload,
    ...payload
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new AppError("Credenciales inválidas", 400);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new AppError("Credenciales inválidas", 400);

  const token = generateToken(user);
  const payload = authPayload(user, token);

  return res.json({
    success: true,
    message: "Login exitoso",
    data: payload,
    ...payload
  });
};
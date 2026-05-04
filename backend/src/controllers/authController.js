import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";
import { sendSuccess } from "../utils/apiResponse.js";

const generateToken = (user) =>
  jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });

export const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new AppError("El usuario ya existe", 400);

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({ name, email, password: hashedPassword, role });
  const token = generateToken(user);

  return sendSuccess(res, {
    statusCode: 201,
    message: "Usuario registrado",
    data: {
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    }
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new AppError("Credenciales inválidas", 400);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new AppError("Credenciales inválidas", 400);

  const token = generateToken(user);

  return sendSuccess(res, {
    message: "Login exitoso",
    data: {
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    }
  });
};

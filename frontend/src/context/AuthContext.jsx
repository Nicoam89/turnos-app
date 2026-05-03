import { useState } from "react";
import api from "../api/axios";
import { AuthContext } from "./authContextObject";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // 🔐 LOGIN
  const login = async (email, password) => {
    const res = await api.post("/auth/login", {
      email,
      password
    });

    const { token, user } = res.data;

    // guardar en localStorage
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    // guardar en estado
    setUser(user);
  };

  // 🚪 LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
frontend/src/context/authContextObject.jsfrontend/src/context/authContextObject.js
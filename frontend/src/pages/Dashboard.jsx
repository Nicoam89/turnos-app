import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Dashboard</h2>

      <p>Bienvenido: {user?.name}</p>
      <p>Rol: {user?.role}</p>

      <button onClick={logout}>Cerrar sesión</button>
    </div>
  );
};

export default Dashboard;
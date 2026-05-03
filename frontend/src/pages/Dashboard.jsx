import { useContext } from "react";
import AuthContext from "../context/AuthContext.jsx";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Dashboard</h2>
      <p>Bienvenido: {user?.name}</p>
      <p>Rol: {user?.role}</p>

      <Link to="/book"><button>Reservar turno</button></Link>
      <Link to="/my-appointments"><button>Mis turnos</button></Link>
      {user?.role === "professional" && (
        <Link to="/professional/calendar"><button>Definir disponibilidad</button></Link>
      )}

      <button onClick={logout}>Cerrar sesión</button>
    </div>
  );
};

export default Dashboard;

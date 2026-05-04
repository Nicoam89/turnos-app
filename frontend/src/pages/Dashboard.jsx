import { useContext } from "react";
import AuthContext from "../context/AuthContext.jsx";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <Layout title="Turnos App">
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900">Dashboard</h2>
        <p className="text-slate-600">Bienvenido: <strong>{user?.name}</strong></p>
        <p className="text-slate-600">Rol: <strong>{user?.role}</strong></p>
        <div className="flex flex-wrap gap-3">
          <Link to="/book"><button className="rounded-lg border border-slate-300 px-4 py-2 bg-slate-50">Reservar turno</button></Link>
          <Link to="/my-appointments"><button className="rounded-lg border border-slate-300 px-4 py-2 bg-slate-50">Mis turnos</button></Link>
          {user?.role === "professional" && <Link to="/professional/calendar"><button className="rounded-lg border border-slate-300 px-4 py-2 bg-slate-50">Definir disponibilidad</button></Link>}
          <button className="rounded-lg border border-rose-200 px-4 py-2 bg-rose-50 text-rose-700" onClick={logout}>Cerrar sesión</button>
        </div>
      </section>
    </Layout>
  );
};

export default Dashboard;

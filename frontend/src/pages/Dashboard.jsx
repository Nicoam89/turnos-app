import { useContext, useEffect, useState } from "react";
import AuthContext from "../context/authContextObject";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../api/axios";

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState({ phone: "", birthDate: "", address: "", bio: "" });
  const [months, setMonths] = useState([]);
  const [professionalConfig, setProfessionalConfig] = useState({
    customProfileSlug: "",
    featureFlags: {
      recurringAppointmentsEnabled: true,
      customProfileLinkEnabled: true,
      appointmentAttachmentsEnabled: true
    }
  });

  useEffect(() => {
    const load = async () => {
      const profileRes = await api.get("/users/me");
      setProfile(profileRes.data.profile || { phone: "", birthDate: "", address: "", bio: "" });

      if (user?.role === "professional") {
        const [availabilityRes, statsRes] = await Promise.all([
          api.get("/professionals/me/availability"),
          api.get("/professionals/me/dashboard-stats")
        ]);

        setProfessionalConfig({
          customProfileSlug: availabilityRes.data.customProfileSlug || "",
          featureFlags: availabilityRes.data.featureFlags || professionalConfig.featureFlags
        });
        setMonths(statsRes.data.months || []);
      }
    };

    load().catch(() => {});
  }, [user?.role]);

  const saveProfile = async () => {
    await api.put("/users/me", profile);
    alert("Perfil actualizado");
  };

  const saveProfessionalSettings = async () => {
    const current = await api.get("/professionals/me/availability");
    await api.put("/professionals/me/availability", {
      ...current.data,
      customProfileSlug: professionalConfig.customProfileSlug,
      featureFlags: professionalConfig.featureFlags
    });
    alert("Preferencias del profesional guardadas");
  };

  return (
    <Layout title="Citas iQ">
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

      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3 mt-4">
        <h3 className="text-xl font-semibold">Mi perfil</h3>
        <input className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Teléfono" value={profile.phone} onChange={(e)=>setProfile((p)=>({ ...p, phone: e.target.value }))} />
        <input className="w-full rounded-lg border border-slate-300 px-3 py-2" type="date" value={profile.birthDate} onChange={(e)=>setProfile((p)=>({ ...p, birthDate: e.target.value }))} />
        <input className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Dirección" value={profile.address} onChange={(e)=>setProfile((p)=>({ ...p, address: e.target.value }))} />
        <textarea className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Bio" value={profile.bio} onChange={(e)=>setProfile((p)=>({ ...p, bio: e.target.value }))} />
        <button className="rounded-lg bg-brand text-white px-4 py-2 font-semibold" onClick={saveProfile}>Guardar perfil</button>
      </section>

      {user?.role === "professional" && <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3 mt-4">
        <h3 className="text-xl font-semibold">Panel profesional</h3>
        <p className="text-sm text-slate-500">Citas por mes</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {months.map((m) => <div key={m._id} className="rounded-lg bg-slate-50 border border-slate-200 p-3"><strong>{m._id}</strong><p>{m.totalAppointments} citas</p></div>)}
        </div>
        <input className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Slug link personalizado" value={professionalConfig.customProfileSlug} onChange={(e)=>setProfessionalConfig((p)=>({ ...p, customProfileSlug: e.target.value }))} />
        <label className="flex items-center gap-2"><input type="checkbox" checked={professionalConfig.featureFlags.recurringAppointmentsEnabled} onChange={(e)=>setProfessionalConfig((p)=>({ ...p, featureFlags: { ...p.featureFlags, recurringAppointmentsEnabled: e.target.checked } }))} /> Habilitar citas recurrentes</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={professionalConfig.featureFlags.customProfileLinkEnabled} onChange={(e)=>setProfessionalConfig((p)=>({ ...p, featureFlags: { ...p.featureFlags, customProfileLinkEnabled: e.target.checked } }))} /> Habilitar link de perfil personalizado</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={professionalConfig.featureFlags.appointmentAttachmentsEnabled} onChange={(e)=>setProfessionalConfig((p)=>({ ...p, featureFlags: { ...p.featureFlags, appointmentAttachmentsEnabled: e.target.checked } }))} /> Habilitar adjuntos en las citas</label>
        <button className="rounded-lg bg-brand text-white px-4 py-2 font-semibold" onClick={saveProfessionalSettings}>Guardar ajustes</button>
      </section>}
    </Layout>
  );
};

export default Dashboard;

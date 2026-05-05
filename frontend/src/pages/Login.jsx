import { useState, useContext } from "react";
import AuthContext from "../context/authContextObject";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch {
      alert("Error en login");
    }
  };

  return (
    <Layout title="Agenda iQ">
      <section className="max-w-md mx-auto bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <h2>Iniciar sesión</h2>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <button className="w-full bg-brand text-white rounded-lg px-4 py-2 font-semibold" type="submit">Ingresar</button>
        </form>
      </section>
    </Layout>
  );
};

export default Login;

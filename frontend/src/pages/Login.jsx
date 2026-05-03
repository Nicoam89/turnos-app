import { useState, useContext } from "react";
import { AuthContext } from "../context/authContextObject";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

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
    <div style={{ padding: "2rem" }}>
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <br /><br />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <br /><br />

        <button type="submit">Ingresar</button>
      </form>
    </div>
  );
};

export default Login;

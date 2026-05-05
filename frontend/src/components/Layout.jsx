import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Inicio" },
  { to: "/book", label: "Reservar turno" },
  { to: "/my-appointments", label: "Mis turnos" },
  { to: "/professional/calendar", label: "Calendario profesional" },
];

const linkClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition ${
    isActive ? "bg-white/25 text-white" : "text-white/90 hover:bg-white/15"
  }`;

const Layout = ({ title = "Turnos App", children }) => (
  <div className="min-h-screen bg-slate-100">
    <header className="bg-brand text-white px-6 py-4 shadow">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/src/assets/1.png"
            alt="Logo"
            className="h-10 w-10 rounded-md bg-white/10 object-contain p-1"
          />
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>

        <nav className="flex flex-wrap gap-2" aria-label="Navegación principal">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
    <main className="max-w-5xl mx-auto p-4 md:p-6">{children}</main>
  </div>
);

export default Layout;

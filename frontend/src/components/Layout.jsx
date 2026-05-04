const Layout = ({ title = "Turnos App", children }) => (
  <div className="min-h-screen bg-slate-100">
    <header className="bg-brand text-white px-6 py-4 font-semibold shadow">{title}</header>
    <main className="max-w-5xl mx-auto p-4 md:p-6">{children}</main>
  </div>
);

export default Layout;

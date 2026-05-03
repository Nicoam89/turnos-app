import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/authContextObject";
import BookAppointment from "./pages/BookAppointment";
import MyAppointments from "./pages/MyAppointments";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

// 🔐 Ruta protegida
const PrivateRoute = ({ children }) => {
  const { user } = useContext(AuthContext);

  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* pública */}
        <Route path="/login" element={<Login />} />

        {/* protegida */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-appointments"
          element={
            <PrivateRoute>
              <MyAppointments />
            </PrivateRoute>
          }
        />
        <Route
          path="/book-appointment"
          element={
            <PrivateRoute>
              <BookAppointment />
            </PrivateRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "./context/AuthContext.jsx";
import BookAppointment from "./pages/BookAppointment";
import MyAppointments from "./pages/MyAppointments";
import ProfessionalCalendar from "./pages/ProfessionalCalendar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

const PrivateRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/book" element={<PrivateRoute><BookAppointment /></PrivateRoute>} />
        <Route path="/my-appointments" element={<PrivateRoute><MyAppointments /></PrivateRoute>} />
        <Route path="/professional/calendar" element={<PrivateRoute><ProfessionalCalendar /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

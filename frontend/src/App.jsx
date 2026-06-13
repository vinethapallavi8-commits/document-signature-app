import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import SignDocument from "./pages/SignDocument";
import PublicSign from "./pages/PublicSign";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/register" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/sign/:id" element={<SignDocument />} />
        <Route path="/public-sign/:token" element={<PublicSign />} />
      </Routes>
    </BrowserRouter>
  );
}
import { useState } from "react";
import { registerUser } from "../api";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const res = await registerUser(form);
      localStorage.setItem("token", res.data.token);
      setMessage("Registered successfully! Redirecting...");
      setError("");
      setTimeout(() => window.location.href = "/dashboard", 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
      setMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-indigo-600 mb-6">Create Account</h2>
        <input name="name" placeholder="Full Name" onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        <input name="email" placeholder="Email Address" onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        <input name="password" type="password" placeholder="Password" onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-6 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        <button onClick={handleSubmit}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition">
          Register
        </button>
        {message && <p className="mt-4 text-green-600 text-center">{message}</p>}
        {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
        <p className="mt-4 text-center text-gray-500">Already have an account? <a href="/login" className="text-indigo-600 font-medium">Login</a></p>
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("info@denemlabs.com");
  const [pass, setPass] = useState("7LbS@TJz@5fYH4Q");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, pass }),
      headers: { "Content-Type": "application/json" },
    });
    setLoading(false);
    if (res.ok) {
      const data = await res.json();
      if (data.token) {
        document.cookie = `token=${data.token}; path=/; secure; samesite=strict`;
      }
      window.location.href = "/";
    } else {
      setError("Identifiants invalides");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-400 to-white">
      <div className="bg-white rounded-lg shadow-lg flex w-full max-w-2xl overflow-hidden m-4">
        <div className="hidden md:flex items-center justify-center w-1/2 bg-blue-100">
          {/* Illustration placeholder */}
          <img
            src="/images/login-illustration.jpg"
            alt="Login Illustration"
            className="w-64 h-64"
          />
        </div>
        <div className="w-full md:w-1/2 p-8">
          <div className="flex flex-col items-center mb-6">
            <span className="text-blue-600 text-3xl font-bold mb-2">🔐</span>
            <h2 className="text-2xl font-semibold text-blue-700">Connexion</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-600 text-sm mb-1">Email</label>
              <input
                type="email"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-1">
                Mot de passe
              </label>
              <input
                type="password"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end text-xs mb-2">
              <a href="#" className="text-blue-500 hover:underline">
                Mot de passe oublié ?
              </a>
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
              disabled={loading}
            >
              {loading ? "Connexion..." : "Connexion"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

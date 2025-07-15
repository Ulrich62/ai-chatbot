"use client";

import env from "@/utils/env";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");

    const email = formData.get("email") as string;
    const pass = formData.get("pass") as string;

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
    <div className="min-h-screen flex items-center justify-center bg-[#1c539b20] backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-lg flex w-full max-w-3xl overflow-hidden m-4">
        <div className="hidden md:flex items-center justify-center w-1/2 bg-blue-100">
          {/* Illustration placeholder */}
          <Image
            src="/images/login-illustration.svg"
            alt="Login Illustration"
            width={350}
            height={350}
            priority
          />
        </div>
        <div className="w-full md:w-1/2 px-8 py-12">
          <div className="flex flex-col items-center mb-6">
            <span className="text-blue-600 text-3xl font-bold mb-2">🔐</span>
            <h2 className="text-2xl font-semibold text-[#1C539B]">Connexion</h2>
          </div>

          <AuthForm action={handleSubmit} defaultEmail={email}>
            <div className="flex justify-end text-xs mb-2">
              <Link
                href={env.PASSWORD_RESET_URL || ""}
                target="_blank"
                className="text-[#1C539B] hover:underline"
              >
                Mot de passe oublié ?
              </Link>
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <button
              type="submit"
              className="w-full bg-[#1C539B] text-white py-2 rounded hover:bg-[#1C539B] transition"
              disabled={loading}
            >
              {loading ? "Connexion..." : "Connexion"}
            </button>
          </AuthForm>
        </div>
      </div>
    </div>
  );
}

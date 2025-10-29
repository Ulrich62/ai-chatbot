"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AuthForm } from "@/components/auth-form";
import { BottomText } from "@/components/bottom-text";

export default function LoginPage() {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [notConnected, setNotConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    // Vérifier les paramètres GET (après redirection depuis la route POST)
    const checkParams = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("auth_token");
        const notConn = urlParams.get("not_connected");
        const error = urlParams.get("error");

        if (error) {
          // Gérer les erreurs
          setError(getErrorMessage(error));
          setLoading(false);
        } else if (token) {
          // État 1: Session Office connectée - auth_token reçu
          setAuthToken(token);
          handleAuthToken(token);
        } else if (notConn) {
          // État 2: Session Office non connectée - afficher login personnalisé
          setNotConnected(true);
          setLoading(false);
        } else {
          // État 3: Aucun paramètre - rediriger vers Office
          window.location.href = "/api/auth/sso/redirect";
        }
      } catch (error) {
        console.error("Erreur lors de la vérification des paramètres:", error);
        setError("Erreur de chargement. Veuillez réessayer.");
        setLoading(false);
      }
    };

    checkParams();
  }, []);

  const getErrorMessage = (error: string) => {
    switch (error) {
      case "invalid_token":
        return "Token d'authentification invalide. Veuillez réessayer.";
      case "invalid_request":
        return "Requête invalide. Veuillez réessayer.";
      case "server_error":
        return "Erreur serveur. Veuillez réessayer plus tard.";
      default:
        return "Erreur de connexion. Veuillez réessayer.";
    }
  };

  const handleAuthToken = async (token: string) => {
    try {
      setLoading(true);
      setError("");

      // Envoyer le token à l'API de validation
      const response = await fetch("/api/auth/sso/validate", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `auth_token=${encodeURIComponent(token)}`,
      });

      if (response.ok) {
        // Redirection vers l'app après validation
        window.location.href = "/";
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Erreur de validation du token");
        setLoading(false);
      }
    } catch (error) {
      console.error("Erreur lors de la validation:", error);
      setError("Erreur de connexion. Veuillez réessayer.");
      setLoading(false);
    }
  };

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");

    const emailValue = formData.get("email") as string;
    const passwordValue = formData.get("password") as string;

    try {
      // Rediriger vers Office avec les credentials
      const response = await fetch("/api/auth/sso/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailValue, password: passwordValue }),
      });

      if (response.ok) {
        // Redirection vers Office sera gérée par l'API
        const data = await response.json();
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Erreur de connexion");
      }
    } catch (err) {
      setError("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  // État de chargement
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#1c539b20] backdrop-blur-sm">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Validation en cours...</p>
          </div>
        </div>
        <BottomText />
      </div>
    );
  }

  // État de redirection vers Office
  if (!notConnected && !authToken) {
    return (
      <div className="min-h-screen flex flex-col bg-[#1c539b20] backdrop-blur-sm">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-pulse rounded-full h-12 w-12 bg-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Redirection vers Office...</p>
          </div>
        </div>
        <BottomText />
      </div>
    );
  }

  // État de login personnalisé (not_connected=1)
  return (
    <div className="min-h-screen flex flex-col bg-[#1c539b20] backdrop-blur-sm">
      <div className="flex-1 flex items-center justify-center">
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
              <h2 className="text-2xl font-semibold text-[#1C539B]">
                Connexion
              </h2>
            </div>

            <AuthForm
              action={handleSubmit}
              email={email}
              password={password}
              onEmailChange={setEmail}
              onPasswordChange={setPassword}
              loading={loading}
              error={error}
            />
          </div>
        </div>
      </div>

      <BottomText />
    </div>
  );
}

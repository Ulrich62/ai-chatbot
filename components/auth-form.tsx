"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "./ui/button";

export function AuthForm({
  action,
  children,
  email = "",
  password = "",
  onEmailChange,
  onPasswordChange,
  loading = false,
  error = "",
}: {
  action: (formData: FormData) => Promise<void>;
  children?: React.ReactNode;
  email?: string;
  password?: string;
  onEmailChange?: (value: string) => void;
  onPasswordChange?: (value: string) => void;
  loading?: boolean;
  error?: string;
}) {
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onEmailChange?.(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onPasswordChange?.(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await action(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-gray-600 text-sm mb-1">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1C539B] disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="user@acme.com"
          autoComplete="email"
          required
          autoFocus
          value={email}
          onChange={handleEmailChange}
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-gray-600 text-sm mb-1">
          Mot de passe
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            className="w-full border rounded px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-[#1C539B] disabled:opacity-50 disabled:cursor-not-allowed"
            required
            value={password}
            onChange={handlePasswordChange}
            disabled={loading}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 size-6 p-0 hover:bg-gray-100 disabled:opacity-50"
            onClick={handleTogglePassword}
            disabled={loading}
            aria-label={
              showPassword
                ? "Masquer le mot de passe"
                : "Afficher le mot de passe"
            }
          >
            {showPassword ? (
              <EyeOff className="size-4 text-gray-500" />
            ) : (
              <Eye className="size-4 text-gray-500" />
            )}
          </Button>
        </div>
      </div>

      {children}

      {error && (
        <div className="text-red-500 text-sm bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </div>
      )}

      <button
        type="submit"
        className={`w-full py-2 rounded transition flex items-center justify-center gap-2 ${
          loading
            ? "bg-gray-400 text-white cursor-not-allowed"
            : "bg-[#1C539B] text-white hover:bg-[#1C539B]/90"
        }`}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Connexion en cours...
          </>
        ) : (
          "Connexion"
        )}
      </button>
    </form>
  );
}

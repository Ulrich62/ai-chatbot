"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Form from "next/form";

import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";

export function AuthForm({
  action,
  children,
  defaultEmail = "",
  loading = false,
}: {
  action: NonNullable<
    string | ((formData: FormData) => void | Promise<void>) | undefined
  >;
  children: React.ReactNode;
  defaultEmail?: string;
  loading?: boolean;
}) {
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Form action={action} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-gray-600 text-sm mb-1">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1C539B]"
          placeholder="user@acme.com"
          autoComplete="email"
          required
          autoFocus
          defaultValue={defaultEmail}
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
            className="w-full border rounded px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-[#1C539B]"
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
            onClick={handleTogglePassword}
            aria-label={
              showPassword
                ? "Masquer le mot de passe"
                : "Afficher le mot de passe"
            }
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-500" />
            ) : (
              <Eye className="h-4 w-4 text-gray-500" />
            )}
          </Button>
        </div>
      </div>

      {children}

      <button
        type="submit"
        className="w-full bg-[#1C539B] text-white py-2 rounded hover:bg-[#1C539B] transition disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={loading}
      >
        {loading ? "Connexion..." : "Connexion"}
      </button>
    </Form>
  );
}

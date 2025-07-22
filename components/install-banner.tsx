"use client";

import { useState, useEffect } from "react";
import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallBanner() {
  const { user, loading } = useAuth();
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Vérifier si la bannière a été fermée précédemment
    const bannerDismissed = localStorage.getItem("install-banner-dismissed");
    if (bannerDismissed === "true") {
      return;
    }

    // Écouter l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);

      // Afficher la bannière seulement si l'utilisateur est connecté
      if (user && !loading) {
        setIsVisible(true);
      }
    };

    // Écouter l'événement d'installation réussie
    const handleAppInstalled = () => {
      setIsVisible(false);
      setInstallPrompt(null);
      localStorage.setItem("install-banner-dismissed", "true");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [user, loading]);

  // Masquer la bannière si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (!user || loading) {
      setIsVisible(false);
    } else if (
      installPrompt &&
      localStorage.getItem("install-banner-dismissed") !== "true"
    ) {
      setIsVisible(true);
    }
  }, [user, loading, installPrompt]);

  // Auto-dismiss après 10 secondes et vibration sur mobile
  useEffect(() => {
    if (isVisible) {
      // Vibration légère sur mobile
      if ("vibrate" in navigator) {
        navigator.vibrate(50); // 50ms de vibration
      }

      // Auto-dismiss après 10 secondes
      const timer = setTimeout(() => {
        setIsVisible(false);
        localStorage.setItem("install-banner-dismissed", "true");
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const handleInstall = async () => {
    if (!installPrompt) return;

    setIsInstalling(true);
    try {
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;

      if (choiceResult.outcome === "accepted") {
        console.log("L&apos;utilisateur a accepté l&apos;installation");
        setIsVisible(false);
        localStorage.setItem("install-banner-dismissed", "true");
      } else {
        console.log("L&apos;utilisateur a refusé l&apos;installation");
      }
    } catch (error) {
      console.error("Erreur lors de l'installation:", error);
    } finally {
      setIsInstalling(false);
      setInstallPrompt(null);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("install-banner-dismissed", "true");
  };

  // Ne pas afficher la bannière si les conditions ne sont pas remplies
  if (!isVisible || !installPrompt || loading || !user) {
    return null;
  }

  return (
    <div className="fixed inset-x-4 bottom-4 sm:bottom-6 z-50 sm:inset-x-0 sm:flex sm:justify-center animate-slide-up">
      <div className="w-full sm:max-w-md bg-white text-blue-900 shadow-lg rounded-xl px-4 py-3 flex items-center gap-3 border border-blue-200">
        <Download className="size-5 text-blue-600 shrink-0" />

        <div className="flex-1 text-sm leading-tight">
          <p className="font-semibold">
            Installez <span className="text-blue-700">My Binhas</span>
          </p>
          <p className="text-xs text-blue-600 hidden sm:block">
            Accès rapide depuis votre écran d&apos;accueil
          </p>
        </div>

        <div className="flex gap-1 items-center">
          <Button
            onClick={handleInstall}
            disabled={isInstalling}
            size="sm"
            variant="outline"
            className="text-sm whitespace-nowrap"
          >
            {isInstalling ? "..." : "Installer"}
          </Button>
          <button
            onClick={handleDismiss}
            className="p-1 text-blue-600 hover:text-blue-800"
            aria-label="Fermer"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

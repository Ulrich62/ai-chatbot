"use client";

import { useState, useEffect } from "react";
import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSidebar } from "@/components/ui/sidebar";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface InstallBannerProps {
  debug?: boolean;
}

export function InstallBanner({ debug = false }: InstallBannerProps) {
  const { user, loading } = useAuth();
  const isMobile = useIsMobile();
  const { open: sidebarOpen } = useSidebar();
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // En mode debug, forcer l'affichage
    if (debug) {
      setIsVisible(true);
      setInstallPrompt({} as BeforeInstallPromptEvent); // Mock pour le debug
      return;
    }

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
  }, [user, loading, debug]);

  // Masquer la bannière si l'utilisateur n'est pas connecté (sauf en mode debug)
  useEffect(() => {
    if (debug) {
      setIsVisible(true);
      return;
    }

    if (!user || loading) {
      setIsVisible(false);
    } else if (
      installPrompt &&
      localStorage.getItem("install-banner-dismissed") !== "true"
    ) {
      setIsVisible(true);
    }
  }, [user, loading, installPrompt, debug]);

  // Auto-dismiss après 10 secondes et vibration sur mobile (désactivé en mode debug)
  useEffect(() => {
    if (isVisible && !debug) {
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
  }, [isVisible, debug]);

  // Ajouter/retirer une classe au body pour pousser le contenu sur desktop
  useEffect(() => {
    if (isVisible && !isMobile) {
      document.body.classList.add("install-banner-visible");
    } else {
      document.body.classList.remove("install-banner-visible");
    }

    // Cleanup au démontage du composant
    return () => {
      document.body.classList.remove("install-banner-visible");
    };
  }, [isVisible, isMobile]);

  const handleInstall = async () => {
    if (debug) {
      console.log("Mode debug : simulation de l'installation");
      setIsInstalling(true);
      setTimeout(() => {
        setIsInstalling(false);
        setIsVisible(false);
      }, 2000);
      return;
    }

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
    if (!debug) {
      localStorage.setItem("install-banner-dismissed", "true");
    }
  };

  // Ne pas afficher la bannière si les conditions ne sont pas remplies (sauf en mode debug)
  if (!isVisible || (!debug && (!installPrompt || loading || !user))) {
    return null;
  }

  // Design mobile : Snackbar en bas
  if (isMobile) {
    return (
      <div className="fixed inset-x-4 bottom-4 z-50 animate-slide-up">
        <div className="w-full bg-white text-blue-900 shadow-lg rounded-xl px-4 py-3 flex items-center gap-3 border border-blue-200 relative">
          {debug && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              DEBUG
            </div>
          )}

          <Download className="size-5 text-blue-600 shrink-0" />

          <div className="flex-1 text-sm leading-tight">
            <p className="font-semibold">
              Installez <span className="text-blue-700">My Binhas</span>
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

  // Design desktop : Bannière qui évite la sidebar
  const sidebarWidth = sidebarOpen ? "16rem" : "3rem"; // 256px ou 48px

  return (
    <div
      className="fixed top-4 z-50 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg rounded-xl animate-slide-down"
      style={{
        left: `calc(${sidebarWidth} + 1rem)`, // Largeur sidebar + marge
        right: "1rem", // Marge droite
      }}
    >
      {debug && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
          DEBUG
        </div>
      )}

      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3 flex-1">
          <Download className="size-5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              Installez My Binhas sur votre appareil
            </p>
            <p className="text-xs text-blue-100">
              Accédez rapidement à votre assistant depuis votre écran
              d&apos;accueil
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-4">
          <Button
            onClick={handleInstall}
            disabled={isInstalling}
            size="sm"
            variant="secondary"
            className="bg-white text-blue-700 hover:bg-blue-50 font-medium whitespace-nowrap"
          >
            {isInstalling ? "Installation..." : "Installer"}
          </Button>
          <Button
            onClick={handleDismiss}
            size="sm"
            variant="ghost"
            className="text-white hover:bg-blue-600 p-1 size-8"
            aria-label="Fermer"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

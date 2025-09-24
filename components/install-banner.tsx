"use client";

import { useState, useEffect } from "react";
import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSidebar } from "@/components/ui/sidebar";
import { usePWAInstall } from "@/hooks/use-pwa-install";

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
  const [isInstalling, setIsInstalling] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const {
    isInstallable,
    isInstalled,
    installPrompt,
    canShowBanner,
    installApp,
    dismissBanner,
    resetInstallState,
  } = usePWAInstall();

  // Détecter iOS Safari pour affichage manuel de la bannière
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  // Vérifier si l'app est en mode standalone sur iOS
  const isStandaloneIOS =
    isIOS &&
    (window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true ||
      window.matchMedia("(display-mode: fullscreen)").matches);

  // Déterminer si la bannière doit être visible
  const isVisible =
    (debug ||
      (canShowBanner && user && !loading && !isInstalled) ||
      (isIOS && isSafari && user && !loading && !isStandaloneIOS)) &&
    !isDismissed;

  // Vibration légère sur mobile quand la bannière apparaît (pas d'auto-dismiss)
  useEffect(() => {
    if (isVisible && !debug) {
      // Vibration légère sur mobile pour attirer l'attention
      if ("vibrate" in navigator) {
        navigator.vibrate(50); // 50ms de vibration
      }
    }
  }, [isVisible, debug]);

  // Note: Pas de réinitialisation automatique si l'utilisateur a fermé délibérément
  // La bannière ne réapparaîtra que si l'utilisateur désinstalle l'app et revient

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
        setIsDismissed(true); // Fermer la bannière après simulation
      }, 2000);
      return;
    }

    // Détecter la plateforme
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    setIsInstalling(true);

    try {
      // Pour iOS Safari, on ne peut pas déclencher l'installation automatiquement
      if (isIOS && isSafari) {
        // Afficher les instructions détaillées pour iOS
        alert(
          "📱 Installation sur iPhone/iPad :\n\n" +
            "1. Appuyez sur le bouton de partage (carré avec flèche vers le haut) en bas de l'écran\n" +
            "2. Faites défiler vers le bas et sélectionnez 'Ajouter à l'écran d'accueil'\n" +
            "3. Appuyez sur 'Ajouter' en haut à droite\n\n" +
            "💡 L'icône My Binhas apparaîtra sur votre écran d'accueil !",
        );
        dismissBanner();
        setIsInstalling(false);
        return;
      }

      // Pour Android Chrome/Edge avec beforeinstallprompt
      if (isInstallable && installPrompt) {
        const success = await installApp();
        if (success) {
          console.log("L'utilisateur a accepté l'installation");
          dismissBanner();
        } else {
          console.log("L'utilisateur a refusé l'installation");
        }
      } else {
        // Fallback pour les autres navigateurs Android
        if (isAndroid) {
          alert(
            "Pour installer My Binhas sur votre appareil Android :\n\n" +
              "1. Ouvrez le menu du navigateur (trois points)\n" +
              "2. Sélectionnez 'Ajouter à l'écran d'accueil' ou 'Installer l'application'\n" +
              "3. Suivez les instructions à l'écran",
          );
        } else {
          alert(
            "Pour installer My Binhas :\n\n" +
              "1. Ouvrez le menu de votre navigateur\n" +
              "2. Recherchez l'option 'Installer l'application' ou 'Ajouter à l'écran d'accueil'\n" +
              "3. Suivez les instructions à l'écran",
          );
        }
        dismissBanner();
      }
    } catch (error) {
      console.error("Erreur lors de l'installation:", error);
      alert(
        "Une erreur est survenue lors de l'installation. Veuillez essayer manuellement via le menu de votre navigateur.",
      );
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    if (debug) {
      // En mode debug, masquer la bannière temporairement
      setIsDismissed(true);
      return;
    }
    // En production, fermer définitivement la bannière
    // L'utilisateur a fait un choix délibéré, ne plus proposer l'installation
    dismissBanner();
    setIsDismissed(true);
  };

  // Fonction pour réinitialiser manuellement l'état (utile pour les tests)
  const resetInstallBanner = () => {
    resetInstallState();
    setIsDismissed(false);
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
          {debug && (
            <button
              onClick={resetInstallBanner}
              className="absolute -top-2 -left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full hover:bg-blue-600"
              title="Réinitialiser l'état d'installation"
            >
              RESET
            </button>
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
              className="text-sm whitespace-nowrap border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              {isInstalling ? "..." : "Installer"}
            </Button>
            <Button
              onClick={handleDismiss}
              size="sm"
              variant="ghost"
              className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 size-8"
              aria-label="Fermer"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Design desktop : Bannière qui évite la sidebar
  const sidebarWidth = sidebarOpen ? "16rem" : "3rem"; // 256px ou 48px

  return (
    <div
      className="fixed top-4 z-50 bg-blue-900 text-white shadow-lg rounded-xl animate-slide-down"
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
      {debug && (
        <button
          onClick={resetInstallBanner}
          className="absolute -top-2 -left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full hover:bg-blue-600"
          title="Réinitialiser l'état d'installation"
        >
          RESET
        </button>
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
            className="text-white hover:bg-blue-800 hover:text-white p-1 size-8"
            aria-label="Fermer"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

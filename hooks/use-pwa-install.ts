import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface PWAInstallState {
  isInstallable: boolean;
  isInstalled: boolean;
  installPrompt: BeforeInstallPromptEvent | null;
  canShowBanner: boolean;
}

const STORAGE_KEYS = {
  BANNER_DISMISSED: 'install-banner-dismissed',
  LAST_INSTALL_CHECK: 'last-install-check',
  APP_INSTALLED: 'app-installed-timestamp',
} as const;

const CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 heures

export function usePWAInstall() {
  const [state, setState] = useState<PWAInstallState>({
    isInstallable: false,
    isInstalled: false,
    installPrompt: null,
    canShowBanner: false,
  });

  // Fonction pour vérifier si l'app est installée
  const checkIfInstalled = useCallback(() => {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://')
    );
  }, []);

  // Fonction pour réinitialiser l'état d'installation
  const resetInstallState = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.BANNER_DISMISSED);
    localStorage.setItem(STORAGE_KEYS.LAST_INSTALL_CHECK, Date.now().toString());
    localStorage.removeItem(STORAGE_KEYS.APP_INSTALLED);
  }, []);

  // Fonction pour réinitialiser seulement si l'app n'est plus installée
  const resetIfUninstalled = useCallback(() => {
    const isInstalled = checkIfInstalled();
    if (!isInstalled) {
      // L'app n'est plus installée, réinitialiser l'état
      resetInstallState();
    }
  }, [checkIfInstalled, resetInstallState]);

  // Fonction pour marquer l'app comme installée
  const markAsInstalled = useCallback(() => {
    localStorage.setItem(STORAGE_KEYS.APP_INSTALLED, Date.now().toString());
    localStorage.removeItem(STORAGE_KEYS.BANNER_DISMISSED);
  }, []);

  // Fonction pour vérifier si la bannière peut être affichée
  const canShowInstallBanner = useCallback(() => {
    const bannerDismissed = localStorage.getItem(STORAGE_KEYS.BANNER_DISMISSED);
    const lastCheck = localStorage.getItem(STORAGE_KEYS.LAST_INSTALL_CHECK);
    const now = Date.now();

    // Si la bannière a été fermée par l'utilisateur, ne plus l'afficher
    if (bannerDismissed === 'true') {
      return false;
    }

    // Vérifier si l'app est installée
    const isInstalled = checkIfInstalled();
    if (isInstalled) {
      markAsInstalled();
      return false;
    }

    return true;
  }, [checkIfInstalled, markAsInstalled]);

  // Fonction pour fermer la bannière
  const dismissBanner = useCallback(() => {
    localStorage.setItem(STORAGE_KEYS.BANNER_DISMISSED, 'true');
    localStorage.setItem(STORAGE_KEYS.LAST_INSTALL_CHECK, Date.now().toString());
  }, []);

  // Fonction pour installer l'app
  const installApp = useCallback(async () => {
    if (!state.installPrompt) return false;

    try {
      await state.installPrompt.prompt();
      const choiceResult = await state.installPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        markAsInstalled();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erreur lors de l\'installation:', error);
      return false;
    }
  }, [state.installPrompt, markAsInstalled]);

  useEffect(() => {
    const isInstalled = checkIfInstalled();
    const canShow = canShowInstallBanner();

    setState(prev => ({
      ...prev,
      isInstalled,
      canShowBanner: canShow && !isInstalled,
    }));

    // Écouter l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setState(prev => ({
        ...prev,
        isInstallable: true,
        installPrompt: e as BeforeInstallPromptEvent,
      }));
    };

    // Écouter l'événement d'installation
    const handleAppInstalled = () => {
      markAsInstalled();
      setState(prev => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
        installPrompt: null,
        canShowBanner: false,
      }));
    };

    // Écouter les changements de visibilité
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const isInstalled = checkIfInstalled();
        if (isInstalled) {
          markAsInstalled();
        } else {
          // Vérifier si l'app a été désinstallée et réinitialiser si nécessaire
          resetIfUninstalled();
        }
        setState(prev => ({
          ...prev,
          isInstalled,
          canShowBanner: canShow && !isInstalled,
        }));
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkIfInstalled, canShowInstallBanner, markAsInstalled]);

  return {
    ...state,
    installApp,
    dismissBanner,
    resetInstallState,
    resetIfUninstalled,
    checkIfInstalled,
  };
}

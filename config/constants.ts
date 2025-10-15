// Application constants
export const APP_CONFIG = {
  name: 'My Binhas',
  description: 'My Binhas - Assistant intelligent pour vos questions',
  version: '3.0.23',
  url: 'https://bgds-assistant.vercel.app',
} as const;

// API Configuration
export const API_CONFIG = {
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
} as const;

// Authentication Configuration
export const AUTH_CONFIG = {
  tokenCookieName: 'token',
  refreshTokenCookieName: 'refreshToken',
  tokenMaxAge: 60 * 60 * 24 * 7, // 7 days (in seconds)
  refreshTokenMaxAge: 60 * 60 * 24 * 30, // 30 days (in seconds)
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  httpOnly: true, // Cookies should be httpOnly for security
} as const;

// Chat Configuration
export const CHAT_CONFIG = {
  maxMessages: 100,
  messageDebounceMs: 300,
  streamingTimeout: 30000,
} as const;

// UI Configuration
export const UI_CONFIG = {
  toastDuration: 4000,
  animationDuration: 300,
  sidebarWidth: 280,
  mobileBreakpoint: 768,
} as const;

// PWA Configuration
export const PWA_CONFIG = {
  name: 'My Binhas',
  shortName: 'Binhas',
  description: 'Assistant intelligent pour vos questions',
  themeColor: '#1e3a8a',
  backgroundColor: '#ffffff',
  display: 'standalone',
  orientation: 'portrait',
} as const;

// File upload configuration
export const UPLOAD_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  maxFiles: 5,
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erreur de connexion. Veuillez réessayer.',
  AUTH_ERROR: 'Erreur d\'authentification',
  SESSION_EXPIRED: 'Session expirée',
  INVALID_CREDENTIALS: 'Identifiants invalides',
  UNAUTHORIZED: 'Non autorisé',
  FORBIDDEN: 'Accès interdit',
  NOT_FOUND: 'Ressource non trouvée',
  SERVER_ERROR: 'Erreur serveur',
  VALIDATION_ERROR: 'Erreur de validation',
  UNKNOWN_ERROR: 'Une erreur inattendue s\'est produite',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Connexion réussie',
  LOGOUT_SUCCESS: 'Déconnexion réussie',
  MESSAGE_SENT: 'Message envoyé',
  CHAT_CREATED: 'Nouvelle conversation créée',
  SETTINGS_SAVED: 'Paramètres sauvegardés',
} as const;

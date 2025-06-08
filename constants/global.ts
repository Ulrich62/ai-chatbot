import env from '@/utils/env';

const PASSWORD_RESET_URL = env.PASSWORD_RESET_URL;

export const DEFAULT_PAGE_SIZE = 10;

export { PASSWORD_RESET_URL };

export const ANIMATION_CONFIG = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
  transition: { type: 'spring' as const, stiffness: 300, damping: 20 },
};

export const AUTO_HEIGHT = 'auto';
export const DEFAULT_HEIGHT = '98px';
export const MIN_HEIGHT_OFFSET = 2;
export const DESKTOP_WIDTH = 768;

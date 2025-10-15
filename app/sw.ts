import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist } from 'serwist';

// This declares the value of `injectionPoint` to TypeScript.
// `injectionPoint` is the string that will be replaced by the
// actual precache manifest. By default, this string is set to
// `"self.__SW_MANIFEST"`.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: WorkerGlobalScope;

// Custom runtime caching configuration that excludes auth routes from caching
const customRuntimeCaching = defaultCache.filter(route => {
  // Exclude auth routes from caching to prevent duplicate requests
  if (route.matcher && typeof route.matcher === 'function') {
    return true; // Keep other routes
  }
  if (route.matcher && typeof route.matcher === 'object' && 'test' in route.matcher) {
    // Exclude auth routes from regex matchers
    return !route.matcher.test('/api/auth');
  }
  return true;
});

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: customRuntimeCaching,
});

serwist.addEventListeners(); 
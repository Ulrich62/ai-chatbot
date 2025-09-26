import type { User } from '@/types';

const secureStore = window.localStorage || window.sessionStorage;

enum storeKeys {
  TOKEN = 'token',
  USER = 'user',
}

export const getStoredToken = () => {
  return secureStore.getItem(storeKeys.TOKEN);
};

export const getStoredUser = () => {
  const persistedUser = secureStore.getItem(storeKeys.USER);
  return persistedUser ? (JSON.parse(persistedUser) as User) : undefined;
};

export const storeToken = async (token: string) => {
  secureStore.setItem(storeKeys.TOKEN, token);
};

export const storeUser = async (user: User) => {
  secureStore.setItem(storeKeys.USER, JSON.stringify(user));
};

export const deleteToken = async () => {
  secureStore.removeItem(storeKeys.TOKEN);
};

export const deleteUser = async () => {
  secureStore.removeItem(storeKeys.USER);
};

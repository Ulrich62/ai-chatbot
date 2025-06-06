import ENDPOINTS from '@/constants/endpoints';
import { openClient } from '@/libs/api';

export const loginUser = async (credentials: PasswordLoginPayload) => {
  const response = await openClient.post<string>(
    ENDPOINTS.AUTH.LOGIN,
    credentials,
  );
  return response.data;
};

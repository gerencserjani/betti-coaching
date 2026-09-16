import {
  useCallback,
  useEffect,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { getAuthToken, setAuthToken } from "../api/client";
import { authApi } from "../api/endpoints";
import type { Coach } from "../api/models";
import { AuthContext } from "./AuthContext";

export default function AuthProvider({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const [coach, setCoach] = useState<Coach | null>(null);
  const [isLoading, setIsLoading] = useState(() => !!getAuthToken());

  useEffect(() => {
    if (!getAuthToken()) return;
    authApi
      .me()
      .then(setCoach)
      .catch(() => {
        setAuthToken(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { accessToken, coach: loggedInCoach } = await authApi.login({
      email,
      password,
    });
    setAuthToken(accessToken);
    setCoach(loggedInCoach);
  }, []);

  const logout = useCallback(() => {
    setAuthToken(null);
    setCoach(null);
  }, []);

  return (
    <AuthContext.Provider value={{ coach, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

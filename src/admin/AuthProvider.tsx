import {
  useCallback,
  useEffect,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getAuthToken, setAuthToken } from "../api/client";
import { authApi } from "../api/endpoints";
import type { Coach } from "../api/models";
import { AuthContext } from "./AuthContext";

export default function AuthProvider({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const queryClient = useQueryClient();
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
    // Otherwise another coach logging in on the same device within the
    // query's staleTime window could briefly see this coach's cached admin
    // data (bookings, settings, other coaches' info) before it refetches.
    queryClient.clear();
  }, [queryClient]);

  return (
    <AuthContext.Provider value={{ coach, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

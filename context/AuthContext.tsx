import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";
import useAuthStore from "../store/auth";
import { Role, User } from "../types/index";

interface AuthContextValue {
  role: Role | null;
  token: string | null;
  user: User | null;
  isLoading: boolean;
  login: (token: string, role: Role, user: User) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function loadAuth() {
      try {
        const storedToken = await SecureStore.getItemAsync("amr_token");
        const storedRole = (await SecureStore.getItemAsync(
          "amr_role",
        )) as Role | null;
        const storedUserStr = await SecureStore.getItemAsync("amr_user");

        if (storedToken && storedRole && storedUserStr) {
          const storedUser = JSON.parse(storedUserStr) as User;
          if (isMounted) {
            setToken(storedToken);
            setRole(storedRole);
            setUser(storedUser);
            useAuthStore
              .getState()
              .setAuth(storedRole, storedToken, storedUser);
          }
        }
      } catch (error) {
        console.error("Failed to load auth state", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (newToken: string, newRole: Role, newUser: User) => {
    await SecureStore.setItemAsync("amr_token", newToken);
    await SecureStore.setItemAsync("amr_role", newRole);
    await SecureStore.setItemAsync("amr_user", JSON.stringify(newUser));

    setToken(newToken);
    setRole(newRole);
    setUser(newUser);
    useAuthStore.getState().setAuth(newRole, newToken, newUser);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("amr_token");
    await SecureStore.deleteItemAsync("amr_role");
    await SecureStore.deleteItemAsync("amr_user");

    setToken(null);
    setRole(null);
    setUser(null);
    useAuthStore.getState().clearAuth();
  };

  const value: AuthContextValue = {
    role,
    token,
    user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used inside AuthProvider");
  return ctx;
}

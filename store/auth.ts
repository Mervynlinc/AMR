import { create } from "zustand";
import { Role, User } from "../types/index";

interface AuthStore {
  role: Role | null;
  token: string | null;
  user: User | null;
  setAuth: (role: Role, token: string, user: User) => void;
  clearAuth: () => void;
}

const useAuthStore = create<AuthStore>((set) => ({
  role: null,
  token: null,
  user: null,
  setAuth: (role, token, user) => set({ role, token, user }),
  clearAuth: () => set({ role: null, token: null, user: null }),
}));

export default useAuthStore;

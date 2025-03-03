import { create } from "zustand";
import { persist } from "zustand/middleware";

type User = {
  name: string;
  room: string;
};

type AuthState = {
  user: User;
  setUser: (user: User) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: { name: "", room: "" },
      setUser: (user) => set(() => ({ user })),
    }),
    { name: "auth-storage" }
  )
);

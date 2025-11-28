import { create } from "zustand";
import { User } from "@/types/auth.types";
import { UserRole } from "@/types/common.types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;

  setAuth: (user: User, accessToken: string) => void;
  logout: () => void;
  checkAuth: () => void;

  hasRole: (roles: UserRole[]) => boolean;
  isAdmin: () => boolean;
  isManager: () => boolean;
  isMaster: () => boolean;
  isGuest: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

  setAuth: (user: User, accessToken: string) => {
    if (user.role === UserRole.GUEST) {
      console.error("GUEST role is not allowed to login");
      return;
    }

    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("accessToken", accessToken);

    set({
      user,
      accessToken,
      isAuthenticated: true,
    });
  },

  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");

    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
  },

  checkAuth: () => {
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("accessToken");

    if (userStr && token) {
      try {
        const user = JSON.parse(userStr) as User;

        if (user.role === UserRole.GUEST) {
          localStorage.removeItem("user");
          localStorage.removeItem("accessToken");
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
          });
          return;
        }

        set({
          user,
          accessToken: token,
          isAuthenticated: true,
        });
      } catch (error) {
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
      }
    }
  },

  hasRole: (roles: UserRole[]) => {
    const { user } = get();
    if (!user) return false;
    if (user.role === UserRole.GUEST) return false;
    return roles.includes(user.role);
  },

  isAdmin: () => get().user?.role === UserRole.ADMIN,
  isManager: () => get().user?.role === UserRole.MANAGER,
  isMaster: () => get().user?.role === UserRole.MASTER,
  isGuest: () => get().user?.role === UserRole.GUEST,
}));

import { NavLink } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/types/common.types";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Package,
  ClipboardList,
} from "lucide-react";

interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  allowedRoles?: UserRole[];
}

const menuItems: MenuItem[] = [
  {
    path: "/dashboard",
    label: "Головна",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    path: "/orders",
    label: "Замовлення",
    icon: <ClipboardList className="w-5 h-5" />,
  },
  {
    path: "/clients",
    label: "Клієнти",
    icon: <Users className="w-5 h-5" />,
    allowedRoles: [UserRole.ADMIN, UserRole.MANAGER],
  },
  {
    path: "/employees",
    label: "Працівники",
    icon: <UserCog className="w-5 h-5" />,
    allowedRoles: [UserRole.ADMIN, UserRole.MANAGER],
  },
  {
    path: "/materials",
    label: "Склад",
    icon: <Package className="w-5 h-5" />,
  },
];

export const Sidebar = () => {
  const { hasRole } = useAuthStore();

  const visibleMenuItems = menuItems.filter((item) => {
    if (!item.allowedRoles) return true;
    return hasRole(item.allowedRoles);
  });

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <nav className="p-4 space-y-1">
        {visibleMenuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-primary-50 text-primary-600 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

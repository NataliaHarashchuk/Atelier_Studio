import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/types/common.types";
import MasterDashboard from "./MasterDashboard";
import AdminManagerDashboard from "./AdminManagerDashboard";

const DashboardPage = () => {
  const { user } = useAuthStore();

  if (user?.role === UserRole.MASTER) {
    return <MasterDashboard />;
  }

  return <AdminManagerDashboard />;
};

export default DashboardPage;

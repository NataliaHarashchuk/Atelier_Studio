import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { UserRole } from "./types/common.types";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";

import LoginPage from "./pages/auth/LoginPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import ProfilePage from "./pages/profile/ProfilePage";
import ClientsPage from "./pages/clients/ClientsPage";
import ClientDetailsPage from "./pages/clients/ClientDetailsPage";
import EmployeesPage from "./pages/employees/EmployeesPage";
import EmployeeDetailsPage from "./pages/employees/EmployeeDetailsPage";
import MaterialsPage from "./pages/materials/MaterialsPage";
import OrdersPage from "./pages/orders/OrderPage";
import OrderDetailsPage from "./pages/orders/OrderDetailsPage";

function App() {
  const { checkAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Routes>
      {}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
        }
      />

      {}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {}
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/orders/:id"
        element={
          <ProtectedRoute>
            <OrderDetailsPage />
          </ProtectedRoute>
        }
      />

      {}
      <Route
        path="/clients"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
            <ClientsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/clients/:id"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
            <ClientDetailsPage />
          </ProtectedRoute>
        }
      />

      {}
      <Route
        path="/employees"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
            <EmployeesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employees/:id"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
            <EmployeeDetailsPage />
          </ProtectedRoute>
        }
      />

      {}
      <Route
        path="/materials"
        element={
          <ProtectedRoute>
            <MaterialsPage />
          </ProtectedRoute>
        }
      />

      {}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;

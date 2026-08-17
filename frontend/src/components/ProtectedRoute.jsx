import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ userRole, allowedRoles }) => {
  // 1. Block direct URL access if user is not logged in
  if (!userRole) {
    return <Navigate to="/login" replace />;
  }

  // 2. Normalize case to prevent "admin" vs "ADMIN" matching bugs
  const currentRole = userRole.toUpperCase();
  const allowed = allowedRoles ? allowedRoles.map((r) => r.toUpperCase()) : [];

  const isAdmin = currentRole === "ADMIN";
  const hasAccess = isAdmin || allowed.includes(currentRole);

  if (!hasAccess) {
    return <Navigate to="/login" replace />;
  }

  // 3. User is authorized
  return <Outlet />;
};

export default ProtectedRoute;

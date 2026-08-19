import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ userRole, allowedRoles = [] }) => {
  // Read state first; fall back to sessionStorage on cold reloads or manual URL entry
  const storedRole = userRole || sessionStorage.getItem("role");

  // 1. Redirect to login if user is unauthenticated
  if (!storedRole) {
    return <Navigate to="/login" replace />;
  }

  // 2. Normalize role strings to avoid case-mismatch bugs (e.g., "admin" vs "ADMIN")
  const currentRole = storedRole.toUpperCase();
  const allowed = allowedRoles.map((role) => role.toUpperCase());

  // 3. Grant access if current user role is explicitly listed in allowedRoles
  const hasAccess = allowed.includes(currentRole);

  if (!hasAccess) {
    return <Navigate to="/login" replace />;
  }

  // 4. Authorized
  return <Outlet />;
};

export default ProtectedRoute;

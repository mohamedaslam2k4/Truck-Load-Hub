import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ userRole, allowedRoles = [] }) => {
  // If no role is present in state, drop back to login
  if (!userRole) {
    return <Navigate to="/login" replace />;
  }
  
  const currentRole = userRole.toUpperCase();
  const allowed = allowedRoles.map((role) => role.toUpperCase());

  // If role doesn't match allowed list, redirect
  if (!allowed.includes(currentRole)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

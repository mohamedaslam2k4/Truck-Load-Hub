import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ userRole, allowedRoles = [] }) => {

  const storedRole = userRole || sessionStorage.getItem("role") || localStorage.getItem("role");

  if (!storedRole) {return <Navigate to="/login" replace />;}
  
  const currentRole = storedRole.toUpperCase();
  const allowed = allowedRoles.map((role) => role.toUpperCase());

  const hasAccess = allowed.includes(currentRole);

  if (!hasAccess) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
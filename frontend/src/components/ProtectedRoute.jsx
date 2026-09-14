import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ userRole, allowedRoles = [] }) => {
  // Rely directly on the validated state passed from App
  if (!userRole) {
    return <Navigate to="/login" replace />;
  }
  
  const currentRole = userRole.toUpperCase();
  const allowed = allowedRoles.map((role) => role.toUpperCase());

  if (!allowed.includes(currentRole)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

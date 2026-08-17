import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ userRole, allowedRoles }) => {
  // 1. If user is not logged in at all, block direct URL typing
  if (!userRole) {
    return <Navigate to="/login" replace />;
  }

  // 2. ADMIN can access all URLs. Block DRIVER/LOADER if role is not allowed.
  const isAdmin = userRole === "ADMIN";
  const hasAccess = isAdmin || (allowedRoles && allowedRoles.includes(userRole));

  if (!hasAccess) {
    return <Navigate to="/login" replace />;
  }

  // 3. Allowed -> render page
  return <Outlet />;
};

export default ProtectedRoute;

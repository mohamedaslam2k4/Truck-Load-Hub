import { useState, useEffect } from "react"; // 1. Import useEffect
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// ... (your other imports stay the same)

function App() {
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // 2. Add loading state

  useEffect(() => {
    // 3. Read session on mount
    const savedRole = sessionStorage.getItem("role");
    if (savedRole) {
      setUserRole(savedRole);
    }
    setIsLoading(false); // 4. Stop loading once checked
  }, []);

  // 5. Block rendering until the role is resolved
  if (isLoading) {
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>Loading...</div>; 
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/contact" element={<Contact />} />
        {/* Pass our fixed state updater down */}
        <Route path="/login" element={<Login setUserRole={(role) => {
          sessionStorage.setItem("role", role);
          setUserRole(role);
        }} />} />
        <Route path="/register" element={<Register />} />

        {/* Admin Pages */}
        <Route element={<ProtectedRoute userRole={userRole} allowedRoles={["ADMIN"]} />}>
          <Route path="/admin" element={<Navigate to="/admin/verification" replace />} />
          <Route path="/admin/verification" element={<DashboardLayout role="ADMIN" setUserRole={setUserRole}><AdminVerification /></DashboardLayout>} />
          <Route path="/admin/drivers" element={<DashboardLayout role="ADMIN" setUserRole={setUserRole}><AdminDrivers /></DashboardLayout>} />
          <Route path="/admin/loaders" element={<DashboardLayout role="ADMIN" setUserRole={setUserRole}><AdminLoaders /></DashboardLayout>} />
          <Route path="/admin/contacts" element={<DashboardLayout role="ADMIN" setUserRole={setUserRole}><AdminContacts /></DashboardLayout>} />
        </Route>

        {/* Driver Pages */}
        <Route element={<ProtectedRoute userRole={userRole} allowedRoles={["DRIVER"]} />}>
          <Route path="/driver" element={<Navigate to="/driver/available-loads" replace />} />
          <Route path="/driver/available-loads" element={<DashboardLayout role={userRole} setUserRole={setUserRole}><DriverAvailableLoads /></DashboardLayout>} />
          <Route path="/driver/deals" element={<DashboardLayout role={userRole} setUserRole={setUserRole}><DriverMyDeals /></DashboardLayout>} />
        </Route>

        {/* Loader Pages */}
        <Route element={<ProtectedRoute userRole={userRole} allowedRoles={["LOADER"]} />}>
          <Route path="/loader" element={<Navigate to="/loader/manage-loads" replace />} />
          <Route path="/loader/manage-loads" element={<DashboardLayout role={userRole} setUserRole={setUserRole}><LoaderManageLoads /></DashboardLayout>} />
          <Route path="/loader/deals" element={<DashboardLayout role={userRole} setUserRole={setUserRole}><LoaderDeals /></DashboardLayout>} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

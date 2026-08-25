import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import DashboardLayout from "./components/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Public Pages
import Landing from "./pages/Landing";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Admin Pages
import AdminContacts from "./pages/admin/Contacts";
import AdminDrivers from "./pages/admin/Drivers";
import AdminLoaders from "./pages/admin/Loaders";
import AdminVerification from "./pages/admin/Verification";

// Driver Pages
import DriverAvailableLoads from "./pages/driver/AvailableLoads";
import DriverMyDeals from "./pages/driver/MyDeals";

// Loader Pages
import LoaderDeals from "./pages/loader/Deals";
import LoaderManageLoads from "./pages/loader/ManageLoads";

function App() {
  const [userRole, setUserRole] = useState(() => sessionStorage.getItem("role") || null);

 
  return (
    <BrowserRouter>
      <Routes>
   
        <Route path="/" element={<Landing />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login setUserRole={setUserRole} />} />
        <Route path="/register" element={<Register />} />

      
        <Route element={<ProtectedRoute userRole={userRole} allowedRoles={["ADMIN"]} />}>
          <Route path="/admin" element={<Navigate to="/admin/verification" replace />} />
          <Route path="/admin/verification" element={<DashboardLayout role="ADMIN" setUserRole={setUserRole}><AdminVerification /></DashboardLayout>} />
          <Route path="/admin/drivers" element={<DashboardLayout role="ADMIN" setUserRole={setUserRole}><AdminDrivers /></DashboardLayout>} />
          <Route path="/admin/loaders" element={<DashboardLayout role="ADMIN" setUserRole={setUserRole}><AdminLoaders /></DashboardLayout>} />
          <Route path="/admin/contacts" element={<DashboardLayout role="ADMIN" setUserRole={setUserRole}><AdminContacts /></DashboardLayout>} />
        </Route>

        <Route element={<ProtectedRoute userRole={userRole} allowedRoles={["DRIVER"]} />}>
          <Route path="/driver" element={<Navigate to="/driver/available-loads" replace />} />
          <Route path="/driver/available-loads" element={<DashboardLayout role={userRole || "DRIVER"} setUserRole={setUserRole}><DriverAvailableLoads /></DashboardLayout>} />
          <Route path="/driver/deals" element={<DashboardLayout role={userRole || "DRIVER"} setUserRole={setUserRole}><DriverMyDeals /></DashboardLayout>} />
        </Route>


        <Route element={<ProtectedRoute userRole={userRole} allowedRoles={["LOADER"]} />}>
          <Route path="/loader" element={<Navigate to="/loader/manage-loads" replace />} />
          <Route path="/loader/manage-loads" element={<DashboardLayout role={userRole || "LOADER"} setUserRole={setUserRole}><LoaderManageLoads /></DashboardLayout>} />
          <Route path="/loader/deals" element={<DashboardLayout role={userRole || "LOADER"} setUserRole={setUserRole}><LoaderDeals /></DashboardLayout>} />
        </Route>


        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

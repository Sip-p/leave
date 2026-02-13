import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import "./index.css";
import "./App.css";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import ManagerDashboard from "./pages/ManagerDashboard.jsx";
import EmployeeDashboard from "./pages/EmployeeDashboard.jsx";

// ✅ SIMPLE PROTECTED ROUTE
const ProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user")); // we will store this on login
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Router>
      <Routes>
        {/* ✅ PUBLIC ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* ✅ PROTECTED ROUTES */}
        <Route
          path="/manager"
          element={
            <ProtectedRoute>
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee"
          element={
            <ProtectedRoute>
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />

        {/* ✅ 404 FALLBACK */}
        <Route path="*" element={<h1 className="text-center mt-20 text-3xl">404 – Page Not Found</h1>} />
      </Routes>
    </Router>
    </>
  );
}

export default App;

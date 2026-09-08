/**
 * App.jsx — Root component
 * SehatSure - Policy-Integrated Care Planning
 * Configures open routes for the 5-Stage Patient/Caregiver Journey (No Authentication Required)
 */

import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// Pages
import DashboardPage from "./pages/DashboardPage";
import UploadPage from "./pages/UploadPage";
import PolicySummaryPage from "./pages/PolicySummaryPage";
import FindHospitalsPage from "./pages/FindHospitalsPage";
import HospitalResultsPage from "./pages/HospitalResultsPage";
import CareJourneyPage from "./pages/CareJourneyPage";

// Layout
import Navbar from "./components/Navbar";
import AmbientBackground from "./components/AmbientBackground";

function AppRoutes() {
  return (
    <div className="relative min-h-screen text-slate-700 selection:bg-primary selection:text-white">
      <AmbientBackground />
      <div className="relative z-10">
        <Navbar />
        <Routes>
        {/* Open Hospitality User Journey */}
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/policy/:id" element={<PolicySummaryPage />} />
        <Route path="/find-hospitals" element={<FindHospitalsPage />} />
        <Route path="/hospital-results" element={<HospitalResultsPage />} />
        <Route path="/care-journey" element={<CareJourneyPage />} />

        {/* Default redirects to Upload */}
        <Route path="/" element={<Navigate to="/upload" replace />} />
        <Route path="*" element={<Navigate to="/upload" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
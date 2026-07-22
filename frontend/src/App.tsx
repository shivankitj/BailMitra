import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./components/ui/toaster";
import PrivateRoute from "./components/PrivateRoute";
import RoleRoute from "./components/RoleRoute";

// Pages
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import BailCalculator from "./pages/BailCalculator";
import RiskAssessment from "./pages/RiskAssessment";
import CaseDiary from "./pages/CaseDiary";
import StatusTracking from "./pages/StatusTracking";
import PredictiveAnalytics from "./pages/PredictiveAnalytics";
import Chatbot from "./pages/Chatbot";
import ApplicationGenerator from "./pages/ApplicationGenerator";
import Feedback from "./pages/Feedback";
import Settings from "./pages/Settings";
import JudgeCalendar from "./pages/judge/JudgeCalendar";
import JudgeCaseView from "./pages/judge/JudgeCaseView";
import LegalDatabase from "./pages/LegalDatabase";
import JudgeDashboard from "./pages/judge/JudgeDashboard";
import JudgeApplicationView from "./pages/judge/JudgeApplicationView";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="bailmitra-theme">
      <ToastProvider>
        <AuthProvider>
          {" "}
          {/* Wrap the application with AuthProvider */}
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Private Routes */}
              <Route
                path="/dashboard"
                element={
                  // <PrivateRoute>
                  <Dashboard />
                  // </PrivateRoute>
                }
              />
              <Route
                path="/calculator"
                element={
                  // <PrivateRoute>
                  <BailCalculator />
                  // </PrivateRoute>
                }
              />
              <Route
                path="/risk-assessment"
                element={
                  // <PrivateRoute>
                  <RiskAssessment />
                  // </PrivateRoute>
                }
              />
              <Route
                path="/case-diary"
                element={
                  // <PrivateRoute>
                  <CaseDiary />
                  // </PrivateRoute>
                }
              />
              <Route
                path="/case/:id"
                element={
                  // <PrivateRoute>
                  <CaseDiary />
                  // </PrivateRoute>
                }
              />
              <Route
                path="/status-tracking"
                element={
                  // <PrivateRoute>
                  <StatusTracking />
                  // </PrivateRoute>
                }
              />
              <Route
                path="/predictive-analytics"
                element={
                  // <PrivateRoute>
                  <PredictiveAnalytics />
                  // </PrivateRoute>
                }
              />
              <Route
                path="/chatbot"
                element={
                  // <PrivateRoute>
                  <Chatbot />
                  // </PrivateRoute>
                }
              />
              <Route
                path="/application"
                element={
                  // <PrivateRoute>
                  <ApplicationGenerator />
                  // </PrivateRoute>
                }
              />
              <Route
                path="/feedback"
                element={
                  // <PrivateRoute>
                  <Feedback />
                  // </PrivateRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  // <PrivateRoute>
                  <Settings />
                  // </PrivateRoute>
                }
              />

              {/* Judge-specific Routes */}
              <Route
                path="/judge/calendar"
                element={
                  // <RoleRoute roles={["judge"]}>
                  <JudgeCalendar />
                  // </RoleRoute>
                }
              />
              <Route
                path="/judge/case/:id"
                element={
                  // <RoleRoute roles={["judge"]}>
                  <JudgeCaseView />
                  // </RoleRoute>
                }
              />

              <Route
                path="/judge-dashboard"
                element={
                  // <RoleRoute roles={["judge"]}>
                  <JudgeDashboard />
                  // </RoleRoute>
                }
              />

              <Route
                path="/judge-application-view/:id"
                element={
                  // <RoleRoute roles={["judge"]}>
                  <JudgeApplicationView />
                  // </RoleRoute>
                }
              />

              <Route
                path="/legal-database"
                element={
                  // <RoleRoute roles={["judge"]}>
                  <LegalDatabase />
                  // </RoleRoute>
                }
              />

              {/* Fallback Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;

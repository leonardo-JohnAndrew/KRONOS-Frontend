/* eslint-disable react/prop-types */

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import UserContextProvider, {
  useUserContext,
} from "./context/usercontextprovider";
import Layout from "./components/main";
import LoginForm from "./components/loginform";
import Dashboard from "./components/Dashboard";
import ReservationForms from "./components/ReservationForms";
import Records from "./components/Records";
import RequestManagement from "./components/RequestManagement";
import RecommendingApproval from "./components/RecommendingApproval";
import Reports from "./components/Reports";
import Properties from "./components/Properties";
import UserManagement from "./components/UserManagement";
import DynamicReservationForm from "./components/DynamicReservationForm";
import "./App.css";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useUserContext();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useUserContext();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return !isAuthenticated() ? (
    children
  ) : (
    <Navigate to="/main/dashboard" replace />
  );
};

function App() {
  return (
    <UserContextProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginForm />
                </PublicRoute>
              }
            />

            <Route
              path="/main"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="reservation-forms" element={<ReservationForms />} />
              <Route
                path="reservation-forms/:formType"
                element={<DynamicReservationForm />}
              />
              <Route path="records/all" element={<Records />} />
              <Route
                path="request-management"
                element={<RequestManagement />}
              />
              <Route
                path="recommending-approval"
                element={<RecommendingApproval />}
              />
              <Route path="reports" element={<Reports />} />
              <Route path="user-management" element={<UserManagement />} />

              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>

            <Route
              path="/properties"
              element={
                <ProtectedRoute>
                  <Properties />
                </ProtectedRoute>
              }
            />

            <Route path="/" element={<Navigate to="/login" replace />} />

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </UserContextProvider>
  );
}

export default App;

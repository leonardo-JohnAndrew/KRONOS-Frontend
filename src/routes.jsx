/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { createBrowserRouter, Navigate } from "react-router-dom";
import FacilityReservationForm from "./views/forms/FacilityReservationForm/FacilityReservationForm";

import LoginForm from "./views/login";
import App from "./views/main";
import Dashboard from "./views/dashboards/dashboard";
import VehicleReservationForm from "./views/forms/VehicleReservation/VehicleReservation";
import FormSelectionUI from "./views/forms/ReservationForms";
import PurchaseRequisitionForm from "./views/forms/PurchaseReservation/PurchaseRequisitionForm";
import JobRequestForm from "./views/forms/JobRequest/JobRequestForm";
import ReportsModule from "./views/reports/datas/ReportsModule";
import RequestManagement from "./views/requestmanagement/requestmanagement";
import RecordManagement from "./views/recordmanagement/recordmanagement";
import UserManagement from "./views/usermanagement/UserManagement";
import NotificationModule from "./components/NotificationModule";
import Properties from "./views/properties/properties";
import KronosSignup from "./views/register";
import { useUserContext } from "./context/usercontextprovider";
import { LogIn } from "lucide-react";
import LoginRegisterSlide from "./views/sample";
import LoginForms from "./views/sample";
import CalendarApp from "./views/calendar/CalendarApp";
// import RecordManagement from "./views/recordmanagement/recordmanagement";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useUserContext();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

const router = createBrowserRouter([
  {
    path: "",
    element: <LoginForm />,
  },
  {
    path: "/login",
    element: <LoginForm />,
  },
  {
    path: "/register",
    element: <KronosSignup />,
  },

  {
    path: "/main",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),

    children: [
      {
        path: "content",
        element: <NotificationModule />,

        children: [
          {
            path: "dashboard",
            element: <Dashboard />,
          },
          {
            path: "reservation-forms",
            element: <FormSelectionUI />,
          },

          {
            path: "request-management",
            element: <RequestManagement />,
          },
          {
            path: "records",
            element: <RecordManagement />,
          },

          {
            path: "user-management",
            element: <UserManagement />,
          },
          {
            path: "properties",
            element: <Properties />,
          },
          {
            path: "reports",
            element: <ReportsModule />,
          },
          {
            path: "calendar",
            element: <CalendarApp />,
          },
        ],
      },
      {
        path: "reservation-forms/vehicle-reservation",
        element: <VehicleReservationForm />,
      },
      {
        path: "reservation-forms/facility-reservation",
        element: <FacilityReservationForm />,
      },
      {
        path: "reservation-forms/purchase-requisit",
        element: <PurchaseRequisitionForm />,
      },
      {
        path: "reservation-forms/job-request",
        element: <JobRequestForm />,
      },
    ],
  },
]);
export default router;

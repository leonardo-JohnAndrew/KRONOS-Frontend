import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
// import App from './App.jsx'
import router from "./routes.jsx";
import { RouterProvider } from "react-router-dom";
import UserContextProvider from "./context/usercontextprovider.jsx";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <UserContextProvider>
            <RouterProvider router={router} />
        </UserContextProvider>
    </StrictMode>
);

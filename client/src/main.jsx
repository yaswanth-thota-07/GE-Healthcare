import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* Global toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#ffffff",
            color: "#334155",
            border: "1px solid #e4e7ec",
            fontSize: "14px",
            boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
          },
          success: { iconTheme: { primary: "#15803d", secondary: "#ffffff" } },
          error: { iconTheme: { primary: "#b91c1c", secondary: "#ffffff" } },
        }}
      />
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
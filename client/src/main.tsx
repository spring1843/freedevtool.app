import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Global error handlers for unhandled promise rejections
window.addEventListener("unhandledrejection", event => {
  console.error("Unhandled promise rejection:", event.reason);
  // Prevent the default browser behavior
  event.preventDefault();
});

window.addEventListener("error", event => {
  console.error("Global error:", event.error);
});

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

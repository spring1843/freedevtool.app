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

  // Check if this is the MIME type error that requires a refresh
  if (
    event.message?.includes("MIME type") ||
    event.message?.includes("module script") ||
    event.filename?.includes("main.tsx")
  ) {
    console.warn("Detected MIME type issue, attempting page refresh...");
    // Add a small delay to avoid infinite refresh loops
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }
});

// Add a retry mechanism for module loading failures
const loadWithRetry = () => {
  try {
    createRoot(document.getElementById("root")!).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Failed to load application:", error);
    // Show a simple loading message while retrying
    const root = document.getElementById("root");
    if (root) {
      root.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: system-ui;">
          <div style="text-align: center;">
            <div style="margin-bottom: 16px;">Loading application...</div>
            <div style="font-size: 14px; color: #666;">If this persists, please refresh the page</div>
          </div>
        </div>
      `;
    }
    // Retry after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }
};

loadWithRetry();

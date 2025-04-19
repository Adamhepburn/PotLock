
import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import App from "./App";
import "./index.css";

// More robust initialization with error handling
console.log("Starting PotLock application");

const root = document.getElementById("root");
if (!root) {
  console.error("Could not find root element");
  document.body.innerHTML = "<div>Error: Could not find root element</div>";
} else {
  console.log("Root element found, attempting to render");
  try {
    createRoot(root).render(
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </React.StrictMode>
    );
    console.log("Render complete");
  } catch (e) {
    console.error("Render error:", e);
    document.body.innerHTML = "<div>Error rendering application</div>";
  }
}

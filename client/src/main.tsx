
import React from "react";
import { createRoot } from "react-dom/client";
import AppTest from "./App-test";
import "./index.css";

// Extremely simplified render with minimal dependencies
console.log("Starting minimal React application");

const root = document.getElementById("root");
if (!root) {
  console.error("Could not find root element");
  document.body.innerHTML = "<div>Error: Could not find root element</div>";
} else {
  console.log("Root element found, attempting to render");
  try {
    createRoot(root).render(<AppTest />);
    console.log("Render complete");
  } catch (e) {
    console.error("Render error:", e);
    document.body.innerHTML = "<div>Error rendering application</div>";
  }
}

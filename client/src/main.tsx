import { createRoot } from "react-dom/client";
import AppTest from "./App-test";
import "./index.css";

// Simple render without any providers to test basic functionality
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

console.log("Attempting to render basic test component");

createRoot(rootElement).render(
  <AppTest />
);

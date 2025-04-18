import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./hooks/use-auth";
import { Web3Provider } from "./hooks/use-web3";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

createRoot(rootElement).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <Web3Provider>
        <App />
        <Toaster />
      </Web3Provider>
    </AuthProvider>
  </QueryClientProvider>
);


  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";
  import { UserProvider } from "./contexts/UserContext";
  import { Toaster } from "sonner";

  createRoot(document.getElementById("root")!).render(
    <UserProvider>
      <App />
      <Toaster position="top-right" richColors />
    </UserProvider>
  );
  
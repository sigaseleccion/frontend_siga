import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/shared/components/ui/toaster";
import AppRoutes from "./routes";
import { AuthProvider } from "./shared/contexts/auth/AuthContext";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

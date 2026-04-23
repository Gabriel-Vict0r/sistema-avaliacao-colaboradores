import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";
import { Toaster } from "sonner";

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Toaster position="top-right" />
        <RouterProvider router={router} />
      </AppProvider>
    </AuthProvider>
  );
}

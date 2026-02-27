import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { OCFProvider } from "./context/OCFContext";
import AppSidebar from "./components/AppSidebar";
import ComplianceBanner from "./components/ComplianceBanner";
import ComplianceChatPanel from "./components/ComplianceChatPanel";
import Index from "./pages/Index";
import CreateCapsule from "./pages/CreateCapsule";
import Registry from "./pages/Registry";
import Gatekeeper from "./pages/Gatekeeper";
import Evidence from "./pages/Evidence";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Verifying credentials…</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <OCFProvider>
      <div className="flex h-screen overflow-hidden">
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <ComplianceBanner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/create" element={<CreateCapsule />} />
            <Route path="/registry" element={<Registry />} />
            <Route path="/gatekeeper" element={<Gatekeeper />} />
            <Route path="/evidence" element={<Evidence />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
      <ComplianceChatPanel />
    </OCFProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/*" element={<ProtectedLayout />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

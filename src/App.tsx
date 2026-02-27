import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { OCFProvider } from "./context/OCFContext";
import AppSidebar from "./components/AppSidebar";
import Index from "./pages/Index";
import CreateCapsule from "./pages/CreateCapsule";
import Registry from "./pages/Registry";
import Gatekeeper from "./pages/Gatekeeper";
import Evidence from "./pages/Evidence";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <OCFProvider>
          <div className="flex h-screen overflow-hidden">
            <AppSidebar />
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
        </OCFProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
